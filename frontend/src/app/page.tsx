'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Logo } from '@/components/common/logo';
import { PhantomWaveCanvas } from '@/components/landing/phantom-wave-canvas';
import { HeroVisualStack } from '@/components/landing/hero-visual';
import { Marquee } from '@/components/landing/marquee';
import { Holographic3DShowcaseSection } from '@/components/landing/holographic-3d-showcase';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function RootHomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#EDEAFD] text-[#3C315B] flex flex-col justify-between p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Floating Navbar Header */}
      <header className="flex items-center justify-between w-full max-w-[1400px] mx-auto py-3 px-4">
        {/* Left: Logo */}
        <Logo size="md" href="/" />

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 bg-white border border-[#E5E4E8] rounded-full px-6 py-2 shadow-sm text-xs font-semibold text-[#3C315B]/80">
          <a href="#matching" className="hover:text-[#6A4FE0] transition-colors">
            Roommate Match
          </a>
          <a href="#marketplace" className="hover:text-[#6A4FE0] transition-colors">
            Marketplace
          </a>
          <a href="#security" className="hover:text-[#6A4FE0] transition-colors">
            Zero-Trust Security
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {isAuthenticated ? (
            <Link
              href={user?.role === 'WARDEN' || user?.role === 'SUPER_ADMIN' ? '/warden' : '/student'}
              className="px-5 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              Go to Student Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
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
                Get Started
              </button>
            </>
          )}
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
                onClick={() => router.push(isAuthenticated ? (user?.role === 'WARDEN' || user?.role === 'SUPER_ADMIN' ? '/warden' : '/student') : '/login')}
                className="bg-white hover:bg-zinc-100 text-[#0D0B18] font-bold text-sm px-8 py-3.5 rounded-full transition-transform hover:scale-105 shadow-xl inline-flex items-center justify-center gap-2"
              >
                {isAuthenticated ? 'Open Student Portal' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Live Roomify Engine Card */}
            <div className="pt-2">
              <HeroVisualStack />
            </div>
          </div>
        </div>

        {/* Continuous Infinite Horizontal Ribbon Marquee */}
        <div className="py-2">
          <p className="text-[11px] font-extrabold text-[#3C315B]/50 uppercase tracking-widest text-center mb-2">
            TRUSTED BY MODERN CAMPUS RESIDENCE HALLS &amp; STUDENT COMMUNITIES
          </p>
          <Marquee
            speed="fast"
            items={[
              'Aegis Hostel Operations',
              'PostgreSQL Row-Level Security',
              'Argon2id Authentication',
              'Symbiotic Strain Roommate Matcher',
              'Peer-to-Peer Marketplace',
              'SLA Maintenance Tracker',
              'Razorpay Merchant Checkout',
              'Emoji Cipher 2FA',
              'Passkey WebAuthn Auth',
            ]}
          />
        </div>

        {/* Full 3D Holographic Showcase Section */}
        <div id="features">
          <Holographic3DShowcaseSection />
        </div>
      </main>

      {/* Rich Full-Width Glass Footer Card */}
      <footer className="w-full max-w-[1400px] mx-auto bg-white/90 backdrop-blur-2xl border border-[#E5E4E8] rounded-[36px] p-8 md:p-10 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3 md:col-span-1">
            <Logo size="md" href="/" />
            <p className="text-[#3C315B]/70 leading-relaxed font-normal">
              Next-generation zero-trust hostel management platform. Built with Next.js, NestJS, and PostgreSQL.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#3C315B] uppercase tracking-wider text-[11px]">Student Features</h4>
            <ul className="space-y-2 text-[#3C315B]/70 font-medium">
              <li><a href="#matching" className="hover:text-[#6A4FE0] transition-colors">Symbiotic Roommate Matcher</a></li>
              <li><a href="#marketplace" className="hover:text-[#6A4FE0] transition-colors">Peer-to-Peer Marketplace</a></li>
              <li><a href="#security" className="hover:text-[#6A4FE0] transition-colors">Passkey &amp; RLS Security</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#3C315B] uppercase tracking-wider text-[11px]">Student Portals</h4>
            <ul className="space-y-2 text-[#3C315B]/70 font-medium">
              <li><Link href="/student/rooms" className="hover:text-[#6A4FE0] transition-colors">Room Allocation Hub</Link></li>
              <li><Link href="/student/match" className="hover:text-[#6A4FE0] transition-colors">Roommate Match Rankings</Link></li>
              <li><Link href="/student/marketplace" className="hover:text-[#6A4FE0] transition-colors">Campus Market</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-[#3C315B] uppercase tracking-wider text-[11px]">Security Protocol</h4>
            <div className="p-3 rounded-2xl bg-[#ECE8FE] border border-[#AB9FF2]/40 space-y-1">
              <span className="flex items-center gap-1.5 font-bold text-[#3C315B]">
                <ShieldCheck className="w-4 h-4 text-[#6A4FE0]" /> PostgreSQL RLS Active
              </span>
              <p className="text-[10px] text-[#3C315B]/70 font-normal">
                Multi-tenant row level isolation active across database sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E4E8] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3C315B]/60 gap-3 font-medium">
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
