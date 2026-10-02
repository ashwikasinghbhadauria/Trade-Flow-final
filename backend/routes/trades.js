/**
 * trades.js — Routes for Trades
 */

import express from 'express';
import { Trade } from '../models/Trade.js';
import { matchingService } from '../services/matchingService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { symbol, limit = 100 } = req.query;
    const filter = {};
    if (symbol) {
      filter.stockSymbol = symbol.toUpperCase();
    }
    const trades = await Trade.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: trades.length, data: trades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { symbol } = req.query;
    const filter = {};
    if (symbol) {
      filter.stockSymbol = symbol.toUpperCase();
    }

    const result = await Trade.deleteMany(filter);
    if (!symbol) {
      matchingService.engine.tradeHistory = [];
    } else {
      matchingService.engine.tradeHistory = matchingService.engine.tradeHistory.filter(
        (t) => t.stockSymbol !== symbol.toUpperCase()
      );
    }

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} trade records successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
