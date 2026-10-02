/**
 * matchingService.js — Bridge between Data Structures Matching Engine, Mongoose DB & Socket.IO
 */

import { MatchingEngine } from '../dataStructures/MatchingEngine.js';
import { Order } from '../models/Order.js';
import { Trade } from '../models/Trade.js';
import { Stock } from '../models/Stock.js';

class MatchingService {
  constructor() {
    this.engine = new MatchingEngine();
    this.io = null;
    this.isInitialized = false;
  }

  /**
   * Initializes the matching service with Socket.IO and loads active orders from DB
   * @param {import('socket.io').Server} io 
   */
  async initialize(io) {
    this.io = io;
    try {
      console.log('🔄 Initializing Matching Engine from Database...');
      // Load all open and partially filled orders from database into the memory heaps
      const activeOrders = await Order.find({
        status: { $in: ['OPEN', 'PARTIALLY_FILLED'] }
      }).sort({ timestamp: 1 });

      for (const order of activeOrders) {
        const orderBook = this.engine.getOrderBook(order.stockSymbol);
        orderBook.addOrder({
          orderId: order.orderId,
          userId: order.userId,
          stockSymbol: order.stockSymbol,
          type: order.type,
          price: order.price,
          quantity: order.quantity,
          remainingQuantity: order.remainingQuantity,
          filledQuantity: order.filledQuantity,
          timestamp: order.timestamp,
          status: order.status
        });
      }

      console.log(`✅ Loaded ${activeOrders.length} active orders into in-memory MaxHeap/MinHeap structures.`);
      this.isInitialized = true;
    } catch (err) {
      console.error('⚠️ Error initializing matching service from DB:', err.message);
    }
  }

  /**
   * Places a BUY or SELL order, executes matching logic, persists trades/orders,
   * updates stock prices, and emits real-time events.
   * 
   * @param {Object} orderData 
   * @returns {Promise<Object>}
   */
  async placeOrder(orderData) {
    const symbol = (orderData.stockSymbol || orderData.symbol).toUpperCase();
    
    // Verify stock exists in DB
    const stock = await Stock.findOne({ symbol });
    if (!stock) {
      throw new Error(`Stock with symbol "${symbol}" not found.`);
    }

    // 1. Process order through core Data Structures matching engine
    const matchResult = this.engine.processOrder({
      ...orderData,
      stockSymbol: symbol
    });

    const { order, trades, updatedOrders, depth } = matchResult;

    // 2. Persist incoming order to DB
    const savedOrder = await Order.findOneAndUpdate(
      { orderId: order.orderId },
      {
        orderId: order.orderId,
        userId: order.userId,
        stockSymbol: order.stockSymbol,
        type: order.type,
        price: order.price,
        quantity: order.quantity,
        remainingQuantity: order.remainingQuantity,
        filledQuantity: order.filledQuantity,
        status: order.status,
        timestamp: order.timestamp
      },
      { upsert: true, new: true }
    );

    // 3. Persist updated resting orders to DB
    for (const updated of updatedOrders) {
      await Order.findOneAndUpdate(
        { orderId: updated.orderId },
        {
          remainingQuantity: updated.remainingQuantity,
          filledQuantity: updated.filledQuantity,
          status: updated.status
        }
      );
    }

    // 4. Persist newly executed trades & update stock price statistics
    if (trades.length > 0) {
      await Trade.insertMany(trades);

      const latestTrade = trades[trades.length - 1];
      const newPrice = Number(latestTrade.price.toFixed(2));
      const totalVolumeTraded = trades.reduce((sum, t) => sum + t.quantity, 0);

      // Update Stock statistics
      const priceChange = Number((newPrice - stock.openPrice).toFixed(2));
      const priceChangePercent = Number(((priceChange / stock.openPrice) * 100).toFixed(2));
      const dayHigh = Math.max(stock.dayHigh, newPrice);
      const dayLow = Math.min(stock.dayLow, newPrice);
      const volume = (stock.volume || 0) + totalVolumeTraded;

      stock.currentPrice = newPrice;
      stock.priceChange = priceChange;
      stock.priceChangePercent = priceChangePercent;
      stock.dayHigh = dayHigh;
      stock.dayLow = dayLow;
      stock.volume = volume;

      // Append to historical timeline for charts
      stock.history.push({
        timestamp: new Date(),
        price: newPrice,
        volume: totalVolumeTraded
      });

      // Keep recent 150 points for snappy responsiveness
      if (stock.history.length > 150) {
        stock.history.shift();
      }

      await stock.save();

      // Emit market price update event
      if (this.io) {
        this.io.emit('marketPriceUpdated', {
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.currentPrice,
          priceChange: stock.priceChange,
          priceChangePercent: stock.priceChangePercent,
          dayHigh: stock.dayHigh,
          dayLow: stock.dayLow,
          volume: stock.volume,
          lastTrade: latestTrade
        });

        // Emit each trade executed
        for (const t of trades) {
          this.io.emit('tradeExecuted', t);
        }
      }
    }

    // 5. Emit real-time updates to all connected frontend clients
    if (this.io) {
      this.io.emit('orderCreated', savedOrder);

      for (const updated of updatedOrders) {
        this.io.emit('orderUpdated', updated);
      }

      this.io.emit('orderBookUpdated', depth);
    }

    return {
      order: savedOrder,
      trades,
      updatedOrders,
      depth
    };
  }

  /**
   * Cancels an active order
   * @param {string} orderId 
   * @param {string} [symbol] 
   */
  async cancelOrder(orderId, symbol) {
    const cancelled = this.engine.cancelOrder(orderId, symbol);
    if (!cancelled) {
      throw new Error(`Order ${orderId} could not be cancelled. It may already be filled or cancelled.`);
    }

    const updatedDBOrder = await Order.findOneAndUpdate(
      { orderId },
      { status: 'CANCELLED' },
      { new: true }
    );

    const sym = cancelled.stockSymbol;
    const depth = this.engine.getOrderBook(sym).getDepth();

    if (this.io) {
      this.io.emit('orderCancelled', updatedDBOrder || cancelled);
      this.io.emit('orderBookUpdated', depth);
    }

    return updatedDBOrder || cancelled;
  }

  /**
   * Fetches the live order book depth for a symbol
   * @param {string} symbol 
   */
  getOrderBookDepth(symbol) {
    const book = this.engine.getOrderBook(symbol);
    return book.getDepth();
  }

  /**
   * Exposes raw internal heap structures and maps for the Data Structures visualization page
   * @param {string} symbol 
   */
  getDataStructuresState(symbol) {
    const book = this.engine.getOrderBook(symbol);
    return {
      symbol: book.symbol,
      maxHeap: {
        rawArray: book.buyOrders.toArray(),
        size: book.buyOrders.size(),
        peek: book.buyOrders.peek(),
        sorted: book.buyOrders.getSortedOrders()
      },
      minHeap: {
        rawArray: book.sellOrders.toArray(),
        size: book.sellOrders.size(),
        peek: book.sellOrders.peek(),
        sorted: book.sellOrders.getSortedOrders()
      },
      orderMapKeys: Array.from(book.orderMap.keys()),
      orderMapCount: book.orderMap.size,
      spread: book.getSpread(),
      lastTradedPrice: book.lastTradedPrice
    };
  }
}

export const matchingService = new MatchingService();
export default matchingService;
