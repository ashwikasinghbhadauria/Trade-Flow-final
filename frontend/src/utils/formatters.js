/**
 * formatters.js — Formatting utilities for TradeFlow
 */

export function formatCurrency(value, showSymbol = true) {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  const num = Number(value);
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return showSymbol ? `₹${formatted}` : formatted;
}

export function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-IN');
}

export function formatPercent(value) {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  const num = Number(value);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatTime(timestamp) {
  if (!timestamp) return '--:--:--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getStatusBadge(status) {
  switch (status) {
    case 'OPEN':
      return {
        bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        label: 'OPEN',
        dot: 'bg-blue-400'
      };
    case 'PARTIALLY_FILLED':
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        label: 'PARTIAL',
        dot: 'bg-amber-400'
      };
    case 'FILLED':
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        label: 'FILLED',
        dot: 'bg-emerald-400'
      };
    case 'CANCELLED':
      return {
        bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        label: 'CANCELLED',
        dot: 'bg-slate-400'
      };
    default:
      return {
        bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        label: status || 'UNKNOWN',
        dot: 'bg-slate-400'
      };
  }
}
