/**
 * ActivityTicker.jsx — Live Streaming Market Activity Feed
 */

import React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, Zap, XCircle } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatTime } from '../utils/formatters';

export const ActivityTicker = () => {
  const { activityFeed } = useMarket();

  const getEventBadge = (type) => {
    switch (type) {
      case 'TRADE_EXECUTED':
        return {
          icon: Zap,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          label: 'TRADE'
        };
      case 'ORDER_CREATED':
        return {
          icon: Activity,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          label: 'ORDER'
        };
      case 'ORDER_CANCELLED':
        return {
          icon: XCircle,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          label: 'CANCEL'
        };
      default:
        return {
          icon: Activity,
          color: 'text-slate-400 bg-white/5 border-white/10',
          label: 'EVENT'
        };
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Real-Time Market Activity
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SOCKET LIVE
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {activityFeed.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            Listening for live order book events...
          </div>
        ) : (
          activityFeed.map((event) => {
            const badge = getEventBadge(event.type);
            const Icon = badge.icon;
            return (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#0B0F19]/70 border border-white/5 text-xs animate-in fade-in duration-200"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-slate-200 font-medium truncate">{event.message}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityTicker;
