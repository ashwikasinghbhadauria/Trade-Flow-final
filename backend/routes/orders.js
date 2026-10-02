/**
 * orders.js — Routes for Orders and Order Books
 */

import express from 'express';
import {
  getOrders,
  placeOrder,
  cancelOrder,
  clearOrders,
  getOrderBook,
  getDataStructuresDebug
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', placeOrder);
router.delete('/', clearOrders);
router.delete('/:id', cancelOrder);
router.get('/book/:symbol', getOrderBook);
router.get('/debug/:symbol', getDataStructuresDebug);

export default router;
