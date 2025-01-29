import fs from "fs";
import { RedisManager } from "../RedisManager";
import { ORDER_UPDATE, TRADE_ADDED, ORDER_CREATE } from "../types/index";
import {
  CANCEL_ORDER,
  CREATE_ORDER,
  GET_DEPTH,
  GET_OPEN_ORDERS,
  MessageFromApi,
  ON_RAMP,
} from "../types/fromApi";
import { Fill, Order, Orderbook } from "./Orderbook";

export const BASE_CURRENCY = "INR";

interface UserBalance {
  [key: string]: {
    available: number;
    locked: number;
  };
}

export class Engine {
  private orderbooks: Orderbook[] = [];
  private balances: Map<string, UserBalance> = new Map();

  constructor() {
    let snapshot = null;
    try {
      if (process.env.WITH_SNAPSHOT) {
        snapshot = fs.readFileSync("./snapshot.json");
      }
    } catch (e) {
      console.log("No snapshot found", e);
    }

    if (snapshot) {
      const snapshotSnapshot = JSON.parse(snapshot.toString());
      this.orderbooks = snapshotSnapshot.orderbooks.map(
        (o: Orderbook) =>
          new Orderbook(
            o.baseAsset,
            o.bids,
            o.asks,
            o.lastTradeId,
            o.currentPrice
          )
      );
      this.balances = new Map(snapshotSnapshot.balances);
    } else {
      this.orderbooks = [new Orderbook(`TATA`, [], [], 0, 0)];
      this.setBaseBalances();
    }
    setInterval(() => {
      this.saveSnapshot();
    }, 1000 * 3);
  }

  saveSnapshot() {
    const snapshotSnapshot = {
      orderbooks: this.orderbooks.map((o) => o.getSnapshot()),
      balances: Array.from(this.balances.entries()),
    };
    fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
  }

