/**
 * Trade.js — Mongoose Model for Executed Trades
 */

import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema(
  {
    tradeId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    stockSymbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0.01
    },
    buyer: {
      type: String,
      required: true,
      index: true
    },
    seller: {
      type: String,
      required: true,
      index: true
    },
    buyOrderId: {
      type: String,
      required: true,
      index: true
    },
    sellOrderId: {
      type: String,
      required: true,
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

export const Trade = mongoose.model('Trade', tradeSchema);
export default Trade;
