/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { JsonRpcProvider, Connection } = require("@mysten/sui.js");
let dotenv = require("dotenv");
dotenv.config();

let getSuiProvider = (network = "mainnet") => {
  if (network == "mainnet") {
    let connection = new Connection({
      fullnode: process.env.MAINNET_RPC,
    });
    return new JsonRpcProvider(connection);
  } else if (network == "testnet") {
    let connection = new Connection({
      fullnode: process.env.TESTNET_RPC,
    });
    return new JsonRpcProvider(connection);
  } else if (network == "devnet") {
    let connection = new Connection({
      fullnode: "https://fullnode.devnet.sui.io:443",
    });
    return new JsonRpcProvider(connection);
  }
};
exports.getSuiProvider = getSuiProvider;
