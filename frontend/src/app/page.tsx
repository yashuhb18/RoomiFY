'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  Lock,
  Cpu,
  Ticket,
  Users,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/3d-card';
import { SpotlightCard } from '@/components/ui/spotlight';
import { ParticleCanvas } from '@/components/ui/particle-canvas';

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
    <main className="relative min-h-screen bg-black text-white flex flex-col justify-between p-6 md:p-12 overflow-hidden">
      {/* Interactive Particle Starfield background */}
      <ParticleCanvas />

      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-bold">
            <Shield className="h-5 w-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">ROOMIFY</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
            Zero-Trust SaaS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/login')}
            className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-5 h-9 rounded-xl transition-all"
          >
            Sign In <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto text-center space-y-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-mono"
        >
          <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" /> 3D Interactive Multi-Tenant Hostel Engine
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          Zero-Trust Security meets <br />
          <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Algorithmic Operations
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          PostgreSQL Row-Level Security (RLS), atomic `FOR UPDATE` double-booking lock prevention, predictive SLA maintenance, and 3D floorplan visualizer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto h-12 bg-white hover:bg-zinc-200 text-black font-bold text-sm px-8 rounded-xl shadow-xl transition-all hover:scale-105"
          >
            Launch Interactive Portal <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 max-w-3xl mx-auto">
          {[
            { value: '100%', label: 'RLS Data Isolation' },
            { value: '0ms', label: 'Double-Booking Risk' },
            { value: '<12h', label: 'SLA Prediction' },
            { value: '2FA / TOTP', label: 'Speakeasy Guarded' },
          ].map((m, idx) => (
            <SpotlightCard key={idx} className="p-4 text-center">
              <div className="text-xl font-bold text-white">{m.value}</div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">{m.label}</div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 3D Cards Showcase */}
      <section className="relative z-10 max-w-6xl mx-auto w-full py-10 border-t border-zinc-900">
        <div className="grid md:grid-cols-3 gap-6">
          <Card3D className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white">FOR UPDATE Lock Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Prisma transactions execute with Serializable isolation acquiring PostgreSQL row locks before booking validation.
            </p>
          </Card3D>

          <Card3D className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Ticket className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white">SLA Predictive Maintenance</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Evaluates 30-day resolution averages per category to flag breach risks and alert wardens automatically.
            </p>
          </Card3D>

          <Card3D className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white">Vector Roommate Matcher</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calculates lifestyle compatibility across active hostel residents to generate ranking scores.
            </p>
          </Card3D>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 pt-6 max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-zinc-400" />
          <span>ROOMIFY Zero-Trust SaaS &copy; 2026</span>
        </div>
        <div className="flex gap-4 font-mono text-[11px]">
          <span>NestJS 10.x</span>
          <span>Next.js 14.2</span>
          <span>Prisma 5.12</span>
          <span>Supabase RLS</span>
        </div>
      </footer>
    </main>
  );
}
