/**
 * seedData.js — Realistic initial demo data generator for TradeFlow
 */

import { Stock } from '../models/Stock.js';
import { Order } from '../models/Order.js';
import { Trade } from '../models/Trade.js';
import { matchingService } from '../services/matchingService.js';

export const INITIAL_STOCKS = [
  {
    symbol: 'ABC',
    name: 'ABC Technologies',
    currentPrice: 1245.50,
    previousClose: 1217.00,
    openPrice: 1220.00,
    dayHigh: 1262.00,
    dayLow: 1215.00,
    volume: 142500,
    priceChange: 28.50,
    priceChangePercent: 2.34
  },
  {
    symbol: 'XYZ',
    name: 'XYZ Industries',
    currentPrice: 842.20,
    previousClose: 849.60,
    openPrice: 850.00,
    dayHigh: 855.40,
    dayLow: 838.00,
    volume: 89400,
    priceChange: -7.40,
    priceChangePercent: -0.87
  },
  {
    symbol: 'DEF',
    name: 'DEF Motors',
    currentPrice: 526.80,
    previousClose: 519.40,
    openPrice: 520.00,
    dayHigh: 531.00,
    dayLow: 518.50,
    volume: 215000,
    priceChange: 7.40,
    priceChangePercent: 1.42
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    currentPrice: 1480.20,
    previousClose: 1466.25,
    openPrice: 1470.00,
    dayHigh: 1492.00,
    dayLow: 1465.00,
    volume: 310200,
    priceChange: 13.95,
    priceChangePercent: 0.95
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    currentPrice: 920.40,
    previousClose: 910.20,
    openPrice: 912.00,
    dayHigh: 928.50,
    dayLow: 908.00,
    volume: 184500,
    priceChange: 10.20,
    priceChangePercent: 1.12
  }
];

function generateHistoricalData(basePrice, count = 30) {
  const points = [];
  const now = Date.now();
  let price = basePrice * 0.96;

  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 1000 * 15); // 15-minute intervals
    const change = (Math.random() - 0.48) * (basePrice * 0.008);
    price = Math.max(1, Number((price + change).toFixed(2)));
    points.push({
      timestamp,
      price,
      volume: Math.floor(Math.random() * 500 + 50) * 10
    });
  }
  // Ensure the last point is close to current basePrice
  points[points.length - 1].price = basePrice;
  return points;
}

export async function seedDatabase(force = false) {
  try {
    const count = await Stock.countDocuments();
    if (count > 0 && !force) {
      console.log('📦 Database already seeded with stocks.');
      return;
    }

    console.log('🌱 Seeding initial market data...');
    if (force) {
      await Stock.deleteMany({});
      await Order.deleteMany({});
      await Trade.deleteMany({});
      matchingService.engine.reset();
    }

    // Insert Stocks
    for (const stockDef of INITIAL_STOCKS) {
      const history = generateHistoricalData(stockDef.currentPrice, 40);
      const stock = new Stock({
        ...stockDef,
        history
      });
      await stock.save();

      // Seed realistic initial resting BUY orders (MaxHeap)
      const bidPrices = [
        Number((stockDef.currentPrice - 0.50).toFixed(2)),
        Number((stockDef.currentPrice - 1.20).toFixed(2)),
        Number((stockDef.currentPrice - 2.00).toFixed(2)),
        Number((stockDef.currentPrice - 3.50).toFixed(2)),
        Number((stockDef.currentPrice - 5.00).toFixed(2)),
        Number((stockDef.currentPrice - 7.50).toFixed(2))
      ];

      for (let i = 0; i < bidPrices.length; i++) {
        const orderId = `ORD_INIT_BUY_${stockDef.symbol}_${i + 1}`;
        const qty = [40, 60, 100, 80, 150, 200][i];
        const buyOrder = {
          orderId,
          userId: `Institution_${i + 1}`,
          stockSymbol: stockDef.symbol,
          type: 'BUY',
          price: bidPrices[i],
          quantity: qty,
          remainingQuantity: qty,
          filledQuantity: 0,
          status: 'OPEN',
          timestamp: new Date(Date.now() - (10 - i) * 60000)
        };
        await Order.create(buyOrder);
        matchingService.engine.getOrderBook(stockDef.symbol).addOrder(buyOrder);
      }

      // Seed realistic initial resting SELL orders (MinHeap)
      const askPrices = [
        Number((stockDef.currentPrice + 0.50).toFixed(2)),
        Number((stockDef.currentPrice + 1.40).toFixed(2)),
        Number((stockDef.currentPrice + 2.20).toFixed(2)),
        Number((stockDef.currentPrice + 3.80).toFixed(2)),
        Number((stockDef.currentPrice + 5.50).toFixed(2)),
        Number((stockDef.currentPrice + 8.00).toFixed(2))
      ];

      for (let i = 0; i < askPrices.length; i++) {
        const orderId = `ORD_INIT_SELL_${stockDef.symbol}_${i + 1}`;
        const qty = [50, 75, 40, 120, 90, 180][i];
        const sellOrder = {
          orderId,
          userId: `MarketMaker_${i + 1}`,
          stockSymbol: stockDef.symbol,
          type: 'SELL',
          price: askPrices[i],
          quantity: qty,
          remainingQuantity: qty,
          filledQuantity: 0,
          status: 'OPEN',
          timestamp: new Date(Date.now() - (10 - i) * 60000)
        };
        await Order.create(sellOrder);
        matchingService.engine.getOrderBook(stockDef.symbol).addOrder(sellOrder);
      }

      // Seed a few initial trades
      const initialTrades = [
        {
          tradeId: `TRD_INIT_${stockDef.symbol}_1`,
          stockSymbol: stockDef.symbol,
          price: stockDef.currentPrice,
          quantity: 100,
          buyer: 'Trader_Alpha',
          seller: 'Trader_Beta',
          buyOrderId: `ORD_HIST_B1_${stockDef.symbol}`,
          sellOrderId: `ORD_HIST_S1_${stockDef.symbol}`,
          timestamp: new Date(Date.now() - 5 * 60000)
        },
        {
          tradeId: `TRD_INIT_${stockDef.symbol}_2`,
          stockSymbol: stockDef.symbol,
          price: Number((stockDef.currentPrice - 0.20).toFixed(2)),
          quantity: 50,
          buyer: 'Trader_Gamma',
          seller: 'Trader_Delta',
          buyOrderId: `ORD_HIST_B2_${stockDef.symbol}`,
          sellOrderId: `ORD_HIST_S2_${stockDef.symbol}`,
          timestamp: new Date(Date.now() - 2 * 60000)
        }
      ];

      await Trade.insertMany(initialTrades);
      for (const t of initialTrades) {
        matchingService.engine.tradeHistory.push(t);
      }
      matchingService.engine.getOrderBook(stockDef.symbol).setLastTrade(stockDef.currentPrice, 100);
    }

    console.log('✅ Demo stock market successfully seeded with order books and trades!');
  } catch (err) {
    console.error('⚠️ Error seeding database:', err.message);
  }
}

export default seedDatabase;
