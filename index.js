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
app.listen(port, async () => {
  console.log(`Express server is listening on ${port}`);
  const cmomands = [
    { command: "mainnet", description: "Mint NFT to Mainnet" },
    { command: "testnet", description: "Mint NFT to Testnet (Free)" },
    { command: "setaddress", description: "Change Address" },
  ];
  bot.setMyCommands(cmomands).then((resp) => {});
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
import { getUser } from "./utils/getUser.mjs";
import { extractTitleAndDescription } from "./utils/extractTitleAndDescription.mjs";

const ipfsClient = create(process.env.IPFS_URL); // the default API address http://localhost:5001

bot.on("photo", async (msg) => {
  if (msg.photo.length === 0) {
    return;
  }
  try {
    bot.sendChatAction(msg.chat.id, "typing");
    let user = await getUser(msg);
    if (!user.address) {
      bot.sendMessage(
        msg.chat.id,
        `Please first set your Sui Address by /setaddress`
      );
      return;
    }
    let photo = msg.photo[msg.photo.length - 1];
    let photoLink = await bot.getFileLink(photo.file_id);
    let { name, description, amount } = extractTitleAndDescription(msg.caption);
    let nftName = name || "Insta NFT Beta";
    let nftDescription = description || ""; //"Mint NFT from https://t.me/InstaSuiBot";

    // const file = await ipfsClient.add(urlSource(photoLink));
    // let nftURL = `ipfs://${file.cid}`;

    let res = await imgurClient.upload({
      image: photoLink,
      type: "url",
    });
    bot.sendChatAction(msg.chat.id, "typing");

    let nftURL = res.data.link;

    let network = user.network || process.env.NETWORK || "testnet";
    let signer = await getSigner(network);

    // let nftURL = photoLink;

    const tx = new TransactionBlock();

    // print hello

    {
      ("");
      // tx.moveCall({
      //   target: `${InstaPackage[network]}::insta_management::mint`,
      //   // typeArguments: [coin_type],
      //   arguments: [
      //     tx.object(await getInstaConfig(network)),
      //     tx.object(await getSignerCap(network)),
      //     tx.pure(Array.from(new TextEncoder().encode(nftName)), "vector<u8>"),
      //     tx.pure(
      //       Array.from(new TextEncoder().encode(nftDescription)),
      //       "vector<u8>"
      //     ),
      //     tx.pure(Array.from(new TextEncoder().encode(nftURL)), "vector<u8>"),
      //   ],
      // });
    }
    for (let i = 0; i < amount; i++) {
      tx.moveCall({
        target: `${InstaPackage[network]}::insta_nft::mint`,
        // typeArguments: [coin_type],
        arguments: [
          tx.pure(Array.from(new TextEncoder().encode(nftName)), "vector<u8>"),
          tx.pure(
            Array.from(new TextEncoder().encode(nftDescription)),
            "vector<u8>"
          ),
          tx.pure(Array.from(new TextEncoder().encode(nftURL)), "vector<u8>"),
          tx.pure(user.address || process.env.DEFAULT_ADDRESS, "address"),
        ],
      });
    }

    bot.sendChatAction(msg.chat.id, "typing");
    const resData = await signer.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showBalanceChanges: true,
      },
    });
    bot.sendChatAction(msg.chat.id, "typing");
    let nftId = resData.effects.created[0].reference.objectId;
    let gasFee = Math.abs(Number(resData.balanceChanges[0].amount) / 10 ** 9);
    let SuiPrice = await (
      await fetch("https://api.binance.com/api/v3/ticker/price?symbol=SUIUSDT")
    ).json();
    let DisplayJPY = "";
    // try {
    //   let SuiPriceInJPY = (
    //     await (
    //       await fetch(
    //         "https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=JPY"
    //       )
    //     ).json()
    //   ).sui.jpy;
    //   DisplayJPY = `(~=${(gasFee * SuiPriceInJPY).toFixed(4)} JPY)`;
    // } catch (e) {}

    const options = {
      reply_markup: getViewerReplyMarkup(nftId, network),
      reply_to_message_id: msg.message_id,
    };
    bot.sendMessage(
      msg.chat.id,
      `NFT Minted!
      The gas fee is ${gasFee.toFixed(4)} Sui
      (~=${(gasFee * SuiPrice.price).toFixed(4)} USD)
      ${DisplayJPY}`.replace(/  +/g, ""),
      options
    );
    if (!user.address) {
      bot.sendMessage(
        msg.chat.id,
        `Not Yet Set Address. Set your Sui Address by /setaddress`
      );
    }
    await (await getDatabase()).collection("history").insertOne({
      user,
      nftURL,
      network,
      nftId,
      gasFee,
      txDigest: resData.digest,
    });
  } catch (e) {
    console.log(e);
  }
});

import { logicHandler } from "./utils/logicHandler.mjs";
import { getDatabase } from "./utils/db.mjs";
// Just to ping!
// import {} from "./utils/signer";
bot.on("text", async (msg) => {
  let user = await getUser(msg);
  let isHandleLogic = await logicHandler(msg);
  if (isHandleLogic) {
    return;
  }
  let res = bot.sendMessage(
    msg.chat.id,
    `Welcome to InstaSui 🤖\nSend me a photo, and I will turn it into NFT on Sui Network.`
  );
  bot.sendPhoto(msg.chat.id, "https://i.imgur.com/1uTIVtl.jpg");
  if (!user.address) {
    bot.sendMessage(msg.chat.id, `Set your Sui Address by /setaddress`);
  }
});

bot.on("sticker", async (msg) => {
  // console.log(msg.sticker);
});
