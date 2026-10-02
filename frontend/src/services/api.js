/**
 * api.js — API Service Layer for TradeFlow
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const stockAPI = {
  getAll: async () => {
    const res = await api.get('/stocks');
    return res.data;
  },
  getBySymbol: async (symbol) => {
    const res = await api.get(`/stocks/${symbol}`);
    return res.data;
  },
  getHistory: async (symbol, timeframe = '1D') => {
    const res = await api.get(`/stocks/${symbol}/history?timeframe=${timeframe}`);
    return res.data;
  },
  resetData: async () => {
    const res = await api.post('/stocks/reset');
    return res.data;
  }
};

export const orderAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },
  placeOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  cancelOrder: async (orderId, symbol) => {
    const res = await api.delete(`/orders/${orderId}`, {
      params: { symbol }
    });
    return res.data;
  },
  clearOrders: async (params = {}) => {
    const res = await api.delete('/orders', { params });
    return res.data;
  },
  getBook: async (symbol) => {
    const res = await api.get(`/orders/book/${symbol}`);
    return res.data;
  },
  getDebugState: async (symbol) => {
    const res = await api.get(`/orders/debug/${symbol}`);
    return res.data;
  }
};

export const tradeAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/trades', { params });
    return res.data;
  },
  clearTrades: async (params = {}) => {
    const res = await api.delete('/trades', { params });
    return res.data;
  }
};

export const analyticsAPI = {
  get: async () => {
    const res = await api.get('/analytics');
    return res.data;
  }
};

export const simulationAPI = {
  getStatus: async () => {
    const res = await api.get('/simulation/status');
    return res.data;
  },
  toggle: async () => {
    const res = await api.post('/simulation/toggle');
    return res.data;
  },
  start: async () => {
    const res = await api.post('/simulation/start');
    return res.data;
  },
  stop: async () => {
    const res = await api.post('/simulation/stop');
    return res.data;
  }
};

export default api;
