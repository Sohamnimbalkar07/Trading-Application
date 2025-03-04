import { createClient } from "redis";
import { Engine } from "./trade/Engine";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const engine = new Engine();
  const redisClient = createClient({
    url: process.env.REDIS_URL
  });
  await redisClient.connect();

  while (true) {
    const response = await redisClient.rPop("messages" as string);
    if (!response) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      engine.process(JSON.parse(response));
    }
  }
}

main();
