/**
 * socket.js — Real-Time WebSocket Connection Manager
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log(`⚡ Connected to TradeFlow real-time server with socket id: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from real-time server');
});

export function subscribeToStock(symbol) {
  if (symbol && socket.connected) {
    socket.emit('subscribeStock', symbol);
  }
}

export function unsubscribeFromStock(symbol) {
  if (symbol && socket.connected) {
    socket.emit('unsubscribeStock', symbol);
  }
}

export default socket;
