export type TickerUpdateMessage = {
  stream: string;
  data: {
    [x: string]: string;
    e: "ticker";
  };
};

export type DepthUpdateMessage = {
  stream: string;
  data: {
    b?: [string, string][];
    a?: [string, string][];
    e: "depth";
  };
};

export type TradeAddedMessage = {
  stream: string;
  data: {
    e: "trade";
    t: number;
    m: boolean;
    p: string;
    q: string;
    s: string; // symbol
  };
};

export type klineMessage = {
  stream: string;
  data: {
    e: "kline";
    [x: string]: string;
  };
};

export type fillsMessage = {
  stream: string;
  data: {
    e: "fills";
    price: string;
    tradeId: number,
    quantity: number,
    orderId: string,
    userId: string
  };
};

export type WsMessage =
  | TickerUpdateMessage
  | DepthUpdateMessage
  | TradeAddedMessage
  | klineMessage
  | fillsMessage;
