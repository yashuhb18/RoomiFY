'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

export function LogoIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm ${className}`}
    >
      <defs>
        <linearGradient id="roomifyBubbleGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B8A8FF" />
          <stop offset="100%" stopColor="#937DF9" />
        </linearGradient>
        <linearGradient id="roomifyRoofGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2E244E" />
          <stop offset="100%" stopColor="#1B1435" />
        </linearGradient>
      </defs>

      {/* Speech Bubble Container with Tail */}
      <path
        d="M 50 8 C 26.8 8 8 26.8 8 50 C 8 59.2 11 67.7 16.2 74.6 L 8 92 L 26.5 86.2 C 33.4 90.5 41.4 92 50 92 C 73.2 92 92 73.2 92 50 C 92 26.8 73.2 8 50 8 Z"
        fill="url(#roomifyBubbleGrad)"
      />

      {/* House Roof (Sleek 3D Chevron) */}
      <path
        d="M 50 26 L 24 45.5 L 29.5 49.5 L 50 34 L 70.5 49.5 L 76 45.5 L 50 26 Z"
        fill="url(#roomifyRoofGrad)"
      />

      {/* 4 Window Panes (2x2 Grid) */}
      <rect x="43" y="42" width="6" height="6" rx="1.2" fill="url(#roomifyRoofGrad)" />
      <rect x="51" y="42" width="6" height="6" rx="1.2" fill="url(#roomifyRoofGrad)" />
      <rect x="43" y="50" width="6" height="6" rx="1.2" fill="url(#roomifyRoofGrad)" />
      <rect x="51" y="50" width="6" height="6" rx="1.2" fill="url(#roomifyRoofGrad)" />

      {/* Arch Doorway */}
      <path
        d="M 41.5 76 V 64 C 41.5 59.3 45.3 55.5 50 55.5 C 54.7 55.5 58.5 59.3 58.5 64 V 76 H 41.5 Z"
        fill="url(#roomifyRoofGrad)"
      />

      {/* Door Knob */}
      <circle cx="55" cy="66" r="1.8" fill="#DCD3FF" />
    </svg>
  );
}

export function Logo({
  className = '',
  size = 'md',
  href,
  variant = 'light',
  showText = true,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 36, text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-3xl', gap: 'gap-3' },
    xl: { icon: 56, text: 'text-4xl', gap: 'gap-3.5' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDark = variant === 'dark';

  const logoContent = (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      <LogoIcon size={currentSize.icon} />
      {showText && (
        <span
          className={`font-sans font-bold ${currentSize.text} tracking-tight leading-none select-none`}
        >
          <span className={isDark ? 'text-white' : 'text-[#1E1838]'}>Roomi</span>
          <span className="text-[#9884F9]">Fy</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center hover:opacity-90 transition-opacity focus:outline-none"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
