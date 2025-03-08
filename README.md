# Real-Time Trading & Order Matching System

## 🚀 Overview

This project is a scalable, low-latency order matching system designed to handle real-time trade execution and market depth updates. It consists of multiple microservices, each handling a specific aspect of order processing.


## 🛠 Technology Stack

- **Backend**: TypeScript, Node.js, Express.js  
- **Queue & Messaging**: Redis (Queue + Pub/Sub)  
- **Database**: PostgreSQL + TimescaleDB  
- **Frontend**: Next.js  
- **Communication**: WebSocket  

## 🏗 Architecture

The system follows a **microservices architecture** with the following key components:

1. **API Server** - **Manages** user **requests** and **order processing**.
   - Receives and processes **HTTP requests** from users (`/api/v1/order`).
   - Pushes incoming orders into a **Redis Queue** for processing.
   - Subscribes to responses from the **Engine Server** for each submitted order.
   - Listens for execution updates via **Redis Pub/Sub**.
   - Forwards execution responses and status updates to the **frontend**.

2. **Engine Server** - **Responsible** for **order matching** and **market updates**.
   - Matches **buy** and **sell** orders efficiently.
   - Updates the **order book** and maintains **market depth**.
   - Publishes **trade executions** and **market updates** to **Redis Pub/Sub**.
   - Pushes processed data into the **Database Processor queue** for storage.

3. **WebSocket Server** - **Streams real-time market updates** to users.
   - Subscribes to **order book depth, trade**, and **ticker** updates.
   - Sends **real-time data** to the **frontend** via WebSockets.

4. **Database Processor** - **Stores** executed **orders** and **trade history**.
   - Listens to **Redis Queue** for **trade-created events**.
   - Persists **order** and **trade data** into **PostgreSQL** with **TimescaleDB** extension.

5. **Frontend** - A **Next.js** application for user interaction.
   - Displays **market data, order execution, and real-time updates**.
   - Allows users to **place** and **track** their orders.

6. **Market Maker (MM)** - Generates **liquidity** for order books.
   - Places **random buy/sell orders**.
   - Ensures an **active order book**.

7. **Redis** - **Message broker** for communication between services.
   - Acts as a **queue** for pending orders.
   - Handles **Pub/Sub** for market updates.

8. **TimescaleDB** - **Stores aggregated trade data**.
   - Creates **buckets of klines** based on price feed.

9. **PostgreSQL** - Primary **database** for order storage and historical data.
   - Stores **user orders, trade executions**, and historical **market data**.
   - Ensures **data integrity** and provides **analytical capabilities**.


![Platform Diagram](./frontend/public/backendArchitecture.png)

---

## 📡 WebSocket Subscription
WebSockets provide real-time updates on market data such as order book depth, candlestick (kline) data, and ticker updates.

### Subscription Request Format
```json
{
  "method" : "SUBSCRIBE",
  "params" : ["depth@TATA_INR", "kline@TATA_INR:1h", "ticker@TATA_INR"]
}
```
### Unsubscription Request Format
To stop receiving updates, you can send an unsubscribe request.
```json
{
  "method" : "UNSUBSCRIBE",
  "params" : ["depth@TATA_INR", "kline@TATA_INR:1h", "ticker@TATA_INR"]
}
```

### WebSocket Event Types

#### 1. Order Book Depth (`depth@TATA_INR`)
Provides real-time updates on the order book, showing the best bid and ask prices along with their respective quantities.

##### Response Example:
```json
{
  "e": "depth",
  "a": [
    [
      "1009.28",
      "7"
    ]
  ],
  "b": [
    [
      "1009.28",
      "3"
    ]
  ]
}
```

#### 2. Kline Data (`kline@TATA_INR:1h`)
Provides candlestick (OHLCV) data for price movements over a specified time interval (e.g., 1 hour).

##### Response Example:
```json
{
   "e": "kline",
   "timestamp":"2025-03-03T18:00:00.000Z",
   "open":"1006.23",
   "high":"1009.86",
   "low":"1000.17",
   "close":"1003.22",
   "volume":"4082.56"
}
```

#### 3. Ticker Updates (`ticker@TATA_INR`)
Provides real-time market ticker information, including price changes, trading volume, and highest/lowest prices in a given period.

