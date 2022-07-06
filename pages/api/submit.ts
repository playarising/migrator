import { MongoClient } from "mongodb";
import { ethers } from "ethers";
import { VERIFICATION_MESSAGE } from "../../constants";

export default async function handler(req, res) {
  const body = JSON.parse(req.body);
  if (!body.address || !body.signature) {
    res
      .status(200)
      .json({ success: false, error: "missing address or signature" });
    return;
  }

  const address = ethers.utils.verifyMessage(
    VERIFICATION_MESSAGE,
    body.signature
  );
  if (address !== body.address) {
    res.status(200).json({ success: false, error: "invalid signature" });
    return;
  }

  const connection = new MongoClient(
    process.env.DATABASE_URL
  );
  await connection.connect();

  const db = connection.db("arising");
  const query: { _id: any } = { _id: body.address.toLowerCase() };
  const data = await db.collection("experience").findOne(query);

  if (data) {
    res.status(200).json({ success: false, error: "migration already done" });
    return;
  }

  res.status(200).json({ success: true });
}
