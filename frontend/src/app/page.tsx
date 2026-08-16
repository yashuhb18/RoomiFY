'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/logo';
import { PhantomWaveCanvas } from '@/components/landing/phantom-wave-canvas';
import { HeroVisualStack } from '@/components/landing/hero-visual';
import { Marquee } from '@/components/landing/marquee';
import { Holographic3DShowcaseSection } from '@/components/landing/holographic-3d-showcase';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function RootHomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#EDEAFD] text-[#3C315B] flex flex-col justify-between p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Floating Navbar Header */}
      <header className="flex items-center justify-between w-full max-w-[1400px] mx-auto py-3 px-4">
        {/* Left: Logo */}
        <Logo size="md" href="/" />

        {/* Center Nav Links (5 Features with Original Font Weight & Subtle Color) */}
        <div className="hidden lg:flex items-center gap-6 bg-white border border-[#E5E4E8] rounded-full px-6 py-2 shadow-sm text-sm font-semibold text-[#3C315B]/80">
          <a href="#matching" className="hover:text-[#3C315B] transition-colors">
            Roommate Match
          </a>
          <a href="#allocation" className="hover:text-[#3C315B] transition-colors">
            Room Allocation
          </a>
          <a href="#marketplace" className="hover:text-[#3C315B] transition-colors">
            Marketplace
          </a>
          <a href="#maintenance" className="hover:text-[#3C315B] transition-colors">
            Maintenance SLA
          </a>
          <a href="#security" className="hover:text-[#3C315B] transition-colors">
            Zero-Trust Security
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link
            href="/login"
            className="text-[#3C315B]/80 hover:text-[#3C315B] transition-colors"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="bg-[#AB9FF2] hover:bg-[#9688EE] text-white px-5 py-2 rounded-full transition-all shadow-sm text-sm font-semibold"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Full-Width Container */}
      <main className="w-full max-w-[1400px] mx-auto space-y-6">
        {/* Main Hero Container Card with Wave Canvas */}
        <div className="relative rounded-[36px] bg-[#0D0B18] overflow-hidden pt-12 pb-16 px-6 md:px-12 text-center text-white border border-white/10 shadow-2xl">
          {/* Static colorful wave ribbons background */}
          <PhantomWaveCanvas />

          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            {/* Top Subtitle */}
            <p className="text-xs md:text-sm text-[#AB9FF2] font-medium tracking-wide">
              The zero-trust hostel app that&apos;ll take you places
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
                onClick={() => router.push('/register')}
                className="bg-white hover:bg-zinc-100 text-[#0D0B18] font-bold text-sm px-8 py-3.5 rounded-full transition-transform hover:scale-105 shadow-xl inline-flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Live Roomify Engine Card */}
            <div className="pt-2">
              <HeroVisualStack />
            </div>
          </div>
        </div>

        {/* Full 3D Holographic Showcase Section */}
        <div id="features">
          <Holographic3DShowcaseSection />
        </div>
      </main>

      {/* Sleek Light Lavender / Azure Glass Footer Card */}
      <footer className="w-full max-w-[1400px] mx-auto bg-gradient-to-br from-[#F5F2FF] via-[#FFFFFF] to-[#F0F7FF] border border-[#E0D7FF] rounded-[36px] p-8 md:p-14 text-[#3C315B] shadow-md space-y-10 relative overflow-hidden">
        {/* Soft Ambient Lavender Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] bg-[#6A4FE0]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[70%] bg-blue-400/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" variant="light" href="/" />
            <p className="text-[#3C315B]/75 leading-relaxed font-normal text-xs md:text-sm max-w-sm">
              Next-generation zero-trust student hostel management platform. Built with Next.js, NestJS, and PostgreSQL.
            </p>
          </div>

          {/* Student Features Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#1E1640] uppercase tracking-wider text-xs md:text-sm">
              Student Features
            </h4>
            <ul className="space-y-2 text-[#3C315B]/80 font-medium text-xs md:text-sm">
              <li>
                <a href="#matching" className="hover:text-[#6A4FE0] transition-colors">
                  1. Symbiotic Roommate Matcher
                </a>
              </li>
              <li>
                <a href="#allocation" className="hover:text-[#6A4FE0] transition-colors">
                  2. Concurrency Allocation Engine
                </a>
              </li>
              <li>
                <a href="#marketplace" className="hover:text-[#6A4FE0] transition-colors">
                  3. Peer-to-Peer Marketplace
                </a>
              </li>
              <li>
                <a href="#maintenance" className="hover:text-[#6A4FE0] transition-colors">
                  4. SLA Maintenance Tracker
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#6A4FE0] transition-colors">
                  5. WebAuthn Passkey Security
                </a>
              </li>
              <li>
                <a href="#matching" className="hover:text-[#6A4FE0] transition-colors">
                  6. Automated Mail Service
                </a>
              </li>
            </ul>
          </div>

          {/* Security Protocol Badge Card */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#1E1640] uppercase tracking-wider text-xs md:text-sm">
              Security Protocol
            </h4>
            <div className="p-4.5 rounded-2xl bg-[#F3F0FF] border border-[#DCD3FF] space-y-2 shadow-xs">
              <span className="flex items-center gap-2 font-extrabold text-[#1E1640] text-xs md:text-sm">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-[#6A4FE0]" /> PostgreSQL RLS Active
              </span>
              <p className="text-xs text-[#3C315B]/75 font-normal leading-relaxed">
                Multi-tenant row level isolation active across database sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="relative z-10 border-t border-[#E5E4E8] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-[#3C315B]/70 gap-4 font-medium">
          <span>RoomiFY Zero-Trust Student Hostel Platform &copy; 2026</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#6A4FE0] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#6A4FE0] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[#6A4FE0] cursor-pointer transition-colors">Security Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
