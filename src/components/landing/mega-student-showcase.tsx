'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, Lock, ShieldCheck, ShoppingBag, ArrowRight,
  Zap, Heart, Users, MessageSquare, Check, HelpCircle, Star, ChevronDown,
  Layers, BadgePercent, Flame, Trophy, DollarSign, Clock, AlertTriangle, Key,
  Search, Filter, RefreshCw, Calendar, MapPin, Sliders, Activity, Radio,
  ThumbsUp, ShieldAlert, Cpu, Terminal, Eye, Send, CheckSquare, Plus, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for Symbiotic Strain Model calculations
function calculateSymbioticMatch(
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

  // Rule 1: Energy window match/clash
  if (energy === 'Dawn (5 AM - 9 AM)' || energy === 'Midday (10 AM - 2 PM)') {
    score += 15;
    rhythmScore = 98;
  } else {
    rhythmScore = 65;
  }

  // Rule 2: Territoriality clash
  if (territoriality > 7) {
    score -= 30;
    territoryScore = 55;
  } else if (territoriality < 4) {
    score += 10;
    territoryScore = 95;
  }

  // Rule 3: Financial mismatch
  if (financial === 'Exact Usage (I pay for what I consume)') {
    score -= 15;
    financialScore = 70;
  } else {
    financialScore = 96;
  }

  // Rule 4: Guest mismatch
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
      forecast: 'Low Stress: You two are rhythmically aligned. Expected conflict: Minimal.',
      risk: 'low',
    };
  } else if (finalScore >= 50) {
    return {
      score: finalScore,
      rhythmScore,
      territoryScore,
      financialScore,
      guestScore,
      forecast: 'Medium Stress: Compromise needed on guest/territory rules. Expected conflict: Occasional.',
      risk: 'medium',
    };
  } else {
    return {
      score: finalScore,
      rhythmScore,
      territoryScore,
      financialScore,
      guestScore,
      forecast: 'High Stress: Fundamental lifestyle clash detected. Expected conflict: Frequent.',
      risk: 'high',
    };
  }
}

