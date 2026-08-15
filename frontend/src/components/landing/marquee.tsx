'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
  className?: string;
  speed?: 'slow' | 'normal';
}

export function Marquee({ items, className, speed = 'normal' }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className={cn('overflow-hidden border-y border-ash bg-bone py-4', className)}>
      <div
        className={cn(
          'flex whitespace-nowrap w-max animate-marquee',
          speed === 'slow' && '[animation-duration:45s]',
        )}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-8 text-body-sm font-light tracking-phantom text-aubergine/70 flex items-center gap-3"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-periwinkle shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
