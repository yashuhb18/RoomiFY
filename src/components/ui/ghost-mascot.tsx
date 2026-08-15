'use client';

import React from 'react';
import { LogoIcon } from '@/components/common/logo';

interface GhostMascotProps {
  className?: string;
  size?: number;
}

export function GhostMascot({ className = '', size = 32 }: GhostMascotProps) {
  return <LogoIcon size={size} className={className} />;
}

export function GhostHeadline({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <GhostMascot size={32} />
      <span className="font-sans font-bold text-xl tracking-tight text-[#1E1838]">
        {text}
      </span>
    </div>
  );
}
