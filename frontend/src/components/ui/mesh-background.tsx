'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Phantom — flat paper-white canvas, no mesh gradients */
export function MeshBackground({ className }: { className?: string; showGrid?: boolean }) {
  return (
    <div className={cn('fixed inset-0 -z-10 bg-paper-white pointer-events-none', className)} />
  );
}
