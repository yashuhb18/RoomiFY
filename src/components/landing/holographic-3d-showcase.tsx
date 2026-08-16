'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, Lock, ShieldCheck, ShoppingBag, ArrowRight,
  Zap, Heart, Users, MessageSquare, Check, HelpCircle, Star, ChevronDown,
  Layers, BadgePercent, Flame, Trophy, DollarSign, Clock, AlertTriangle, Key,
  Search, Filter, RefreshCw, Calendar, MapPin, Sliders, Activity, Radio,
  ThumbsUp, ShieldAlert, Cpu, Terminal, Eye, Send, CheckSquare, Plus, CreditCard,
  BookOpen, Monitor, Armchair, Gamepad2, Shield, Wrench, Wifi, Server, Box, Layers3
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for Symbiotic Strain Model calculations
function calculate3DSymbioticScore(
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
      forecast: 'Optimal Compatibility: High vector alignment. Expected conflict: Minimal.',
      risk: 'low',
    };
  } else if (finalScore >= 50) {
    return {
      score: finalScore,
      rhythmScore,
      territoryScore,
      financialScore,
      guestScore,
      forecast: 'Moderate Compatibility: Compromise needed on space/guest rules. Expected conflict: Occasional.',
      risk: 'medium',
    };
  } else {
    return {
      score: finalScore,
      rhythmScore,
      territoryScore,
      financialScore,
      guestScore,
      forecast: 'High Strain Risk: Fundamental lifestyle divergence. Expected conflict: Frequent.',
      risk: 'high',
    };
  }
}

// 3D Tilt Wrapper Component for Interactive Perspective Depth
function Perspective3DCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn('perspective-1000 transition-all duration-200 ease-out', className)}
    >
      {children}
    </motion.div>
  );
}

