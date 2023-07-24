import { Inputs } from "@mysten/sui.js";
import { getSuiProvider } from "./getSuiProvider.mjs";

let getSignerCap = async (network = "mainnet") => {
  let provider = getSuiProvider(network);
  let SignerCap;
  if (network == "mainnet") {
    SignerCap = await provider.getObject({
      id: "0x179d62f950f74b426bb1faf356fd15dfd74b2467b9d28d341c5b6a1a376ad054",
    });
  } else {
    //if (network == "testnet") {
    SignerCap = await provider.getObject({
      id: "0x51d8e2e6299d3b0f597bb1cd0d511dcc90c71190efb329e73a6a1bbdfc63621e",
    });
  }
  return Inputs.ObjectRef({
    objectId: SignerCap.data.objectId,
    digest: SignerCap.data.digest,
    version: Number(SignerCap.data.version),
  });
};
export { getSignerCap };
