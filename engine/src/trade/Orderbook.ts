import { BASE_CURRENCY } from "./Engine";
import { binarySearch } from "../binarySearch";
import { RedisManager } from "../RedisManager";

export interface Order {
  price: number;
  quantity: number;
  orderId: string;
  filled: number;
  side: "buy" | "sell";
  userId: string;
}

export interface Fill {
  price: string;
  qty: number;
  tradeId: number;
  otherUserId: string;
  markerOrderId: string;
  isBuyerMaker: boolean;
}

export class Orderbook {
  bids: Order[];
  asks: Order[];
  baseAsset: string;
  quoteAsset: string = BASE_CURRENCY;
  lastTradeId: number;
  currentPrice: number;

  constructor(
    baseAsset: string,
    bids: Order[],
    asks: Order[],
    lastTradeId: number,
    currentPrice: number
  ) {
    this.bids = bids;
    this.asks = asks;
    this.baseAsset = baseAsset;
    this.lastTradeId = lastTradeId || 0;
    this.currentPrice = currentPrice || 0;
  }

  ticker() {
    return `${this.baseAsset}_${this.quoteAsset}`;
  }

  getSnapshot() {
    return {
      baseAsset: this.baseAsset,
      bids: this.bids,
      asks: this.asks,
      lastTradeId: this.lastTradeId,
      currentPrice: this.currentPrice,
    };
  }

  addOrder(order: Order): {
    executedQty: number;
    fills: Fill[];
  } {
    if (order.side === "buy") {
      const { executedQty, fills } = this.matchBid(order);
      order.filled = executedQty;
      if (executedQty === order.quantity) {
        return {
          executedQty,
          fills,
        };
      }
      // this.bids.push(order);
      this.bids.splice(binarySearch(this.bids, order), 0, order);
      return {
        executedQty,
        fills,
      };
    } else {
      const { executedQty, fills } = this.matchAsk(order);
      order.filled = executedQty;
      if (executedQty === order.quantity) {
        return {
          executedQty,
          fills,
        };
      }
      // this.asks.push(order);
      this.asks.splice(binarySearch(this.asks, order), 0, order);
      return {
        executedQty,
        fills,
      };
    }
  }

  matchBid( order: Order ) : { fills: Fill[]; executedQty: number } {
    const fills: Fill[] = [];
    let executedQty = 0;

    for (let i = 0; i < this.asks.length; i++) {
      if (this.asks[i].price <= order.price && executedQty < order.quantity) {
        const filledQty = Math.min(
          order.quantity - executedQty,
          this.asks[i].quantity - this.asks[i].filled
        );
        executedQty += filledQty;
        this.asks[i].filled += filledQty;
        fills.push({
          price: this.asks[i].price.toString(),
          qty: filledQty,
          tradeId: this.lastTradeId++,
          otherUserId: this.asks[i].userId,
          markerOrderId: this.asks[i].orderId,
          isBuyerMaker: false,
        });
      }
    }
    for (let i = 0; i < this.asks.length; i++) {
      if (this.asks[i].filled === this.asks[i].quantity) {
        this.asks.splice(i, 1);
        i--;
      }
    }
    return {
      fills,
      executedQty,
    };
  }

  matchAsk(order: Order): { fills: Fill[]; executedQty: number } {
    const fills: Fill[] = [];
    let executedQty = 0;

    for (let i = 0; i < this.bids.length; i++) {
      if (this.bids[i].price >= order.price && executedQty < order.quantity) {
        const amountRemaining = Math.min(
          order.quantity - executedQty,
          this.bids[i].quantity -this.bids[i].filled
        );
        executedQty += amountRemaining;
        this.bids[i].filled += amountRemaining;
        fills.push({
          price: this.bids[i].price.toString(),
          qty: amountRemaining,
          tradeId: this.lastTradeId++,
          otherUserId: this.bids[i].userId,
          markerOrderId: this.bids[i].orderId,
          isBuyerMaker: true,
        });
      }
    }
    for (let i = 0; i < this.bids.length; i++) {
      if (this.bids[i].filled === this.bids[i].quantity) {
        this.bids.splice(i, 1);
        i--;
      }
    }
    return {
      fills,
      executedQty,
    };
  }

  getDepth() {
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];

    const bidsObj: { [key: string]: number } = {};
    const asksObj: { [key: string]: number } = {};

    for (let i = 0; i < this.bids.length; i++) {
      const order = this.bids[i];
      if (!bidsObj[order.price]) {
        bidsObj[order.price] = 0;
      }
      bidsObj[order.price] += order.quantity - order.filled;
    }

    for (let i = 0; i < this.asks.length; i++) {
      const order = this.asks[i];
      if (!asksObj[order.price]) {
        asksObj[order.price] = 0;
      }
      asksObj[order.price] += order.quantity - order.filled;
    }

    for (const price in bidsObj) {
      bids.push([price, bidsObj[price].toString()]);
    }

    for (const price in asksObj) {
      asks.push([price, asksObj[price].toString()]);
    }

    return {
      bids,
      asks,
    };
  }

  getOpenOrders(userId: string): Order[] {
    const asks = this.asks.filter((x) => x.userId === userId);
    const bids = this.bids.filter((x) => x.userId === userId);
    return [...asks, ...bids];
  }

  cancelBid(order: Order) {
    const index = this.bids.findIndex((x) => x.orderId === order.orderId);
    if (index !== -1) {
      const price = this.bids[index].price;
      this.bids.splice(index, 1);
      return price;
    }
  }

  cancelAsk(order: Order) {
    const index = this.asks.findIndex((x) => x.orderId === order.orderId);
    if (index !== -1) {
      const price = this.asks[index].price;
      this.asks.splice(index, 1);
      return price;
    }
  }

  updateKline(symbol : string, interval : string, timestamp : number, price : string, volume: string) {
    const bucketTimestamp = timestamp - (timestamp % 3600); // Round to nearest hour
    const key = `kline:${symbol}:${interval}:${bucketTimestamp}`;
     const redis = RedisManager.getInstance();
     const client = redis.client;
    const exists = await redis.exists(key);

    if (!exists) {
        // First trade, initialize Kline
        await redis.hset(key, {
            open: price,
            high: price,
            low: price,
            close: price,
            volume: volume,
        });
    } else {
        // Update existing Kline
        await redis.hset(key, "close", price);
        await redis.hset(key, "volume", parseFloat(await redis.hget(key, "volume")) + volume);
        await redis.hset(key, "high", Math.max(price, parseFloat(await redis.hget(key, "high"))));
        await redis.hset(key, "low", Math.min(price, parseFloat(await redis.hget(key, "low"))));
    }

    // Publish the updated Kline
    await publishKline(symbol, interval, bucketTimestamp);
}
}
