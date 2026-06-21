import { MongoClient, ObjectId } from "mongodb";

async function dbconnect() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  return client;
}

export const handler = async (event) => {
  try {
    const client = await dbconnect();

    const db = client.db("Social_Media");
    const collection = db.collection("users");

    for (const record of event.Records) {
      const Key = decodeURIComponent(record.s3.object.key);

      const userId = Key.split("/")[2];

      console.log("matchedCount =", result.matchedCount);
      console.log("modifiedCount =", result.modifiedCount);

      const result = await collection.updateOne(
        {
          _id: ObjectId.createFromHexString(userId),
        },
        {
          $set: {
            profilePics: Key,
          },
        },
      );
      console.log("matchedCount =", result.matchedCount);
      console.log("modifiedCount =", result.modifiedCount);
    }
  } catch (err) {
    console.log(err);
  }
};
