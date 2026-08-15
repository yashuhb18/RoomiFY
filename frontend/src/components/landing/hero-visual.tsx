'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Users, Activity } from 'lucide-react';
import { LogoIcon } from '@/components/common/logo';

export function HeroVisualStack() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Clean frosted glass card on dark hero */}
      <div className="rounded-[28px] bg-white/[0.07] backdrop-blur-md border border-white/[0.12] p-7 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-left">

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <LogoIcon size={40} />
            <div>
              <h3 className="text-base font-bold text-white/90 tracking-tight">RoomiFy Engine</h3>
              <p className="text-[11px] text-white/40 font-normal mt-0.5">
                Zero-Trust SaaS Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1]">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400/90 font-medium">Live</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {[
            {
              icon: CheckCircle2,
              iconColor: 'text-emerald-400',
              title: 'Room Allocation',
              desc: 'FOR UPDATE atomic locks prevent double-booking across all hostels.',
              stat: 'Real-time',
            },
            {
              icon: Users,
              iconColor: 'text-[#AB9FF2]',
              title: 'Roommate AI',
              desc: 'Vector compatibility scores match residents by lifestyle preferences.',
              stat: '96% Match',
            },
            {
              icon: ShieldCheck,
              iconColor: 'text-amber-300',
              title: 'SLA Monitor',
              desc: 'Predictive maintenance flags breach risks before SLA windows expire.',
              stat: 'Active',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white/[0.05] border border-white/[0.08] p-5 space-y-3 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex items-center justify-between">
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                  {card.stat}
                </span>
              </div>
              <p className="text-sm font-semibold text-white/85">{card.title}</p>
              <p className="text-xs text-white/40 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
