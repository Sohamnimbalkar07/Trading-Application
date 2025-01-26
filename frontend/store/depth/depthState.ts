import { atom, selector } from "recoil";
import axios from "axios";
import { Depth } from "@/utils/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const marketState = atom<string>({
  key: "marketState",
  default: "TATA_INR",
});

export const bidsState = atom<[string, string][]>({
  key: "bidsState",
  default: [],
});

export const asksState = atom<[string, string][]>({
  key: "asksState",
  default: [],
});

export const priceState = atom<string>({
  key: "priceState",
  default: "0",
});

export const depthState = selector<Depth>({
  key: "depthState",
  get: async ({ get }) => {
    const market = get(marketState);
    try {
      const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching depth data:", error);
      throw error;
    }
  },
});
