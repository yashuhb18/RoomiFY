'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animated-counter';

type AccentColor = 'lavender' | 'periwinkle' | 'mint' | 'butter' | 'blush' | 'cornflower';

const accentMap: Record<AccentColor, { icon: string; text: string }> = {
  lavender: { icon: 'bg-ghost-lavender text-aubergine', text: 'text-aubergine' },
  periwinkle: { icon: 'bg-periwinkle/20 text-aubergine', text: 'text-aubergine' },
  mint: { icon: 'bg-mint-signal/15 text-mint-signal', text: 'text-mint-signal' },
  butter: { icon: 'bg-buttercream text-obsidian', text: 'text-obsidian' },
  blush: { icon: 'bg-blush-mist text-obsidian', text: 'text-obsidian' },
  cornflower: { icon: 'bg-cornflower-pop/15 text-cornflower-pop', text: 'text-cornflower-pop' },
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
        'rounded-card border border-[#E5E0F6] bg-white p-6 md:p-8 shadow-[0_4px_20px_rgba(60,49,91,0.05)] transition-all duration-300 hover:shadow-phantom hover:-translate-y-1',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <p className="text-caption text-[#524B6B] font-light tracking-phantom uppercase">{label}</p>
          <div className={cn('text-heading font-light tracking-phantom', colors.text)}>
            {isNumeric && animate ? (
              <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
            ) : (
              <span>{prefix}{value}{suffix}</span>
            )}
          </div>
          {sublabel && (
            <p className="text-caption text-[#524B6B] font-light tracking-phantom">{sublabel}</p>
          )}
        </div>
        <div className={cn('shrink-0 h-11 w-11 rounded-pill flex items-center justify-center', colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
