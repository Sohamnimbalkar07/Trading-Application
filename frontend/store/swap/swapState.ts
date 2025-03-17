import { atom } from "recoil";
import { OrderResponseData } from "@/utils/types";

export enum OrderType {
  INTRADAY = "intraday",
  LONG_TERM = "long-term",
}

interface OrderState {
  market: string;
  price: number;
  quantity: number;
  side: string;
  userId: string;
  orderType: OrderType;
}

export const orderState = atom<OrderState>({
  key: "orderState",
  default: {
    market: "",
    price: 0,
    quantity: 0,
    side: "",
    userId: "",
    orderType: OrderType.INTRADAY
  },
});

export const orderResponseState = atom<OrderResponseData | null>({
  key: "orderResponseState",
  default: null,
});
