/**
 * DashboardPage.jsx — Main Pro Trading Terminal
 */

import React, { useState } from 'react';
import {
  FileText,
  History,
  TrendingUp,
  XCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import StockTicker from '../components/StockTicker';
import StockChart from '../components/StockChart';
import OrderBookVisualizer from '../components/OrderBookVisualizer';
import OrderForm from '../components/OrderForm';
import ActivityTicker from '../components/ActivityTicker';
import CancelOrderModal from '../components/CancelOrderModal';
import { formatCurrency, formatNumber, formatTime, getStatusBadge } from '../utils/formatters';

export const DashboardPage = () => {
  const {
    orders,
    trades,
    selectedSymbol,
    cancelOrder
  } = useMarket();

  const [bottomTab, setBottomTab] = useState('orders'); // 'orders' or 'trades'
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [formPrefillPrice, setFormPrefillPrice] = useState(null);
  const [formPrefillSide, setFormPrefillSide] = useState('BUY');

  const handleBookPriceClick = (price, side) => {
    setFormPrefillPrice(price);
    setFormPrefillSide(side);
  };

  // Filter orders and trades for active stock
  const currentStockOrders = orders.filter((o) => o.stockSymbol === selectedSymbol);
  const currentStockTrades = trades.filter((t) => t.stockSymbol === selectedSymbol);

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 lg:px-6 py-4">
      {/* Top Stock Watchlist */}
      <StockTicker />

      {/* Main 3-Column Pro Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (Chart & Bottom Tables) — 5 cols on lg, 6 cols on xl */}
        <div className="lg:col-span-6 space-y-4">
          <StockChart />

          {/* Bottom Dock Tabs: Open Orders & Recent Trades */}
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setBottomTab('orders')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bottomTab === 'orders'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Active Orders ({currentStockOrders.filter((o) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED').length})</span>
                </button>

                <button
                  onClick={() => setBottomTab('trades')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bottomTab === 'trades'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Executed Trades ({currentStockTrades.length})</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                Ticker: {selectedSymbol}
              </span>
            </div>

            {/* Content for Orders Tab */}
            {bottomTab === 'orders' && (
              <div className="overflow-x-auto max-h-56 scrollbar-thin">
                {currentStockOrders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono">
                    No orders for {selectedSymbol}. Use the order form to place one!
                  </div>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-[10px] uppercase text-slate-400 border-b border-white/5 pb-1">
                        <th className="py-1">Type</th>
                        <th>Price</th>
                        <th>Qty / Remaining</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentStockOrders.slice(0, 10).map((ord) => {
                        const badge = getStatusBadge(ord.status);
                        const canCancel = ord.status === 'OPEN' || ord.status === 'PARTIALLY_FILLED';
                        return (
                          <tr key={ord.orderId} className="hover:bg-white/5 transition-colors">
                            <td className="py-2">
                              <span
                                className={`font-bold ${
                                  ord.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {ord.type}
                              </span>
                            </td>
                            <td className="font-bold text-white">
                              {formatCurrency(ord.price)}
                            </td>
                            <td className="text-slate-300">
                              {ord.remainingQuantity} / {ord.quantity}
                            </td>
                            <td>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                            <td className="text-[10px] text-slate-400">
                              {formatTime(ord.timestamp)}
                            </td>
                            <td className="text-right">
                              {canCancel && (
                                <button
                                  onClick={() => setSelectedOrderToCancel(ord)}
                                  className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Content for Trades Tab */}
            {bottomTab === 'trades' && (
              <div className="overflow-x-auto max-h-56 scrollbar-thin">
                {currentStockTrades.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono">
                    No trades executed yet for {selectedSymbol}.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-[10px] uppercase text-slate-400 border-b border-white/5 pb-1">
                        <th className="py-1">Trade ID</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Value</th>
                        <th>Buyer / Seller</th>
                        <th className="text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentStockTrades.slice(0, 10).map((tr) => (
                        <tr key={tr.tradeId} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 text-[10px] text-slate-400">
                            #{tr.tradeId?.substring(0, 8)}
                          </td>
                          <td className="font-bold text-white">{formatCurrency(tr.price)}</td>
                          <td className="text-cyan-400 font-bold">{formatNumber(tr.quantity)}</td>
                          <td className="text-slate-300">{formatCurrency(tr.price * tr.quantity)}</td>
                          <td className="text-[10px] text-slate-400">
                            <span className="text-emerald-400 font-semibold">{tr.buyer}</span> →{' '}
                            <span className="text-rose-400 font-semibold">{tr.seller}</span>
                          </td>
                          <td className="text-right text-[10px] text-slate-400">
                            {formatTime(tr.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Order Book Hero Visualizer (3 cols on lg) */}
        <div className="lg:col-span-3">
          <OrderBookVisualizer onSelectPrice={handleBookPriceClick} />
        </div>

        {/* Right Column: Order Form & Activity Feed (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4">
          <OrderForm initialPrice={formPrefillPrice} initialSide={formPrefillSide} />
          <ActivityTicker />
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <CancelOrderModal
        order={selectedOrderToCancel}
        isOpen={Boolean(selectedOrderToCancel)}
        onClose={() => setSelectedOrderToCancel(null)}
        onConfirm={(orderId, symbol) => cancelOrder(orderId, symbol)}
      />
    </div>
  );
};

export default DashboardPage;