##### Response Example:
```json
{
   "e": "ticker",
   "startTime":"2025-03-02T16:28:36.827Z",
   "firstPrice":"1002.97",
   "high":"1009.86",
   "low":"1000.26",
   "lastPrice":"1002.77",
   "volume":"3542.95",
   "priceChange":"-0.27",
   "priceChangePercent":"-0.03"
}
```
---

## 🌐 API Endpoints

### 1. Create Order

Create a new order in the specified market.

**POST** `http://localhost:3001/api/v1/order`

#### Request Body:

```json
{
  "orderId": "6rq4ll66wte2yex35p64ge",
  "executedQty": 6.04,
  "fills": [
    {
      "price": "1004.12",
      "qty": 1.37,
      "tradeId": 36005,
      "otherUserId": "5",
      "markerOrderId": "cqbeqvksjtnmukk52sa9m",
      "isBuyerMaker": true
    }
  ]
}
```

#### Response Body:

```json
{
    "orderId": "g5xehpcjuqbhdsqvp37h7",
    "market": "TATA_INR",
    "side": "buy",
    "price": 1000.97,
    "quantity": 2.5,
    "status": "open"
}
```

---

### 2. Delete Order

Cancel an existing order.

**DELETE** `http://localhost:3001/api/v1/order`

#### Request Body:

```json
{
    "orderId": "g5xehpcjuqbhdsqvp37h7",
    "market": "TATA_INR"
}
```

#### Response Body:

```json
{
    "orderId": "974htbuumoch1xmhwywlfu",
    "executedQty": 7,
    "remainingQty": 2
}
```

---

### 3. Get Open Orders

Retrieve all open orders for a user in a specific market.

**GET** `http://localhost:3001/api/v1/order/open?userId=5&market=TATA_INR`

#### Response Body:

```json
[
    {
        "price": 1000.97,
        "quantity": 2.92,
        "orderId": "vow8zhu3iz7ywhizqsocx",
        "filled": 1.67,
        "side": "buy",
        "userId": "5"
    },
    {
        "price": 1001.46,
        "quantity": 1.36,
        "orderId": "9wmtbthaifor52lad8xh8",
        "filled": 0,
        "side": "buy",
        "userId": "5"
    }
]
```

---

### 4. Get Market Depth

Fetch the current market depth, including bid and ask prices.

**GET** `http://localhost:3001/api/v1/depth?symbol=TATA_INR`

#### Response Body:

```json
{
    "bids": [
        [
            "1001.46",
            "1.36"
        ],
        [
            "1001.47",
            "1.68"
        ]
    ],
    "asks": [
        [
            "1010",
            "2.56"
        ],
        [
            "1021",
            "9"
        ]
    ]
}
```

---

### 5. Get Kline Data

Retrieve historical candlestick (OHLCV) data for a market.

**GET** `http://localhost:3001/api/v1/klines?symbol=TATA_INR&interval=1h&startTime=1737564324&endTime=1738169124`

#### Response Body:

```json
[
    {
        "close": 1007.1,
        "end": "2025-01-25T08:00:00.000Z",
        "high": 1007.1,
        "low": 1007.1,
        "open": 1007.1,
        "volume": 1
    },
    {
        "close": 998,
        "end": "2025-01-26T17:00:00.000Z",
        "high": 1013,
        "low": 998,
        "open": 1011,
        "volume": 9
    }
]
```

---

### 6. Get Ticker Data

Fetch the latest market summary, including price changes and volume.

**GET** `http://localhost:3001/api/v1/tickers?symbol=TATA_INR`

#### Response Body:

```json
{
    "startTime": "2025-03-02T18:57:07.356Z",
    "firstPrice": 1005.97,
    "high": 1009.22,
    "low": 1000.39,
    "lastPrice": 1005,
    "volume": 2036.24,
    "priceChange": -0.97,
    "priceChangePercent": -0.1
}
```

---

### 7. On-Ramp

Deposit funds into the user's account.

**POST** `http://localhost:3001/api/v1/on-ramp`

#### Request Body:

```json
{
    "userId": "5",
    "message": "On-ramp successful",
    "amount": 54767.1
}
```

#### Response Body:

```json
{
    "userId": "5",
    "amount": 74298.45
}
```

---
