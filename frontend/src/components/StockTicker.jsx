/**
 * StockTicker.jsx — Horizontal Watchlist & Live Stock Ticker
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const StockTicker = () => {
  const { stocks, selectedSymbol, setSelectedSymbol, lastFlash } = useMarket();

  return (
    <div className="bg-[#0B0F19] border-b border-white/5 py-2 px-4 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-3 min-w-max">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 pr-2 border-r border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Watchlist
        </span>

        {stocks.map((stock) => {
          const isSelected = selectedSymbol === stock.symbol;
          const isPositive = stock.priceChange >= 0;
          const isFlashing = lastFlash && lastFlash.symbol === stock.symbol;

          return (
            <button
              key={stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-[#161F31] border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-[#101623]/60 border-white/5 hover:border-white/15 hover:bg-[#161F31]/80'
              } ${
                isFlashing
                  ? lastFlash.direction === 'UP'
                    ? 'animate-flash-green'
                    : 'animate-flash-red'
                  : ''
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100">{stock.symbol}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline max-w-[80px] truncate">
                    {stock.name}
                  </span>
                </div>
                <div className="text-xs font-mono font-semibold text-slate-200">
                  {formatCurrency(stock.currentPrice)}
                </div>
              </div>

              <div
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{formatPercent(stock.priceChangePercent)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StockTicker;
