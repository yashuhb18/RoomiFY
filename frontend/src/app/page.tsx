'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Logo } from '@/components/common/logo';
import { PhantomWaveCanvas } from '@/components/landing/phantom-wave-canvas';
import { HeroVisualStack } from '@/components/landing/hero-visual';

export default function RootHomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'WARDEN' || user?.role === 'SUPER_ADMIN') {
        router.push('/warden');
      } else {
        router.push('/student');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-[#EDEAFD] text-[#3C315B] flex flex-col justify-between p-4 md:p-8">
      {/* Top Floating Navbar Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto py-3 px-4">
        {/* Left: Logo */}
        <Logo size="md" href="/" />

        {/* Center Nav Pill */}
        <div className="hidden md:flex items-center gap-6 bg-white border border-[#E5E4E8] rounded-full px-6 py-2 shadow-sm text-xs font-medium text-[#3C315B]/80">
          <button type="button" className="flex items-center gap-1 hover:text-[#3C315B] transition-colors">
            Features <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-[#3C315B] transition-colors">
            Learn <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-[#3C315B] transition-colors">
            Developers <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-[#3C315B] transition-colors">
            Support <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href="/login"
            className="text-[#3C315B]/80 hover:text-[#3C315B] transition-colors"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="bg-[#AB9FF2] hover:bg-[#9688EE] text-white px-5 py-2.5 rounded-full transition-all shadow-sm font-semibold"
          >
            Download
          </button>
        </div>
      </header>

      {/* Main Hero Container Card with Wave Canvas */}
      <main className="max-w-6xl w-full mx-auto my-4">
        <div className="relative rounded-[32px] bg-[#0D0B18] overflow-hidden pt-12 pb-16 px-6 md:px-12 text-center text-white border border-white/10 shadow-2xl">
          {/* Static colorful wave ribbons background */}
          <PhantomWaveCanvas />

          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            {/* Top Subtitle */}
            <p className="text-xs md:text-sm text-[#AB9FF2] font-medium tracking-wide">
              The hostel app that&apos;ll take you places
            </p>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white"
            >
              Your home for room allocations, roommate matching, and more
            </motion.h1>

            {/* CTA Button */}
            <div className="pt-2 pb-6">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="bg-white hover:bg-zinc-100 text-[#0D0B18] font-bold text-sm px-8 py-3.5 rounded-full transition-transform hover:scale-105 shadow-xl inline-flex items-center justify-center"
              >
                Get Started Free
              </button>
            </div>

            {/* Floating Live Roomify Engine Card */}
            <div className="pt-4">
              <HeroVisualStack />
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 text-center text-xs text-[#3C315B]/50 font-normal">
        RoomiFy Zero-Trust Hostel Platform &copy; 2026
      </footer>
    </div>
  );
}
