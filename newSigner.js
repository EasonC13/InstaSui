// let {
//   Ed25519Keypair,
//   JsonRpcProvider,
//   RawSigner,
//   TransactionBlock,
//   Ed25519KeypairData,
// } = require("@mysten/sui.js");
// const fs = require("fs");
// const util = require("util");
import {
  Ed25519Keypair,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
  Ed25519KeypairData,
} from "@mysten/sui.js";
import fs from "fs";
import util from "util";

// Convert fs functions to promise-based functions
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
async function saveUint8ArrayToFile(array, filePath) {
  try {
    // Create a buffer from the Uint8Array
    const buffer = Buffer.from(array);

    // Write the buffer to the file
    await writeFileAsync(filePath, buffer);

    // console.log("Uint8Array saved to file successfully.");
  } catch (error) {
    console.error("Error saving Uint8Array to file:", error);
  }
}

async function readUint8ArrayFromFile(filePath) {
  try {
    // Read the file as a buffer
    const buffer = await readFileAsync(filePath);

    // Convert the buffer to a Uint8Array
    const array = new Uint8Array(buffer);

    // console.log("Uint8Array read from file successfully.");
    return array;
  } catch (error) {
    console.error("Error reading Uint8Array from file:", error);
    return null;
  }
}
let data = {};
let loadSecretKey = async () => {
  let key = new Ed25519Keypair();
  console.log(key.keypair.secretKey);
  let provider = new JsonRpcProvider();
  let signer = new RawSigner(key, provider);
  console.log(await signer.getAddress());
  saveUint8ArrayToFile(key.keypair.secretKey, "host.secret.new");
};
loadSecretKey();
