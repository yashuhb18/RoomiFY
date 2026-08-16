'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShieldCheck, Sparkles, CheckCircle2, ShoppingBag, Clock, Lock, ArrowUpRight } from 'lucide-react';

type CardTone = 'lavender' | 'periwinkle' | 'bone' | 'aubergine' | 'butter' | 'blush';

const toneMap: Record<CardTone, { bg: string; border: string; text: string }> = {
  lavender: { bg: 'bg-[#EAE6FF]', border: 'border-[#D6CDFE]', text: 'text-[#251A4A]' },
  periwinkle: { bg: 'bg-[#DFF0FF]', border: 'border-[#C5E2FF]', text: 'text-[#102A54]' },
  bone: { bg: 'bg-white', border: 'border-[#E5E4E8]', text: 'text-[#1C1C1C]' },
  aubergine: { bg: 'bg-[#3C315B]', border: 'border-[#AB9FF2]/30', text: 'text-white' },
  butter: { bg: 'bg-[#FFFDF0]', border: 'border-[#FFEFA6]', text: 'text-[#2B2300]' },
  blush: { bg: 'bg-[#FFF0F2]', border: 'border-[#FFD0D6]', text: 'text-[#4A1018]' },
};

interface ShowcaseCardProps {
  eyebrow: string;
  title: string;
  description: string;
  tone?: CardTone;
  children?: React.ReactNode;
  className?: string;
  index?: number;
}

export function ShowcaseCard({
  eyebrow,
  title,
  description,
  tone = 'bone',
  children,
  className,
  index = 0,
}: ShowcaseCardProps) {
  const colors = toneMap[tone];
  const isDark = tone === 'aubergine';

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.015 }}
      className={cn(
        'rounded-[32px] border p-8 md:p-10 flex flex-col justify-between h-full transition-all duration-300 shadow-[0_15px_35px_rgba(60,49,91,0.06)] hover:shadow-[0_25px_50px_rgba(106,79,224,0.18)] hover:border-[#6A4FE0]/50',
        colors.bg,
        colors.border,
        className,
      )}
    >
      <div className="space-y-4 mb-6">
        <p className={cn('text-xs font-extrabold uppercase tracking-wider', isDark ? 'text-[#AB9FF2]' : 'text-[#6A4FE0]')}>
          {eyebrow}
        </p>
        <h3 className={cn('text-2xl md:text-3xl font-bold tracking-tight leading-tight', colors.text)}>
          {title}
        </h3>
        <p className={cn('text-xs md:text-sm font-normal leading-relaxed max-w-md', isDark ? 'text-white/70' : 'text-[#3C315B]/70')}>
          {description}
        </p>
      </div>
      {children && (
        <div className="mt-auto pt-4 flex items-center justify-center w-full">{children}</div>
      )}
    </motion.article>
  );
}

/** Mini UI mockups inside showcase cards — Phantom-style product previews */
export function MockBookingCard() {
  return (
    <div className="w-full rounded-[24px] bg-white border border-[#D6CDFE] p-5 space-y-3 shadow-lg text-[#251A4A]">
      <div className="flex justify-between items-center text-xs">
        <span className="font-extrabold tracking-wider text-[#6A4FE0]">LIVE ATOMIC ALLOCATION</span>
        <span className="px-3 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Allocated
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xl font-bold text-[#3C315B]">Room 204 — Bed A</p>
        <p className="text-[11px] text-[#3C315B]/60 font-mono">Prisma FOR UPDATE Lock ID: #9042</p>
      </div>
      <div className="flex gap-2 pt-1 text-xs">
        <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold">Floor 2</span>
        <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold">Deluxe Double</span>
      </div>
    </div>
  );
}

export function Mock3DPillsCard() {
  return (
    <div className="w-full space-y-2.5 relative">
      <motion.div
        whileHover={{ scale: 1.03, x: 4 }}
        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center justify-between shadow-md"
      >
        <span className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#AB9FF2]" /> FOR UPDATE Row Lock
        </span>
        <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full text-white font-semibold">Atomic</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03, x: -4 }}
        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center justify-between shadow-md"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2EC08B]" /> Tenant RLS Isolation
        </span>
        <span className="text-[10px] bg-[#2EC08B]/20 text-[#2EC08B] px-2.5 py-0.5 rounded-full font-bold">Hostel Scoped</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03, x: 4 }}
        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center justify-between shadow-md"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" /> Argon2id Key Derivation
        </span>
        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">Zero Trust</span>
      </motion.div>
    </div>
  );
}

export function MockScatteredBadgesCard() {
  return (
    <div className="w-full space-y-3 p-2 text-center">
      <div className="inline-block px-4 py-1.5 rounded-full bg-[#6A4FE0] text-white font-extrabold text-xs shadow-md">
        ✨ 96% Peaceful Survival
      </div>
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <span className="px-3 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] font-bold text-[11px] border border-emerald-200">
          🌅 Dawn (5 AM - 9 AM)
        </span>
        <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold text-[11px] border border-[#AB9FF2]/30">
          🛡️ Level 2 Territoriality
        </span>
        <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold text-[11px] border border-[#AB9FF2]/30">
          💳 Equal Split
        </span>
        <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold text-[11px] border border-[#AB9FF2]/30">
          🏰 Private Fortress
        </span>
      </div>
    </div>
  );
}

