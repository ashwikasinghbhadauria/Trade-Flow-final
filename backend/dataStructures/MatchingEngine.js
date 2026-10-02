/**
 * MatchingEngine.js — Core Stock Market Order Matching Engine
 * 
 * Engineering Data Structures Specification:
 * - Implements continuous double-auction matching with Price-Time Priority.
 * - Multi-stock support: Maintains an OrderBook per stock symbol.
 * - Handles:
 *     1. Full order fills
 *     2. Partial order fills
 *     3. Multiple fills across price levels
 *     4. Resting limit orders
 *     5. Order cancellations
 * 
 * Price-Time Priority Invariant:
 * - A BUY order matches when BUY PRICE >= SELL PRICE.
 * - Execution Price: Always trades at the resting (maker) order's price.
 * - High bid matches low ask first; ties broken by earliest arrival timestamp.
 */

import { v4 as uuidv4 } from 'uuid';
import { OrderBook } from './OrderBook.js';

export class MatchingEngine {
  constructor() {
    // Map of symbol -> OrderBook instance
    this.orderBooks = new Map();
    // Complete audit log of all executed trades across the market
    this.tradeHistory = [];
  }

  /**
   * Retrieves or initializes an OrderBook for a given stock symbol.
   * @param {string} symbol 
   * @returns {OrderBook}
   */
  getOrderBook(symbol) {
    const cleanSymbol = symbol.toUpperCase();
    if (!this.orderBooks.has(cleanSymbol)) {
      this.orderBooks.set(cleanSymbol, new OrderBook(cleanSymbol));
    }
    return this.orderBooks.get(cleanSymbol);
  }

  /**
   * Processes a newly submitted order through the matching engine.
   * 
   * @param {Object} orderData 
   * @returns {Object} { order, trades, updatedOrders, depth }
   */
  processOrder(orderData) {
    const symbol = orderData.stockSymbol?.toUpperCase() || orderData.symbol?.toUpperCase();
    if (!symbol) {
      throw new Error('Stock symbol is required.');
    }

    const price = Number(orderData.price);
    const quantity = Number(orderData.quantity);
    const type = orderData.type?.toUpperCase();

    if (isNaN(price) || price <= 0) {
      throw new Error(`Invalid order price: ${orderData.price}. Must be greater than 0.`);
    }
    if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error(`Invalid order quantity: ${orderData.quantity}. Must be a positive integer.`);
    }
    if (type !== 'BUY' && type !== 'SELL') {
      throw new Error(`Invalid order type: ${orderData.type}. Must be BUY or SELL.`);
    }

    const orderBook = this.getOrderBook(symbol);

    // Build standard order object
    const incomingOrder = {
      orderId: orderData.orderId || `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: orderData.userId || 'trader_user',
      stockSymbol: symbol,
      type,
      price,
      quantity,
      remainingQuantity: quantity,
      filledQuantity: 0,
      timestamp: orderData.timestamp ? new Date(orderData.timestamp) : new Date(),
      status: 'OPEN'
    };

    const trades = [];
    const updatedOrders = [];

    // ==========================================
    // BUY ORDER MATCHING LOGIC (Against MinHeap)
    // ==========================================
    if (incomingOrder.type === 'BUY') {
      while (incomingOrder.remainingQuantity > 0 && !orderBook.sellOrders.isEmpty()) {
        const bestAsk = orderBook.sellOrders.peek();

        // Check if matching condition is met: BUY PRICE >= BEST SELL PRICE
        if (incomingOrder.price >= bestAsk.price) {
          // Execution price is the resting ask price (maker price)
          const executionPrice = bestAsk.price;
          const matchQuantity = Math.min(incomingOrder.remainingQuantity, bestAsk.remainingQuantity);

          // Update Quantities
          incomingOrder.remainingQuantity -= matchQuantity;
          incomingOrder.filledQuantity += matchQuantity;
          bestAsk.remainingQuantity -= matchQuantity;
          bestAsk.filledQuantity += matchQuantity;

          // Create Trade Event
          const trade = {
            tradeId: `TRD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            stockSymbol: symbol,
            price: executionPrice,
            quantity: matchQuantity,
            buyer: incomingOrder.userId,
            seller: bestAsk.userId,
            buyOrderId: incomingOrder.orderId,
            sellOrderId: bestAsk.orderId,
            timestamp: new Date()
          };

          trades.push(trade);
          this.tradeHistory.unshift(trade);
          orderBook.setLastTrade(executionPrice, matchQuantity, trade.timestamp);

          // Update Ask Order Status
          if (bestAsk.remainingQuantity === 0) {
            bestAsk.status = 'FILLED';
            // Remove completely filled order from MinHeap
            orderBook.sellOrders.extractMin();
          } else {
            bestAsk.status = 'PARTIALLY_FILLED';
            // If still has quantity, the heap root remains bestAsk with updated remainingQuantity
          }

