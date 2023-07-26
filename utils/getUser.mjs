import { getDatabase } from "./db.mjs";

export async function getUser(msg) {
  let db = await getDatabase();
  let userCol = db.collection("telegramUsers");
  let user = await userCol.findOne({ userId: msg.from.id });
  if (!user) {
    user = {
      userId: msg.from.id,
      status: "init",
      address: "",
      network: process.env.NETWORK,
    };
    await userCol.insertOne(user);
    user = await userCol.findOne({ userId: msg.from.id });
  }
  return user;
}
