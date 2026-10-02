/**
 * CancelOrderModal.jsx — Confirmation Modal for Order Cancellation
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const CancelOrderModal = ({ order, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#101623] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cancel Order Confirmation</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Order #{order.orderId?.substring(0, 10)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Asset:</span>
            <span className="font-bold text-white">{order.stockSymbol}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Order Type:</span>
            <span
              className={`font-bold font-mono ${
                order.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {order.type}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Limit Price:</span>
            <span className="font-bold font-mono text-white">
              {formatCurrency(order.price)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Remaining Quantity:</span>
            <span className="font-bold font-mono text-white">
              {formatNumber(order.remainingQuantity)} shares
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Are you sure you want to remove this resting order from the{' '}
          <span className="text-cyan-400 font-semibold">
            {order.type === 'BUY' ? 'MaxHeap' : 'MinHeap'}
          </span>
          ? This action cannot be reversed.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Keep Order
          </button>
          <button
            onClick={() => {
              onConfirm(order.orderId, order.stockSymbol);
              onClose();
            }}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