          // Update resting order in orderMap
          orderBook.orderMap.set(bestAsk.orderId, { ...bestAsk });
          updatedOrders.push({ ...bestAsk });
        } else {
          // Best ask is higher than incoming buy price -> No further matches possible
          break;
        }
      }

      // Finalize incoming BUY order status
      if (incomingOrder.remainingQuantity === 0) {
        incomingOrder.status = 'FILLED';
        // Filled completely, add to map for lookup
        orderBook.orderMap.set(incomingOrder.orderId, { ...incomingOrder });
      } else {
        if (incomingOrder.filledQuantity > 0) {
          incomingOrder.status = 'PARTIALLY_FILLED';
        } else {
          incomingOrder.status = 'OPEN';
        }
        // Insert remaining quantity into MaxHeap as resting order
        orderBook.buyOrders.insert({ ...incomingOrder });
        orderBook.orderMap.set(incomingOrder.orderId, { ...incomingOrder });
      }
    }

    // ===========================================
    // SELL ORDER MATCHING LOGIC (Against MaxHeap)
    // ===========================================
    else if (incomingOrder.type === 'SELL') {
      while (incomingOrder.remainingQuantity > 0 && !orderBook.buyOrders.isEmpty()) {
        const bestBid = orderBook.buyOrders.peek();

        // Check if matching condition is met: SELL PRICE <= BEST BUY PRICE
        if (incomingOrder.price <= bestBid.price) {
          // Execution price is the resting bid price (maker price)
          const executionPrice = bestBid.price;
          const matchQuantity = Math.min(incomingOrder.remainingQuantity, bestBid.remainingQuantity);

          // Update Quantities
          incomingOrder.remainingQuantity -= matchQuantity;
          incomingOrder.filledQuantity += matchQuantity;
          bestBid.remainingQuantity -= matchQuantity;
          bestBid.filledQuantity += matchQuantity;

          // Create Trade Event
          const trade = {
            tradeId: `TRD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            stockSymbol: symbol,
            price: executionPrice,
            quantity: matchQuantity,
            buyer: bestBid.userId,
            seller: incomingOrder.userId,
            buyOrderId: bestBid.orderId,
            sellOrderId: incomingOrder.orderId,
            timestamp: new Date()
          };

          trades.push(trade);
          this.tradeHistory.unshift(trade);
          orderBook.setLastTrade(executionPrice, matchQuantity, trade.timestamp);

          // Update Bid Order Status
          if (bestBid.remainingQuantity === 0) {
            bestBid.status = 'FILLED';
            // Remove completely filled order from MaxHeap
            orderBook.buyOrders.extractMax();
          } else {
            bestBid.status = 'PARTIALLY_FILLED';
          }

          // Update resting order in orderMap
          orderBook.orderMap.set(bestBid.orderId, { ...bestBid });
          updatedOrders.push({ ...bestBid });
        } else {
          // Best bid is lower than incoming sell price -> No further matches possible
          break;
        }
      }

      // Finalize incoming SELL order status
      if (incomingOrder.remainingQuantity === 0) {
        incomingOrder.status = 'FILLED';
        orderBook.orderMap.set(incomingOrder.orderId, { ...incomingOrder });
      } else {
        if (incomingOrder.filledQuantity > 0) {
          incomingOrder.status = 'PARTIALLY_FILLED';
        } else {
          incomingOrder.status = 'OPEN';
        }
        // Insert remaining quantity into MinHeap as resting order
        orderBook.sellOrders.insert({ ...incomingOrder });
        orderBook.orderMap.set(incomingOrder.orderId, { ...incomingOrder });
      }
    }

    return {
      order: incomingOrder,
      trades,
      updatedOrders,
      depth: orderBook.getDepth()
    };
  }

  /**
   * Cancels an order in the matching engine.
   * @param {string} orderId 
   * @param {string} symbol 
   * @returns {Object|null}
   */
  cancelOrder(orderId, symbol) {
    if (!symbol) {
      // Find symbol across all books if not provided
      for (const [sym, book] of this.orderBooks.entries()) {
        if (book.getOrder(orderId)) {
          return book.cancelOrder(orderId);
        }
      }
      return null;
    }
    const book = this.getOrderBook(symbol);
    return book.cancelOrder(orderId);
  }

  /**
   * Returns trades for a given symbol or all trades.
   * @param {string} [symbol] 
   * @param {number} [limit=50] 
   * @returns {Array}
   */
  getTrades(symbol = null, limit = 50) {
    if (symbol) {
      const clean = symbol.toUpperCase();
      return this.tradeHistory.filter((t) => t.stockSymbol === clean).slice(0, limit);
    }
    return this.tradeHistory.slice(0, limit);
  }

  /**
   * Clears all order books and trade history.
   */
  reset() {
    this.orderBooks.clear();
    this.tradeHistory = [];
  }
}

export default MatchingEngine;
