import { getDatabase } from "./db.mjs";
import { bot } from "./bot.mjs";
import { getSigner } from "./signer.mjs";
export async function logicHandler(msg) {
  msg.from.id;
  let user = await getUser(msg);
  let signer = await getSigner(process.env.NETWORK);
  if (msg.text.toLowerCase().startsWith("/setaddress")) {
    msg.text = msg.text.toLowerCase().replace("/setaddress", "").trim();
    await setAddress(signer, msg, user);
    return true;
  }
  if (msg.text.toLowerCase().startsWith("/setnetwork")) {
    console.log("set network");
    msg.text = msg.text.toLowerCase().replace("/network", "").trim();
    if (msg.text == "testnet" || msg.text == "mainnet") {
      let db = await getDatabase();
      let userCol = db.collection("telegramUsers");
      userCol.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            network: msg.text.toLowerCase(),
          },
        }
      );

      const options = {
        reply_to_message_id: msg.message_id,
      };
      bot.sendMessage(msg.chat.id, `Network set to ${msg.text}`, options);
    } else {
      const options = {
        reply_to_message_id: msg.message_id,
      };
      bot.sendMessage(
        msg.chat.id,
        `Invalid Network. We support mainnet and testnet`,
        options
      );
    }

    return true;
  }
  if (msg.text.toLowerCase().startsWith("/status")) {
    bot.sendMessage(
      msg.chat.id,
      `Your Sui Address is ${user.address}`,
      options
    );
    return true;
  }
  if (user.status == "init" || user.status == "settingAddress") {
    await setAddress(signer, msg, user);
    return true;
  }
  return false;
}
async function setAddress(signer, msg, user) {
  const options = {
    reply_to_message_id: msg.message_id,
    parse_mode: "Markdown",
  };
  try {
    let res = await signer.provider.getAllCoins({
      owner: msg.text,
    });
    let db = await getDatabase();
    let userCol = db.collection("telegramUsers");
    userCol.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          address: msg.text,
          status: "ready",
        },
      }
    );
    bot.sendMessage(msg.chat.id, `Address set`, options);
  } catch (e) {
    bot.sendMessage(
      msg.chat.id,
      `Invaalid Sui Address, please try again.\n\n/setaddress <sui address>\n\nFor Example: \`/setaddress 0x04d626ce8938318165fab01491095329aee67fd017a4a17fe2c981b8a9a569cc\``,
      options
    );
  }
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
      network: process.env.NETWORK,
    };
    await userCol.insertOne(user);
    user = await userCol.findOne({ userId: msg.from.id });
  }
  return user;
}
