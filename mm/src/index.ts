import axios from "axios";

const BASE_URL = process.env.BACKEND_URL;
const MARKET = "TATA_INR";
const USER_ID = "5";
const TOTAL_BIDS = 15;
const TOTAL_ASKS = 15;
const TRADE_MIN = 5;
const TRADE_MAX = 7;
const BASE_PRICE = 1000;
const PRICE_SPREAD = 5;
const SMALL_BATCH_SIZE = 3;
const INTERVAL = 2000;

async function main() {
  let tradesScheduled = 0;

  while (true) {
    try {
      const currentPrice = BASE_PRICE + Math.random() * 10;
      const openOrders = await getOpenOrders();

      await maintainLiquidity(openOrders, currentPrice);

      if (tradesScheduled <= 0) {
        tradesScheduled = TRADE_MIN + Math.floor(Math.random() * (TRADE_MAX - TRADE_MIN + 1));
      }

      await performScheduledTrades(currentPrice, Math.min(tradesScheduled, SMALL_BATCH_SIZE));
      tradesScheduled -= SMALL_BATCH_SIZE;

      await sleep(INTERVAL);
    } catch (error) {
      console.error("Error in market maintenance:", error);
    }
  }
}

async function getOpenOrders() {
  const response = await axios.get(
    `${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`
  );
  return response.data;
}

async function maintainLiquidity(openOrders: any[], currentPrice: number) {
  const totalBids = openOrders.filter((o: any) => o.side === "buy").length;
  const totalAsks = openOrders.filter((o: any) => o.side === "sell").length;

  await cancelOutdatedOrders(openOrders, currentPrice, SMALL_BATCH_SIZE);

  if (totalBids < TOTAL_BIDS) {
    const bidsToAdd = Math.min(SMALL_BATCH_SIZE, TOTAL_BIDS - totalBids);
    await addOrders("buy", bidsToAdd, currentPrice - PRICE_SPREAD, currentPrice);
  }
  if (totalAsks < TOTAL_ASKS) {
    const asksToAdd = Math.min(SMALL_BATCH_SIZE, TOTAL_ASKS - totalAsks);
    await addOrders("sell", asksToAdd, currentPrice, currentPrice + PRICE_SPREAD);
  }
}

async function addOrders(side: "buy" | "sell", count: number, minPrice: number, maxPrice: number) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    const price = (minPrice + Math.random() * (maxPrice - minPrice)).toFixed(2);
    const quantity = (1 + Math.random() * 2).toFixed(2);
    promises.push(
      axios.post(`${BASE_URL}/api/v1/order`, {
        market: MARKET,
        price,
        quantity,
        side,
        userId: USER_ID,
      })
    );
  }
  await Promise.all(promises);
}

async function cancelOutdatedOrders(openOrders: any[], currentPrice: number, batchSize: number) {
  const promises = [];
  let canceled = 0;
  for (const order of openOrders) {
    if (canceled >= batchSize) break;
    if (
      (order.side === "buy" && order.price < currentPrice - PRICE_SPREAD) ||
      (order.side === "sell" && order.price > currentPrice + PRICE_SPREAD)
    ) {
      promises.push(
        axios.delete(`${BASE_URL}/api/v1/order`, {
          data: { orderId: order.orderId, market: MARKET },
        })
      );
      canceled++;
    }
  }
  await Promise.all(promises);
}

async function performScheduledTrades(currentPrice: number, tradeCount: number) {
  const promises = [];
  for (let i = 0; i < tradeCount; i++) {
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const price =
      side === "buy"
        ? (currentPrice - Math.random() * 1).toFixed(2)
        : (currentPrice + Math.random() * 1).toFixed(2);
    const quantity = (0.5 + Math.random()).toFixed(2);

    promises.push(
      axios.post(`${BASE_URL}/api/v1/order`, {
        market: MARKET,
        price,
        quantity,
        side,
        userId: USER_ID,
      })
    );
  }
  await Promise.all(promises);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();





