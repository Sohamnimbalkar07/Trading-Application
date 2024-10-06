import express from "express";
import { OrderInputSchema } from "./types";
import { orderbook, bookWithQuantity } from "./orderbook";

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

app.post("/api/v1/order", async (req, res) => {
  const order = OrderInputSchema.safeParse(req.body);

  if (!order.success) {
    res.status(400).send(order.error.message);
    return;
  }
  const orderId = getOrderId();

  const { baseAsset, quoteAsset, price, quantity, side, kind } = order.data;
  const { executedQty, fills } = fillOrder(
    orderId,
    price,
    quantity,
    side,
    kind
  );

  res.send({
    orderId,
    executedQty,
    fills,
  });
});

function getOrderId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

interface Fill {
  price: number;
  qty: number;
  tradeId: number;
}

let GLOBAL_TRADE_ID = 1;

function fillOrder(
  orderId: string,
  price: number,
  quantity: number,
  side: "buy" | "sell",
  type?: "ioc"
): { status: "rejected" | "accepted"; executedQty: number; fills: Fill[] } {
  console.log(side, price, quantity, orderId);
  const fills: Fill[] = [];
  const firstQuantity = quantity;
  if (side === "buy") {
    console.log("inside if buy");
    orderbook.asks.forEach ( (o) => {
      console.log("inside foreach buy");
      console.log("before if price", o.price);
      if (o.price <= price && quantity !== 0) {
        const fill = Math.min(o.quantity, quantity);
        console.log("fill", fill);
        console.log("if order price", o.price);
        quantity = quantity - fill;
        console.log("remaining quantity to be filled", quantity);
        o.quantity = o.quantity - fill;
        console.log("sinle qua", o.quantity);
        bookWithQuantity.asks[o.price] =
          (bookWithQuantity.asks[o.price] || 0) - fill;
        fills.push({
          price: o.price,
          qty: fill,
          tradeId: GLOBAL_TRADE_ID++,
        });
      }
      // if (o.quantity === 0) {
      //   orderbook.asks.splice(orderbook.asks.indexOf(o), 1);
      // }
    });

    console.log("adding");

    if (quantity !== 0) {
      orderbook.bids.push({
        price,
        quantity: quantity,
        side: "bid",
        orderId,
      });
    }
  } else {
    orderbook.bids.forEach((o) => {
      if (o.price >= price && quantity !== 0) {
        const fill = Math.min(o.quantity, quantity);
        quantity = quantity - fill;
        o.quantity = o.quantity - fill;
        bookWithQuantity.asks[o.price] =
          (bookWithQuantity.asks[o.price] || 0) - fill;
        fills.push({
          price: o.price,
          qty: fill,
          tradeId: GLOBAL_TRADE_ID++,
        });
      }
      // if (o.quantity === 0) {
      //   orderbook.bids.splice(orderbook.bids.indexOf(o), 1);
      // }
      
    });
    if (quantity !== 0) {
      orderbook.asks.push({
        price,
        quantity: quantity,
        side: "ask",
        orderId,
      });
    }
  }
  console.log("Orderbook", orderbook);
  console.log("bookwithquantity", bookWithQuantity);
  return {
    status: "accepted",
    executedQty: firstQuantity - quantity,
    fills,
  };
}
