'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Zap, Lock, Sparkles, CheckCircle2, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  index: number;
  totalCards: number;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  bgStyle: string;
  textColor: string;
  visualComponent: React.ReactNode;
  progress: any;
}

function StackedCard({
  index,
  totalCards,
  eyebrow,
  title,
  description,
  badge,
  bgStyle,
  textColor,
  visualComponent,
  progress,
}: FeatureCardProps) {
  const cardStart = index / totalCards;
  const cardEnd = (index + 1) / totalCards;

  const scale = useTransform(
    progress,
    [cardStart, cardEnd],
    [1, 1 - (totalCards - index - 1) * 0.04]
  );

  const topOffset = 120 + index * 24;

  return (
    <motion.div
      style={{
        top: `${topOffset}px`,
        scale: index === totalCards - 1 ? 1 : scale,
      }}
      className={cn(
        'sticky rounded-[32px] p-8 md:p-12 border transition-all duration-300 shadow-[0_20px_50px_rgba(12,10,28,0.08)] mb-10',
        bgStyle,
        textColor
      )}
    >
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
            {eyebrow}
          </span>

          <h3 className="text-2xl md:text-4xl font-jakarta font-bold tracking-[-0.03em] leading-[1.08]">
            {title}
          </h3>

          <p className="text-base font-normal opacity-60 leading-relaxed max-w-xl">
            {description}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium opacity-70">{badge}</span>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          {visualComponent}
        </div>
      </div>
    </motion.div>
  );
}

export function StickyFeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={containerRef} className="relative bg-white py-24 md:py-36 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-20 text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-jakarta font-bold text-[#3C315B] tracking-[-0.03em] leading-[1.08]">
            Built for security, engineered for scale.
          </h2>
          <p className="text-base text-[#3C315B]/50 font-normal max-w-xl mx-auto">
            Scroll down to explore how Roomify isolates tenant data, predicts maintenance SLA breaches, and matches roommates.
          </p>
        </div>

        <div className="relative pb-24 space-y-6">
          {/* Card 1 — Lavender */}
          <StackedCard
            index={0}
            totalCards={3}
            progress={scrollYProgress}
            eyebrow="PostgreSQL FOR UPDATE Locking"
            title="Zero double-booking. Guaranteed."
            description="Serializable transactions lock room records before validation, ensuring 100% atomic allocations across concurrent requests."
            badge="Atomic Concurrency Control"
            bgStyle="bg-[#EAE6FF] border-[#D6CDFE]"
            textColor="text-[#3C315B]"
            visualComponent={
              <div className="w-full max-w-xs bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3C315B]/50 uppercase tracking-wider">Lock Engine</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="p-3 bg-[#3C315B]/5 rounded-2xl flex items-center justify-between text-xs font-medium">
                  <span>FOR UPDATE Lock</span>
                  <Lock className="w-4 h-4 text-[#AB9FF2]" />
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-medium">
                  <span>Room 304 Allocated</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            }
          />

          {/* Card 2 — Dark */}
          <StackedCard
            index={1}
            totalCards={3}
            progress={scrollYProgress}
            eyebrow="SLA Predictive AI Engine"
            title="Predict maintenance breaches before they happen."
            description="Machine learning calculates 30-day resolution averages to flag risk items before SLA windows expire."
            badge="Predictive Maintenance Alerts"
            bgStyle="bg-[#3C315B] border-[#AB9FF2]/20"
            textColor="text-white"
            visualComponent={
              <div className="w-full max-w-xs bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/[0.1] shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">SLA Monitor</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs font-medium text-white/60">
                    <span>HVAC Ticket #408</span>
                    <span className="text-amber-400 font-semibold">2.4h to breach</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full w-[78%]" />
                  </div>
                </div>
              </div>
            }
          />

          {/* Card 3 — Light blue */}
          <StackedCard
            index={2}
            totalCards={3}
            progress={scrollYProgress}
            eyebrow="Vector Roommate Matching"
            title="Find roommates with 95%+ lifestyle score."
            description="Algorithmic vectors align sleep preferences, study habits, and cleanliness scores to pair residents for optimal harmony."
            badge="Vector Match Algorithm"
            bgStyle="bg-[#E8F4FD] border-[#C5E2FF]"
            textColor="text-[#102A54]"
            visualComponent={
              <div className="w-full max-w-xs bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#102A54]/50">AI Vector Match</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">96%</span>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    A+
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#102A54]">Night Owl + Quiet Study</p>
                    <p className="text-[11px] text-[#102A54]/40">Perfect compatibility</p>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
