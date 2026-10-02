/**
 * User.js — Mongoose Model for Platform Traders & Authentication
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    virtualBalance: {
      type: Number,
      default: 1000000 // Initial ₹10 Lakhs simulation cash
    },
    role: {
      type: String,
      enum: ['TRADER', 'ADMIN'],
      default: 'TRADER'
    }
  },
  {
    timestamps: true
  }
);

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
