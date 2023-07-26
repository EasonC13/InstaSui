/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JsonRpcProvider, Connection } from "@mysten/sui.js";
import dotenv from "dotenv";

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

export { getSuiProvider };
