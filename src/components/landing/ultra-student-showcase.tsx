'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, Lock, ShieldCheck, ShoppingBag, ArrowRight,
  Zap, Heart, Users, MessageSquare, Check, HelpCircle, Star, ChevronDown,
  Layers, BadgePercent, Flame, Trophy, DollarSign, Clock, AlertTriangle, Key,
  Search, Filter, RefreshCw, Calendar, MapPin, Sliders, Activity, Radio,
  ThumbsUp, ShieldAlert, Cpu, Terminal, Eye, Send, CheckSquare, Plus, CreditCard,
  BookOpen, Monitor, Armchair, Gamepad2, Shield, Wrench, Wifi, Server
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for Symbiotic Strain Model calculations (NO EMOJIS)
function calculateSymbioticMetrics(
  energy: string,
  territoriality: number,
  financial: string,
  guest: string
): {
  score: number;
  rhythmScore: number;
  territoryScore: number;
  financialScore: number;
  guestScore: number;
  forecast: string;
  risk: 'low' | 'medium' | 'high';
} {
  let score = 100;
  let rhythmScore = 95;
  let territoryScore = 90;
  let financialScore = 92;
  let guestScore = 88;

  if (energy === 'Dawn (5 AM - 9 AM)' || energy === 'Midday (10 AM - 2 PM)') {
    score += 15;
    rhythmScore = 98;
  } else {
    rhythmScore = 65;
  }

  if (territoriality > 7) {
    score -= 30;
    territoryScore = 55;
  } else if (territoriality < 4) {
    score += 10;
    territoryScore = 95;
  }

  if (financial === 'Exact Usage (I pay for what I consume)') {
    score -= 15;
    financialScore = 70;
  } else {
    financialScore = 96;
  }

  if (guest === 'Home is a Social Hub') {
    score -= 10;
    guestScore = 60;
  } else {
    guestScore = 94;
  }

  const finalScore = Math.min(100, Math.max(0, score));

  if (finalScore >= 75) {
    return {
      score: finalScore,
      rhythmScore,
      territoryScore,
      financialScore,
      guestScore,
      forecast: 'Low Stress: Rhythmically aligned profile. Expected conflict: Minimal.',
      risk: 'low',
    };
  } else if (finalScore >= 50) {
    return {
      score: finalScore,
      rhythmScore,
      territoryScore,
      financialScore,
      guestScore,
      forecast: 'Medium Stress: Compromise required on territory/guest rules. Expected conflict: Occasional.',
      risk: 'medium',
    };
  } else {
    return {
      score: finalScore,
      rhythmScore,
      territoryScore,
      financialScore,
      guestScore,
      forecast: 'High Stress: Lifestyle vector conflict detected. Expected conflict: Frequent.',
      risk: 'high',
    };
  }
}

