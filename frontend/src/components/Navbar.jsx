/**
 * Navbar.jsx — Top Header & Navigation Bar
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  Layers,
  FileText,
  History,
  BarChart3,
  Binary,
  RotateCcw,
  Bell,
  CheckCircle2,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatTime, formatCurrency } from '../utils/formatters';

export const Navbar = () => {
  const {
    activePage,
    setActivePage,
    resetMarketData,
    activityFeed
  } = useMarket();

  const {
    user,
    isAuthenticated,
    openAuthModal,
    signout
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'markets', label: 'Markets', icon: Layers },
    { id: 'orders', label: 'My Orders', icon: FileText },
    { id: 'trades', label: 'Trade History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'datastructures', label: 'Data Structures', icon: Binary, highlight: true }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  TradeFlow
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-0.5">
                Order Book & Matching Simulator
              </p>
            </div>
          </div>

          {/* Center-Left: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : item.highlight
                      ? 'text-purple-400 hover:bg-purple-500/10 hover:text-purple-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Market Status Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MARKET OPEN</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 transition-all"
            title="Reset Stock Market to Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 transition-all"
            >
              <Bell className="w-4 h-4" />
              {activityFeed.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[9px] font-bold text-black flex items-center justify-center animate-pulse">
                  {Math.min(activityFeed.length, 9)}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-[#101623] border border-white/10 shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                  <span className="text-xs font-bold text-slate-200">Live Activity Feed</span>
                  <span className="text-[10px] text-slate-400">{activityFeed.length} events</span>
                </div>
                <div className="space-y-2">
                  {activityFeed.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>
                  ) : (
                    activityFeed.slice(0, 10).map((act) => (
                      <div
                        key={act.id}
                        className="text-[11px] p-2 rounded-lg bg-[#161F31] border border-white/5 space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-cyan-400">{act.symbol || 'MARKET'}</span>
                          <span className="text-[10px]">{formatTime(act.timestamp)}</span>
                        </div>
                        <p className="text-slate-200 font-medium leading-snug">{act.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10 relative">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-cyan-500/20 ring-1 ring-white/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-100 leading-none">
                      {user.name || user.username}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono leading-none mt-1">
                      {formatCurrency(user.virtualBalance || 1000000)}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {/* Profile Menu Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#101623] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in duration-150 space-y-3">
                    <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 space-y-1">
                      <div className="text-xs font-extrabold text-white">{user.name}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">@{user.username}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-semibold">Sim Balance:</span>
                      </div>
                      <span className="text-xs font-black font-mono text-white">
                        {formatCurrency(user.virtualBalance || 1000000)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <button
                        onClick={() => {
                          setActivePage('orders');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>My Placed Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          signout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-black bg-cyan-500 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden items-center justify-around gap-1 pt-2 mt-2 border-t border-white/5 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md text-[10px] font-medium ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#101623] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-100">Reset Market Simulation?</h3>
              <p className="text-xs text-slate-400">
                This will clear recent orders and re-seed the order books and stocks with fresh realistic demo data.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetMarketData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
