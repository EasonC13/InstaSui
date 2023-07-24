const fs = require("fs");
require("dotenv").config();

// Create an IPFS client instance

console.log("AAA");
let { create, urlSource } = require("helia/src/index.js");
console.log(create);
const ipfs = create(process.env.IPFS_URL);

console.log(file);
// Function to upload a file to IPFS
async function uploadToIPFS(url) {
  try {
    const file = await ipfs.add(urlSource(url));

    console.log("File uploaded to IPFS. Hash:", file);

    // Return the IPFS hash
    return file;
  } catch (error) {
    console.error("Error uploading to IPFS:", error.message);
    return null;
  }
}

exports.uploadToIPFS = uploadToIPFS;
