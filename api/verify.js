import Razorpay from "razorpay";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}

const db = admin.database();

export default async function handler(req, res) {
  const { payment_id, email } = req.query;

  try {
    const razorpay = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    // FETCH PAYMENT DETAILS
    const payment = await razorpay.payments.fetch(payment_id);

    if (payment.status === "captured") {
      // SAVE PREMIUM TO FIREBASE
      await db.ref("premium_users/" + email.replace(/\./g, "_")).set({
        premium: 1,
        activated_on: new Date().toISOString(),
        payment_id: payment_id
      });

      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

