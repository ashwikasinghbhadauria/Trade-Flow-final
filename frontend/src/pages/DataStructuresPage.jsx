/**
 * DataStructuresPage.jsx — Interactive Viva Demonstration & Data Structures Visualizer
 */

import React, { useState, useEffect } from 'react';
import {
  Binary,
  Layers,
  ArrowDown,
  ArrowRight,
  Database,
  Search,
  CheckCircle2,
  HelpCircle,
  Code2,
  RefreshCw,
  Zap,
  Play,
  Check,
  Cpu,
  BookOpen
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { orderAPI } from '../services/api';
import { formatCurrency, formatNumber, formatTime } from '../utils/formatters';

export const DataStructuresPage = () => {
  const { selectedSymbol, stocks, setSelectedSymbol } = useMarket();
  const [debugState, setDebugState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visualizer'); // 'visualizer' | 'interactive' | 'viva'

  // Interactive step simulator state
  const [simStep, setSimStep] = useState(0);
  const [simBuyPrice, setSimBuyPrice] = useState(1250);
  const [simBuyQty, setSimBuyQty] = useState(100);
  const [simSellPrice, setSimSellPrice] = useState(1245);
  const [simSellQty, setSimSellQty] = useState(40);

  const fetchDebugState = async () => {
    try {
      setIsLoading(true);
      const res = await orderAPI.getDebugState(selectedSymbol);
      if (res.success) {
        setDebugState(res.data);
      }
    } catch (err) {
      console.error('Error fetching debug data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugState();
  }, [selectedSymbol]);

  // Simulation steps explanation
  const simStepsList = [
    {
      title: 'Initial State: Resting Sell Order in MinHeap',
      code: `sellOrders.insert({ price: ₹${simSellPrice}, qty: ${simSellQty} })`,
      explanation: `MinHeap maintains the lowest ask at root index 0. O(log n) insert via bubbleUp().`,
      heapState: `MinHeap Root: ₹${simSellPrice} (${simSellQty} shares)`
    },
    {
      title: 'Step 1: Incoming BUY Order Arrives',
      code: `matchingEngine.processOrder({ type: 'BUY', price: ₹${simBuyPrice}, qty: ${simBuyQty} })`,
      explanation: `Engine inspects buy price (₹${simBuyPrice}) and compares against MinHeap peek() ask price (₹${simSellPrice}).`,
      heapState: `Condition Check: ₹${simBuyPrice} >= ₹${simSellPrice} -> MATCH VALID!`
    },
    {
      title: 'Step 2: Maker Price Priority & Quantity Execution',
      code: `tradeQuantity = Math.min(${simBuyQty}, ${simSellQty}) = ${Math.min(simBuyQty, simSellQty)}\nexecutedPrice = ${simSellPrice} (Maker Price Priority)`,
      explanation: `Standard exchange rule: Trade executes at the resting order's ask price. ${Math.min(simBuyQty, simSellQty)} shares matched.`,
      heapState: `Trade Record Generated -> Trade ID: TRD_${Date.now().toString().slice(-4)}`
    },
    {
      title: 'Step 3: Heap Rebalancing & Partial Fill Update',
      code: `sellOrders.extractMin() // ${simSellQty} fully filled!\nremainingBuy = ${simBuyQty - Math.min(simBuyQty, simSellQty)} shares`,
      explanation: `Sell order is FILLED and extracted in O(log n). Remaining ${simBuyQty - Math.min(simBuyQty, simSellQty)} BUY shares bubble up into MaxHeap.`,
      heapState: `MaxHeap Root: ${simBuyQty - Math.min(simBuyQty, simSellQty)} shares @ ₹${simBuyPrice}`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Binary className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Data Structures Architecture & Viva Guide
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual inspection of custom MaxHeap, MinHeap, Hash Map, and Price-Time Priority algorithms.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#101623] p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'visualizer'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Heap State
          </button>
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'interactive'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Step-by-Step Simulator
          </button>
          <button
            onClick={() => setActiveTab('viva')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'viva'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Viva Q&A Cheat Sheet
          </button>
        </div>
      </div>

      {/* CORE ARCHITECTURE PIPELINE CARD */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>System Data Structures Blueprint</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Box 1: BUY ORDERS */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400">BUY ORDERS</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                MAX HEAP
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Highest bid gets root index 0. O(1) peek, O(log n) insert & extract.
            </p>
            <div className="text-[10px] font-mono text-emerald-400/80 pt-1 border-t border-white/5">
              Priority: Price DESC → Time ASC
            </div>
          </div>

          {/* Box 2: SELL ORDERS */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400">SELL ORDERS</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300">
                MIN HEAP
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Lowest ask gets root index 0. O(1) peek, O(log n) insert & extract.
            </p>
            <div className="text-[10px] font-mono text-rose-400/80 pt-1 border-t border-white/5">
              Priority: Price ASC → Time ASC
            </div>
          </div>

          {/* Box 3: ORDER LOOKUP */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400">ORDER LOOKUP</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                HASH MAP
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Key: orderId → Value: Order object. Provides instantaneous O(1) lookup & cancel verification.
            </p>
            <div className="text-[10px] font-mono text-cyan-400/80 pt-1 border-t border-white/5">
              Lookup Time: O(1)
            </div>
          </div>

          {/* Box 4: TRADE HISTORY */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-400">TRADE HISTORY</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">
                DYNAMIC ARRAY
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Maintains chronological audit trail of matched trades with O(1) amortized append.
            </p>
            <div className="text-[10px] font-mono text-purple-400/80 pt-1 border-t border-white/5">
              Append Time: O(1)
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: LIVE HEAP ARRAY & TREE STATE */}
      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          
          {/* Asset Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">Select Asset:</span>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-[#101623] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchDebugState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Heaps</span>
            </button>
          </div>

          {/* Heaps Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BUY MaxHeap */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white">
                    BUY Side: MaxHeap Array
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Size: {debugState?.maxHeap?.size || 0} orders
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                  Array Indices [0..N-1] (Root at index 0):
                </span>
                <div className="flex flex-wrap gap-2">
                  {debugState?.maxHeap?.rawArray?.length === 0 ? (
                    <div className="text-xs text-slate-500 font-mono py-2">MaxHeap is empty</div>
                  ) : (
                    debugState?.maxHeap?.rawArray?.map((ord, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-center font-mono border ${
                          idx === 0
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-400'
                            : 'bg-[#0B0F19] border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="text-[9px] text-slate-500 uppercase">
                          idx[{idx}] {idx === 0 ? 'ROOT' : `P[${Math.floor((idx-1)/2)}]`}
                        </div>
                        <div className="text-xs font-bold text-emerald-400">
                          ₹{ord.price}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.remainingQuantity} sh
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sorted Extraction Priority */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                  Priority Queue Order (Highest Bid First):
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {debugState?.maxHeap?.sorted?.map((ord, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#0B0F19] border border-white/5 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">#{i + 1}</span>
                        <span className="text-emerald-400 font-bold">₹{ord.price}</span>
                        <span className="text-slate-400">({ord.remainingQuantity} shares)</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {formatTime(ord.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SELL MinHeap */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <h3 className="text-sm font-extrabold text-white">
                    SELL Side: MinHeap Array
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">
                  Size: {debugState?.minHeap?.size || 0} orders
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                  Array Indices [0..N-1] (Root at index 0):
                </span>
                <div className="flex flex-wrap gap-2">
                  {debugState?.minHeap?.rawArray?.length === 0 ? (
                    <div className="text-xs text-slate-500 font-mono py-2">MinHeap is empty</div>
                  ) : (
                    debugState?.minHeap?.rawArray?.map((ord, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-center font-mono border ${
                          idx === 0
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-400'
                            : 'bg-[#0B0F19] border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="text-[9px] text-slate-500 uppercase">
                          idx[{idx}] {idx === 0 ? 'ROOT' : `P[${Math.floor((idx-1)/2)}]`}
                        </div>
                        <div className="text-xs font-bold text-rose-400">
                          ₹{ord.price}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.remainingQuantity} sh
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sorted Extraction Priority */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                  Priority Queue Order (Lowest Ask First):
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {debugState?.minHeap?.sorted?.map((ord, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#0B0F19] border border-white/5 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">#{i + 1}</span>
                        <span className="text-rose-400 font-bold">₹{ord.price}</span>
                        <span className="text-slate-400">({ord.remainingQuantity} shares)</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {formatTime(ord.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP SIMULATOR */}
      {activeTab === 'interactive' && (
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="space-y-1 pb-4 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400" />
              <span>Step-by-Step Order Matching Visualizer</span>
            </h3>
            <p className="text-xs text-slate-400">
              Configure incoming orders and step forward through every stage of the heapify & matching algorithm.
            </p>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0B0F19] border border-white/5">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 block">
                Incoming BUY Order (Taker):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Price (₹)</label>
                  <input
                    type="number"
                    value={simBuyPrice}
                    onChange={(e) => setSimBuyPrice(Number(e.target.value))}
                    className="w-full bg-[#101623] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Quantity</label>
                  <input
                    type="number"
                    value={simBuyQty}
                    onChange={(e) => setSimBuyQty(Number(e.target.value))}
                    className="w-full bg-[#101623] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-400 block">
                Resting SELL Order in MinHeap (Maker):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Price (₹)</label>
                  <input
                    type="number"
                    value={simSellPrice}
                    onChange={(e) => setSimSellPrice(Number(e.target.value))}
                    className="w-full bg-[#101623] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Quantity</label>
                  <input
                    type="number"
                    value={simSellQty}
                    onChange={(e) => setSimSellQty(Number(e.target.value))}
                    className="w-full bg-[#101623] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {simStepsList.map((st, i) => (
                <button
                  key={i}
                  onClick={() => setSimStep(i)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    simStep === i
                      ? 'bg-purple-500 text-white ring-4 ring-purple-500/20'
                      : simStep > i
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSimStep(Math.max(0, simStep - 1))}
                disabled={simStep === 0}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold disabled:opacity-30"
              >
                Previous Step
              </button>
              <button
                onClick={() => setSimStep(Math.min(simStepsList.length - 1, simStep + 1))}
                disabled={simStep === simStepsList.length - 1}
                className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-30"
              >
                Next Step →
              </button>
            </div>
          </div>

          {/* Current Step Card */}
          <div className="p-5 rounded-2xl bg-[#0B0F19] border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-white">
                {simStepsList[simStep].title}
              </h4>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Step {simStep + 1} / {simStepsList.length}
              </span>
            </div>

            <pre className="p-3 rounded-xl bg-[#101623] border border-white/5 text-xs font-mono text-cyan-300 overflow-x-auto">
              {simStepsList[simStep].code}
            </pre>

            <p className="text-xs text-slate-300 leading-relaxed">
              {simStepsList[simStep].explanation}
            </p>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
              ⚡ {simStepsList[simStep].heapState}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VIVA CHEAT SHEET & BIG-O COMPLEXITY */}
      {activeTab === 'viva' && (
        <div className="space-y-6">
          
          {/* Big-O Complexity Table */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Time & Space Complexity Summary for Viva</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-400 border-b border-white/5 pb-2">
                    <th className="py-2">Operation</th>
                    <th>Data Structure</th>
                    <th>Time Complexity</th>
                    <th>Space Complexity</th>
                    <th>Viva Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5">
                    <td className="py-2.5 font-bold text-white">Insert Order</td>
                    <td className="text-cyan-400">Binary Heap</td>
                    <td className="text-emerald-400 font-bold">O(log n)</td>
                    <td className="text-slate-400">O(1)</td>
                    <td className="text-slate-300 font-sans text-[11px]">
                      Appends to array end and performs bubble-up to restore heap property.
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2.5 font-bold text-white">Peek Best Bid / Ask</td>
                    <td className="text-cyan-400">Binary Heap</td>
                    <td className="text-emerald-400 font-bold">O(1)</td>
                    <td className="text-slate-400">O(1)</td>
                    <td className="text-slate-300 font-sans text-[11px]">
                      Direct array index 0 access (root node of Max/Min Heap).
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2.5 font-bold text-white">Extract Max / Min</td>
                    <td className="text-cyan-400">Binary Heap</td>
                    <td className="text-emerald-400 font-bold">O(log n)</td>
                    <td className="text-slate-400">O(1)</td>
                    <td className="text-slate-300 font-sans text-[11px]">
                      Swaps root with last leaf, pops, and performs bubble-down.
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-2.5 font-bold text-white">Order Lookup by ID</td>
                    <td className="text-cyan-400">Hash Map (Map)</td>
                    <td className="text-emerald-400 font-bold">O(1)</td>
                    <td className="text-slate-400">O(n)</td>
                    <td className="text-slate-300 font-sans text-[11px]">
                      Constant-time hash table lookup for instant cancellation checks.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Viva Questions & Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="glass-panel rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Q1: Why Max-Heap for BUY and Min-Heap for SELL?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In a financial order book, sellers want to match with the highest available buying price (best bid at root of Max-Heap in O(1)). Conversely, buyers want the cheapest available asking price (best ask at root of Min-Heap in O(1)).
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Q2: How is Price-Time priority implemented?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inside the custom heap comparator: Primary comparison evaluates price (higher price for BUY, lower price for SELL). If prices are identical, the tie-breaker evaluates arrival timestamp (earlier timestamp gets priority FIFO).
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Q3: Why not use a Sorted Array or Linked List?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A sorted array requires O(n) time for insertion due to element shifting. A linked list requires O(n) search time to locate insertion point. Binary Heaps achieve O(log n) insertions and O(1) peek while maintaining excellent CPU cache locality.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Q4: Why combine Heaps with a Hash Map?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Searching for an arbitrary order in a heap takes O(n). By maintaining a secondary Hash Map (orderId → order), order status checks and cancellation validations occur in O(1) time without traversing the tree.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataStructuresPage;
