/**
 * simulationService.js — Automated Market Maker & Order Flow Simulator
 * 
 * Features:
 * - Generates realistic market liquidity around current stock prices.
 * - Randomly crosses spreads to generate live trades and price fluctuations.
 * - Allows user to Start/Stop simulation from the UI.
 * - Emits real-time updates via Socket.IO.
 */

import { Stock } from '../models/Stock.js';
import { matchingService } from './matchingService.js';

class SimulationService {
  constructor() {
    this.isRunning = false;
    this.timer = null;
    this.intervalMs = 3000;
    this.traderNames = [
      'AlphaFund', 'QuantumTrader', 'ApexCapital', 'VanguardAlgo',
      'ZenithBot', 'NexusHedge', 'BlackRockSim', 'CitadelAlgo',
      'Retail_Rahul', 'Retail_Priya', 'Retail_Aarav', 'OptimaFlow'
    ];
  }

  /**
   * Starts or resumes the market simulation
   */
  start() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = true;
    this.timer = setInterval(() => this.runSimulationStep(), this.intervalMs);
    console.log('🟢 Market Simulation: ON');
    this.broadcastStatus();
  }

  /**
   * Stops the market simulation
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('🔴 Market Simulation: OFF');
    this.broadcastStatus();
  }

  /**
   * Toggles simulation state
   */
  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  /**
   * Returns current simulation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs
    };
  }

  /**
   * Broadcasts status via Socket.IO
   */
  broadcastStatus() {
    if (matchingService.io) {
      matchingService.io.emit('simulationStatus', this.getStatus());
    }
  }

  /**
   * Executes a single simulation step: picks a random stock, generates a realistic BUY or SELL order.
   */
  async runSimulationStep() {
    try {
      const stocks = await Stock.find({});
      if (!stocks || stocks.length === 0) return;

      // Pick random stock
      const stock = stocks[Math.floor(Math.random() * stocks.length)];
      const depth = matchingService.getOrderBookDepth(stock.symbol);

      const isBuy = Math.random() > 0.5;
      const trader = this.traderNames[Math.floor(Math.random() * this.traderNames.length)];
      
      // Calculate realistic price: either slightly above/below last traded price or best bid/ask
      const basePrice = stock.currentPrice;
      const variationPercent = (Math.random() * 0.016 - 0.008); // +/- 0.8%
      let orderPrice = Number((basePrice * (1 + variationPercent)).toFixed(2));

      // 40% chance of crossing the spread to trigger a real match & trade
      const shouldMatch = Math.random() < 0.4;
      if (shouldMatch) {
        if (isBuy && depth.bestAsk) {
          orderPrice = depth.bestAsk.price; // Cross ask to trigger buy match
        } else if (!isBuy && depth.bestBid) {
          orderPrice = depth.bestBid.price; // Cross bid to trigger sell match
        }
      }

      // Quantity between 10 and 150 shares (rounded to multiple of 5)
      const quantity = Math.floor(Math.random() * 25 + 2) * 5;

      // Submit through matching service
      await matchingService.placeOrder({
        stockSymbol: stock.symbol,
        type: isBuy ? 'BUY' : 'SELL',
        price: orderPrice,
        quantity,
        userId: trader
      });
    } catch (err) {
      // Catch and log simulation tick error without crashing
      console.warn('Simulation step warning:', err.message);
    }
  }
}

export const simulationService = new SimulationService();
export default simulationService;
