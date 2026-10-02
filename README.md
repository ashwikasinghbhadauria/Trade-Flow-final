# TradeFlow — Stock Market Order Book Simulator & Matching Engine
### 🎓 2nd-Year Engineering Data Structures Project

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black.svg)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 1. Project Overview & Problem Statement

Financial stock exchanges (such as NASDAQ, NYSE, and NSE) process hundreds of thousands of BUY and SELL orders every second. Storing orders in a naive list or array requires $O(n)$ time to search for the best price, which leads to unacceptable execution delays and race conditions.

**TradeFlow** is a real-world, high-performance stock market simulator engineered with **manual implementations of core Computer Science Data Structures**:
1. **Max-Heap** for the BUY side (Highest Bid Priority)
2. **Min-Heap** for the SELL side (Lowest Ask Priority)
3. **Hash Map (`Map`)** for $O(1)$ fast order lookup and instant cancellation
4. **Dynamic Array / List** for chronological audit trails of executed trades
5. **Continuous Double-Auction Matching Engine** operating on strict **Price-Time Priority**.

---

## 🏛️ 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT + VITE FRONTEND                           │
│  - Pro Dark Trading Dashboard      - Live Visual Order Book Depth      │
│  - Recharts Price & Volume Chart   - Real-time Socket.IO Updates       │
│  - Interactive Heap Tree View      - Step-by-Step Viva Match Simulator │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ WebSocket / HTTP REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                        NODE.JS + EXPRESS BACKEND                       │
│  - REST Controllers (/api/stocks, /api/orders, /api/trades, etc.)      │
│  - Socket.IO Real-Time Event Dispatcher (tradeExecuted, depthUpdated)  │
│  - Automated Market Maker Simulation Engine (ON/OFF Toggle)            │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Memory / Persistence
┌───────────────────────────────────▼────────────────────────────────────┐
│                 CORE DATA STRUCTURES (MANUAL IMPLEMENTATION)           │
│                                                                        │
│   BUY SIDE                  SELL SIDE                  LOOKUP          │
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐ │
│  │   MAX HEAP    │         │   MIN HEAP    │         │   HASH MAP    │ │
│  │ Highest Bid   │         │  Lowest Ask   │         │  orderId ->   │ │
│  │  Root = O(1)  │         │  Root = O(1)  │         │   Order O(1)  │ │
│  └───────┬───────┘         └───────┬───────┘         └───────────────┘ │
│          └────────────┬────────────┘                                   │
│                       ▼                                                │
│         MATCHING ENGINE (PRICE-TIME PRIORITY)                          │
│         Matches when BUY PRICE >= SELL PRICE                           │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Database
┌───────────────────────────────────▼────────────────────────────────────┐
│              MONGODB (With Automatic In-Memory Fallback)               │
│  - Collections: stocks, orders, trades                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 3. Exact Project Directory Structure

