import crypto from "crypto";
import admin from "firebase-admin";

export const config = { api: { bodyParser: false } };

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async (req, res) => {
  if (req.method !== "POST")
    return res.status(405).send("Only POST allowed");

  const rawBody = await getRawBody(req);
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected)
    return res.status(400).send("Invalid signature");

  const data = JSON.parse(rawBody);
  const payment = data.payload.payment.entity;

  const email = payment.notes.email;
  if (!email) return res.status(400).send("Email missing");

  const safe = email.replace(/\./g, "_").replace(/@/g, "_");

  await admin.database().ref("users/" + safe).update({
    premium: true,
    paymentId: payment.id,
    updatedAt: Date.now()
  });

  return res.status(200).send("OK");
};
