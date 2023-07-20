let {
  Ed25519Keypair,
  JsonRpcProvider,
  RawSigner,
  TransactionBlock,
  Ed25519KeypairData,
} = require("@mysten/sui.js");
const fs = require("fs");
const util = require("util");
const { getSuiProvider } = require("./getSuiProvider");

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
  // let data = await readFileAsync("host.secret", "utf8");
  // let secretKey = JSON.parse(data);
  let secretKey = await readUint8ArrayFromFile("host.secret");
  data.secretKey = secretKey;

  // console.log({ result });
};
loadSecretKey();

exports.getSigner = async (network = "mainnet") => {
  if (data.secretKey) {
    await loadSecretKey();
  }
  let keypair = Ed25519Keypair.fromSecretKey(data.secretKey.slice(0, 32));

  let provider = await getSuiProvider(network);
  let signer = new RawSigner(keypair, provider);
  return signer;
};
