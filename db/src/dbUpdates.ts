import { DbMessage } from "./types";
import pool from "./dbConnection";

export async function processDbUpdates(response: string) {
  try {
    const data: DbMessage = JSON.parse(response);

    switch (data.type) {
      case "TRADE_ADDED":
        await handleTradeAdded(data);
        break;
      case "ORDER_UPDATE":
        await handleOrderUpdate(data);
        break;
      case "ORDER_CREATE":
        await handleOrderCreate(data);
        break;
      default:
        console.log("Unknown data type:");
        break;
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

async function handleTradeAdded(data: DbMessage) {
  if (data.type === "TRADE_ADDED") {
    const price = data.data.price;
    const volume = data.data.quantity;
    const timestamp = new Date(data.data.timestamp);
    const query = "INSERT INTO tata_prices (time, price, volume) VALUES ($1, $2, $3)";
    const values = [timestamp, price, volume];
    const client = await pool.connect();
    try {
      await client.query(query, values);
    } finally {
      client.release();
    }
  }
}

async function handleOrderUpdate(data: DbMessage) {
  console.log("Order Update", data);
}

async function handleOrderCreate(data: DbMessage) {
  console.log("Order Create", data);
}
