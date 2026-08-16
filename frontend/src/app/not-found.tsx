'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/common/logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#EDEAFD] flex flex-col items-center justify-center p-6 text-center">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E4E8] p-8 md:p-10 shadow-[0_16px_48px_rgba(60,49,91,0.08)] space-y-6 flex flex-col items-center">
        {/* RoomiFy Logo */}
        <Logo size="lg" href="/" />

        {/* 404 Banner */}
        <div className="space-y-2 pt-2">
          <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#6A4FE0] text-xs font-extrabold tracking-wider uppercase">
            Error 404
          </span>
          <h1 className="text-5xl font-extrabold text-[#3C315B] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-[#3C315B]/70 leading-relaxed font-normal max-w-xs mx-auto">
            The requested route does not exist or you do not have permission to access it.
          </p>
        </div>

        {/* Return Button */}
        <div className="w-full pt-2">
          <Link href="/">
            <button
              type="button"
              className="w-full h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" /> Return to Safety Console
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
