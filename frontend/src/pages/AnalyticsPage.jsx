/**
 * AnalyticsPage.jsx — Market Analytics, KPIs & Recharts Visualizations
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

const PIE_COLORS = ['#10B981', '#EF4444'];

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        const res = await analyticsAPI.get();
        if (res.success && isMounted) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 text-center text-slate-500 font-mono">
        Aggregating market metrics & analytics...
      </div>
    );
  }

  const buyVsSellData = [
    { name: 'BUY Bids', value: analytics.buyOrdersCount || 0 },
    { name: 'SELL Asks', value: analytics.sellOrdersCount || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Market Intelligence & Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time statistical breakdown of turnover, liquidity distribution, and trade velocity.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Volume */}
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Turnover</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatCurrency(analytics.totalVolume)}
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">
            Across all active simulated assets
          </div>
        </div>

        {/* Total Trades */}
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Trades Matched</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatNumber(analytics.totalTrades)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {formatNumber(analytics.totalSharesTraded)} shares executed
          </div>
        </div>

        {/* Active Orders */}
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Resting Orders in Heaps</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {formatNumber(analytics.activeOrdersCount)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {analytics.buyOrdersCount} Bids / {analytics.sellOrdersCount} Asks
          </div>
        </div>

        {/* Top Performer */}
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Most Traded Asset</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {analytics.mostTradedStock?.symbol || 'ABC'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Turnover: {formatCurrency(analytics.mostTradedStock?.volumeValue || 0)}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Trading Volume by Stock (Bar Chart) — 7 cols */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Turnover Volume by Asset (₹)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Live Aggregate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.volumeByStock} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="symbol" stroke="#384B6E" fontSize={11} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  stroke="#384B6E"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Volume']}
                  contentStyle={{
                    backgroundColor: '#101623',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="volumeValue" fill="#00D2FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buy vs Sell Distribution (Donut Chart) — 5 cols */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Order Side Liquidity (Bids vs Asks)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Total: {analytics.buyOrdersCount + analytics.sellOrdersCount}</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={buyVsSellData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {buyVsSellData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} orders`, name]}
                  contentStyle={{
                    backgroundColor: '#101623',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 pt-2 border-t border-white/5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">BUY Orders ({analytics.buyOrdersCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">SELL Orders ({analytics.sellOrdersCount})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
