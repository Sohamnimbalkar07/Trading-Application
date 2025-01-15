import { Client } from "pg";
import { createClient } from "redis";
import { DbMessage } from "./types";

const pgClient = new Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
pgClient.connect();

async function main() {
  const redisClient = createClient();
  await redisClient.connect();

  while (true) {
    const response = await redisClient.rPop("db_processor" as string);
    if (!response) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      const data: DbMessage = JSON.parse(response);
      if (data.type === "TRADE_ADDED") {
      }
    }
  }
}

main();
