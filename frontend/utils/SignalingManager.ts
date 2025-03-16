import { Ticker } from "./types";

interface callbacks {
  [key: string]: callback[];
}

interface callback {
  callback: Function;
  id: string;
}

export class SignalingManager {
  private ws: WebSocket;
  private static instance: SignalingManager;
  private bufferedMessages: any[] = [];
  private callbacks: callbacks = {};
  private initialized: boolean = false;

  private constructor() {
    this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL as string);
    this.bufferedMessages = [];
    this.init();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  init() {
    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessages.forEach((message) => {
        this.ws.send(JSON.stringify(message));
      });
      this.bufferedMessages = [];
    };
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const type = message.e;
      if (this.callbacks[type]) {
        this.callbacks[type].forEach(({ callback }) => {
          if (type === "ticker") {
            const newTicker: Partial<Ticker> = {
              startTime: message.startTime,
              firstPrice: Number(message.firstPrice),
              high: Number(message.high),
              low: Number(message.low),
              lastPrice: Number(message.lastPrice),
              volume: Number(message.volume),
              priceChange: Number(message.priceChange),
              priceChangePercent: Number(message.priceChangePercent),
            };
            callback(newTicker);
          }
          if (type === "depth") {
            const updatedBids = message.b;
            const updatedAsks = message.a;
            callback({ bids: updatedBids, asks: updatedAsks });
          }
          if (type === "kline") {
            const end = message.timestamp;
            const open = message.open;
            const close = message.close;
            const high = message.high;
            const low = message.low;
            const volume = message.volume;
            callback({ end, open, close, high, low, volume });
          }
          if (type === "fills") {
            const orderId = message.orderId;
            const quantity = message.quantity;
            const tradeId = message.tradeId;
            const price = message.price;
            callback({ orderId, quantity, tradeId, price });
          }
        });
      }
    };
  }

  sendMessage(message: any) {
    const messageToSend = {
      ...message,
    };
    if (!this.initialized) {
      this.bufferedMessages.push(messageToSend);
      return;
    }
    this.ws.send(JSON.stringify(messageToSend));
  }

  async registerCallback(type: string, callback: Function, id: string) {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ callback, id });
  }

  async deRegisterCallback(type: string, id: string) {
    if (this.callbacks[type]) {
      const index = this.callbacks[type].findIndex(
        (callback: callback) => callback.id === id
      );
      if (index !== -1) {
        this.callbacks[type].splice(index, 1);
      }
    }
  }
}
