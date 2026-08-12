'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <main className="relative min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[140px]" />

      <div className="relative z-10 space-y-6 max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center mx-auto shadow-xl shadow-purple-500/25">
          <ShieldAlert className="h-8 w-8 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested route does not exist or you do not have permission to access it.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 text-white font-semibold text-xs px-8 h-11 shadow-lg shadow-purple-500/25 transition-all">
              <Home className="mr-2 h-4 w-4" /> Return to Safety
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
