/**
 * database.js — MongoDB Connection Manager with Automatic In-Memory Fallback
 * 
 * Guarantees zero-friction startup:
 * 1. Attempts connection to standard MongoDB (e.g., MONGODB_URI in .env or mongodb://127.0.0.1:27017/tradeflow).
 * 2. If local MongoDB server is offline/unavailable, automatically spins up an in-memory MongoMemoryServer.
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tradeflow';
  
  try {
    // Attempt standard MongoDB connection with a 2.5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`📦 Connected to MongoDB successfully at: ${uri}`);
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}).`);
    console.log('🚀 Starting seamless embedded In-Memory MongoDB for effortless local development...');
    
    try {
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`⚡ In-Memory MongoDB started and connected at: ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

export default connectDB;
