'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Zap, Lock, Sparkles, CheckCircle2, Clock, Users,
  ShoppingBag, ArrowRight, Check, AlertTriangle, Layers, Cpu, Server, Key
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for Symbiotic Strain Model calculations
function calculateLandingMatch(
  energy: string,
  territoriality: number,
  financial: string,
  guest: string
): { score: number; forecast: string; risk: 'low' | 'medium' | 'high' } {
  let score = 100;

  // Rule 1: Energy window match/clash
  if (energy === 'Dawn (5 AM - 9 AM)' || energy === 'Midday (10 AM - 2 PM)') {
    score += 15;
  }

  // Rule 2: Territoriality clash
  if (territoriality > 7) {
    score -= 30;
  } else if (territoriality < 4) {
    score += 10;
  }

  // Rule 3: Financial mismatch
  if (financial === 'Exact Usage (I pay for what I consume)') {
    score -= 15;
  }

  // Rule 4: Guest mismatch
  if (guest === 'Home is a Social Hub') {
    score -= 10;
  }

  const finalScore = Math.min(100, Math.max(0, score));

  if (finalScore >= 75) {
    return {
      score: finalScore,
      forecast: 'Low Stress: You two are rhythmically aligned. Expected conflict: Minimal.',
      risk: 'low',
    };
  } else if (finalScore >= 50) {
    return {
      score: finalScore,
      forecast: 'Medium Stress: Compromise needed on guest/territory rules. Expected conflict: Occasional.',
      risk: 'medium',
    };
  } else {
    return {
      score: finalScore,
      forecast: 'High Stress: Fundamental lifestyle clash detected. Expected conflict: Frequent.',
      risk: 'high',
    };
  }
}

