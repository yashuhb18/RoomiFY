'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
  bgColor?: string;
}

export function Marquee({ items, className, speed = 'normal', bgColor = '#FAF8F5' }: MarqueeProps) {
  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className={cn('relative w-full overflow-hidden py-1', className)}>
      {/* Dynamic Edge Fades matching container background */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${bgColor}, transparent)` }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${bgColor}, transparent)` }}
      />

      <div
        className={cn(
          'flex whitespace-nowrap w-max animate-marquee items-center',
          speed === 'slow' && '[animation-duration:50s]',
          speed === 'normal' && '[animation-duration:30s]',
          speed === 'fast' && '[animation-duration:20s]',
        )}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center gap-3 mx-6 shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-[#6A4FE0]/60 shrink-0" />
            <span className="text-base md:text-lg font-semibold text-[#2B231A] tracking-tight">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
