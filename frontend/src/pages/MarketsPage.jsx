/**
 * MarketsPage.jsx — Overview of All Available Assets & Market Depth
 */

import React, { useState } from 'react';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Search,
  ArrowRight,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export const MarketsPage = () => {
  const { stocks, setSelectedSymbol, setActivePage } = useMarket();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'GAINERS', 'LOSERS'

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'GAINERS') return stock.priceChange >= 0;
    if (filterType === 'LOSERS') return stock.priceChange < 0;
    return true;
  });

  const handleTradeClick = (symbol) => {
    setSelectedSymbol(symbol);
    setActivePage('dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Simulated Stock Markets
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-stock order book ecosystem powered by Heap & Price-Time priority.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#101623] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-48 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#101623] p-1 rounded-xl border border-white/5 text-xs">
            {['ALL', 'GAINERS', 'LOSERS'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterType === type
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStocks.map((stock) => {
          const isPositive = stock.priceChange >= 0;
          const strokeColor = isPositive ? '#10B981' : '#EF4444';
          const sparklineData = stock.history?.slice(-20) || [];

          return (
            <div
              key={stock.symbol}
              className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/5 text-cyan-400 border border-white/10 font-mono">
                      {stock.symbol}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{stock.name}</h3>
                  </div>

                  <div
                    className={`flex items-center gap-1 text-xs font-bold font-mono px-2 py-1 rounded-lg border ${
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>{formatPercent(stock.priceChangePercent)}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-black font-mono text-white">
                    {formatCurrency(stock.currentPrice)}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(stock.priceChange)}
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              {sparklineData.length > 0 && (
                <div className="h-16 w-full -my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <defs>
                        <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill={`url(#grad-${stock.symbol})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Stats & Trade Action */}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                  <div>
                    <span className="block text-slate-500">Day High</span>
                    <span className="font-bold text-slate-200">
                      {formatCurrency(stock.dayHigh)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Day Low</span>
                    <span className="font-bold text-slate-200">
                      {formatCurrency(stock.dayLow)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-500">24h Vol</span>
                    <span className="font-bold text-cyan-400">
                      {formatNumber(stock.volume)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleTradeClick(stock.symbol)}
                  className="w-full py-2 px-3 rounded-xl bg-[#161F31] hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 group shadow-md"
                >
                  <span>Trade {stock.symbol}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketsPage;
