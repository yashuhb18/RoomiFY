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
import { ShowcaseCard, MockBookingCard, MockScatteredBadgesCard, Mock3DPillsCard } from '@/components/landing/showcase-card';
import { StickyFeaturesSection } from '@/components/landing/sticky-features';
import { ShoppingBag, ShieldCheck, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function RootHomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#EDEAFD] text-[#3C315B] flex flex-col justify-between p-4 md:p-8 space-y-12">
      {/* Top Floating Navbar Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto py-3 px-4">
        {/* Left: Logo */}
        <Logo size="md" href="/" />

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-6 bg-white border border-[#E5E4E8] rounded-full px-6 py-2 shadow-sm text-xs font-semibold text-[#3C315B]/80">
          <a href="#features" className="hover:text-[#3C315B] transition-colors">
            Features
          </a>
          <a href="#security" className="hover:text-[#3C315B] transition-colors">
            Security
          </a>
          <a href="#matching" className="hover:text-[#3C315B] transition-colors">
            Roommate Match
          </a>
          <a href="#marketplace" className="hover:text-[#3C315B] transition-colors">
            Marketplace
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {isAuthenticated ? (
            <Link
              href={user?.role === 'WARDEN' || user?.role === 'SUPER_ADMIN' ? '/warden' : '/student'}
              className="px-5 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Main Hero Container Card with Wave Canvas */}
      <main className="max-w-6xl w-full mx-auto space-y-16">
        <div className="relative rounded-[32px] bg-[#0D0B18] overflow-hidden pt-12 pb-16 px-6 md:px-12 text-center text-white border border-white/10 shadow-2xl">
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
                {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Live Roomify Engine Card */}
            <div className="pt-4">
              <HeroVisualStack />
            </div>
          </div>
        </div>

        {/* Section: Controlled by you, secured by us (Exact Screenshot Design) */}
        <section id="security" className="rounded-[36px] bg-[#3C315B] text-white py-16 px-6 md:px-12 border border-[#AB9FF2]/20 shadow-2xl space-y-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white flex items-center justify-center gap-2">
              Controlled by you, secured by us <span className="text-3xl md:text-5xl">🔮</span>
            </h2>

            <div>
              <button
                type="button"
                className="px-5 py-1.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs text-white/90 font-medium transition-all inline-flex items-center gap-1.5"
              >
                See more <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Card 1 — Self-custodial (Butter/Cream) */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-[32px] bg-[#FFFDF0] border border-[#FFEFA6]/40 p-8 md:p-10 text-[#2B2300] shadow-xl flex flex-col justify-between min-h-[260px]"
            >
              <h3 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#2B2300]">
                Self-custodial means you control your data. We never have access.
              </h3>
              <p className="text-xs md:text-sm text-[#2B2300]/60 font-normal leading-relaxed mt-6">
                PostgreSQL Row-Level Security isolates every tenant. Argon2id hashing protects credentials.
              </p>
            </motion.div>

            {/* Card 2 — TOTP 2FA (Lavender/Periwinkle) */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-[32px] bg-[#EAE6FF] border border-[#D6CDFE]/40 p-8 md:p-10 text-[#251A4A] shadow-xl flex flex-col justify-between min-h-[260px]"
            >
              <h3 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#251A4A]">
                TOTP 2FA, audit logs, and predictive SLA monitoring built in.
              </h3>
              <p className="text-xs md:text-sm text-[#251A4A]/60 font-normal leading-relaxed mt-6">
                Speakeasy-powered two-factor auth and machine learning SLA breach prediction protect every hostel.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Campus Trust Marquee */}
        <div className="space-y-4 text-center">
          <p className="text-xs font-bold text-[#3C315B]/50 uppercase tracking-wider">
            Trusted by modern campus residence halls &amp; student communities
          </p>
          <Marquee
            items={[
              'Aegis Hostel Operations',
              'PostgreSQL Row-Level Security',
              'Argon2id Authentication',
              'Vector Roommate Matcher',
              'Peer-to-Peer Marketplace',
              'SLA Maintenance Tracker',
              'Razorpay Merchant Checkout',
            ]}
          />
        </div>

        {/* Section: Core Product Feature Showcase Cards */}
        <div id="features" className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] text-xs font-extrabold tracking-wide">
              PLATFORM HIGHLIGHTS
            </span>
            <h2 className="text-3xl font-bold text-[#3C315B] tracking-tight">
              Everything your hostel campus needs
            </h2>
            <p className="text-xs text-[#3C315B]/70 font-normal">
              Designed for zero double-bookings, seamless student roommate matching, and campus marketplace trading.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ShowcaseCard
              eyebrow="Room Inventory Management"
              title="Atomic Room Allocations"
              description="PostgreSQL serializable locking ensures room requests and bed assignments never collide."
              tone="lavender"
              index={0}
            >
              <MockBookingCard />
            </ShowcaseCard>

            <ShowcaseCard
              eyebrow="AI Vector Matching"
              title="Algorithmic Roommate Finder"
              description="Vector embeddings analyze sleep cycles, study habits, and lifestyle traits to pair compatible roommates."
              tone="periwinkle"
              index={1}
            >
              <MockScatteredBadgesCard />
            </ShowcaseCard>

            <ShowcaseCard
              eyebrow="Peer Commerce"
              title="Student Peer Marketplace"
              description="Buy and sell textbooks, room furniture, and electronics with Razorpay integration."
              tone="bone"
              index={2}
            >
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] text-center text-xs font-bold text-[#3C315B] flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#6A4FE0]" /> Peer-to-Peer Hostel Commerce Active
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              eyebrow="Enterprise Security"
              title="Row-Level Security & SLA Engine"
              description="Tenant data is isolated per hostel branch with automated SLA breach alerts."
              tone="aubergine"
              index={3}
            >
              <Mock3DPillsCard />
            </ShowcaseCard>
          </div>
        </div>

        {/* Section 2: Interactive Sticky Features Scroll Section */}
        <div>
          <StickyFeaturesSection />
        </div>
      </main>

      {/* Rich Soft Lavender Footer */}
      <footer className="bg-white border-t border-[#E5E4E8] rounded-t-[32px] mt-16 pt-12 pb-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3 md:col-span-1">
            <Logo size="md" href="/" />
            <p className="text-[#3C315B]/60 leading-relaxed font-normal">
              Next-generation zero-trust hostel management platform. Built with Next.js, NestJS, and PostgreSQL.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#3C315B] uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-[#3C315B]/70">
              <li><a href="#features" className="hover:text-[#3C315B]">Room Allocations</a></li>
              <li><a href="#matching" className="hover:text-[#3C315B]">Roommate Matcher</a></li>
              <li><a href="#marketplace" className="hover:text-[#3C315B]">Peer Marketplace</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#3C315B] uppercase tracking-wider text-[11px]">Portals</h4>
            <ul className="space-y-1.5 text-[#3C315B]/70">
              <li><Link href="/student/rooms" className="hover:text-[#3C315B]">Student Portal</Link></li>
              <li><Link href="/warden/rooms" className="hover:text-[#3C315B]">Warden Portal</Link></li>
              <li><Link href="/superadmin" className="hover:text-[#3C315B]">Command Hub</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#3C315B] uppercase tracking-wider text-[11px]">Security</h4>
            <div className="p-3 rounded-2xl bg-[#EDEAFD] border border-[#E5E4E8] space-y-1">
              <span className="flex items-center gap-1.5 font-bold text-[#3C315B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6A4FE0]" /> RLS Protected
              </span>
              <p className="text-[10px] text-[#3C315B]/60">Tenant isolation active across PostgreSQL sessions.</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-[#E5E4E8] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3C315B]/50 gap-2">
          <span>RoomiFy Zero-Trust Hostel Platform &copy; 2026</span>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Security Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
