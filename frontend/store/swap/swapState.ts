import { atom } from "recoil";

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