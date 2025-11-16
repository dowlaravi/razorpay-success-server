export default function handler(req, res) {
  const { uid } = req.query;
  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  res.status(200).json({ status: "verified", uid: uid });
}
