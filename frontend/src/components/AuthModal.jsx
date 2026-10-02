/**
 * AuthModal.jsx — Sign In & Sign Up Modal Dialog
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    signin,
    signup,
    loginAsDemo
  } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const isSignIn = authModalMode === 'signin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignIn) {
        await signin({ identifier: email || username, password });
      } else {
        await signup({ name, username, email, password });
      }
    } catch (err) {
      // Error is toasted in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-[#101623] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {isSignIn ? 'Welcome to TradeFlow' : 'Create Trader Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignIn
              ? 'Sign in to place orders, track your simulated portfolio, and trade.'
              : 'Join the next-generation stock market order book simulator.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-[#0B0F19] rounded-xl border border-white/5 gap-1">
          <button
            type="button"
            onClick={() => setAuthModalMode('signin')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              isSignIn
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('signup')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              !isSignIn
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Virtual Cash Perk Badge */}
        {!isSignIn && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-emerald-300">₹1,000,000 Virtual Capital</div>
              <div className="text-[10px] text-slate-400">Instant simulation balance credited on registration.</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Full Name (Sign Up Only) */}
          {!isSignIn && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Username (Sign Up Only) */}
          {!isSignIn && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                <input
                  type="text"
                  placeholder="rahul_trader"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Email or Username for Sign In */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {isSignIn ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type={isSignIn ? 'text' : 'email'}
                placeholder={isSignIn ? 'trader@tradeflow.com or rahul_trader' : 'trader@tradeflow.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isSignIn ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Presets */}
        {isSignIn && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block text-center tracking-wider">
              Quick 1-Click Login (Viva Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemo('Rahul Sharma', 'trader_user')}
                className="p-2 rounded-xl bg-[#0B0F19] hover:bg-white/5 border border-white/10 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-slate-200">Demo Trader</div>
                <div className="text-[9px] text-cyan-400 font-mono">@trader_user</div>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('Prof. Sharma (Examiner)', 'prof_examiner')}
                className="p-2 rounded-xl bg-[#0B0F19] hover:bg-white/5 border border-white/10 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-purple-300">Professor Mode</div>
                <div className="text-[9px] text-purple-400 font-mono">@prof_examiner</div>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Switcher */}
        <div className="text-center text-xs text-slate-400">
          {isSignIn ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('signin')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
