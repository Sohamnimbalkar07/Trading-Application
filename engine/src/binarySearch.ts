import { Order } from "./trade/Orderbook";

export function binarySearch(orders: Order[], order: Order): number {
  if (orders.length === 0) return 0;

  let left = 0;
  let right = orders.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const cmp = compareFn(order, orders[mid]);

    if (cmp > 0) {
      left = mid + 1;
    } else if (cmp < 0) {
      right = mid - 1;
    } else {
      return mid;
    }
  }

  return left;
}

function compareFn(order1: Order, order2: Order) {
  return order1["price"] - order2["price"];
}