export function UltraStudentShowcaseSection() {
  // 1. Symbiotic Strain State
  const [energyWindow, setEnergyWindow] = useState('Dawn (5 AM - 9 AM)');
  const [territoriality, setTerritoriality] = useState(3);
  const [financialStyle, setFinancialStyle] = useState('Equal Split (Bill divided by N)');
  const [guestPhilosophy, setGuestPhilosophy] = useState('Home is a Private Fortress');

  const metrics = calculateSymbioticMetrics(energyWindow, territoriality, financialStyle, guestPhilosophy);

  // 2. Room Booking Lock Engine State
  const [activeWing, setActiveWing] = useState<'North' | 'South' | 'East'>('North');
  const [selectedRoom, setSelectedRoom] = useState<'304' | '201' | '108'>('304');
  const [selectedBed, setSelectedBed] = useState<'Bed A' | 'Bed B'>('Bed A');
  const [bookingLocked, setBookingLocked] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSimulateLock = () => {
    setBookingLocked(true);
    setBookingSuccess(false);
    setTimeout(() => {
      setBookingLocked(false);
      setBookingSuccess(true);
    }, 1600);
  };

  // 3. Marketplace State
  const [marketSearch, setMarketSearch] = useState('');
  const [marketCategory, setMarketCategory] = useState<'all' | 'books' | 'electronics' | 'furniture'>('all');
  const [selectedProductModal, setSelectedProductModal] = useState<any | null>(null);

  // 4. Ticket SLA State
  const [ticketCategory, setTicketCategory] = useState<'HVAC' | 'Plumbing' | 'Electrical' | 'Network'>('HVAC');
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'dispatched'>('idle');

  const triggerTicketSimulation = () => {
    setTicketStatus('submitting');
    setTimeout(() => setTicketStatus('dispatched'), 1400);
  };

  // 5. Passkey Simulation State
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');

  const triggerPasskeyDemo = () => {
    setPasskeyStatus('scanning');
    setTimeout(() => setPasskeyStatus('verified'), 1400);
  };

  // 6. FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 7. Budget Calculator State
  const [rentAmount, setRentAmount] = useState(6500);
  const [messPlan, setMessPlan] = useState(3500);
  const [utilitySplit, setUtilitySplit] = useState(800);

  const totalMonthlyCost = rentAmount + messPlan + utilitySplit;

  return (
    <div className="space-y-16 pt-4 pb-16 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 text-[#3C315B]">
      {/* SECTION 1: PLATFORM METRICS & VALUE HEADER (NO EMOJIS, COMPACT PADDING) */}
      <section className="bg-gradient-to-r from-[#3C315B] via-[#2D2447] to-[#1A1530] rounded-[32px] p-6 md:p-10 text-white border border-[#AB9FF2]/20 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center lg:text-left max-w-2xl">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2] border border-white/15 shadow-sm inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#AB9FF2]" /> STUDENT RESIDENCE ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Hostel Infrastructure Built for Students.
            </h2>
            <p className="text-xs md:text-sm text-white/70 font-normal leading-relaxed">
              Serializable PostgreSQL row locks for 100% room booking concurrency, Symbiotic Strain co-existence vectors, peer-to-peer commerce, and WebAuthn biometrics.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-[#2EC08B]">100%</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Atomic Locks</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-[#AB9FF2]">96%</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Survival Score</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-300">₹0</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Platform Fees</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-purple-300">&lt; 2.4h</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">SLA Resolution</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE SYMBIOTIC STRAIN MODEL LIVE SIMULATOR */}
      <section id="matching" className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#6A4FE0]" /> SYMBIOTIC VECTOR ENGINE
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#3C315B] tracking-tight">
            Calculate Roommate Peaceful Survival Vectors
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Test the 4 core lifestyle parameters below to calculate real-time co-existence scores and 3-month forecast projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Form Parameters (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E5E4E8] rounded-[32px] p-6 shadow-lg space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-3">
                <h3 className="text-base font-extrabold text-[#3C315B]">1. Configure Lifestyle Characteristics</h3>
                <span className="text-[11px] text-[#6A4FE0] font-extrabold">Live Vector Engine</span>
              </div>

              {/* Param 1: Energy Window */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#3C315B] uppercase tracking-wider block">
                  1. Peak Energy Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dawn (5 AM - 9 AM)', 'Midday (10 AM - 2 PM)', 'Dusk (5 PM - 9 PM)', 'Midnight (10 PM - 2 AM)'].map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setEnergyWindow(win)}
                      className={cn(
                        'px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border',
                        energyWindow === win
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-sm scale-[1.01]'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {win.split(' ')[0]} <span className="opacity-70 text-[10px] font-normal">{win.slice(win.indexOf('('))}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Param 2: Territoriality Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs font-extrabold text-[#3C315B]">
                  <span className="uppercase tracking-wider">2. Territoriality Index (Personal Space Zoning)</span>
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
                <div className="flex justify-between text-[10px] text-[#3C315B]/60 font-bold">
                  <span>Level 1: Shared Space &amp; Snacks</span>
                  <span>Level 10: Strictly Zoned Desk/Shelf</span>
                </div>
              </div>

              {/* Param 3: Financial Splitting */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-extrabold text-[#3C315B] uppercase tracking-wider block">
                  3. Financial Splitting Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Equal Split (Bill divided by N)', 'Exact Usage (I pay for what I consume)'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFinancialStyle(style)}
                      className={cn(
                        'px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border',
                        financialStyle === style
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-sm scale-[1.01]'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {style.split(' ')[0]} {style.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Param 4: Guest Philosophy */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-extrabold text-[#3C315B] uppercase tracking-wider block">
                  4. Guest Philosophy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Home is a Social Hub', 'Home is a Private Fortress'].map((phil) => (
                    <button
                      key={phil}
                      type="button"
                      onClick={() => setGuestPhilosophy(phil)}
                      className={cn(
                        'px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left border',
                        guestPhilosophy === phil
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-sm scale-[1.01]'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {phil === 'Home is a Social Hub' ? 'Social Hub' : 'Private Fortress'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Output Dial Card (5 Cols) */}
          <div className="lg:col-span-5 rounded-[32px] bg-gradient-to-br from-[#3C315B] via-[#2B2347] to-[#1A1530] text-white p-6 md:p-8 border border-[#AB9FF2]/30 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold uppercase tracking-wider text-[#AB9FF2]">
                VECTOR ANALYSIS RESULT
              </span>
              <h3 className="text-xl font-extrabold text-white">Chance of Peaceful Survival</h3>
            </div>

            {/* Gauge Dial Visual */}
            <div className="text-center space-y-3 py-2">
              <motion.div
                key={metrics.score}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-[#AB9FF2]/30 bg-white/5 backdrop-blur-xl shadow-xl relative"
              >
                <div className="space-y-0.5">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{metrics.score}%</span>
                  <span className="block text-[9px] uppercase font-extrabold text-[#AB9FF2] tracking-wider">Peaceful Survival</span>
                </div>
              </motion.div>

              {/* Sub-scores breakdown grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-white/60 block text-[9px]">Rhythm Match</span>
                  <span className="font-extrabold text-[#2EC08B]">{metrics.rhythmScore}%</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-white/60 block text-[9px]">Space Overlap</span>
                  <span className="font-extrabold text-[#AB9FF2]">{metrics.territoryScore}%</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-white/60 block text-[9px]">Expense Harmony</span>
                  <span className="font-extrabold text-amber-300">{metrics.financialScore}%</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-white/60 block text-[9px]">Guest Balance</span>
                  <span className="font-extrabold text-purple-300">{metrics.guestScore}%</span>
                </div>
              </div>
            </div>

            {/* 3-Month Forecast Widget */}
            <div className={cn(
              'p-3.5 rounded-2xl border space-y-1 transition-all text-xs font-semibold',
              metrics.risk === 'low' && 'bg-[#E6F9F0]/10 border-[#2EC08B]/40 text-[#2EC08B]',
              metrics.risk === 'medium' && 'bg-amber-500/10 border-amber-400/40 text-amber-300',
              metrics.risk === 'high' && 'bg-rose-500/10 border-rose-400/40 text-rose-300'
            )}>
              <div className="font-extrabold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>The 3-Month Forecast Projection</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{metrics.forecast}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ATOMIC ROOM BOOKING & ROW LOCK ALLOCATION ENGINE */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#6A4FE0]" /> CONCURRENCY ALLOCATION ENGINE
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#3C315B] tracking-tight">
            Book Hostel Beds With 100% Concurrency Safety
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Select a hostel wing and room below to observe PostgreSQL serializable row locks lock room records before validation.
          </p>
        </div>

        <div className="bg-white border border-[#E5E4E8] rounded-[32px] p-6 shadow-lg max-w-5xl mx-auto space-y-6">
          {/* Wing & Room Selectors */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#E5E4E8] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#3C315B]">Hostel Wing:</span>
              {(['North', 'South', 'East'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setActiveWing(w)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all border',
                    activeWing === w
                      ? 'bg-[#3C315B] text-white border-[#3C315B]'
                      : 'bg-[#FAFAFA] text-[#3C315B]/70 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                  )}
                >
                  {w} Wing
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#3C315B]">Room:</span>
              {[
                { id: '304', name: 'Room 304 (AC)' },
                { id: '201', name: 'Room 201 (Std)' },
                { id: '108', name: 'Room 108 (Single)' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoom(r.id as any)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border',
                    selectedRoom === r.id
                      ? 'bg-[#6A4FE0] text-white border-[#6A4FE0]'
                      : 'bg-[#FAFAFA] text-[#3C315B]/70 border-[#E5E4E8]'
                  )}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Panel Grid */}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-[#ECE8FE]/60 border border-[#AB9FF2]/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase text-[#6A4FE0] tracking-wider">SELECTED BED ALLOCATION</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[10px] font-extrabold">
                    Ready to Book
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-[#3C315B]">{activeWing} Wing — Room {selectedRoom} ({selectedBed})</h4>
                <p className="text-xs text-[#3C315B]/70 font-medium">PostgreSQL Transaction ID: #9042 • Row Lock Standing By</p>

                <div className="flex gap-2 text-xs font-bold pt-1">
                  {['Bed A', 'Bed B'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBed(b as any)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all',
                        selectedBed === b
                          ? 'bg-[#3C315B] text-white border-[#3C315B]'
                          : 'bg-white text-[#3C315B]/70 border-[#E5E4E8]'
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateLock}
                disabled={bookingLocked}
                className="w-full py-3.5 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {bookingLocked ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
                    Acquiring PostgreSQL FOR UPDATE Row Lock...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" /> Book Room {selectedRoom} ({selectedBed}) Now
                  </>
                )}
              </button>

              {bookingSuccess && (
                <div className="p-2.5 rounded-xl bg-[#E6F9F0] border border-emerald-200 text-[#2EC08B] text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2EC08B]" /> Bed Allocated Atomically! Zero Double-Booking.
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0B18] text-white border border-white/10 space-y-2.5 font-mono text-xs shadow-xl">
              <div className="flex justify-between items-center text-white/50 text-[10px] uppercase font-bold border-b border-white/10 pb-2">
                <span>Database Concurrency Pipeline</span>
                <span className="text-[#2EC08B]">ACTIVE</span>
              </div>
              <p className="text-purple-300">BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;</p>
              <p className="text-white">SELECT * FROM rooms WHERE id = {selectedRoom} FOR UPDATE;</p>
              <p className="text-emerald-400 font-bold">
                {bookingLocked ? 'LOCK ACQUIRED: Room Allocated!' : '✓ Zero collision across concurrent student requests.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PEER MARKETPLACE & RAZORPAY BUY DECK (NO EMOJIS) */}
      <section id="marketplace" className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#6A4FE0]" /> PEER CAMPUS MARKETPLACE
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#3C315B] tracking-tight">
            Buy &amp; Sell Items Within Your Hostel
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Trade textbooks, gadgets, and room essentials directly with fellow resident students using Razorpay merchant checkout.
          </p>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-2xl mx-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#3C315B]/50 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search textbooks, gadgets..."
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
                className="w-full bg-white border border-[#E5E4E8] rounded-full pl-9 pr-4 py-1.5 text-xs font-bold text-[#3C315B] focus:outline-none focus:border-[#6A4FE0]"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {[
                { id: 'all', label: 'All Items', icon: ShoppingBag },
                { id: 'books', label: 'Textbooks', icon: BookOpen },
                { id: 'electronics', label: 'Electronics', icon: Monitor },
                { id: 'furniture', label: 'Furniture', icon: Armchair },
              ].map((cat) => {
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMarketCategory(cat.id as any)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border flex items-center gap-1',
                      marketCategory === cat.id
                        ? 'bg-[#6A4FE0] text-white border-[#6A4FE0]'
                        : 'bg-white text-[#3C315B]/80 border-[#E5E4E8]'
                    )}
                  >
                    <IconComp className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              id: 1,
              title: 'Engineering Mathematics Vol II',
              category: 'books',
              price: '₹450',
              seller: 'Yashwanth (Room 204)',
              badge: 'Textbook',
            },
            {
              id: 2,
              title: 'Ergonomic Desk Chair & Lamp',
              category: 'furniture',
              price: '₹1,200',
              seller: 'Alex (Room 304)',
              badge: 'Furniture',
            },
            {
              id: 3,
              title: 'Logitech Wireless Keyboard & Mouse',
              category: 'electronics',
              price: '₹850',
              seller: 'Rohan (Room 108)',
              badge: 'Electronics',
            },
          ]
            .filter((item) => marketCategory === 'all' || item.category === marketCategory)
            .filter((item) => item.title.toLowerCase().includes(marketSearch.toLowerCase()))
            .map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                className="bg-white border border-[#E5E4E8] rounded-[28px] p-5 shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-[10px] font-extrabold">
                      {item.badge}
                    </span>
                    <span className="text-base font-extrabold text-[#3C315B]">{item.price}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#3C315B]">{item.title}</h4>
                  <p className="text-xs text-[#3C315B]/60 font-medium">Seller: {item.seller}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProductModal(item)}
                  className="w-full py-2.5 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  Buy with Razorpay <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
        </div>

        {/* Razorpay Modal */}
        {selectedProductModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-5 text-[#3C315B]"
            >
              <div className="flex justify-between items-center border-b border-[#E5E4E8] pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#6A4FE0]" />
                  <span className="font-extrabold text-xs">Razorpay Merchant Gateway</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProductModal(null)}
                  className="text-[#3C315B]/50 hover:text-[#3C315B] font-bold text-xs"
                >
                  Close ✕
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-[#3C315B]/60 font-semibold block">PURCHASING ITEM</span>
                <h4 className="text-base font-extrabold">{selectedProductModal.title}</h4>
                <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8] flex justify-between items-center text-xs font-bold">
                  <span>Total Payable Amount</span>
                  <span className="text-base text-[#6A4FE0]">{selectedProductModal.price}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('Razorpay Checkout Simulation Triggered!');
                  setSelectedProductModal(null);
                }}
                className="w-full py-3 rounded-full bg-[#6A4FE0] text-white font-extrabold text-xs shadow-md"
              >
                Pay Now with Razorpay
              </button>
            </motion.div>
          </div>
        )}
      </section>

      {/* SECTION 5: MAINTENANCE SLA RADAR & SERVICE TICKETS */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#6A4FE0]" /> MAINTENANCE SLA RADAR
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#3C315B] tracking-tight">
            Predictive Maintenance &amp; SLA Tracking
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Report hostel room issues with automatic Machine Learning SLA breach countdown tracking.
          </p>
        </div>

        <div className="bg-white border border-[#E5E4E8] rounded-[32px] p-6 shadow-lg max-w-4xl mx-auto space-y-5">
          <div className="flex flex-wrap justify-between items-center border-b border-[#E5E4E8] pb-3 gap-3">
            <span className="text-xs font-extrabold text-[#3C315B]">Issue Type:</span>
            <div className="flex gap-2">
              {(['HVAC', 'Plumbing', 'Electrical', 'Network'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTicketCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border',
                    ticketCategory === cat
                      ? 'bg-[#3C315B] text-white border-[#3C315B]'
                      : 'bg-[#FAFAFA] text-[#3C315B]/70 border-[#E5E4E8]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-2 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-[#3C315B]/60">Target SLA Resolution Window:</span>
                  <span className="text-[#6A4FE0]">&lt; 4 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3C315B]/60">Assigned Hostel Technician:</span>
                  <span className="text-[#3C315B]">Duty Engineer #14</span>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerTicketSimulation}
                disabled={ticketStatus !== 'idle'}
                className="w-full py-3 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {ticketStatus === 'idle' && 'Create Ticket & Trigger SLA Radar'}
                {ticketStatus === 'submitting' && 'Registering Ticket...'}
                {ticketStatus === 'dispatched' && '✓ Dispatch Confirmed! SLA Active.'}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#3C315B] text-white space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#AB9FF2] font-bold">
                <span>ML BREACH PREDICTION RADAR</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#2EC08B]">98.4% On-Time</span>
              </div>
              <p className="text-white/80 font-normal leading-relaxed">
                Tickets created for {ticketCategory} in Room {selectedRoom} are prioritized dynamically based on urgency score and staff load.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: MONTHLY BUDGET & UTILITY SPLITTER */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#6A4FE0]" /> MONTHLY BUDGET CALCULATOR
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#3C315B] tracking-tight">
            Transparent Monthly Hostel Expenses
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Calculate your monthly room rent, meal plan, and shared utility bill splitting in seconds.
          </p>
        </div>

        <div className="bg-white border border-[#E5E4E8] rounded-[32px] p-6 shadow-lg max-w-4xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#3C315B]">Adjust Expense Sliders</h3>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#3C315B]">
                <span>Room Rent Share</span>
                <span>₹{rentAmount}</span>
              </div>
              <input
                type="range"
                min={4000}
                max={12000}
                step={500}
                value={rentAmount}
                onChange={(e) => setRentAmount(Number(e.target.value))}
                className="w-full accent-[#6A4FE0] h-2 bg-[#E5E4E8] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#3C315B]">
                <span>Mess Meal Plan</span>
                <span>₹{messPlan}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={6000}
                step={250}
                value={messPlan}
                onChange={(e) => setMessPlan(Number(e.target.value))}
                className="w-full accent-[#6A4FE0] h-2 bg-[#E5E4E8] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#3C315B]">
                <span>Utility &amp; Wi-Fi Split</span>
                <span>₹{utilitySplit}</span>
              </div>
              <input
                type="range"
                min={300}
                max={2000}
                step={100}
                value={utilitySplit}
                onChange={(e) => setUtilitySplit(Number(e.target.value))}
                className="w-full accent-[#6A4FE0] h-2 bg-[#E5E4E8] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#3C315B] via-[#2B2347] to-[#1A1530] text-white space-y-3 text-center shadow-xl">
            <span className="text-[10px] font-extrabold uppercase text-[#AB9FF2] tracking-wider block">ESTIMATED TOTAL MONTHLY OUTLAY</span>
            <span className="text-4xl font-extrabold text-white tracking-tight">₹{totalMonthlyCost.toLocaleString()}</span>
            <p className="text-xs text-white/70 font-medium">Split evenly across roommate balances via Razorpay.</p>
          </div>
        </div>
      </section>

      {/* SECTION 7: ZERO-TRUST PASSKEY SECURITY & BIOMETRICS */}
      <section id="security" className="bg-[#3C315B] text-white rounded-[32px] p-6 md:p-10 border border-[#AB9FF2]/30 shadow-xl space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2] border border-white/15">
            ZERO-TRUST SECURITY STACK
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Protected by WebAuthn Passkeys &amp; Row-Level Isolation
          </h2>
          <p className="text-xs md:text-sm text-white/70 font-normal max-w-xl mx-auto leading-relaxed">
            Log in passwordlessly with WebAuthn biometrics or our 2FA Cipher Grid — isolated per tenant in PostgreSQL.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <ShieldCheck className="w-7 h-7 text-[#2EC08B]" />
            <h4 className="text-base font-extrabold text-white">PostgreSQL RLS</h4>
            <p className="text-xs text-white/70 font-normal leading-relaxed">
              Row-Level Security isolates hostel tenant data. Cross-hostel data leakage is cryptographically impossible.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Key className="w-7 h-7 text-amber-300" />
            <h4 className="text-base font-extrabold text-white">WebAuthn Passkeys</h4>
            <p className="text-xs text-white/70 font-normal leading-relaxed">
              Log in securely with WebAuthn TouchID / FaceID biometrics or our 2FA Cipher Grid.
            </p>
            <button
              type="button"
              onClick={triggerPasskeyDemo}
              className="px-3.5 py-1.5 rounded-full bg-[#6A4FE0] text-white text-xs font-bold shadow-md hover:bg-[#583EC2] transition-all"
            >
              {passkeyStatus === 'idle' && 'Test Passkey Scan'}
              {passkeyStatus === 'scanning' && 'Scanning TouchID...'}
              {passkeyStatus === 'verified' && '✓ Biometrics Verified!'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <Lock className="w-7 h-7 text-[#AB9FF2]" />
            <h4 className="text-base font-extrabold text-white">Argon2id Key Derivation</h4>
            <p className="text-xs text-white/70 font-normal leading-relaxed">
              Industry-standard Argon2id key derivation protects all credentials against GPU cracking attacks.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: STUDENT FAQ ACCORDION */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#6A4FE0]" /> KNOWLEDGE BASE &amp; FAQ
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#3C315B] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {[
            {
              q: 'How does the Symbiotic Strain Model calculate compatibility?',
              a: 'Instead of outdated habit surveys, we measure co-existence strain across 4 categories: Peak Energy Window, Territoriality Index (1-10), Financial Splitting Style, and Guest Philosophy. This calculates your % Chance of Peaceful Survival and 3-Month Forecast.',
            },
            {
              q: 'How does RoomiFY prevent double-bookings during room allocation?',
              a: 'Our backend uses PostgreSQL FOR UPDATE row-level locking with serializable transaction isolation. When a student initiates a booking, the room record is locked instantly, ensuring no concurrent request can collide.',
            },
            {
              q: 'Can I sell textbooks and room furniture on the Marketplace?',
              a: 'Yes! Students can list items for sale directly within their campus marketplace with Razorpay checkout integration.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E4E8] rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:border-[#6A4FE0]/40"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex justify-between items-center font-extrabold text-[#3C315B] text-xs md:text-sm">
                <span>{faq.q}</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform text-[#6A4FE0]', openFaq === idx && 'rotate-180')} />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-[#3C315B]/70 font-normal leading-relaxed mt-2.5 pt-2.5 border-t border-[#E5E4E8]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
