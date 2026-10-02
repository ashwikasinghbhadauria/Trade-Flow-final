/**
 * stocks.js — Routes for Stocks
 */

import express from 'express';
import {
  getStocks,
  getStockBySymbol,
  getStockHistory,
  resetMarketData
} from '../controllers/stockController.js';

const router = express.Router();

router.get('/', getStocks);
router.post('/reset', resetMarketData);
router.get('/:symbol', getStockBySymbol);
router.get('/:symbol/history', getStockHistory);

export default router;
