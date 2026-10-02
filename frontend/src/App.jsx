/**
 * App.jsx — TradeFlow Stock Market Order Book Simulator Root Component
 */

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { MarketProvider, useMarket } from './context/MarketContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import DashboardPage from './pages/DashboardPage';
import MarketsPage from './pages/MarketsPage';
import OrdersPage from './pages/OrdersPage';
import TradesPage from './pages/TradesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DataStructuresPage from './pages/DataStructuresPage';
import { TrendingUp, Binary, ShieldCheck, Heart } from 'lucide-react';

const MainContent = () => {
  const { activePage } = useMarket();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="pb-12">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'markets' && <MarketsPage />}
          {activePage === 'orders' && <OrdersPage />}
          {activePage === 'trades' && <TradesPage />}
          {activePage === 'analytics' && <AnalyticsPage />}
          {activePage === 'datastructures' && <DataStructuresPage />}
        </main>
      </div>

      <AuthModal />

      {/* Footer */}
      <footer className="bg-[#0B0F19] border-t border-white/5 py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
              TF
            </div>
            <span className="font-bold text-slate-200">TradeFlow</span>
            <span className="text-slate-500">— 2nd-Year Engineering Data Structures Project</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              MaxHeap (Bids)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              MinHeap (Asks)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Hash Map O(1)
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Engineered with React + Vite + Node.js + Socket.IO
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MarketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#101623',
              color: '#F1F5F9',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600'
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#101623'
              }
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#101623'
              }
            }
          }}
        />
        <MainContent />
      </MarketProvider>
    </AuthProvider>
  );
}

export default App;
