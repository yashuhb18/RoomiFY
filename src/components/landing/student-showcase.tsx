'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, Lock, ShieldCheck, ShoppingBag, ArrowRight,
  Zap, Heart, Users, MessageSquare, Check, HelpCircle, Star, ChevronDown,
  Layers, BadgePercent, Flame, Trophy, DollarSign, Clock, AlertTriangle, Key
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

  if (energy === 'Dawn (5 AM - 9 AM)' || energy === 'Midday (10 AM - 2 PM)') {
    score += 15;
  }

  if (territoriality > 7) {
    score -= 30;
  } else if (territoriality < 4) {
    score += 10;
  }

  if (financial === 'Exact Usage (I pay for what I consume)') {
    score -= 15;
  }

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

export function StudentShowcaseSection() {
  // 1. Symbiotic Strain Engine State
  const [energyWindow, setEnergyWindow] = useState('Dawn (5 AM - 9 AM)');
  const [territoriality, setTerritoriality] = useState(3);
  const [financialStyle, setFinancialStyle] = useState('Equal Split (Bill divided by N)');
  const [guestPhilosophy, setGuestPhilosophy] = useState('Home is a Private Fortress');

  const matchResult = calculateLandingMatch(energyWindow, territoriality, financialStyle, guestPhilosophy);

  // 2. Interactive Room & Bed Floorplan State
  const [selectedRoom, setSelectedRoom] = useState<'304' | '201' | '108'>('304');
  const [selectedBed, setSelectedBed] = useState<'Bed A' | 'Bed B'>('Bed A');
  const [bookingLocked, setBookingLocked] = useState(false);

  const handleSimulateBooking = () => {
    setBookingLocked(true);
    setTimeout(() => setBookingLocked(false), 2000);
  };

  // 3. Marketplace Active Filter State
  const [marketCategory, setMarketCategory] = useState<'all' | 'books' | 'electronics' | 'furniture'>('all');

  // 4. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-28 pt-8 pb-16 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
      {/* SECTION 1: HERO METRICS BAR */}
      <section className="bg-gradient-to-r from-[#3C315B] via-[#2D2447] to-[#1A1530] rounded-[36px] p-8 md:p-12 text-white border border-[#AB9FF2]/30 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2]">
              BUILT EXCLUSIVELY FOR STUDENTS
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Hostel Living, Evolved.
            </h2>
            <p className="text-xs md:text-sm text-white/70 font-normal max-w-xl">
              Zero double-bookings, conflict-free roommate matching, peer-to-peer commerce, and instant passkey logins.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
              <span className="text-2xl md:text-3xl font-extrabold text-[#2EC08B]">100%</span>
              <span className="block text-[10px] text-white/70 uppercase font-bold mt-0.5">Atomic Locks</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
              <span className="text-2xl md:text-3xl font-extrabold text-[#AB9FF2]">96%</span>
              <span className="block text-[10px] text-white/70 uppercase font-bold mt-0.5">Peaceful Survival</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-300">₹0</span>
              <span className="block text-[10px] text-white/70 uppercase font-bold mt-0.5">Middleman Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE SYMBIOTIC STRAIN MODEL LIVE SIMULATOR */}
      <section id="matching" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6A4FE0]" /> SYMBIOTIC CO-EXISTENCE ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Calculate Roommate Peaceful Survival in Real Time.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            We tossed out generic sleep &amp; music surveys. Test our 4 Symbiotic Strain categories below to predict roommate harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E5E4E8] rounded-[36px] p-6 md:p-10 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <h3 className="text-lg font-extrabold text-[#3C315B]">Set Candidate Profile Characteristics</h3>

              {/* Field 1: Peak Energy Window */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#3C315B]/70 block">1. Peak Energy Window</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dawn (5 AM - 9 AM)', 'Midday (10 AM - 2 PM)', 'Dusk (5 PM - 9 PM)', 'Midnight (10 PM - 2 AM)'].map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setEnergyWindow(win)}
                      className={cn(
                        'px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left border',
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
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#3C315B]">
                  <span>2. Territoriality Index (Personal Space Zoning)</span>
                  <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] font-extrabold">Level {territoriality} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={territoriality}
                  onChange={(e) => setTerritoriality(Number(e.target.value))}
                  className="w-full accent-[#6A4FE0] h-2.5 bg-[#E5E4E8] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#3C315B]/60 font-semibold">
                  <span>Level 1: Fully Open (Share chargers &amp; snacks)</span>
                  <span>Level 10: Strictly Zoned (Private shelf)</span>
                </div>
              </div>

              {/* Field 3: Financial Splitting Style */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#3C315B]/70 block">3. Financial Splitting Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Equal Split (Bill divided by N)', 'Exact Usage (I pay for what I consume)'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFinancialStyle(style)}
                      className={cn(
                        'px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left border',
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
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#3C315B]/70 block">4. Guest Philosophy</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Home is a Social Hub', 'Home is a Private Fortress'].map((phil) => (
                    <button
                      key={phil}
                      type="button"
                      onClick={() => setGuestPhilosophy(phil)}
                      className={cn(
                        'px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left border',
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
          <div className="lg:col-span-5 rounded-[36px] bg-gradient-to-br from-[#3C315B] via-[#2B2347] to-[#1A1530] text-white p-8 border border-[#AB9FF2]/30 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2]">
                SYMBIOTIC VECTOR RESULTS
              </span>
              <h3 className="text-2xl font-extrabold text-white">Chance of Peaceful Survival</h3>
            </div>

            {/* Gauge Dial Visual */}
            <div className="text-center space-y-3 py-6">
              <motion.div
                key={matchResult.score}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-40 h-40 rounded-full border-4 border-[#AB9FF2]/40 bg-white/5 backdrop-blur-xl shadow-2xl relative"
              >
                <div className="space-y-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white">{matchResult.score}%</span>
                  <span className="block text-[10px] uppercase font-extrabold text-[#AB9FF2] tracking-wider">Peaceful Survival</span>
                </div>
              </motion.div>
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

      {/* SECTION 3: INTERACTIVE ROOM & BED BOOKING PIPELINE */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#6A4FE0]" /> ATOMIC ROOM ALLOCATION ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Book Beds With 100% Concurrency Safety.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Select a hostel room and bed below to see PostgreSQL serializable row locks lock room records before validation.
          </p>
        </div>

        <div className="bg-white border border-[#E5E4E8] rounded-[36px] p-8 shadow-xl max-w-5xl mx-auto space-y-8">
          {/* Room Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E4E8] pb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-[#3C315B]">Select Room:</span>
              {[
                { id: '304', name: 'Room 304 (AC Deluxe)' },
                { id: '201', name: 'Room 201 (Standard Double)' },
                { id: '108', name: 'Room 108 (Single Private)' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoom(r.id as any)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-extrabold transition-all border',
                    selectedRoom === r.id
                      ? 'bg-[#3C315B] text-white border-[#3C315B]'
                      : 'bg-[#FAFAFA] text-[#3C315B]/70 border-[#E5E4E8] hover:bg-[#ECE8FE]/50'
                  )}
                >
                  {r.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#3C315B]">Bed:</span>
              {['Bed A', 'Bed B'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBed(b as any)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all border',
                    selectedBed === b
                      ? 'bg-[#6A4FE0] text-white border-[#6A4FE0]'
                      : 'bg-[#FAFAFA] text-[#3C315B]/70 border-[#E5E4E8]'
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Bed Allocation Card Preview */}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#ECE8FE]/60 border border-[#AB9FF2]/30 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-[#6A4FE0] tracking-wider">SELECTED BED ALLOCATION</span>
                <h4 className="text-2xl font-extrabold text-[#3C315B]">Room {selectedRoom} — {selectedBed}</h4>
                <p className="text-xs text-[#3C315B]/70 font-medium">PostgreSQL Lock ID: #9042 • Serializable Transaction Active</p>
              </div>

              <button
                type="button"
                onClick={handleSimulateBooking}
                disabled={bookingLocked}
                className="w-full py-3.5 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {bookingLocked ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
                    Acquiring FOR UPDATE Row Lock...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" /> Book Room {selectedRoom} ({selectedBed}) Now
                  </>
                )}
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#0D0B18] text-white border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-white/50 text-[10px] uppercase font-bold border-b border-white/10 pb-2">
                <span>Database Concurrency Guard</span>
                <span className="text-[#2EC08B]">ACTIVE</span>
              </div>
              <p className="text-purple-300">BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;</p>
              <p className="text-white">SELECT * FROM rooms WHERE id = {selectedRoom} FOR UPDATE;</p>
              <p className="text-emerald-400 font-bold">
                {bookingLocked ? '🔒 ROW LOCK ACQUIRED: Room Allocated!' : '✓ Zero double-bookings across concurrent requests.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PEER-TO-PEER HOSTEL MARKETPLACE TRADING DECK */}
      <section id="marketplace" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#6A4FE0]" /> CAMPUS PEER MARKETPLACE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#3C315B] tracking-tight leading-[1.12]">
            Buy &amp; Sell Items Within Your Hostel.
          </h2>
          <p className="text-xs md:text-sm text-[#3C315B]/70 font-normal max-w-xl mx-auto leading-relaxed">
            Trade textbooks, electronics, study desks, and room essentials directly with fellow students using instant Razorpay checkout.
          </p>

          {/* Filter Pills */}
          <div className="flex justify-center gap-2 pt-2">
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
                  'px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border',
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

        {/* Marketplace Grid */}
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
            .map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#E5E4E8] rounded-[32px] p-6 shadow-xl space-y-4 flex flex-col justify-between"
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
                  className="w-full py-2.5 rounded-full bg-[#6A4FE0] hover:bg-[#583EC2] text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  Buy with Razorpay <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
        </div>
      </section>

      {/* SECTION 5: ENTERPRISE ZERO-TRUST SECURITY DEEP DIVE */}
      <section id="security" className="bg-[#3C315B] text-white rounded-[36px] p-8 md:p-12 border border-[#AB9FF2]/30 shadow-2xl space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-wider text-[#AB9FF2] border border-white/15">
            ZERO-TRUST SECURITY ARCHITECTURE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Self-Custodial &amp; Protected by Row-Level Security.
          </h2>
          <p className="text-xs md:text-sm text-white/70 font-normal max-w-xl mx-auto leading-relaxed">
            Your data is isolated per hostel tenant across PostgreSQL sessions. Passwordless passkey logins protect your profile.
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

      {/* SECTION 6: STUDENT FAQ ACCORDION */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wide border border-[#AB9FF2]/30 shadow-sm inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#6A4FE0]" /> FREQUENTLY ASKED QUESTIONS
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
