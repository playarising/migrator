import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const connection = new MongoClient(process.env.DATABASE_URL);
  await connection.connect();
  const db = connection.db("arising");

  res.status(200).json({ success: true });
}
