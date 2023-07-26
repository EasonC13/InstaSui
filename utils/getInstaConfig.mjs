import { Inputs } from "@mysten/sui.js";

let getInstaConfig = async (network = "mainnet") => {
  if (network == "mainnet") {
    return Inputs.SharedObjectRef({
      objectId:
        "0xabc34ced1aa2c07cd8bbd7fd9195b09277cb038d55431680221938919c469d65",
      mutable: false,
      initialSharedVersion: 5307143,
    });
  } else if (network == "testnet") {
    return Inputs.SharedObjectRef({
      objectId:
        "0x9ca1f0a4605598afe615f31926df68b2a35dbf346465633e9d91843249156ea6",
      mutable: false,
      initialSharedVersion: 650486,
    });
  }
};
export { getInstaConfig };
