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
let { getSignerCap } = require("./utils/getSignerCap");
let { getInstaConfig } = require("./utils/getInstaConfig");
const { getSigner } = require("./utils/signer");
const { InstaPackage, a } = require("./projectConfig");
const { getViewerReplyMarkup } = require("./utils/getViewerReplyMarkup");
let { uploadToIPFS } = require("./utils/ipfsUpload");
bot.on("photo", async (msg) => {
  try {
    let photoUrl = await bot.getFileLink(msg.photo[0].file_id);

    let res = await uploadToIPFS(photoUrl);
    console.log(res);

    network = "testnet";
    let signer = await getSigner(network);

    let nftName = "Insta NFT Beta";
    let nftDescription = "Mint NFT from https://t.me/InstaSuiBot";
    let nftURL = res.data.link;
    console.log(res);
    return;

    try {
      const tx = new TransactionBlock();

      // print hello

      tx.moveCall({
        target: `${InstaPackage[network]}::insta_management::mint`,
        // typeArguments: [coin_type],
        arguments: [
          tx.object(await getInstaConfig(network)),
          tx.object(await getSignerCap(network)),
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
      console.log(resData);

      let nftId = resData.effects.created[0].reference.objectId;

      const options = {
        reply_markup: getViewerReplyMarkup(nftId, network),
        reply_to_message_id: msg.message_id,
      };
      bot.sendMessage(msg.chat.id, "NFT Minted!", options);
    } catch (e) {
      if (
        e.message.includes(
          "Failed to sign transaction by a quorum of validators because of locked objects"
        )
      ) {
        let random_time = Math.floor(Math.random() * 3000);
        await sleep(random_time);
        throw e;
      } else {
        throw e;
      }
    }
  } catch (e) {
    console.log(e);
  }
});

// Just to ping!
// import {} from "./utils/signer";
bot.on("text", (msg) => {
  console.log(msg);
  bot.sendMessage(
    msg.chat.id,
    `Welcome to InstaSui 🤖\nSend me a photo, and I will turn it into NFT on Sui Network.`
  );
  bot.sendPhoto(msg.chat.id, "https://i.imgur.com/1uTIVtl.jpg");
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    readableStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    readableStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    readableStream.on("error", (error) => {
      reject(error);
    });
  });
}
