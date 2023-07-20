/* eslint-disable @typescript-eslint/no-non-null-assertion */
let { JsonRpcProvider, Connection } = require("@mysten/sui.js");

let getSuiProvider = (network = "mainnet") => {
  if (network == "mainnet") {
    let connection = new Connection({
      fullnode:
        "https://sui-mainnet.blockvision.org/v1/2SjMglFHZy5G6RUaIEm4aLLtHGP",
    });
    return new JsonRpcProvider(connection);
  } else if (network == "testnet") {
    let connection = new Connection({
      fullnode:
        "https://sui-testnet.blockvision.org/v1/2SnBwJqW1RLEao9yzPo8oB7fKhi",
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
