export interface KLine {
  close: string;
  end: string;
  high: string;
  low: string;
  open: string;
  quoteVolume: string;
  start: string;
  trades: string;
  volume: string;
}

export interface Trade {
  id: number;
  isBuyerMaker: boolean;
  price: string;
  quantity: string;
  quoteQuantity: string;
  timestamp: number;
}

export interface Depth {
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: string;
}

export interface Ticker {
  startTime: string;
  firstPrice: number;
  high: number;
  low: number;
  lastPrice: number;
  volume: number;
  priceChange: number;
  priceChangePercent: number;
}

export interface Fill {
  price: string;
  qty: number;
  tradeId: number;
  otherUserId: string;
  markerOrderId: string;
  isBuyerMaker: boolean;
}

export interface OrderResponseData {
  orderId: string;
  executedQty: number;
  fills: Fill[]
}
