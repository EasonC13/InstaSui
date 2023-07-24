/**
 * This example demonstrates setting up a webook, and receiving
 * updates in your express app
 */
/* eslint-disable no-console */
import dotenv from "dotenv";
dotenv.config();

import pkg from "imgur";
const { ImgurClient } = pkg;
const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
});
import express from "express";
const port = process.env.PORT;
import { bot } from "./utils/bot.mjs";

const app = express();
import { Inputs, ObjectCallArg, TransactionBlock } from "@mysten/sui.js";

// parse the updates to JSON
app.use(express.json());

// We are receiving updates at the route below!
app.post(`/instaSuiBot`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get(`/hello`, (req, res) => {
  res.send("Hello World!");
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

import { getSuiProvider } from "./utils/getSuiProvider.mjs";
// const { getSuiProvider } = require("./utils/getSuiProvider.mjs");
// const { getSignerCap } = require("./utils/getSignerCap.mjs");

import { getSignerCap } from "./utils/getSignerCap.mjs";
import { getInstaConfig } from "./utils/getInstaConfig.mjs";
import { getSigner } from "./utils/signer.mjs";
import { InstaPackage } from "./projectConfig.mjs";
import { getViewerReplyMarkup } from "./utils/getViewerReplyMarkup.mjs";
import { create, urlSource } from "ipfs-http-client";

const ipfsClient = create(process.env.IPFS_URL); // the default API address http://localhost:5001

bot.on("photo", async (msg) => {
  try {
    let photo = msg.photo[msg.photo.length - 1];
    let photoLink = await bot.getFileLink(photo.file_id);
    // const file = await ipfsClient.add(urlSource(photoLink));
    // let nftURL = `ipfs://${file.cid}`;

    let res = await imgurClient.upload({
      image: photoLink,
      type: "url",
    });
    let nftURL = res.data.link;

    let network = process.env.NETWORK || "testnet";
    let signer = await getSigner(network);

    let nftName = "Insta NFT Beta";
    let nftDescription = "Mint NFT from https://t.me/InstaSuiBot";

    // let nftURL = photoLink;

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
  } catch (e) {
    console.log(e);
  }
});

import { logicHandler } from "./utils/logicHandler.mjs";
// Just to ping!
// import {} from "./utils/signer";
bot.on("text", async (msg) => {
  await logicHandler(msg);
  console.log(msg);
  bot.sendMessage(
    msg.chat.id,
    `Welcome to InstaSui 🤖\nSend me a photo, and I will turn it into NFT on Sui Network.`
  );
  bot.sendPhoto(msg.chat.id, "https://i.imgur.com/1uTIVtl.jpg");
});

bot.on("sticker", async (msg) => {
  // console.log(msg.sticker);
});
