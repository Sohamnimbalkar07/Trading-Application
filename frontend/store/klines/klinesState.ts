import { atom, selector } from "recoil";
import axios from "axios";
import { KLine } from "@/utils/types";
import { marketState } from "../depth/depthState";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const klineParamsState = atom<{
  interval: string;
  startTime: number;
  endTime: number;
}>({
  key: "klineParamsState",
  default: {
    interval: "1h",
    startTime: Math.floor((Date.now() - 1000 * 60 * 60 * 24 * 7) / 1000),
    endTime: Math.floor(Date.now() / 1000),
  },
});

export const klineState = selector<KLine[]>({
  key: "klinesState",
  get: async ({ get }) => {
    const { interval, startTime, endTime } = get(klineParamsState);
    const market = get(marketState);
    try {
      const response = await axios.get(
        `${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
      );
      return response.data.sort((a: KLine, b: KLine) =>
        Number(a.end) < Number(b.end) ? -1 : 1
      );
    } catch (error) {
      console.error("Error fetching Klines:", error);
      return [];
    }
  },
});
