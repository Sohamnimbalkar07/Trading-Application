import { createClient } from "redis";
import { processDbUpdates } from "./dbUpdates";

async function main() {
  const redisClient = createClient({
    url: process.env.REDIS_URL
  });
  await redisClient.connect();

  while (true) {
    const response = await redisClient.rPop("db_processor" as string);
    if (!response) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      await processDbUpdates(response);
    }
  }
}

main();
