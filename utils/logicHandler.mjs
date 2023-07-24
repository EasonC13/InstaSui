import { getDatabase } from "./db.mjs";
import { bot } from "./bot.mjs";
export async function logicHandler(msg) {
  msg.from.id;
  let user = await getUser(msg);
  if (user.status == "init" || user.status == "settingAddress") {
    bot.sendMessage(msg.chat.id, `Set Addr`);
    return true;
  }
  return false;
}
async function getUser(msg) {
  let db = await getDatabase();
  let userCol = db.collection("telegramUsers");
  let user = await userCol.findOne({ userId: msg.from.id });
  if (!user) {
    user = {
      userId: msg.from.id,
      status: "init",
      address: "",
    };
    await userCol.insertOne(user);
  }
  return user;
}
