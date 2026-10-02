/**
 * stockController.js — Controller for Stocks & Price History
 */

import { Stock } from '../models/Stock.js';
import { seedDatabase } from '../config/seedData.js';
import { matchingService } from '../services/matchingService.js';

export async function getStocks(req, res) {
  try {
    const stocks = await Stock.find({}).sort({ symbol: 1 });
    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getStockBySymbol(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = await Stock.findOne({ symbol });
    if (!stock) {
      return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });
    }
    const depth = matchingService.getOrderBookDepth(symbol);
    res.json({ success: true, data: stock, orderBook: depth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getStockHistory(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { timeframe = '1D' } = req.query;
    const stock = await Stock.findOne({ symbol });

    if (!stock) {
      return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });
    }

    let history = stock.history || [];
    // If history is small, generate additional timeframe variations for 1W, 1M, 3M
    if (timeframe === '1W' || timeframe === '1M' || timeframe === '3M') {
      const days = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 90;
      const stepPoints = [];
      const now = Date.now();
      let p = stock.openPrice * 0.92;
      for (let i = days; i >= 0; i--) {
        const time = new Date(now - i * 24 * 60 * 60 * 1000);
        const delta = (Math.random() - 0.48) * (stock.currentPrice * 0.02);
        p = Math.max(1, Number((p + delta).toFixed(2)));
        stepPoints.push({
          timestamp: time,
          price: p,
          volume: Math.floor(Math.random() * 5000 + 1000)
        });
      }
      stepPoints[stepPoints.length - 1].price = stock.currentPrice;
      return res.json({ success: true, timeframe, data: stepPoints });
    }

    res.json({ success: true, timeframe, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function resetMarketData(req, res) {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Market data reset and re-seeded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
