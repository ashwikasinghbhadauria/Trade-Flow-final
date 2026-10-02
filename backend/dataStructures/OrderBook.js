/**
 * OrderBook.js — Core Order Book Data Structure
 * 
 * Engineering Data Structures Specification:
 * - Encapsulates BUY side (MaxHeap) and SELL side (MinHeap).
 * - Uses a JavaScript Map (Hash Map) for O(1) order lookups, updates, and cancellations.
 * - Aggregates price levels for market depth calculations.
 * 
 * Key Operations:
 * - addOrder(order):      O(log n) heap insert + O(1) Map write
 * - cancelOrder(orderId): O(1) Map lookup + O(n) heap removal
 * - getBestBid():         O(1) peek
 * - getBestAsk():         O(1) peek
 * - getOrder(orderId):    O(1) Map lookup
 */

import { MaxHeap } from './MaxHeap.js';
import { MinHeap } from './MinHeap.js';

export class OrderBook {
  /**
   * @param {string} symbol - The stock ticker symbol (e.g. 'ABC', 'INFY')
   */
  constructor(symbol) {
    this.symbol = symbol;
    this.buyOrders = new MaxHeap();   // Max Heap for BUY orders (Highest Bid First)
    this.sellOrders = new MinHeap(); // Min Heap for SELL orders (Lowest Ask First)
    this.orderMap = new Map();       // Hash Map for O(1) orderId -> order lookup
    this.lastTradedPrice = null;
    this.lastTradedQuantity = 0;
    this.lastTradedTimestamp = null;
  }

  /**
   * Adds an order to the order book and the hash map.
   * @param {Object} order 
   */
  addOrder(order) {
    const formattedOrder = {
      orderId: order.orderId || order._id?.toString(),
      userId: order.userId || 'trader_default',
      stockSymbol: this.symbol,
      type: order.type, // 'BUY' or 'SELL'
      price: Number(order.price),
      quantity: Number(order.quantity),
      remainingQuantity: Number(order.remainingQuantity !== undefined ? order.remainingQuantity : order.quantity),
      filledQuantity: Number(order.filledQuantity || 0),
      timestamp: order.timestamp ? new Date(order.timestamp) : new Date(),
      status: order.status || 'OPEN'
    };

    if (formattedOrder.type === 'BUY') {
      this.buyOrders.insert(formattedOrder);
    } else if (formattedOrder.type === 'SELL') {
      this.sellOrders.insert(formattedOrder);
    } else {
      throw new Error(`Invalid order type: ${formattedOrder.type}. Must be BUY or SELL.`);
    }

    // Store in Hash Map for O(1) retrieval and fast cancellation
    this.orderMap.set(formattedOrder.orderId, formattedOrder);
    return formattedOrder;
  }

  /**
   * Fast O(1) lookup of any order in the book.
   * @param {string} orderId 
   * @returns {Object|null}
   */
  getOrder(orderId) {
    return this.orderMap.get(orderId) || null;
  }

  /**
   * Cancels an open or partially filled order.
   * Removes from respective heap and updates status in map.
   * @param {string} orderId 
   * @returns {Object|null} The cancelled order or null if not found
   */
  cancelOrder(orderId) {
    const order = this.orderMap.get(orderId);
    if (!order) return null;

    if (order.status === 'FILLED' || order.status === 'CANCELLED') {
      return null; // Cannot cancel already finalized order
    }

    if (order.type === 'BUY') {
      this.buyOrders.remove(orderId);
    } else {
      this.sellOrders.remove(orderId);
    }

    order.status = 'CANCELLED';
    this.orderMap.set(orderId, order);
    return order;
  }

  /**
   * Removes an order completely from the book (e.g. after fill)
   * @param {string} orderId 
   */
  removeOrder(orderId) {
    const order = this.orderMap.get(orderId);
    if (!order) return null;

    if (order.type === 'BUY') {
      this.buyOrders.remove(orderId);
    } else {
      this.sellOrders.remove(orderId);
    }
    this.orderMap.delete(orderId);
    return order;
  }

  /**
   * Returns the highest BUY order currently in the book (Best Bid)
   * Time Complexity: O(1)
   * @returns {Object|null}
   */
  getBestBid() {
    return this.buyOrders.peek();
  }

