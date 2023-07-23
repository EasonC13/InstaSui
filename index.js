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
bot.on("photo", async (msg) => {
  try {
    let photo = msg.photo[msg.photo.length - 1];
    let photoLink = await bot.getFileLink(photo.file_id);
    let res = await client.upload({
      image: photoLink,
      type: url,
    });

    network = "mainnet";
    let signer = await getSigner(network);

    let nftName = "Insta NFT Beta";
    let nftDescription = "Mint NFT from https://t.me/InstaSuiBot";
    let nftURL = res.data.link;

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
    let nftId = resData.effects.created[0].reference.objectId;

    const options = {
      reply_markup: getViewerReplyMarkup(nftId, network),
      reply_to_message_id: msg.message_id,
    };
    bot.sendMessage(msg.chat.id, "NFT Minted!", options);
  } catch (e) {}
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
