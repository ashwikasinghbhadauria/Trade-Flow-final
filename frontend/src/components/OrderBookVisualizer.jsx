/**
 * OrderBookVisualizer.jsx — High-Performance Order Book & Depth Visualizer
 * 
 * Features:
 * - SELL Orders (Asks, MinHeap) in Crimson Red (Lowest Ask on bottom of sell side)
 * - Middle Ribbon: Last Traded Price, Spread (₹), Spread %
 * - BUY Orders (Bids, MaxHeap) in Emerald Green (Highest Bid on top of buy side)
 * - Dynamic Depth volume bars
 * - Best Bid & Best Ask badges
 * - Click-to-trade: Clicking any price in the book fills price in order form
 */

import React from 'react';
import { Layers, ArrowUp, ArrowDown, Activity, Sparkles } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const OrderBookVisualizer = ({ onSelectPrice }) => {
  const { orderBook, selectedStock } = useMarket();

  const asks = orderBook?.asks || [];
  const bids = orderBook?.bids || [];
  const spread = orderBook?.spread;
  const lastPrice = orderBook?.lastTradedPrice || selectedStock?.currentPrice;
  const maxCumulative = orderBook?.maxCumulativeVolume || 100;

  // We show top 7 asks (reversed so lowest ask is closest to center spread)
  const displayAsks = [...asks].slice(0, 7).reverse();
  const displayBids = [...bids].slice(0, 7);

  const bestAskPrice = orderBook?.bestAsk?.price;
  const bestBidPrice = orderBook?.bestBid?.price;

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-full space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Live Order Book
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              MaxHeap (Bids) & MinHeap (Asks)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Spread
          </span>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {spread !== null && spread !== undefined ? `₹${spread.toFixed(2)}` : '0.00'}
          </span>
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 bg-[#0B0F19]/80 rounded-lg border border-white/5">
        <div>Price (₹)</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      {/* SELL SIDE (ASKS - Red / MinHeap) */}
      <div className="space-y-1 overflow-hidden min-h-[140px] flex flex-col justify-end">
        {displayAsks.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500 font-mono">
            No active Sell orders in MinHeap
          </div>
        ) : (
          displayAsks.map((ask, idx) => {
            const isBestAsk = ask.price === bestAskPrice;
            const depthWidth = Math.min(100, Math.round((ask.total / maxCumulative) * 100));

            return (
              <div
                key={`ask-${ask.price}-${idx}`}
                onClick={() => onSelectPrice && onSelectPrice(ask.price, 'BUY')}
                className="relative grid grid-cols-3 text-xs font-mono py-1 px-2 rounded cursor-pointer hover:bg-rose-500/10 transition-colors group"
                title={`Click to BUY @ ₹${ask.price}`}
              >
                {/* Visual Depth Bar Background */}
                <div
                  className="absolute right-0 top-0 bottom-0 ask-depth-bar rounded opacity-60 transition-all duration-300 pointer-events-none"
                  style={{ width: `${depthWidth}%` }}
                />

                {/* Price */}
                <div className="relative z-10 flex items-center gap-1.5 font-bold text-rose-400">
                  <span>{ask.price.toFixed(2)}</span>
                  {isBestAsk && (
                    <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-sans font-bold">
                      BEST ASK
                    </span>
                  )}
                </div>

                {/* Quantity */}
                <div className="relative z-10 text-right text-slate-200">
                  {formatNumber(ask.quantity)}
                </div>

                {/* Cumulative Total */}
                <div className="relative z-10 text-right text-slate-400">
                  {formatNumber(ask.total)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MIDDLE RIBBON: Last Traded Price */}
      <div className="my-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#101623] via-[#161F31] to-[#101623] border border-white/10 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-300">LAST TRADED:</span>
          <span className="text-base font-black font-mono text-white tracking-tight">
            {formatCurrency(lastPrice)}
          </span>
        </div>

        {orderBook?.lastTradedQuantity > 0 && (
          <div className="text-[11px] font-mono text-cyan-400">
            Qty: {formatNumber(orderBook.lastTradedQuantity)}
          </div>
        )}
      </div>

      {/* BUY SIDE (BIDS - Green / MaxHeap) */}
      <div className="space-y-1 overflow-hidden min-h-[140px]">
        {displayBids.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500 font-mono">
            No active Buy orders in MaxHeap
          </div>
        ) : (
          displayBids.map((bid, idx) => {
            const isBestBid = bid.price === bestBidPrice;
            const depthWidth = Math.min(100, Math.round((bid.total / maxCumulative) * 100));

            return (
              <div
                key={`bid-${bid.price}-${idx}`}
                onClick={() => onSelectPrice && onSelectPrice(bid.price, 'SELL')}
                className="relative grid grid-cols-3 text-xs font-mono py-1 px-2 rounded cursor-pointer hover:bg-emerald-500/10 transition-colors group"
                title={`Click to SELL @ ₹${bid.price}`}
              >
                {/* Visual Depth Bar Background */}
                <div
                  className="absolute right-0 top-0 bottom-0 bid-depth-bar rounded opacity-60 transition-all duration-300 pointer-events-none"
                  style={{ width: `${depthWidth}%` }}
                />

                {/* Price */}
                <div className="relative z-10 flex items-center gap-1.5 font-bold text-emerald-400">
                  <span>{bid.price.toFixed(2)}</span>
                  {isBestBid && (
                    <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-bold">
                      BEST BID
                    </span>
                  )}
                </div>

                {/* Quantity */}
                <div className="relative z-10 text-right text-slate-200">
                  {formatNumber(bid.quantity)}
                </div>

                {/* Cumulative Total */}
                <div className="relative z-10 text-right text-slate-400">
                  {formatNumber(bid.total)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div>
          Bids: <span className="text-emerald-400 font-bold">{formatNumber(orderBook?.totalBuyVolume || 0)}</span>
        </div>
        <div>
          Asks: <span className="text-rose-400 font-bold">{formatNumber(orderBook?.totalSellVolume || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderBookVisualizer;