export function MegaStudentShowcaseSection() {
  // 1. Symbiotic Strain Engine State
  const [energyWindow, setEnergyWindow] = useState('Dawn (5 AM - 9 AM)');
  const [territoriality, setTerritoriality] = useState(3);
  const [financialStyle, setFinancialStyle] = useState('Equal Split (Bill divided by N)');
  const [guestPhilosophy, setGuestPhilosophy] = useState('Home is a Private Fortress');

  const matchResult = calculateSymbioticMatch(energyWindow, territoriality, financialStyle, guestPhilosophy);

  // 2. Interactive Room & Bed Floorplan State
  const [activeWing, setActiveWing] = useState<'North' | 'South' | 'East'>('North');
  const [selectedRoom, setSelectedRoom] = useState<'304' | '201' | '108'>('304');
  const [selectedBed, setSelectedBed] = useState<'Bed A' | 'Bed B'>('Bed A');
  const [bookingLocked, setBookingLocked] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSimulateBooking = () => {
    setBookingLocked(true);
    setBookingSuccess(false);
    setTimeout(() => {
      setBookingLocked(false);
      setBookingSuccess(true);
    }, 1800);
  };

  // 3. Marketplace Filter & Search State
  const [marketSearch, setMarketSearch] = useState('');
  const [marketCategory, setMarketCategory] = useState<'all' | 'books' | 'electronics' | 'furniture' | 'gaming'>('all');
  const [selectedProductModal, setSelectedProductModal] = useState<any | null>(null);

  // 4. Ticket Maintenance Simulator State
  const [ticketCategory, setTicketCategory] = useState<'HVAC' | 'Plumbing' | 'Electrical' | 'Wi-Fi'>('HVAC');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);

  // 5. Passkey Simulation State
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');

  const triggerPasskeyDemo = () => {
    setPasskeyStatus('scanning');
    setTimeout(() => setPasskeyStatus('verified'), 1500);
  };

  // 6. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 7. Budget Calculator State
  const [rentAmount, setRentAmount] = useState(6500);
  const [messPlan, setMessPlan] = useState(3500);
  const [utilitySplit, setUtilitySplit] = useState(800);

  const totalMonthlyCost = rentAmount + messPlan + utilitySplit;

  return (
    <div className="space-y-32 pt-8 pb-20 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 text-[#3C315B]">
      {/* MEGA SECTION 1: STUDENT METRICS & PLATFORM HIGHLIGHTS */}
      <section className="bg-gradient-to-r from-[#3C315B] via-[#2D2447] to-[#1A1530] rounded-[40px] p-8 md:p-14 text-white border border-[#AB9FF2]/30 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Glow backdrop decorative orb */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#6A4FE0]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-extrabold uppercase tracking-wider text-[#AB9FF2] border border-white/15 shadow-sm inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#AB9FF2]" /> STUDENT HOSTEL PLATFORM 2.0
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              Hostel Living, Re-Engineered.
            </h2>
            <p className="text-xs md:text-sm text-white/70 font-normal leading-relaxed">
              Designed 100% for students. Experience serializable atomic room booking, conflict-free roommate matching via the Symbiotic Strain Model, peer-to-peer campus commerce, and zero-trust security.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto shrink-0">
            <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold text-[#2EC08B]">100%</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Atomic Locks</span>
            </div>
            <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold text-[#AB9FF2]">96%</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Peaceful Survival</span>
            </div>
            <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold text-amber-300">₹0</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Middleman Fees</span>
            </div>
            <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold text-rose-300">&lt; 2.4h</span>
              <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">SLA Alert</span>
            </div>
          </div>
        </div>
      </section>

      {/* MEGA SECTION 2: THE SYMBIOTIC STRAIN MODEL — LIVE INTERACTIVE SIMULATOR */}
      <section id="matching" className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> SYMBIOTIC CO-EXISTENCE ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Calculate Roommate Peaceful Survival in Real-Time.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            We tossed out boring habit surveys. Adjust the 4 real Symbiotic Strain categories below to test our co-existence engine and see live 3-Month Forecast projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E5E4E8] rounded-[40px] p-6 md:p-10 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-4">
                <h3 className="text-lg font-extrabold text-[#3C315B]">1. Configure Co-Existence Variables</h3>
                <span className="text-xs text-[#6A4FE0] font-extrabold">Active Simulator</span>
              </div>

              {/* Field 1: Peak Energy Window */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-[#3C315B] uppercase tracking-wider block">
                  1. Peak Energy Window
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Dawn (5 AM - 9 AM)', 'Midday (10 AM - 2 PM)', 'Dusk (5 PM - 9 PM)', 'Midnight (10 PM - 2 AM)'].map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setEnergyWindow(win)}
                      className={cn(
                        'px-4 py-3 rounded-2xl text-xs font-extrabold transition-all text-left border',
                        energyWindow === win
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-md scale-[1.02]'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {win.split(' ')[0]} <span className="opacity-70 text-[10px] font-normal">{win.slice(win.indexOf('('))}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Territoriality Index Slider */}
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center text-xs font-extrabold text-[#3C315B]">
                  <span className="uppercase tracking-wider">2. Territoriality Index (Personal Space Zoning)</span>
                  <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0]">Level {territoriality} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={territoriality}
                  onChange={(e) => setTerritoriality(Number(e.target.value))}
                  className="w-full accent-[#6A4FE0] h-2.5 bg-[#E5E4E8] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#3C315B]/60 font-bold">
                  <span>Level 1: Fully Open (Share chargers &amp; snacks)</span>
                  <span>Level 10: Strictly Zoned (Private shelf)</span>
                </div>
              </div>

              {/* Field 3: Financial Splitting Style */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-extrabold text-[#3C315B] uppercase tracking-wider block">
                  3. Financial Splitting Style
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Equal Split (Bill divided by N)', 'Exact Usage (I pay for what I consume)'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFinancialStyle(style)}
                      className={cn(
                        'px-4 py-3 rounded-2xl text-xs font-extrabold transition-all text-left border',
                        financialStyle === style
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-md scale-[1.02]'
                          : 'bg-[#FAFAFA] text-[#3C315B]/80 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                      )}
                    >
                      {style.split(' ')[0]} {style.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Guest Philosophy */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-extrabold text-[#3C315B] uppercase tracking-wider block">
                  4. Guest Philosophy
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Home is a Social Hub', 'Home is a Private Fortress'].map((phil) => (
                    <button
                      key={phil}
                      type="button"
                      onClick={() => setGuestPhilosophy(phil)}
                      className={cn(
                        'px-4 py-3 rounded-2xl text-xs font-extrabold transition-all text-left border',
                        guestPhilosophy === phil
                          ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-md scale-[1.02]'
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
          <div className="lg:col-span-5 rounded-[40px] bg-gradient-to-br from-[#3C315B] via-[#2B2347] to-[#1A1530] text-white p-8 md:p-10 border border-[#AB9FF2]/30 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2]">
                SYMBIOTIC VECTOR RESULTS
              </span>
              <h3 className="text-2xl font-extrabold text-white">Peaceful Survival Dial</h3>
            </div>

            {/* Gauge Dial Visual */}
            <div className="text-center space-y-4 py-4">
              <motion.div
                key={matchResult.score}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-44 h-44 rounded-full border-4 border-[#AB9FF2]/40 bg-white/5 backdrop-blur-xl shadow-2xl relative"
              >
                <div className="space-y-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white">{matchResult.score}%</span>
                  <span className="block text-[10px] uppercase font-extrabold text-[#AB9FF2] tracking-wider">Peaceful Survival</span>
                </div>
              </motion.div>

              {/* Sub-scores breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-white/60 block text-[10px]">Rhythm Alignment</span>
                  <span className="font-extrabold text-[#2EC08B]">{matchResult.rhythmScore}%</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-white/60 block text-[10px]">Territory Overlap</span>
                  <span className="font-extrabold text-[#AB9FF2]">{matchResult.territoryScore}%</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-white/60 block text-[10px]">Financial Harmony</span>
                  <span className="font-extrabold text-amber-300">{matchResult.financialScore}%</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-white/60 block text-[10px]">Guest Frequency</span>
                  <span className="font-extrabold text-purple-300">{matchResult.guestScore}%</span>
                </div>
              </div>
            </div>

            {/* 3-Month Forecast Widget */}
            <div className={cn(
              'p-4 rounded-2xl border space-y-2 transition-all text-xs font-semibold',
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

      {/* MEGA SECTION 3: ATOMIC ROOM BOOKING & FLOORPLAN SIMULATOR */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#6A4FE0]" /> ATOMIC ROOM ALLOCATION ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Book Beds With 100% Concurrency Safety.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Select a hostel wing, room, and bed below to see PostgreSQL serializable row locks lock room records before validation.
          </p>
        </div>

        <div className="bg-white border border-[#E5E4E8] rounded-[40px] p-8 shadow-xl max-w-5xl mx-auto space-y-8">
          {/* Wing & Room Selectors */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#E5E4E8] pb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-[#3C315B]">Hostel Wing:</span>
              {(['North', 'South', 'East'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setActiveWing(w)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-extrabold transition-all border',
                    activeWing === w
                      ? 'bg-[#3C315B] text-white border-[#3C315B]'
                      : 'bg-[#FAFAFA] text-[#3C315B]/70 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                  )}
                >
                  {w} Wing
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-[#3C315B]">Room &amp; Bed:</span>
              {[
                { id: '304', name: 'Room 304 (AC)' },
                { id: '201', name: 'Room 201 (Std)' },
                { id: '108', name: 'Room 108 (Private)' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoom(r.id as any)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all border',
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

          {/* Interactive Bed Allocation Card Preview */}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-[#ECE8FE]/60 border border-[#AB9FF2]/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase text-[#6A4FE0] tracking-wider">SELECTED BED ALLOCATION</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[10px] font-extrabold">
                    Ready to Book
                  </span>
                </div>
                <h4 className="text-2xl font-extrabold text-[#3C315B]">{activeWing} Wing — Room {selectedRoom} ({selectedBed})</h4>
                <p className="text-xs text-[#3C315B]/70 font-medium">Prisma FOR UPDATE Lock Engine ID: #9042</p>

                <div className="flex gap-2 text-xs font-bold pt-1">
                  {['Bed A', 'Bed B'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBed(b as any)}
                      className={cn(
                        'px-4 py-2 rounded-xl border text-xs font-extrabold transition-all',
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
                onClick={handleSimulateBooking}
                disabled={bookingLocked}
                className="w-full py-4 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white font-extrabold text-xs shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {bookingLocked ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-white animate-ping" />
                    Acquiring PostgreSQL FOR UPDATE Row Lock...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" /> Book Room {selectedRoom} ({selectedBed}) Now
                  </>
                )}
              </button>

              {bookingSuccess && (
                <div className="p-3 rounded-2xl bg-[#E6F9F0] border border-emerald-200 text-[#2EC08B] text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2EC08B]" /> Room {selectedRoom} Bed Allocated Atomically! Zero Collision.
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-[#0D0B18] text-white border border-white/10 space-y-3 font-mono text-xs shadow-2xl">
              <div className="flex justify-between items-center text-white/50 text-[10px] uppercase font-bold border-b border-white/10 pb-2">
                <span>Database Concurrency Pipeline</span>
                <span className="text-[#2EC08B]">ACTIVE</span>
              </div>
              <p className="text-purple-300">BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;</p>
              <p className="text-white">SELECT * FROM rooms WHERE id = {selectedRoom} FOR UPDATE;</p>
              <p className="text-emerald-400 font-bold">
                {bookingLocked ? '🔒 ROW LOCK ACQUIRED: Room Locked!' : '✓ Zero double-bookings across concurrent student requests.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MEGA SECTION 4: PEER-TO-PEER CAMPUS MARKETPLACE & RAZORPAY BUY */}
      <section id="marketplace" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#6A4FE0]" /> CAMPUS PEER MARKETPLACE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Buy &amp; Sell Items Within Your Hostel.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Trade textbooks, electronics, study desks, and room essentials directly with fellow students using instant Razorpay merchant checkout.
          </p>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-2xl mx-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#3C315B]/50 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search textbooks, gadgets..."
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
                className="w-full bg-white border border-[#E5E4E8] rounded-full pl-10 pr-4 py-2 text-xs font-bold text-[#3C315B] focus:outline-none focus:border-[#6A4FE0]"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'books', label: '📚 Textbooks' },
                { id: 'electronics', label: '💻 Electronics' },
                { id: 'furniture', label: '🛋️ Furniture' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setMarketCategory(cat.id as any)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-extrabold transition-all border',
                    marketCategory === cat.id
                      ? 'bg-[#6A4FE0] text-white border-[#6A4FE0]'
                      : 'bg-white text-[#3C315B]/80 border-[#E5E4E8]'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Marketplace Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              title: 'Ergonomic Desk Chair &amp; Lamp',
              category: 'furniture',
              price: '₹1,200',
              seller: 'Alex (Room 304)',
              badge: 'Furniture',
            },
            {
              id: 3,
              title: 'Logitech Wireless Keyboard &amp; Mouse',
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
                whileHover={{ y: -4 }}
                className="bg-white border border-[#E5E4E8] rounded-[36px] p-6 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-[10px] font-extrabold">
                      {item.badge}
                    </span>
                    <span className="text-base font-extrabold text-[#3C315B]">{item.price}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-[#3C315B]">{item.title}</h4>
                  <p className="text-xs text-[#3C315B]/60 font-medium">Seller: {item.seller}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProductModal(item)}
                  className="w-full py-3 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  Buy with Razorpay <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
        </div>

        {/* Razorpay Checkout Modal Preview */}
        {selectedProductModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[36px] p-8 max-w-md w-full shadow-2xl space-y-6 text-[#3C315B]"
            >
              <div className="flex justify-between items-center border-b border-[#E5E4E8] pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#6A4FE0]" />
                  <span className="font-extrabold text-sm">Razorpay Checkout</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProductModal(null)}
                  className="text-[#3C315B]/50 hover:text-[#3C315B] font-bold text-xs"
                >
                  Close ✕
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#3C315B]/60 font-semibold block">PURCHASING ITEM</span>
                <h4 className="text-lg font-extrabold">{selectedProductModal.title}</h4>
                <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex justify-between items-center text-xs font-bold">
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
                className="w-full py-3.5 rounded-full bg-[#6A4FE0] text-white font-extrabold text-xs shadow-lg"
              >
                Pay Now with Razorpay
              </button>
            </motion.div>
          </div>
        )}
      </section>

      {/* MEGA SECTION 5: STUDENT BUDGET & EXPENSE SPLITTING CALCULATOR */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#6A4FE0]" /> STUDENT HOSTEL BUDGET CALCULATOR
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Transparent Monthly Hostel Expenses.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Calculate your monthly room rent, mess meal plan, and shared utility bill splitting in seconds.
          </p>
        </div>

        <div className="bg-white border border-[#E5E4E8] rounded-[40px] p-8 shadow-xl max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <h3 className="text-base font-extrabold text-[#3C315B]">Adjust Monthly Values</h3>

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#3C315B] via-[#2B2347] to-[#1A1530] text-white space-y-4 text-center shadow-2xl">
            <span className="text-[11px] font-extrabold uppercase text-[#AB9FF2] tracking-wider block">ESTIMATED TOTAL MONTHLY OUTLAY</span>
            <span className="text-5xl font-extrabold text-white tracking-tight">₹{totalMonthlyCost.toLocaleString()}</span>
            <p className="text-xs text-white/70 font-medium">Split evenly across roommate balances via Razorpay.</p>
          </div>
        </div>
      </section>

      {/* MEGA SECTION 6: ZERO-TRUST PASSKEY SECURITY & EMOJI CIPHER */}
      <section id="security" className="bg-[#3C315B] text-white rounded-[40px] p-8 md:p-12 border border-[#AB9FF2]/30 shadow-2xl space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2] border border-white/15">
            ZERO-TRUST STUDENT SECURITY
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Protected by Passkeys &amp; Row-Level Isolation.
          </h2>
          <p className="text-xs md:text-sm text-white/70 font-normal max-w-xl mx-auto leading-relaxed">
            Log in passwordlessly with WebAuthn biometrics or our 2FA Emoji Cipher Grid — isolated per tenant in PostgreSQL.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#2EC08B]" />
            <h4 className="text-lg font-extrabold text-white">PostgreSQL RLS</h4>
            <p className="text-xs text-white/70 font-normal leading-relaxed">
              Row-Level Security isolates hostel tenant data. Cross-hostel data leakage is cryptographically impossible.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <Key className="w-8 h-8 text-amber-300" />
            <h4 className="text-lg font-extrabold text-white">Passkeys &amp; Emoji Cipher</h4>
            <p className="text-xs text-white/70 font-normal leading-relaxed">
              Log in securely with WebAuthn TouchID / FaceID biometrics or our 2FA Emoji Cipher Grid.
            </p>
            <button
              type="button"
              onClick={triggerPasskeyDemo}
              className="px-4 py-2 rounded-full bg-[#6A4FE0] text-white text-xs font-bold shadow-md hover:bg-[#583EC2] transition-all"
            >
              {passkeyStatus === 'idle' && 'Test Passkey Scan'}
              {passkeyStatus === 'scanning' && 'Scanning TouchID...'}
              {passkeyStatus === 'verified' && '✓ Biometrics Verified!'}
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <Lock className="w-8 h-8 text-[#AB9FF2]" />
            <h4 className="text-lg font-extrabold text-white">Argon2id Hashing</h4>
            <p className="text-xs text-white/70 font-normal leading-relaxed">
              Industry-standard Argon2id key derivation protects all credentials against GPU cracking attacks.
            </p>
          </div>
        </div>
      </section>

      {/* MEGA SECTION 7: STUDENT FAQ ACCORDION */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#6A4FE0]" /> STUDENT HELP &amp; FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Everything Students Need to Know.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
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
              className="bg-white border border-[#E5E4E8] rounded-3xl p-6 shadow-md cursor-pointer transition-all hover:border-[#6A4FE0]/40"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex justify-between items-center font-extrabold text-[#3C315B] text-sm">
                <span>{faq.q}</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform text-[#6A4FE0]', openFaq === idx && 'rotate-180')} />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-[#3C315B]/70 font-normal leading-relaxed mt-3 pt-3 border-t border-[#E5E4E8]">
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