export function StickyFeaturesSection() {
  // Interactive Symbiotic State
  const [energyWindow, setEnergyWindow] = useState('Dawn (5 AM - 9 AM)');
  const [territoriality, setTerritoriality] = useState(3);
  const [financialStyle, setFinancialStyle] = useState('Equal Split (Bill divided by N)');
  const [guestPhilosophy, setGuestPhilosophy] = useState('Home is a Private Fortress');

  const matchResult = calculateLandingMatch(energyWindow, territoriality, financialStyle, guestPhilosophy);

  // Interactive Concurrency Lock State
  const [lockStatus, setLockStatus] = useState<'idle' | 'locking' | 'allocated'>('idle');

  const triggerLockSimulation = () => {
    setLockStatus('locking');
    setTimeout(() => setLockStatus('allocated'), 1200);
  };

  // Interactive Portal Switcher State
  const [activePortalTab, setActivePortalTab] = useState<'student' | 'warden' | 'admin'>('student');

  return (
    <div className="space-y-24 pt-8 pb-12">
      {/* SECTION 1: THE SYMBIOTIC STRAIN MODEL (LIVE INTERACTIVE CALCULATOR) */}
      <section id="matching" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> LIVE SYMBIOTIC STRAIN CALCULATOR
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Test Roommate Peaceful Co-Existence in Real-Time.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Adjust the 4 strain categories below to test our Symbiotic Strain Engine and see live 3-Month Forecast projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E5E4E8] rounded-[36px] p-6 md:p-8 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#3C315B]">1. Select Lifestyle Categories</h3>

              {/* Field 1: Energy Window */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#3C315B]/70 block">Peak Energy Window</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dawn (5 AM - 9 AM)', 'Midday (10 AM - 2 PM)', 'Dusk (5 PM - 9 PM)', 'Midnight (10 PM - 2 AM)'].map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setEnergyWindow(win)}
                      className={cn(
                        'px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left border',
                        energyWindow === win
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-md'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {win.split(' ')[0]} <span className="opacity-60 text-[10px] font-normal">{win.slice(win.indexOf('('))}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Territoriality */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#3C315B]">
                  <span>Territoriality Index</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0]">Level {territoriality} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={territoriality}
                  onChange={(e) => setTerritoriality(Number(e.target.value))}
                  className="w-full accent-[#6A4FE0] h-2 bg-[#E5E4E8] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#3C315B]/60 font-semibold">
                  <span>1 (Fully Open: Share snacks/chargers)</span>
                  <span>10 (Strictly Zoned: Private shelf)</span>
                </div>
              </div>

              {/* Field 3: Financial Splitting */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#3C315B]/70 block">Financial Splitting Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Equal Split (Bill divided by N)', 'Exact Usage (I pay for what I consume)'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFinancialStyle(style)}
                      className={cn(
                        'px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left border',
                        financialStyle === style
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-md'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {style.split(' ')[0]} {style.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Guest Philosophy */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#3C315B]/70 block">Guest Philosophy</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Home is a Social Hub', 'Home is a Private Fortress'].map((phil) => (
                    <button
                      key={phil}
                      type="button"
                      onClick={() => setGuestPhilosophy(phil)}
                      className={cn(
                        'px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left border',
                        guestPhilosophy === phil
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-md'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {phil === 'Home is a Social Hub' ? '🏰 Social Hub' : '🔒 Private Fortress'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Output Dial & 3-Month Forecast Card (5 Cols) */}
          <div className="lg:col-span-5 rounded-[36px] bg-gradient-to-br from-[#3C315B] via-[#2B2347] to-[#1A1530] text-white p-8 border border-[#AB9FF2]/30 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2]">
                SIMULATOR OUTPUT
              </span>
              <h3 className="text-xl font-extrabold text-white">Symbiotic Co-Existence Engine</h3>
            </div>

            {/* Gauge Dial Visual */}
            <div className="text-center space-y-3 py-4">
              <motion.div
                key={matchResult.score}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-[#AB9FF2]/40 bg-white/5 backdrop-blur-xl shadow-2xl"
              >
                <div className="space-y-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{matchResult.score}%</span>
                  <span className="block text-[10px] uppercase font-bold text-[#AB9FF2] tracking-wider">Peaceful Survival</span>
                </div>
              </motion.div>
            </div>

            {/* 3-Month Forecast Widget */}
            <div className={cn(
              'p-4 rounded-2xl border space-y-1.5 transition-all text-xs font-semibold',
              matchResult.risk === 'low' && 'bg-[#E6F9F0]/10 border-[#2EC08B]/40 text-[#2EC08B]',
              matchResult.risk === 'medium' && 'bg-amber-500/10 border-amber-400/40 text-amber-300',
              matchResult.risk === 'high' && 'bg-rose-500/10 border-rose-400/40 text-rose-300'
            )}>
              <div className="font-extrabold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>The 3-Month Forecast</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{matchResult.forecast}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: POSTGRESQL ATOMIC ALLOCATION LOCK SIMULATOR */}
      <section id="security" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> POSTGRESQL FOR UPDATE ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Zero Double-Booking Concurrency Control.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Test simultaneous student bed booking requests to see serializable PostgreSQL transaction row locking in real-time.
          </p>
        </div>

        <div className="bg-white border border-[#E5E4E8] rounded-[36px] p-8 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#E5E4E8] pb-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#3C315B]">Room 304 — Bed A (AC Deluxe)</h3>
              <p className="text-xs text-[#3C315B]/60 font-normal">2 Concurrent Student Requests at 00:00:00.001s</p>
            </div>
            <button
              type="button"
              onClick={triggerLockSimulation}
              disabled={lockStatus === 'locking'}
              className="px-6 py-3 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" /> Simulate Concurrent Booking Requests
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs font-bold">
            {/* Request Thread A */}
            <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#3C315B]">Thread A (Student #104)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Acquired Lock</span>
              </div>
              <p className="text-[11px] text-[#3C315B]/60 font-mono">SELECT * FROM rooms WHERE id=304 FOR UPDATE;</p>
              <div className="p-2.5 rounded-xl bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-between">
                <span>Status: ALLOCATED</span>
                <Check className="w-4 h-4" />
              </div>
            </div>

            {/* Request Thread B */}
            <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#3C315B]">Thread B (Student #209)</span>
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10px]',
                  lockStatus === 'locking' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-rose-100 text-rose-800'
                )}>
                  {lockStatus === 'locking' ? 'Waiting on Lock...' : 'Blocked / Re-routed'}
                </span>
              </div>
              <p className="text-[11px] text-[#3C315B]/60 font-mono">Transaction Blocked: Bed A Occupied</p>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-between">
                <span>Result: Zero Collision</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE LIVE PORTAL SWITCHER */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> INTERACTIVE PORTAL PREVIEW
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Experience Portals Tailored for Every Role.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Click between Student, Warden, and Command Hub portals to inspect tailored UI workflows.
          </p>

          {/* Tab Switcher Pills */}
          <div className="inline-flex p-1.5 bg-white border border-[#E5E4E8] rounded-full shadow-sm gap-2 pt-2">
            {[
              { id: 'student', label: '🎓 Student Portal' },
              { id: 'warden', label: '🛡️ Warden Console' },
              { id: 'admin', label: '⚡ Command Hub' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePortalTab(tab.id as any)}
                className={cn(
                  'px-5 py-2 rounded-full text-xs font-extrabold transition-all',
                  activePortalTab === tab.id
                    ? 'bg-[#3C315B] text-white shadow-md'
                    : 'text-[#3C315B]/70 hover:text-[#3C315B]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portal Preview Screen */}
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#3C315B] via-[#2B2347] to-[#1A1530] text-white rounded-[36px] p-8 border border-[#AB9FF2]/30 shadow-2xl space-y-6">
          <AnimatePresence mode="wait">
            {activePortalTab === 'student' && (
              <motion.div
                key="student"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs text-[#AB9FF2] font-bold">STUDENT DASHBOARD</span>
                    <h4 className="text-2xl font-extrabold text-white">Room Allocations &amp; Symbiotic Match</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#2EC08B]/20 text-[#2EC08B] text-xs font-bold">
                    Active Student Session
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs font-bold">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">CURRENT ROOM</span>
                    <span className="text-base text-white">Room 204 — Bed A</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">ROOMMATE SCORE</span>
                    <span className="text-base text-[#2EC08B]">96% Peaceful Survival</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">CAMPUS COMMERCE</span>
                    <span className="text-base text-amber-300">Razorpay Merchant Active</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activePortalTab === 'warden' && (
              <motion.div
                key="warden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs text-[#AB9FF2] font-bold">WARDEN CONSOLE</span>
                    <h4 className="text-2xl font-extrabold text-white">Room Approvals &amp; Predictive Maintenance</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
                    Warden Override Active
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs font-bold">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">PENDING REQUESTS</span>
                    <span className="text-base text-white">3 Room Approvals</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">SLA RISK MONITOR</span>
                    <span className="text-base text-amber-300">1 Ticket (2.4h to Breach)</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">HOSTEL OCCUPANCY</span>
                    <span className="text-base text-[#2EC08B]">94.2% Occupied</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activePortalTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs text-[#AB9FF2] font-bold">COMMAND HUB</span>
                    <h4 className="text-2xl font-extrabold text-white">Multi-Tenant Management &amp; Audit Logs</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-300 text-xs font-bold">
                    Super Admin Rights
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs font-bold">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">TENANT ISOLATION</span>
                    <span className="text-base text-[#2EC08B]">100% RLS Protected</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">GLOBAL HOSTELS</span>
                    <span className="text-base text-white">12 Campuses</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-white/60 block text-[10px]">AUDIT LOGS</span>
                    <span className="text-base text-[#AB9FF2]">Argon2id Hashed</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
