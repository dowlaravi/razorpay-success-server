import Razorpay from "razorpay";
import crypto from "crypto";
import admin from "firebase-admin";

// Firebase initialize
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DB_URL,
  });
}

const db = admin.database();

// Razorpay Webhook Secret
const WEBHOOK_SECRET = "ravi8546#";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const razorSignature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  // Create expected signature
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  // Signature verification
  if (razorSignature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  // Payment captured event
  if (req.body.event === "payment.captured") {
    const email = req.body.payload.payment.entity.email;

    await db.ref("premium_users/" + email.replace(".", "_")).set({
      premium: true,
      activated_on: new Date().toISOString(),
    });

    return res.status(200).send("Premium Updated Successfully");
  }

  res.status(200).send("Webhook received");
}
