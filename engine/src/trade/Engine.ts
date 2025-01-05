import fs from "fs";
import { RedisManager } from "../RedisManager";
import { ORDER_UPDATE, TRADE_ADDED } from "../types/index";
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
    this.orderbooks = [new Orderbook(`TATA`, [], [], 0, 0)];
    this.setBaseBalances();
  }

  setBaseBalances() {
    this.balances.set("1", {
        [BASE_CURRENCY]: {
            available: 10000000,
            locked: 0
        },
        "TATA": {
            available: 10000000,
            locked: 0
        }
    });

    this.balances.set("2", {
        [BASE_CURRENCY]: {
            available: 10000000,
            locked: 0
        },
        "TATA": {
            available: 10000000,
            locked: 0
        }
    });

    this.balances.set("5", {
        [BASE_CURRENCY]: {
            available: 10000000,
            locked: 0
        },
        "TATA": {
            available: 10000000,
            locked: 0
        }
    });
}
}