export function Holographic3DShowcaseSection() {
  // 1. Symbiotic Strain State
  const [energyWindow, setEnergyWindow] = useState('Dawn (5 AM - 9 AM)');
  const [territoriality, setTerritoriality] = useState(3);
  const [financialStyle, setFinancialStyle] = useState('Equal Split (Bill divided by N)');
  const [guestPhilosophy, setGuestPhilosophy] = useState('Home is a Private Fortress');

  const matchData = calculate3DSymbioticScore(energyWindow, territoriality, financialStyle, guestPhilosophy);

  // 2. Room Lock State
  const [activeWing, setActiveWing] = useState<'Alpha' | 'Beta' | 'Gamma'>('Alpha');
  const [selectedRoom, setSelectedRoom] = useState<'Room 304' | 'Room 201' | 'Room 108'>('Room 304');
  const [selectedBed, setSelectedBed] = useState<'Bed A' | 'Bed B'>('Bed A');
  const [bookingLocked, setBookingLocked] = useState(false);
  const [lockSuccess, setLockSuccess] = useState(false);

  const handleSimulate3DLock = () => {
    setBookingLocked(true);
    setLockSuccess(false);
    setTimeout(() => {
      setBookingLocked(false);
      setLockSuccess(true);
    }, 1500);
  };

  // 3. Marketplace State
  const [marketCategory, setMarketCategory] = useState<'all' | 'books' | 'electronics' | 'furniture'>('all');
  const [selectedItemModal, setSelectedItemModal] = useState<any | null>(null);

  // 4. Ticket State
  const [ticketCategory, setTicketCategory] = useState<'HVAC' | 'Plumbing' | 'Electrical' | 'Network'>('HVAC');
  const [ticketScanning, setTicketScanning] = useState(false);

  // 5. Passkey State
  const [passkeyVerified, setPasskeyVerified] = useState(false);

  // 6. Budget Calculator State
  const [rentAmount, setRentAmount] = useState(6500);
  const [messPlan, setMessPlan] = useState(3500);
  const [utilitySplit, setUtilitySplit] = useState(800);

  const totalMonthlyCost = rentAmount + messPlan + utilitySplit;

  // 7. FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-24 pt-6 pb-20 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 text-[#3C315B]">
      {/* 3D MODULE 1: HOLOGRAPHIC 3D METRICS BANNER */}
      <Perspective3DCard className="w-full">
        <div className="relative rounded-[36px] bg-gradient-to-br from-[#0D0B18] via-[#1F1934] to-[#0A0814] p-8 md:p-12 text-white border border-[#AB9FF2]/30 shadow-[0_0_60px_rgba(106,79,224,0.25)] space-y-8 overflow-hidden">
          {/* Animated 3D Grid Grid Lines Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

          {/* Floating Neon Glowing Sphere Accent */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)] inline-flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} /> 3D RESIDENCE ALLOCATION ENGINE
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Next-Gen Holographic Student Portal
              </h2>
              <p className="text-xs md:text-sm text-white/70 font-normal leading-relaxed">
                Experience real-time 3D interactive allocation locking, Symbiotic vector strain calculations, peer trading, and biometric passkey verification.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto shrink-0">
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-center space-y-1 transform-gpu hover:translate-z-6 transition-transform">
                <span className="text-3xl font-extrabold text-[#2EC08B] drop-shadow-[0_0_10px_rgba(46,192,139,0.5)]">100%</span>
                <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Atomic Locks</span>
              </div>
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-center space-y-1 transform-gpu hover:translate-z-6 transition-transform">
                <span className="text-3xl font-extrabold text-[#AB9FF2] drop-shadow-[0_0_10px_rgba(171,159,242,0.5)]">96%</span>
                <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Survival Score</span>
              </div>
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-center space-y-1 transform-gpu hover:translate-z-6 transition-transform">
                <span className="text-3xl font-extrabold text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.5)]">₹0</span>
                <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">Platform Fees</span>
              </div>
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-center space-y-1 transform-gpu hover:translate-z-6 transition-transform">
                <span className="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]">&lt; 2.4h</span>
                <span className="block text-[10px] text-white/70 uppercase font-extrabold tracking-wider">SLA Alert</span>
              </div>
            </div>
          </div>
        </div>
      </Perspective3DCard>

      {/* 3D MODULE 2: INTERACTIVE SYMBIOTIC STRAIN 3D HOLOGRAM MATRIX */}
      <section id="matching" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-[#6A4FE0]" /> 3D SYMBIOTIC MATRIX ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-tight">
            Calculate Roommate Survival Vector in 3D
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Test the 4 Symbiotic Strain lifestyle variables below to calculate real-time co-existence scores and 3-month forecast projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Form (7 Cols) */}
          <Perspective3DCard className="lg:col-span-7">
            <div className="bg-white border border-[#E5E4E8] rounded-[36px] p-6 md:p-10 shadow-xl space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-4">
                  <h3 className="text-lg font-extrabold text-[#3C315B]">Set Candidate Profile Parameters</h3>
                  <span className="text-xs text-[#6A4FE0] font-extrabold">Interactive 3D Engine</span>
                </div>

                {/* Param 1: Energy Window */}
                <div className="space-y-2">
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
                          'px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left border',
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

                {/* Param 2: Territoriality Slider */}
                <div className="space-y-2 pt-2">
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
                    <span>Level 1: Fully Open Space &amp; Snacks</span>
                    <span>Level 10: Strictly Zoned Desk/Shelf</span>
                  </div>
                </div>

                {/* Param 3: Financial Splitting */}
                <div className="space-y-2 pt-2">
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
                          'px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left border',
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

                {/* Param 4: Guest Philosophy */}
                <div className="space-y-2 pt-2">
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
                          'px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left border',
                          guestPhilosophy === phil
                            ? 'bg-[#6A4FE0] text-white border-[#6A4FE0] shadow-md scale-[1.02]'
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
          </Perspective3DCard>

          {/* Hologram Output Gauge Dial (5 Cols) */}
          <Perspective3DCard className="lg:col-span-5">
            <div className="rounded-[36px] bg-gradient-to-br from-[#0D0B18] via-[#241C3D] to-[#120E24] text-white p-8 border border-[#AB9FF2]/30 shadow-2xl flex flex-col justify-between space-y-6 h-full relative overflow-hidden">
              {/* Cyan Glow Effect */}
              <div className="absolute -top-16 -right-16 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-1 relative z-10">
                <span className="px-3.5 py-1 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2]">
                  3D HOLOGRAM MATRIX RESULT
                </span>
                <h3 className="text-2xl font-extrabold text-white">Chance of Peaceful Survival</h3>
              </div>

              {/* 3D Metallic Gauge Dial Visual */}
              <div className="text-center space-y-4 py-4 relative z-10">
                <motion.div
                  key={matchData.score}
                  initial={{ scale: 0.8, opacity: 0, rotateZ: -20 }}
                  animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
                  className="inline-flex items-center justify-center w-44 h-44 rounded-full border-4 border-cyan-400/40 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.3)] relative"
                >
                  <div className="space-y-1">
                    <span className="text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                      {matchData.score}%
                    </span>
                    <span className="block text-[10px] uppercase font-extrabold text-cyan-300 tracking-wider">Peaceful Survival</span>
                  </div>
                </motion.div>

                {/* Sub-scores breakdown */}
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-white/60 block text-[10px]">Rhythm Alignment</span>
                    <span className="font-extrabold text-[#2EC08B]">{matchData.rhythmScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-white/60 block text-[10px]">Territory Overlap</span>
                    <span className="font-extrabold text-[#AB9FF2]">{matchData.territoryScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-white/60 block text-[10px]">Financial Harmony</span>
                    <span className="font-extrabold text-amber-300">{matchData.financialScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-white/60 block text-[10px]">Guest Frequency</span>
                    <span className="font-extrabold text-cyan-300">{matchData.guestScore}%</span>
                  </div>
                </div>
              </div>

              {/* 3-Month Forecast Widget */}
              <div className={cn(
                'p-4 rounded-2xl border space-y-1.5 transition-all text-xs font-semibold relative z-10',
                matchData.risk === 'low' && 'bg-[#E6F9F0]/10 border-[#2EC08B]/40 text-[#2EC08B]',
                matchData.risk === 'medium' && 'bg-amber-500/10 border-amber-400/40 text-amber-300',
                matchData.risk === 'high' && 'bg-rose-500/10 border-rose-400/40 text-rose-300'
              )}>
                <div className="font-extrabold flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>The 3-Month Forecast Projection</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{matchData.forecast}</p>
              </div>
            </div>
          </Perspective3DCard>
        </div>
      </section>

      {/* 3D MODULE 3: ATOMIC ROOM ALLOCATION LOCK SIMULATOR */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#6A4FE0]" /> ATOMIC ROOM ALLOCATION ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-tight">
            Book Hostel Beds With 100% Concurrency Safety
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Select a hostel wing and room below to observe PostgreSQL serializable row locks lock room records before validation.
          </p>
        </div>

        <Perspective3DCard className="w-full max-w-5xl mx-auto">
          <div className="bg-white border border-[#E5E4E8] rounded-[36px] p-8 shadow-xl space-y-8">
            {/* Wing & Room Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E5E4E8] pb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-[#3C315B]">Hostel Wing:</span>
                {(['Alpha', 'Beta', 'Gamma'] as const).map((w) => (
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

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#3C315B]">Room:</span>
                {[
                  { id: 'Room 304', name: 'Room 304 (AC)' },
                  { id: 'Room 201', name: 'Room 201 (Std)' },
                  { id: 'Room 108', name: 'Room 108 (Single)' },
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

            {/* Allocation Grid */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-[#ECE8FE]/60 border border-[#AB9FF2]/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase text-[#6A4FE0] tracking-wider">SELECTED BED ALLOCATION</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[10px] font-extrabold">
                      Ready to Book
                    </span>
                  </div>
                  <h4 className="text-2xl font-extrabold text-[#3C315B]">{activeWing} Wing — {selectedRoom} ({selectedBed})</h4>
                  <p className="text-xs text-[#3C315B]/70 font-medium">PostgreSQL Transaction ID: #9042 • Row Lock Active</p>

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
                  onClick={handleSimulate3DLock}
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
                      <Zap className="w-4 h-4 text-amber-300" /> Book {selectedRoom} ({selectedBed}) Now
                    </>
                  )}
                </button>

                {lockSuccess && (
                  <div className="p-3 rounded-2xl bg-[#E6F9F0] border border-emerald-200 text-[#2EC08B] text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2EC08B]" /> Bed Allocated Atomically! Zero Double-Booking.
                  </div>
                )}
              </div>

              <div className="p-6 rounded-3xl bg-[#0D0B18] text-white border border-white/10 space-y-3 font-mono text-xs shadow-2xl">
                <div className="flex justify-between items-center text-white/50 text-[10px] uppercase font-bold border-b border-white/10 pb-2">
                  <span>Database Concurrency Pipeline</span>
                  <span className="text-[#2EC08B]">ACTIVE</span>
                </div>
                <p className="text-purple-300">BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;</p>
                <p className="text-white">SELECT * FROM rooms WHERE id = &apos;{selectedRoom}&apos; FOR UPDATE;</p>
                <p className="text-emerald-400 font-bold">
                  {bookingLocked ? 'LOCK ACQUIRED: Room Allocated!' : '✓ Zero collision across concurrent student requests.'}
                </p>
              </div>
            </div>
          </div>
        </Perspective3DCard>
      </section>

      {/* 3D MODULE 4: CAMPUS PEER MARKETPLACE & RAZORPAY BUY */}
      <section id="marketplace" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#6A4FE0]" /> CAMPUS PEER MARKETPLACE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-tight">
            Buy &amp; Sell Items Within Your Hostel
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Trade textbooks, gadgets, and room essentials directly with fellow resident students using Razorpay merchant checkout.
          </p>

          {/* Filter Pills */}
          <div className="flex justify-center gap-2 pt-2">
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
                    'px-4 py-2 rounded-full text-xs font-extrabold transition-all border flex items-center gap-1.5',
                    marketCategory === cat.id
                      ? 'bg-[#6A4FE0] text-white border-[#6A4FE0]'
                      : 'bg-white text-[#3C315B]/80 border-[#E5E4E8]'
                  )}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Deck */}
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
            .map((item) => (
              <Perspective3DCard key={item.id}>
                <div className="bg-white border border-[#E5E4E8] rounded-[32px] p-6 shadow-xl space-y-4 flex flex-col justify-between h-full">
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
                    onClick={() => setSelectedItemModal(item)}
                    className="w-full py-3 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    Buy with Razorpay <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Perspective3DCard>
            ))}
        </div>

        {/* Razorpay Modal */}
        {selectedItemModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[36px] p-8 max-w-md w-full shadow-2xl space-y-6 text-[#3C315B]"
            >
              <div className="flex justify-between items-center border-b border-[#E5E4E8] pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#6A4FE0]" />
                  <span className="font-extrabold text-sm">Razorpay Checkout Gateway</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItemModal(null)}
                  className="text-[#3C315B]/50 hover:text-[#3C315B] font-bold text-xs"
                >
                  Close ✕
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#3C315B]/60 font-semibold block">PURCHASING ITEM</span>
                <h4 className="text-lg font-extrabold">{selectedItemModal.title}</h4>
                <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex justify-between items-center text-xs font-bold">
                  <span>Total Amount</span>
                  <span className="text-lg text-[#6A4FE0]">{selectedItemModal.price}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('Razorpay Merchant Simulation Executed!');
                  setSelectedItemModal(null);
                }}
                className="w-full py-3.5 rounded-full bg-[#6A4FE0] text-white font-extrabold text-xs shadow-lg"
              >
                Pay Now with Razorpay
              </button>
            </motion.div>
          </div>
        )}
      </section>

      {/* 3D MODULE 5: ZERO-TRUST SECURITY STACK & PASSKEYS */}
      <section id="security" className="bg-[#0D0B18] text-white rounded-[36px] p-8 md:p-12 border border-[#AB9FF2]/30 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-extrabold uppercase tracking-widest text-cyan-300 border border-white/15">
            ZERO-TRUST SECURITY PROTOCOL
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Protected by WebAuthn Passkeys &amp; Row-Level Security
          </h2>
          <p className="text-xs md:text-sm text-white/70 font-normal max-w-xl mx-auto leading-relaxed">
            Log in passwordlessly with WebAuthn biometrics or our 2FA Cipher Grid — isolated per tenant in PostgreSQL.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          <Perspective3DCard>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 h-full">
              <ShieldCheck className="w-8 h-8 text-[#2EC08B]" />
              <h4 className="text-lg font-extrabold text-white">PostgreSQL RLS</h4>
              <p className="text-xs text-white/70 font-normal leading-relaxed">
                Row-Level Security isolates hostel tenant data. Cross-hostel data leakage is cryptographically impossible.
              </p>
            </div>
          </Perspective3DCard>

          <Perspective3DCard>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 h-full">
              <Key className="w-8 h-8 text-amber-300" />
              <h4 className="text-lg font-extrabold text-white">WebAuthn Passkeys</h4>
              <p className="text-xs text-white/70 font-normal leading-relaxed">
                Log in securely with WebAuthn TouchID / FaceID biometrics or our 2FA Cipher Grid.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPasskeyVerified(true);
                  setTimeout(() => setPasskeyVerified(false), 2000);
                }}
                className="px-4 py-2 rounded-full bg-[#6A4FE0] text-white text-xs font-bold shadow-md hover:bg-[#583EC2] transition-all"
              >
                {passkeyVerified ? '✓ TouchID Verified!' : 'Test Passkey Scan'}
              </button>
            </div>
          </Perspective3DCard>

          <Perspective3DCard>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 h-full">
              <Lock className="w-8 h-8 text-cyan-300" />
              <h4 className="text-lg font-extrabold text-white">Argon2id Key Derivation</h4>
              <p className="text-xs text-white/70 font-normal leading-relaxed">
                Industry-standard Argon2id key derivation protects all credentials against GPU cracking attacks.
              </p>
            </div>
          </Perspective3DCard>
        </div>
      </section>

      {/* 3D MODULE 6: KNOWLEDGE BASE & FAQ ACCORDION */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#6A4FE0]" /> KNOWLEDGE BASE &amp; FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-tight">
            Frequently Asked Questions
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
