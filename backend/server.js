/**
 * server.js — Main Express Server & Socket.IO Entrypoint for TradeFlow
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB } from './config/database.js';
import { seedDatabase } from './config/seedData.js';
import { matchingService } from './services/matchingService.js';
import { simulationService } from './services/simulationService.js';

import stockRoutes from './routes/stocks.js';
import orderRoutes from './routes/orders.js';
import tradeRoutes from './routes/trades.js';
import analyticsRoutes from './routes/analytics.js';
import simulationRoutes from './routes/simulation.js';
import authRoutes from './routes/auth.js';
import { seedDemoUsers } from './controllers/authController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5050;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO Setup with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE']
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Logging Middleware for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test' && !req.url.includes('/health')) {
    // Light logging
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'TradeFlow Stock Market Order Book Simulator',
    time: new Date(),
    uptime: process.uptime()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/simulation', simulationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

  // Send current simulation status immediately upon connection
  socket.emit('simulationStatus', simulationService.getStatus());

  // Allow client to subscribe to specific stock symbol order book channel
  socket.on('subscribeStock', (symbol) => {
    if (symbol) {
      const clean = symbol.toUpperCase();
      socket.join(clean);
      const depth = matchingService.getOrderBookDepth(clean);
      socket.emit('orderBookUpdated', depth);
    }
  });

  socket.on('unsubscribeStock', (symbol) => {
    if (symbol) {
      socket.leave(symbol.toUpperCase());
    }
  });

  socket.on('disconnect', () => {
    // Client disconnected
  });
});

// Start Server and Database
async function startServer() {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Seed initial market stocks, order books, and trades if first run
    await seedDatabase(false);
    await seedDemoUsers();

    // 3. Initialize matching service with DB active orders and socket.io
    await matchingService.initialize(io);

    // 4. Listen on Port
    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 TradeFlow Backend Server running on port ${PORT}`);
      console.log(`🌐 HTTP API:   http://localhost:${PORT}/api/health`);
      console.log(`📊 WebSocket:  ws://localhost:${PORT}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export { app, server, io };
