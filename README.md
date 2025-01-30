# Real-Time Trading Platform

The Real-Time Trading Platform is an exchange system designed for efficient order management and trade execution. It leverages Redis Queue for enqueuing incoming orders and Redis Pub/Sub for seamless inter-service communication and response handling, ensuring a highly responsive and reliable trading environment.

## Features
- **Real-Time Trading**: Orders are placed and executed in real time, ensuring that the trading experience is seamless and responsive.
- **Efficient Order Matching**: The platform efficiently matches buy and sell orders, providing optimal trade execution.
- **Market Liquidity**: A Market Maker (MM) service ensures that the order book remains liquid by placing random orders.
- **WebSocket Support**: WebSocket server provides real-time updates to users about their orders and market events.
- **Data Persistence**: PostgreSQL and TimescaleDB are used for storing user information, orders, trades, and price feeds.

## Backend Architecture

The system architecture consists of several services that work together to handle real-time trading:

### 1. API
- **Description**: The API server that handles incoming HTTP requests from users to place orders, fetch order details, and interact with the platform.
  
### 2. Engine
- **Description**: The core engine running multiple market order books. It stores user balances in memory and processes orders.

### 3. WebSocket
- **Description**: A WebSocket server that allows users to subscribe to real-time events such as order updates, trade executions, and market events.

### 4. DB Processor
- **Description**: Processes messages from the Engine and persists them into the database for later retrieval, ensuring that the data is durable.

### 5. Redis
- **Description**: Redis Queue is used to enqueue incoming orders. Redis Pub/Sub is used for communication between services, allowing for real-time updates and event handling.

### 6. Frontend
- **Description**: A Next.js app that serves as the frontend for the users to interact with the platform.

### 7. PostgreSQL
- **Description**: A relational database used to store user information, orders, trades, and other relevant data.

### 8. TimescaleDB
- **Description**: A time-series database that stores and creates buckets of price feed data (klines).

### 9. Market Maker (MM)
- **Description**: A service that places random orders in the order books to keep liquidity flowing, ensuring that the market remains active.
