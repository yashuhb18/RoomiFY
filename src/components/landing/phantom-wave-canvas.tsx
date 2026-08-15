'use client';

import React from 'react';

/**
 * Phantom-style hero background with colorful static ribbon bands.
 * Uses pure CSS — no Framer Motion, no JS animation, no blur layers.
 * Ribbons are rendered as static SVG paths for zero GPU overhead.
 */
export function PhantomWaveCanvas() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 select-none pointer-events-none">
      {/* Static ribbon bands — pure SVG, no animation, no blur */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ willChange: 'auto' }}
      >
        {/* Purple band 1 — dominant */}
        <path
          d="M-200,120 C150,30 400,320 720,220 C1000,130 1250,380 1650,180"
          stroke="#7C3AED"
          strokeWidth="62"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Blue band */}
        <path
          d="M-150,380 C120,180 480,480 800,280 C1050,130 1320,340 1650,230"
          stroke="#3B82F6"
          strokeWidth="48"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Deep indigo band */}
        <path
          d="M-100,80 C280,280 520,30 850,330 C1100,480 1380,180 1650,340"
          stroke="#4F46E5"
          strokeWidth="44"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Gold band */}
        <path
          d="M-200,480 C80,330 430,580 750,380 C1000,230 1260,490 1650,430"
          stroke="#B68D40"
          strokeWidth="36"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Orange band */}
        <path
          d="M-150,230 C230,430 490,130 800,430 C1050,580 1310,280 1650,480"
          stroke="#E87040"
          strokeWidth="32"
          strokeLinecap="round"
          opacity="0.45"
        />
        {/* Grey band */}
        <path
          d="M-100,530 C180,380 480,680 820,480 C1050,330 1300,530 1650,380"
          stroke="#9CA3AF"
          strokeWidth="50"
          strokeLinecap="round"
          opacity="0.38"
        />
        {/* Violet overlay band */}
        <path
          d="M-200,330 C130,130 430,380 750,180 C1000,30 1260,330 1650,130"
          stroke="#A78BFA"
          strokeWidth="58"
          strokeLinecap="round"
          opacity="0.35"
        />
        {/* Dark blue deep band */}
        <path
          d="M-150,580 C180,480 430,280 750,530 C1000,680 1280,430 1650,580"
          stroke="#312E81"
          strokeWidth="40"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
