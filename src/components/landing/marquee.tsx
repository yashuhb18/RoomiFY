'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface MarqueeProps {
  items: string[];
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export function Marquee({ items, className, speed = 'normal' }: MarqueeProps) {
  // Duplicate 4 times to guarantee smooth infinite looping seamlessly
  const quadItems = [...items, ...items, ...items, ...items];

  return (
    <div className={cn('relative w-full overflow-hidden py-3 bg-[#EDEAFD]', className)}>
      {/* Soft gradient fade on left and right edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#EDEAFD] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#EDEAFD] to-transparent z-10 pointer-events-none" />

      <div
        className={cn(
          'flex whitespace-nowrap w-max animate-marquee gap-4',
          speed === 'slow' && '[animation-duration:45s]',
          speed === 'fast' && '[animation-duration:18s]',
        )}
      >
        {quadItems.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#E5E4E8] text-xs font-bold text-[#3C315B] shadow-sm flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6A4FE0]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
