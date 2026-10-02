/**
 * Order.js — Mongoose Model for Buy and Sell Limit Orders
 */

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      default: 'trader_user',
      index: true
    },
    stockSymbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['BUY', 'SELL'],
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    filledQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0.01
    },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED'],
      default: 'OPEN',
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);
export default Order;
