/**
 * authController.js — Controller for User Registration, Login & Profile
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { JWT_SECRET } from '../middleware/auth.js';

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function signup(req, res) {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existing) {
      if (existing.email === cleanEmail) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ success: false, message: 'This username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = `USR_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUser = new User({
      userId,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      virtualBalance: 1000000 // ₹10,00,000 initial virtual cash
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to TradeFlow.',
      token,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        virtualBalance: newUser.virtualBalance,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function signin(req, res) {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!loginId) {
      return res.status(400).json({ success: false, message: 'Email or username is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        userId: user.userId,
        name: user.name,
        username: user.username,
        email: user.email,
        virtualBalance: user.virtualBalance,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        username: user.username,
        email: user.email,
        virtualBalance: user.virtualBalance,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Ensures a standard demo trader account exists for instant testing
 */
export async function seedDemoUsers() {
  try {
    const demoUsername = 'trader_user';
    const existing = await User.findOne({ username: demoUsername });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('tradeflow123', salt);

      const demoUser = new User({
        userId: 'USR_DEMO_DEFAULT',
        name: 'Rahul Sharma (Demo Trader)',
        username: demoUsername,
        email: 'trader@tradeflow.com',
        password: hashedPassword,
        virtualBalance: 1000000
      });
      await demoUser.save();
      console.log('👤 Default Demo Trader Account seeded (username: trader_user, pass: tradeflow123)');
    }
  } catch (err) {
    console.warn('Could not seed demo user:', err.message);
  }
}
