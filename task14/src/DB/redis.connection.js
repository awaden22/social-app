import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

export const client = createClient({
  url: REDIS_URL,
});

export async function testRedisConnection() {
  try {
    await client.connect();
  } catch (err) {
    console.log("Error connection to redis", err);
  }
}
