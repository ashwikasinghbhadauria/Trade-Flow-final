/**
 * Stock.js — Mongoose Model for Simulated Stocks
 */

import mongoose from 'mongoose';

const pricePointSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    price: { type: Number, required: true },
    volume: { type: Number, default: 0 }
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0.01
    },
    previousClose: {
      type: Number,
      required: true
    },
    openPrice: {
      type: Number,
      required: true
    },
    dayHigh: {
      type: Number,
      required: true
    },
    dayLow: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      default: 0
    },
    priceChange: {
      type: Number,
      default: 0
    },
    priceChangePercent: {
      type: Number,
      default: 0
    },
    history: [pricePointSchema]
  },
  {
    timestamps: true
  }
);

export const Stock = mongoose.model('Stock', stockSchema);
export default Stock;
