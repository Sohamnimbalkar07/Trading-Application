import { atom } from "recoil";
import { OrderResponseData } from "@/utils/types";

export const orderState = atom({
  key: "orderState",
  default: {
    market: "",
    price: 0,
    quantity: 0,
    side: "",
    userId: "",
  },
});

export const orderResponseState = atom<OrderResponseData | null>({
  key: "orderResponseState",
  default: null,
});
