'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animated-counter';

type AccentColor = 'lavender' | 'periwinkle' | 'mint' | 'butter' | 'blush' | 'cornflower';

const accentMap: Record<AccentColor, { icon: string; text: string }> = {
  lavender: { icon: 'bg-[#ECE8FE] text-[#6A4FE0]', text: 'text-[#3C315B]' },
  periwinkle: { icon: 'bg-[#ECE8FE] text-[#6A4FE0]', text: 'text-[#3C315B]' },
  mint: { icon: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-700' },
  butter: { icon: 'bg-amber-50 text-amber-600', text: 'text-amber-700' },
  blush: { icon: 'bg-rose-50 text-rose-600', text: 'text-rose-700' },
  cornflower: { icon: 'bg-[#ECE8FE] text-[#6A4FE0]', text: 'text-[#6A4FE0]' },
};

interface StatCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: AccentColor;
  animate?: boolean;
  suffix?: string;
  prefix?: string;
  index?: number;
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = 'lavender',
  animate = true,
  suffix = '',
  prefix = '',
  index = 0,
  className,
}: StatCardProps) {
  const colors = accentMap[accent] ?? accentMap.lavender;
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-3xl border border-[#E5E4E8] bg-white p-5 md:p-6 shadow-sm transition-all duration-300 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] text-[#3C315B]/70 font-bold uppercase tracking-wider">{label}</p>
          <div className={cn('text-3xl font-extrabold tracking-tight', colors.text)}>
            {isNumeric && animate ? (
              <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
            ) : (
              <span>{prefix}{value}{suffix}</span>
            )}
          </div>
          {sublabel && (
            <p className="text-xs text-[#3C315B]/50 font-normal">{sublabel}</p>
          )}
        </div>
        <div className={cn('shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm', colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