```
/Users/shreyasomal/Desktop/CodeS/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection with zero-friction In-Memory fallback
│   │   └── seedData.js          # Initial stock catalog, order books & demo trades
│   ├── controllers/
│   │   ├── orderController.js   # Order placement, depth & debug state controller
│   │   └── stockController.js   # Stock list, single asset & history controller
│   ├── dataStructures/
│   │   ├── MaxHeap.js           # Manual Max-Heap for BUY orders (Price-Time priority)
│   │   ├── MinHeap.js           # Manual Min-Heap for SELL orders (Price-Time priority)
│   │   ├── OrderBook.js         # Order book wrapping MaxHeap, MinHeap & Map
│   │   └── MatchingEngine.js    # Continuous double-auction price-time priority matcher
│   ├── models/
│   │   ├── Order.js             # Mongoose schema for limit orders
│   │   ├── Stock.js             # Mongoose schema for assets & historical chart points
│   │   └── Trade.js             # Mongoose schema for executed trade records
│   ├── routes/
│   │   ├── analytics.js         # Turnover, KPIs & distribution endpoints
│   │   ├── orders.js            # /api/orders routing
│   │   ├── simulation.js        # /api/simulation toggle & status
│   │   ├── stocks.js            # /api/stocks routing
│   │   └── trades.js            # /api/trades public ledger routing
│   ├── services/
│   │   ├── matchingService.js   # Bridge between Data Structures, DB & Socket.IO
│   │   └── simulationService.js # Automated liquidity provider & background orders
│   ├── tests/
│   │   └── dataStructures.test.js # Comprehensive 41-assertion automated test suite
│   ├── package.json
│   └── server.js                # Express app & Socket.IO server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityTicker.jsx      # Streaming live market activity feed
│   │   │   ├── CancelOrderModal.jsx    # Safe cancellation confirmation dialog
│   │   │   ├── Navbar.jsx              # Navigation header, simulation toggle & profile
│   │   │   ├── OrderBookVisualizer.jsx # Hero depth component with red/green bars
│   │   │   ├── OrderForm.jsx           # BUY/SELL limit order entry with quick presets
│   │   │   ├── StockChart.jsx          # Interactive Recharts area chart (1D, 1W, 1M, 3M)
│   │   │   └── StockTicker.jsx         # Horizontal multi-stock live watchlist
│   │   ├── context/
│   │   │   └── MarketContext.jsx       # Central state management & Socket.IO syncing
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.jsx       # KPI metrics & volume distribution charts
│   │   │   ├── DashboardPage.jsx       # 3-column pro trading terminal
│   │   │   ├── DataStructuresPage.jsx  # Viva visualizer, Heap inspector & step simulator
│   │   │   ├── MarketsPage.jsx         # Asset cards grid with mini sparklines
│   │   │   ├── OrdersPage.jsx          # Filterable user orders table & cancellation
│   │   │   └── TradesPage.jsx          # Public ledger of executed matches
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client for backend endpoints
│   │   │   └── socket.js               # Socket.IO connection manager
│   │   ├── utils/
│   │   │   └── formatters.js           # Currency (₹), numbers, time & badge formatters
│   │   ├── App.jsx                     # Root component with toast notifications
│   │   ├── index.css                   # Tailwind design system & depth bar gradients
│   │   └── main.jsx                    # React entrypoint
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## 🧠 4. Data Structures & Algorithms Explained (Viva Guide)

### A. Max-Heap (`backend/dataStructures/MaxHeap.js`) — BUY Side
- **Why Max-Heap?** Sellers want to match with buyers offering the **highest price**. By using a Max-Heap, the Best Bid is always located at the root (index 0), retrievable in **$O(1)$ time**.
- **Array Layout:** For element at index $i$:
  - Parent: $\lfloor (i - 1) / 2 \rfloor$
  - Left Child: $2i + 1$
  - Right Child: $2i + 2$
- **Comparator (Price-Time Priority):**
  1. Primary: `orderA.price > orderB.price` (Higher price wins)
  2. Tie-Breaker: `timestampA < timestampB` (Earlier order wins FIFO)

### B. Min-Heap (`backend/dataStructures/MinHeap.js`) — SELL Side
- **Why Min-Heap?** Buyers want to buy from sellers offering the **lowest price**. The Best Ask is located at the root (index 0) in **$O(1)$ time**.
- **Comparator (Price-Time Priority):**
  1. Primary: `orderA.price < orderB.price` (Lower price wins)
  2. Tie-Breaker: `timestampA < timestampB` (Earlier order wins FIFO)

### C. Hash Map (`Map`) — Order Lookup & Cancellation
- **Why Hash Map?** Finding an order to cancel inside a raw binary tree requires $O(n)$ search time. Storing each active order in a JavaScript `Map` (`orderId -> Order`) enables instantaneous **$O(1)$ status verification and lookup**.

### D. Time Complexity Comparison Table

| Operation | Array / List (Unsorted) | Sorted Array | Binary Search Tree (Balanced) | **TradeFlow Heaps + Map** |
| :--- | :---: | :---: | :---: | :---: |
| **Insert Order** | $O(1)$ | $O(n)$ shift | $O(\log n)$ | **$O(\log n)$** |
| **Get Best Bid/Ask** | $O(n)$ search | $O(1)$ | $O(1)$ | **$O(1)$** |
| **Extract Best Order** | $O(n)$ | $O(1)$ | $O(\log n)$ | **$O(\log n)$** |
| **Order Lookup by ID** | $O(n)$ | $O(n)$ | $O(\log n)$ | **$O(1)$ via Map** |
| **Space Overhead** | $O(n)$ | $O(n)$ | High pointer overhead | **Compact Contiguous Array** |

---

## ⚡ 5. Order Matching Engine Mechanics

A trade executes when:
$$\text{BUY PRICE} \ge \text{SELL PRICE}$$

### Execution Protocol:
1. **Maker Price Priority:** The trade executes at the resting (maker) order's price.
2. **Partial Fills:** If order sizes differ, $\min(Q_{\text{buy}}, Q_{\text{sell}})$ shares trade immediately. The filled order is removed via `extractMin()` / `extractMax()`, while the remaining balance stays at the root or re-bubbles.
3. **Database & Socket.IO Synchronization:** Every executed match atomically updates `Order`, creates `Trade`, adjusts `Stock` statistics (Day High, Day Low, VWAP, Volume), and broadcasts real-time WebSocket events.

---

## 🚀 6. Installation & Setup Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** (v9 or higher)
- **MongoDB** *(Optional! If local MongoDB is not running, TradeFlow automatically spins up an embedded in-memory MongoDB instance with zero extra configuration).*

### Step 1: Clone or Navigate to Directory
```bash
cd /Users/shreyasomal/Desktop/CodeS
```

### Step 2: Configure Environment Variables
Copy `.env.example` if you wish to customize ports:
```bash
cp .env.example backend/.env
```
*(Default backend port is `5050` to avoid macOS AirPlay Receiver port 5000/5001 conflicts).*

### Step 3: Run the Backend
```bash
cd backend
npm install
npm start
```
*Backend will run on: `http://localhost:5050`*

