import { atom } from "recoil";
import { Ticker } from "@/utils/types";

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
