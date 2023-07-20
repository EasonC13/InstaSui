/**
 * This example demonstrates setting up a webook, and receiving
 * updates in your express app
 */
/* eslint-disable no-console */
require("dotenv").config();
let { ImgurClient } = require("imgur");
const client = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
});

const TOKEN = process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const url = "https://injoy2.intag.io";
const port = process.env.PORT;

const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/instaSuiBot`);

const app = express();
let { Inputs, ObjectCallArg, TransactionBlock } = require("@mysten/sui.js");

// parse the updates to JSON
app.use(express.json());

// We are receiving updates at the route below!
app.post(`/instaSuiBot`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

let walletKit = require("@mysten/wallet-kit");
let { getSuiProvider } = require("./utils/getSuiProvider");
const { getSigner } = require("./utils/signer");
const { InstaPackage, a } = require("./projectConfig");
bot.on("photo", async (msg) => {
  let photo = msg.photo[msg.photo.length - 1];
  let photoLink = await bot.getFileLink(photo.file_id);
  let res = await client.upload({
    image: photoLink,
    type: url,
  });
  let signer = await getSigner("testnet");

  let nftName = "Insta NFT";
  let nftDescription = "";
  let nftURL = res.data.link;

  const tx = new TransactionBlock();
  let SignerCap = await signer.provider.getObject({
    id: "0x78d58c72e1a0cbe74b08ee7993f031aa678b5515879ddc7699a2cffbaeeb86da",
  });
  tx.moveCall({
    target: `${InstaPackage["testnet"]}::insta_management::mint`,
    // typeArguments: [coin_type],
    arguments: [
      tx.object(
        Inputs.SharedObjectRef({
          objectId:
            "0x995f855ae21cc29c4e4327a68569d98f20c46177edf446d6705353dba7e6f1a4",
          mutable: false,
          initialSharedVersion: 650474,
        })
      ),
      tx.object(
        Inputs.ObjectRef({
          objectId:
            "0x78d58c72e1a0cbe74b08ee7993f031aa678b5515879ddc7699a2cffbaeeb86da",
          digest: SignerCap.data.digest,
          version: Number(SignerCap.data.version),
        })
      ),
      tx.pure(Array.from(new TextEncoder().encode(nftName)), "vector<u8>"),
      tx.pure(
        Array.from(new TextEncoder().encode(nftDescription)),
        "vector<u8>"
      ),
      tx.pure(Array.from(new TextEncoder().encode(nftURL)), "vector<u8>"),
    ],
  });
  const resData = await signer.signAndExecuteTransactionBlock({
    transactionBlock: tx,
    options: {
      showEffects: true,
      showBalanceChanges: true,
    },
  });
  let nftId = resData.effects.created[0].reference.objectId;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "View on Explorer",
            url: `https://suiexplorer.com/object/${nftId}?network=testnet`,
          },
        ],
        // [{ text: "View on MoveBlue", url: "option2" }],
      ],
    },
    reply_to_message_id: msg.message_id,
  };
  bot.sendMessage(msg.chat.id, "NFT Minted!", options);
});

// Just to ping!
// import {} from "./utils/signer";
bot.on("text", (msg) => {
  console.log(msg);
  bot.onReplyToMessage(msg.chat.id, msg.message_id, "I am alive!");
});
