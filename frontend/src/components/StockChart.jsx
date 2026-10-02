/**
 * StockChart.jsx — Interactive Stock Price & Volume Chart using Recharts
 */

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Calendar } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { stockAPI } from '../services/api';
import { formatCurrency, formatNumber, formatPercent, formatTime } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#101623] border border-white/10 rounded-xl p-3 shadow-2xl space-y-1">
        <p className="text-[10px] font-mono text-slate-400">
          {new Date(data.timestamp).toLocaleString()}
        </p>
        <p className="text-sm font-bold font-mono text-cyan-400">
          Price: {formatCurrency(data.price)}
        </p>
        {data.volume > 0 && (
          <p className="text-[11px] font-mono text-slate-300">
            Volume: {formatNumber(data.volume)} shares
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const StockChart = () => {
  const { selectedStock, selectedSymbol } = useMarket();
  const [timeframe, setTimeframe] = useState('1D');
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('price'); // 'price' or 'volume'

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!selectedSymbol) return;
      try {
        const res = await stockAPI.getHistory(selectedSymbol, timeframe);
        if (res.success && isMounted) {
          setChartData(res.data);
        }
      } catch (err) {
        console.error('Error fetching stock history:', err);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, timeframe]);

  // If live selectedStock updates and timeframe is 1D, append/update chartData
  useEffect(() => {
    if (selectedStock && timeframe === '1D' && chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      if (lastPoint && lastPoint.price !== selectedStock.currentPrice) {
        setChartData((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            price: selectedStock.currentPrice,
            volume: 10
          }
        ]);
      }
    }
  }, [selectedStock, timeframe]);

  if (!selectedStock) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-[420px] flex items-center justify-center text-slate-500">
        Loading stock details...
      </div>
    );
  }

  const isPositive = selectedStock.priceChange >= 0;
  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) * 0.995 : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) * 1.005 : 100;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 flex flex-col justify-between">
      
      {/* Stock Header & Key Metrics */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {selectedStock.name}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/5 text-cyan-400 border border-white/10 font-mono">
              {selectedStock.symbol}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(selectedStock.currentPrice)}
            </span>
            <div
              className={`flex items-center gap-1 text-sm font-bold font-mono px-2 py-0.5 rounded-lg ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{formatCurrency(selectedStock.priceChange)}</span>
              <span>({formatPercent(selectedStock.priceChangePercent)})</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B0F19]/60 p-2.5 rounded-xl border border-white/5">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Day High</div>
            <div className="text-xs font-bold font-mono text-emerald-400">
              {formatCurrency(selectedStock.dayHigh)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Day Low</div>
            <div className="text-xs font-bold font-mono text-rose-400">
              {formatCurrency(selectedStock.dayLow)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Open Price</div>
            <div className="text-xs font-bold font-mono text-slate-200">
              {formatCurrency(selectedStock.openPrice)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Total Volume</div>
            <div className="text-xs font-bold font-mono text-cyan-400">
              {formatNumber(selectedStock.volume)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Timeframe Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Live Price Action</span>
        </div>

        <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-white/5">
          {['1D', '1W', '1M', '3M'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(t) => {
                const d = new Date(t);
                return timeframe === '1D'
                  ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
              }}
              stroke="#384B6E"
              fontSize={10}
              tickLine={false}
              dy={5}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tickFormatter={(v) => `₹${v.toFixed(0)}`}
              stroke="#384B6E"
              fontSize={10}
              tickLine={false}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
