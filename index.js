const express = require("express");
const app = express();
const admin = require("firebase-admin");
const cors = require("cors");

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.database();

app.get("/success", async (req, res) => {
  const uid = req.query.uid;

  if (!uid) return res.send("User ID not found");

  await db.ref("users/" + uid).set({
    premium: true,
    activatedOn: new Date().toISOString(),
  });

  res.send("Premium Activated Successfully!");
});

app.listen(3000, () => {
  console.log("Server running");
});