### Step 4: Run the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will run on: `http://localhost:5173`*

---

## 🧪 7. Running the Automated Test Suite

We have written a comprehensive, dedicated test suite covering all 7 test cases specified in the engineering brief:
1. Basic BUY/SELL full match
2. Partial fill execution
3. Multiple orders matching across price levels
4. Price priority verification
5. Time priority (FIFO tie-breaking) verification
6. Order cancellation verification
7. No-match scenario (spread maintained)

Run the test suite anytime:
```bash
cd backend
npm test
```
**Output:**
```
========================================
🧪 RUNNING DATA STRUCTURES TEST SUITE
========================================
--- SECTION 1: MaxHeap (BUY Orders) ---
✅ PASSED: MaxHeap size is 4
✅ PASSED: MaxHeap extracted highest price + earliest time (B4)
...
🎉 ALL 41/41 TESTS PASSED PERFECTLY!
========================================
```

---

## 📡 8. REST API & WebSocket Documentation

### REST Endpoints:
- `POST /api/auth/signup` — Register a new trader account with ₹1,000,000 virtual balance
- `POST /api/auth/signin` — Authenticate trader and receive JWT session token
- `GET  /api/auth/me` — Retrieve authenticated user profile and virtual balance
- `GET  /api/health` — Health check & server uptime
- `GET  /api/stocks` — List all available stock assets
- `GET  /api/stocks/:symbol` — Detailed stock data & live depth
- `GET  /api/stocks/:symbol/history?timeframe=1D|1W|1M|3M` — Historical price chart points
- `POST /api/stocks/reset` — Reset market data to demo defaults
- `GET  /api/orders` — List orders with filters (`symbol`, `status`, `userId`)
- `POST /api/orders` — Submit a new BUY/SELL limit order
- `DELETE /api/orders` — Clear all orders history
- `DELETE /api/orders/:id` — Cancel an active resting order
- `GET  /api/orders/book/:symbol` — Aggregated order book depth
- `GET  /api/orders/debug/:symbol` — Raw internal Heap arrays and Map keys for visualizer
- `GET  /api/trades` — Public trade history ledger
- `GET  /api/analytics` — Market KPIs, turnover, and volume breakdown
- `POST /api/simulation/toggle` — Turn automated market maker ON/OFF
- `GET  /api/simulation/status` — Get current simulation status

### WebSocket Events (`Socket.IO`):
- `orderCreated` — Emitted when a new limit order is placed
- `orderUpdated` — Emitted when an existing order is partially or fully filled
- `orderCancelled` — Emitted when an order is cancelled
- `tradeExecuted` — Emitted when matching engine executes a match
- `orderBookUpdated` — Emitted with updated bids/asks depth
- `marketPriceUpdated` — Emitted when an asset's price, high, low, or volume changes
- `simulationStatus` — Emitted when simulation is started or paused

---

## 🎯 9. How to Test a BUY / SELL Match

1. Open `http://localhost:5173/` in your browser.
2. Select **ABC Technologies** (or any stock).
3. In the **Order Book**, observe the current **Best Ask (Lowest Sell Price)**, for example `₹1245.00`.
4. In the **Order Terminal**, select **BUY**, enter a price equal to or higher than the Best Ask (e.g. `₹1245.00`), set quantity to `50`, and click **PLACE BUY ORDER**.
5. **Observe:**
   - The matching engine executes the trade instantly.
   - A celebration confetti animation triggers.
   - The trade appears in the **Trade History** tab and the **Executed Trades Ledger**.
   - The order book depth re-aggregates automatically in real time!

---

## 👨‍💻 Engineering Viva Q&A Highlights

**Q: Where is MaxHeap implemented?**  
`backend/dataStructures/MaxHeap.js` (Class `MaxHeap` with `insert`, `extractMax`, `bubbleUp`, `bubbleDown`, `peek`, `remove`).

**Q: Where is MinHeap implemented?**  
`backend/dataStructures/MinHeap.js` (Class `MinHeap` with `insert`, `extractMin`, `bubbleUp`, `bubbleDown`, `peek`, `remove`).

**Q: Where is OrderBook implemented?**  
`backend/dataStructures/OrderBook.js` (Class `OrderBook` combining `buyOrders: MaxHeap`, `sellOrders: MinHeap`, and `orderMap: Map`).

**Q: Where is MatchingEngine implemented?**  
`backend/dataStructures/MatchingEngine.js` (Class `MatchingEngine` containing continuous double-auction price-time matching loop).

---

Developed as a full-stack Computer Science Engineering Data Structures project.
