import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const address = JSON.parse(req.body).address?.toLowerCase();
  if (!address) {
    res
      .status(200)
      .json({ data: null, success: false, error: "missing address" });
    return;
  }
  const connection = new MongoClient(process.env.DATABASE_URL);
  await connection.connect();
  const db = connection.db("arising");
  const query: { _id: any } = { _id: address };
  const data = await db.collection("experience").findOne(query);
  if (!data) {
    res.status(200).json({ success: true, migrated: false });
    return;
  }
  res
    .status(200)
    .json({ success: true, migrated: true, experience: data.experience });
  return;
}
