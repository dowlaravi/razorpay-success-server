export default function handler(req, res) {
  const uid = req.query.uid;

  if (!uid) {
    return res.status(400).json({ error: "UID Missing" });
  }

  return res.status(200).send(`
    <h2>Payment Verified!</h2>
    <p>UID = ${uid}</p>
    <p>You may close this and return to the app.</p>
  `);
}
