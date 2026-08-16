'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

type SectionMode = 'light' | 'bone' | 'dark';

interface PageHeroProps {
  title: React.ReactNode;
  description?: string;
  badges?: string[];
  icon?: React.ComponentType<{ className?: string }>;
  mode?: SectionMode;
  actions?: React.ReactNode;
  className?: string;
}

const modeStyles: Record<SectionMode, string> = {
  light: 'bg-white border-[#E5E0F6] text-[#3C315B] shadow-[0_4px_20px_rgba(60,49,91,0.05)]',
  bone: 'bg-[#D7CBFE] border-[#B7A6F6] text-[#3C315B] shadow-sm',
  dark: 'bg-[#3C315B] border-[#3C315B] text-white',
};

export function PageHero({
  title,
  description,
  badges = [],
  icon: Icon,
  mode = 'bone',
  actions,
  className,
}: PageHeroProps) {
  const isDark = mode === 'dark';

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-card border p-8 md:p-12',
        modeStyles[mode],
        className,
      )}
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <Badge key={b} variant={isDark ? 'secondary' : 'default'} className="text-caption">
                  {b}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                'h-11 w-11 rounded-pill flex items-center justify-center',
                isDark ? 'bg-paper-white/10' : 'bg-ghost-lavender',
              )}>
                <Icon className={cn('h-5 w-5', isDark ? 'text-paper-white' : 'text-aubergine')} />
              </div>
            )}
            <h1 className={cn(
              'text-heading-lg font-light tracking-phantom leading-[1.1]',
              isDark ? 'text-paper-white' : 'text-aubergine',
            )}>
              {title}
            </h1>
          </div>
          {description && (
            <p className={cn(
              'text-body-sm font-normal tracking-phantom max-w-lg',
              isDark ? 'text-paper-white/80' : 'text-[#524B6B]',
            )}>
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </motion.div>
  );
}
