import { selector, atom } from "recoil";
import axios from "axios";
import { Ticker } from "@/utils/types";
import { marketState } from "../depth/depthState";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const tickerState = atom<Ticker>({
  key: "tickerState",
  default: {
    startTime: new Date().toISOString(),
    firstPrice: 0,
    high: 0,
    low: 0,
    lastPrice: 0,
    volume: 0,
    priceChange: 0.00,
    priceChangePercent: 0.00
  },
});

export const tickerSelector = selector<Ticker>({
  key: "fetchTickerState",
  get: async ({ get }) => {
    const market = get(marketState);
    try {
      const response = await axios.get(`${BASE_URL}/tickers?symbol=${market}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Klines:", error);
      return null;
    }
  },
});
