'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShieldCheck, Sparkles, CheckCircle2, UserCheck, Clock, Layers } from 'lucide-react';

type CardTone = 'lavender' | 'periwinkle' | 'bone' | 'aubergine' | 'butter' | 'blush';

const toneMap: Record<CardTone, { bg: string; border: string; text: string }> = {
  lavender: { bg: 'bg-[#EAE6FF]', border: 'border-[#D6CDFE]', text: 'text-[#251A4A]' },
  periwinkle: { bg: 'bg-[#DFF0FF]', border: 'border-[#C5E2FF]', text: 'text-[#102A54]' },
  bone: { bg: 'bg-white', border: 'border-[#E5E4E8]', text: 'text-[#1C1C1C]' },
  aubergine: { bg: 'bg-[#0D0B18]', border: 'border-white/10', text: 'text-white' },
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
        'rounded-[32px] border p-8 md:p-10 flex flex-col justify-between transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(139,92,246,0.15)] hover:border-[#8B5CF6]/40',
        colors.bg,
        colors.border,
        className,
      )}
    >
      <div className="space-y-4 mb-8">
        <p className={cn('text-xs font-semibold uppercase tracking-wider', isDark ? 'text-purple-300' : 'text-[#8B5CF6]')}>
          {eyebrow}
        </p>
        <h3 className={cn('text-2xl md:text-3xl font-jakarta font-bold tracking-tight leading-tight', colors.text)}>
          {title}
        </h3>
        <p className={cn('text-sm md:text-base font-normal leading-relaxed max-w-md', isDark ? 'text-gray-300' : 'text-gray-600')}>
          {description}
        </p>
      </div>
      {children && (
        <div className="mt-auto pt-2">{children}</div>
      )}
    </motion.article>
  );
}

/** Mini UI mockups inside showcase cards — Phantom-style product previews */
export function MockBookingCard() {
  return (
    <div className="w-full max-w-sm mx-auto rounded-[28px] bg-white border border-[#D6CDFE] p-6 space-y-4 shadow-xl text-[#251A4A]">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Live Booking</span>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Allocated
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-jakarta font-extrabold text-[#1C1C1C]">Room 204 — AC Bed A</p>
        <p className="text-xs text-gray-500 font-medium">PostgreSQL Lock ID: #9042</p>
      </div>
      <div className="flex gap-2 pt-1">
        <span className="text-xs px-3 py-1.5 rounded-full bg-[#EAE6FF] text-[#251A4A] font-bold">Floor 2</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-[#EAE6FF] text-[#251A4A] font-bold">Deluxe Room</span>
      </div>
    </div>
  );
}

export function Mock3DPillsCard() {
  return (
    <div className="w-full max-w-sm mx-auto p-4 space-y-3 relative">
      <motion.div
        whileHover={{ scale: 1.05, rotate: -2 }}
        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white font-jakarta font-bold text-sm flex items-center justify-between shadow-lg"
      >
        <span>🔒 FOR UPDATE Lock</span>
        <span className="text-xs text-purple-300 font-normal">Atomic</span>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white font-jakarta font-bold text-sm flex items-center justify-between shadow-lg ml-4"
      >
        <span>🛡️ RLS Isolation</span>
        <span className="text-xs text-emerald-300 font-normal">Tenant Scoped</span>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.05, rotate: -1 }}
        className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white font-jakarta font-bold text-sm flex items-center justify-between shadow-lg"
      >
        <span>🔑 Argon2id Hashing</span>
        <span className="text-xs text-amber-300 font-normal">Zero Trust</span>
      </motion.div>
    </div>
  );
}

export function MockScatteredBadgesCard() {
  return (
    <div className="w-full max-w-sm mx-auto p-4 flex flex-wrap gap-2.5 justify-center items-center">
      <motion.span
        whileHover={{ scale: 1.1, rotate: 3 }}
        className="px-4 py-2 rounded-full bg-[#8B5CF6] text-white font-jakarta font-bold text-xs shadow-md"
      >
        ✨ 96% Match
      </motion.span>
      <motion.span
        whileHover={{ scale: 1.1, rotate: -3 }}
        className="px-4 py-2 rounded-full bg-emerald-500 text-white font-jakarta font-bold text-xs shadow-md"
      >
        🌙 Night Owl
      </motion.span>
      <motion.span
        whileHover={{ scale: 1.1, rotate: 2 }}
        className="px-4 py-2 rounded-full bg-blue-500 text-white font-jakarta font-bold text-xs shadow-md"
      >
        📚 Quiet Study
      </motion.span>
      <motion.span
        whileHover={{ scale: 1.1, rotate: -2 }}
        className="px-4 py-2 rounded-full bg-amber-400 text-gray-900 font-jakarta font-bold text-xs shadow-md"
      >
        🧼 Clean &amp; Organized
      </motion.span>
    </div>
  );
}

