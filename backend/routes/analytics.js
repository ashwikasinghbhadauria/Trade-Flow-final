/**
 * analytics.js — Market Analytics & Trading KPIs
 */

import express from 'express';
import { Stock } from '../models/Stock.js';
import { Order } from '../models/Order.js';
import { Trade } from '../models/Trade.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [stocks, allOrders, trades] = await Promise.all([
      Stock.find({}),
      Order.find({}),
      Trade.find({}).sort({ timestamp: -1 })
    ]);

    const totalTrades = trades.length;
    const totalVolume = trades.reduce((sum, t) => sum + (t.quantity * t.price), 0);
    const totalSharesTraded = trades.reduce((sum, t) => sum + t.quantity, 0);

    const activeOrders = allOrders.filter((o) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED');
    const buyOrders = allOrders.filter((o) => o.type === 'BUY');
    const sellOrders = allOrders.filter((o) => o.type === 'SELL');

    // Volume by stock
    const volumeByStockMap = {};
    for (const s of stocks) {
      volumeByStockMap[s.symbol] = {
        symbol: s.symbol,
        name: s.name,
        tradeCount: 0,
        volumeValue: 0,
        shares: 0,
        currentPrice: s.currentPrice,
        priceChangePercent: s.priceChangePercent
      };
    }

    for (const t of trades) {
      if (volumeByStockMap[t.stockSymbol]) {
        volumeByStockMap[t.stockSymbol].tradeCount += 1;
        volumeByStockMap[t.stockSymbol].volumeValue += t.quantity * t.price;
        volumeByStockMap[t.stockSymbol].shares += t.quantity;
      }
    }

    const volumeByStock = Object.values(volumeByStockMap);
    
    // Find most traded stock
    const mostTraded = [...volumeByStock].sort((a, b) => b.volumeValue - a.volumeValue)[0] || null;

    // Trades timeline (last 20 trades bucketed or formatted)
    const recentTradesTimeline = trades.slice(0, 25).reverse().map((t) => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: t.price,
      quantity: t.quantity,
      value: Number((t.price * t.quantity).toFixed(2)),
      symbol: t.stockSymbol
    }));

    res.json({
      success: true,
      data: {
        totalTrades,
        totalVolume: Number(totalVolume.toFixed(2)),
        totalSharesTraded,
        activeOrdersCount: activeOrders.length,
        buyOrdersCount: buyOrders.length,
        sellOrdersCount: sellOrders.length,
        mostTradedStock: mostTraded,
        volumeByStock,
        recentTradesTimeline,
        stockSummary: stocks.map((s) => ({
          symbol: s.symbol,
          name: s.name,
          currentPrice: s.currentPrice,
          priceChange: s.priceChange,
          priceChangePercent: s.priceChangePercent,
          volume: s.volume
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