  /**
   * Returns the lowest SELL order currently in the book (Best Ask)
   * Time Complexity: O(1)
   * @returns {Object|null}
   */
  getBestAsk() {
    return this.sellOrders.peek();
  }

  /**
   * Returns all active BUY orders sorted by price-time priority (Highest price first).
   * @returns {Array}
   */
  getBuyOrders() {
    return this.buyOrders.getSortedOrders();
  }

  /**
   * Returns all active SELL orders sorted by price-time priority (Lowest price first).
   * @returns {Array}
   */
  getSellOrders() {
    return this.sellOrders.getSortedOrders();
  }

  /**
   * Calculates the Bid-Ask spread: (Best Ask - Best Bid)
   * @returns {number|null}
   */
  getSpread() {
    const bestBid = this.getBestBid();
    const bestAsk = this.getBestAsk();
    if (bestBid && bestAsk) {
      return Number((bestAsk.price - bestBid.price).toFixed(2));
    }
    return null;
  }

  /**
   * Computes market depth aggregated by price level for visual order book presentation.
   * Groups multiple orders at the same price, calculates cumulative volumes and relative percentages.
   * 
   * @param {number} limit - Maximum number of price levels to return
   * @returns {Object} { bids: [], asks: [], spread, maxCumulativeVolume }
   */
  getDepth(limit = 10) {
    const rawBuys = this.getBuyOrders();
    const rawSells = this.getSellOrders();

    // Aggregate Bids by price
    const bidMap = new Map();
    for (const order of rawBuys) {
      const price = order.price;
      const existing = bidMap.get(price) || { price, quantity: 0, orderCount: 0, orders: [] };
      existing.quantity += order.remainingQuantity;
      existing.orderCount += 1;
      existing.orders.push(order);
      bidMap.set(price, existing);
    }

    // Aggregate Asks by price
    const askMap = new Map();
    for (const order of rawSells) {
      const price = order.price;
      const existing = askMap.get(price) || { price, quantity: 0, orderCount: 0, orders: [] };
      existing.quantity += order.remainingQuantity;
      existing.orderCount += 1;
      existing.orders.push(order);
      askMap.set(price, existing);
    }

    // Sort Bids: highest price first
    const bids = Array.from(bidMap.values())
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);

    // Sort Asks: lowest price first
    const asks = Array.from(askMap.values())
      .sort((a, b) => a.price - b.price)
      .slice(0, limit);

    // Calculate cumulative totals
    let cumulativeBidTotal = 0;
    for (const bid of bids) {
      cumulativeBidTotal += bid.quantity;
      bid.total = cumulativeBidTotal;
    }

    let cumulativeAskTotal = 0;
    for (const ask of asks) {
      cumulativeAskTotal += ask.quantity;
      ask.total = cumulativeAskTotal;
    }

    const maxCumulativeVolume = Math.max(cumulativeBidTotal, cumulativeAskTotal, 1);

    // Attach percentage for depth bar visualization
    bids.forEach((b) => {
      b.depthPercent = Math.min(100, Math.round((b.total / maxCumulativeVolume) * 100));
    });
    asks.forEach((a) => {
      a.depthPercent = Math.min(100, Math.round((a.total / maxCumulativeVolume) * 100));
    });

    return {
      symbol: this.symbol,
      bids,
      asks,
      spread: this.getSpread(),
      bestBid: this.getBestBid(),
      bestAsk: this.getBestAsk(),
      lastTradedPrice: this.lastTradedPrice,
      lastTradedQuantity: this.lastTradedQuantity,
      buyOrderCount: this.buyOrders.size(),
      sellOrderCount: this.sellOrders.size(),
      totalBuyVolume: cumulativeBidTotal,
      totalSellVolume: cumulativeAskTotal,
      maxCumulativeVolume
    };
  }

  /**
   * Sets last trade information for market tracking
   */
  setLastTrade(price, quantity, timestamp = new Date()) {
    this.lastTradedPrice = price;
    this.lastTradedQuantity = quantity;
    this.lastTradedTimestamp = timestamp;
  }

  /**
   * Clears the entire book
   */
  clear() {
    this.buyOrders.clear();
    this.sellOrders.clear();
    this.orderMap.clear();
  }
}

export default OrderBook;