  process({
    message,
    clientId,
  }: {
    message: MessageFromApi;
    clientId: string;
  }) {
    switch (message.type) {
      case CREATE_ORDER:
        try {
          const { executedQty, fills, orderId } = this.createOrder(
            message.data.market,
            message.data.price,
            message.data.quantity,
            message.data.side,
            message.data.userId
          );
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_PLACED",
            payload: {
              orderId,
              executedQty,
              fills,
            },
          });
        } catch (e) {
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_CANCELLED",
            payload: {
              orderId: "",
              executedQty: 0,
              remainingQty: 0,
            },
          });
          console.log(e);
        }
        break;
      //bug
      case CANCEL_ORDER:
        try {
          const orderId = message.data.orderId;
          const cancelMarket = message.data.market;
          const cancelOrderbook = this.orderbooks.find(
            (o) => o.ticker() === cancelMarket
          );
          const baseAsset = cancelMarket.split("_")[0];
          if (!cancelOrderbook) {
            throw new Error("No orderbook found");
          }

          const order =
            cancelOrderbook.asks.find((o) => o.orderId === orderId) ||
            cancelOrderbook.bids.find((o) => o.orderId === orderId);
          if (!order) {
            console.log("No order found");
            throw new Error("No order found");
          }

          const userBalances = this.balances.get(order.userId);
          if (!userBalances) {
            throw new Error(`Balances for user ${order.userId} not found`);
          }
          if (order.side === "buy") {
            const price = cancelOrderbook.cancelBid(order);
            const leftQuantity = (order.quantity - order.filled) * order.price;
            if (!userBalances[BASE_CURRENCY]) {
              throw new Error(
                `Base currency balance for user ${order.userId} not found`
              );
            }
            userBalances[BASE_CURRENCY].available += leftQuantity;
            userBalances[BASE_CURRENCY].locked -= leftQuantity;
            if (price) {
              this.sendUpdatedDepthAt(price.toString(), cancelMarket);
            }
          } else {
            const price = cancelOrderbook.cancelAsk(order);
            const leftQuantity = order.quantity - order.filled;
            userBalances[baseAsset].available += leftQuantity;
            userBalances[baseAsset].locked -= leftQuantity;
            if (price) {
              this.sendUpdatedDepthAt(price.toString(), cancelMarket);
            }
          }

          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_CANCELLED",
            payload: {
              orderId,
              executedQty: 0,
              remainingQty: 0,
            },
          });
        } catch (e) {
          console.log("Error while cancelling order");
          console.log(e);
        }
        break;
      case GET_OPEN_ORDERS:
        try {
          const openOrderbook = this.orderbooks.find(
            (o) => o.ticker() === message.data.market
          );
          if (!openOrderbook) {
            throw new Error("No orderbook found");
          }
          const openOrders = openOrderbook.getOpenOrders(message.data.userId);

          RedisManager.getInstance().sendToApi(clientId, {
            type: "OPEN_ORDERS",
            payload: openOrders,
          });
        } catch (e) {
          console.log(e);
        }
        break;
      case ON_RAMP: {
        const userId = message.data.userId;
        const amount = Number(message.data.amount);
        const balance = this.onRamp(userId, amount);
        RedisManager.getInstance().sendToApi(clientId, {
          type: "ON_RAMP",
          payload: {
            userId,
            message: "On-ramp successful",
            amount: balance,
          },
        });

        break;
      }
      case GET_DEPTH:
        try {
          const market = message.data.market;
          const orderbook = this.orderbooks.find((o) => o.ticker() === market);
          if (!orderbook) {
            throw new Error("No orderbook found");
          }
          RedisManager.getInstance().sendToApi(clientId, {
            type: "DEPTH",
            payload: orderbook.getDepth(),
          });
        } catch (e) {
          console.log(e);
          RedisManager.getInstance().sendToApi(clientId, {
            type: "DEPTH",
            payload: {
              bids: [],
              asks: [],
            },
          });
        }
        break;
    }
  }

  //quantity bug
  sendUpdatedDepthAt(price: string, market: string) {
    const orderbook = this.orderbooks.find((o) => o.ticker() === market);
    if (!orderbook) {
      return;
    }
    const depth = orderbook.getDepth();
    const updatedBids = depth?.bids.filter((x) => x[0] === price);
    const updatedAsks = depth?.asks.filter((x) => x[0] === price);

    RedisManager.getInstance().publishMessage(`depth@${market}`, {
      stream: `depth@${market}`,
      data: {
        a: updatedAsks.length ? updatedAsks : [[price, "0"]],
        b: updatedBids.length ? updatedBids : [[price, "0"]],
        e: "depth",
      },
    });
  }

  addOrderbook(orderbook: Orderbook) {
    this.orderbooks.push(orderbook);
  }

  createOrder(
    market: string,
    price: string,
    quantity: string,
    side: "buy" | "sell",
    userId: string
  ) {
    const orderbook = this.orderbooks.find((o) => o.ticker() === market);
    const baseAsset = market.split("_")[0];
    const quoteAsset = market.split("_")[1];

    if (!orderbook) {
      throw new Error("No orderbook found");
    }

    this.checkAndLockFunds(
      baseAsset,
      quoteAsset,
      side,
      userId,
      price,
      quantity
    );

    const order: Order = {
      price: Number(price),
      quantity: Number(quantity),
      orderId:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
      filled: 0,
      side,
      userId,
    };

    const { fills, executedQty } = orderbook.addOrder(order);

    this.updateBalance(userId, baseAsset, quoteAsset, side, fills);

    this.createDbTrades(fills, market);
    this.updateDbOrders(order, executedQty, fills, market);
    this.publisWsDepthUpdates(fills, price, side, market);
    this.publishWsTrades(fills, market);

    return { executedQty, fills, orderId: order.orderId };
  }

  updateDbOrders(
    order: Order,
    executedQty: number,
    fills: Fill[],
    market: string
  ) {
    RedisManager.getInstance().pushMessage({
      type: ORDER_CREATE,
      data: {
        orderId: order.orderId,
        executedQty: executedQty,
        market: market,
        price: order.price.toString(),
        quantity: order.quantity.toString(),
        side: order.side,
      },
    });

    fills.forEach((fill) => {
      RedisManager.getInstance().pushMessage({
        type: ORDER_UPDATE,
        data: {
          orderId: fill.markerOrderId,
          executedQty: fill.qty,
        },
      });
    });
  }

  //needed to update quantity
  publisWsDepthUpdates(
    fills: Fill[],
    price: string,
    side: "buy" | "sell",
    market: string
  ) {
    const orderbook = this.orderbooks.find((o) => o.ticker() === market);
    if (!orderbook) {
      return;
    }
    const depth = orderbook.getDepth();
    const fillPrices = fills.map((f) => f.price.toString());
    if (side === "buy") {
      const updatedAsks = depth?.asks.filter((x) =>
        fillPrices.includes(x[0].toString())
      );
      fillPrices.forEach((fillPrice) => {
        const exists = updatedAsks.some(([price]) => price == fillPrice);
        if (!exists) {
          updatedAsks.push([fillPrice, "0"]);
        }
      });
      const updatedBid = depth?.bids.find((x) => x[0] == price);
      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsks,
          b: updatedBid ? [updatedBid] : [],
          e: "depth",
        },
      });
    }
    if (side === "sell") {
      const updatedBids = depth?.bids.filter((x) =>
        fillPrices.includes(x[0].toString())
      );
      fillPrices.forEach((fillPrice) => {
        const exists = updatedBids.some(([price]) => price == fillPrice);
        if (!exists) {
          updatedBids.push([fillPrice, "0"]);
        }
      });
      const updatedAsk = depth?.asks.find((x) => x[0] == price);
      console.log("publish ws depth updates");
      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsk ? [updatedAsk] : [],
          b: updatedBids,
          e: "depth",
        },
      });
    }
  }

  createDbTrades(fills: Fill[], market: string) {
    fills.forEach((fill) => {
      RedisManager.getInstance().pushMessage({
        type: TRADE_ADDED,
        data: {
          market: market,
          id: fill.tradeId.toString(),
          isBuyerMaker: fill.isBuyerMaker,
          price: fill.price,
          quantity: fill.qty.toString(),
          quoteQuantity: (fill.qty * Number(fill.price)).toString(),
          timestamp: Date.now(),
        },
      });
    });
  }

  publishWsTrades(fills: Fill[], market: string) {
    fills.forEach((fill) => {
      RedisManager.getInstance().publishMessage(`trade@${market}`, {
        stream: `trade@${market}`,
        data: {
          e: "trade",
          t: fill.tradeId,
          m: fill.isBuyerMaker,
          p: fill.price,
          q: fill.qty.toString(),
          s: market,
        },
      });
    });
  }

  updateBalance(
    userId: string,
    baseAsset: string,
    quoteAsset: string,
    side: "buy" | "sell",
    fills: Fill[]
  ) {
    const userBalances = this.balances.get(userId);
    if (side === "buy") {
      fills.forEach((fill) => {
        const otherUserBalances = this.balances.get(fill.otherUserId);

        if (otherUserBalances && userBalances) {
          const otherUserQuoteAsset = otherUserBalances[quoteAsset];
          const userQuoteAsset = userBalances[quoteAsset];
          const otherUserBaseAsset = otherUserBalances[baseAsset];
          const userBaseAsset = userBalances[baseAsset];

          if (
            otherUserQuoteAsset &&
            userQuoteAsset &&
            otherUserBaseAsset &&
            userBaseAsset
          ) {
            otherUserQuoteAsset.available += fill.qty * Number(fill.price);
            userQuoteAsset.locked -= fill.qty * Number(fill.price);

            otherUserBaseAsset.locked -= fill.qty;
            userBaseAsset.available += fill.qty;
          }
        }
      });
    } else {
      fills.forEach((fill) => {
        const otherUserBalances = this.balances.get(fill.otherUserId);

        if (otherUserBalances && userBalances) {
          const otherUserQuoteAsset = otherUserBalances[quoteAsset];
          const userQuoteAsset = userBalances[quoteAsset];
          const otherUserBaseAsset = otherUserBalances[baseAsset];
          const userBaseAsset = userBalances[baseAsset];

          if (
            otherUserQuoteAsset &&
            userQuoteAsset &&
            otherUserBaseAsset &&
            userBaseAsset
          ) {
            otherUserQuoteAsset.locked -= fill.qty * Number(fill.price);
            userQuoteAsset.available += fill.qty * Number(fill.price);

            otherUserBaseAsset.available += fill.qty;
            userBaseAsset.locked -= fill.qty;
          }
        }
      });
    }
  }

  checkAndLockFunds(
    baseAsset: string,
    quoteAsset: string,
    side: "buy" | "sell",
    userId: string,
    price: string,
    quantity: string
  ) {
    const userBalances = this.balances.get(userId);

    if (!userBalances) {
      throw new Error("User balances not found");
    }

    if (side === "buy") {
      const quoteBalance = userBalances[quoteAsset];

      if (
        !quoteBalance ||
        quoteBalance.available < Number(quantity) * Number(price)
      ) {
        throw new Error("Insufficient funds");
      }

      quoteBalance.available -= Number(quantity) * Number(price);
      quoteBalance.locked += Number(quantity) * Number(price);
    } else {
      const baseBalance = userBalances[baseAsset];

      if (!baseBalance || baseBalance.available < Number(quantity)) {
        throw new Error("Insufficient funds");
      }

      baseBalance.available -= Number(quantity);
      baseBalance.locked += Number(quantity);
    }
  }

  onRamp(userId: string, amount: number) {
    const userBalance = this.balances.get(userId);
    if (!userBalance) {
      this.balances.set(userId, {
        [BASE_CURRENCY]: {
          available: amount,
          locked: 0,
        },
      });
      return amount;
    } else {
      userBalance[BASE_CURRENCY].available += amount;
      return userBalance[BASE_CURRENCY].available;
    }
  }

  setBaseBalances() {
    this.balances.set("1", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      TATA: {
        available: 10000000,
        locked: 0,
      },
    });

    this.balances.set("2", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      TATA: {
        available: 10000000,
        locked: 0,
      },
    });

    this.balances.set("5", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      TATA: {
        available: 10000000,
        locked: 0,
      },
    });
  }
}
