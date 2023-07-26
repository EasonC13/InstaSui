import { MongoClient } from "mongodb";

let global = { client: undefined };
export { global };

export async function connectToMongo() {
  const uri = process.env.MONGODB_URI || "";
  const client = new MongoClient(uri);
  await client.connect();
  console.log("Mongodb connected");
  global.client = client;
}

export async function closeMongoConnection() {
  await global.client.close();
}

export async function getDatabase() {
  if (!global.client) {
    await connectToMongo();
  }
  return global.client.db(process.env.MONGODB_NAME);
}
