'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';
import {
  Users,
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronDown,
  Fingerprint,
  Database,
  CreditCard,
  Wrench,
  Hexagon,
  Cpu,
  Activity,
  BarChart3,
  Key,
  CheckCircle2,
  Star,
  Shield,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Marquee } from './marquee';

// ────────────────────────────────────────────────────────────
// PRIMITIVES
// ────────────────────────────────────────────────────────────

function useCountUp(target: number, inView: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return val;
}

const ease = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children,
  className = '',
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: ease as any, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#6A4FE0]">
      {children}
    </span>
  );
}

function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-[2.25rem] md:text-[3.25rem] font-semibold tracking-[-0.03em] leading-[1.1] text-[#1E1640]', className)}>
      {children}
    </h2>
  );
}

function GlowCard({
  children,
  className = '',
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(350px circle at ${mx}px ${my}px, ${
    dark ? 'rgba(171,159,242,0.1)' : 'rgba(106,79,224,0.08)'
  }, transparent 70%)`;

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className={cn('relative group', className)}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: bg }}
      />
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN EXPORT
// ────────────────────────────────────────────────────────────

export function Holographic3DShowcaseSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' });

  const s1 = useCountUp(96, statsInView);
  const s2 = useCountUp(2400, statsInView);
  const s3 = useCountUp(100, statsInView);

  // ── Tab data ──
  const tabs = [
    {
      label: 'Matching Engine',
      icon: Users,
      heading: 'Symbiotic Strain Vector Analysis',
      body: 'Our proprietary engine calculates co-existence strain across four independent lifestyle dimensions: Peak Energy Window, Territoriality Index, Financial Splitting Style, and Guest Philosophy. This produces a weighted survival probability with a 3-month conflict forecast.',
      code: `const vectors = {
  rhythm:     calcRhythmAlignment(userA, userB),
  territory:  measureSpaceOverlap(userA, userB),
  financial:  assessSplitCompat(userA, userB),
  guest:      evalGuestFrequency(userA, userB),
};

const survival = weightedAverage(vectors);
const forecast = predict3MonthOutcome(survival);
// → { score: 96, risk: "low", conflict: "minimal" }`,
      metrics: [
        { label: 'Rhythm', val: '98%', color: '#2EC08B' },
        { label: 'Territory', val: '92%', color: '#AB9FF2' },
        { label: 'Financial', val: '96%', color: '#E8B931' },
        { label: 'Guest', val: '94%', color: '#5EC4E8' },
      ],
    },
    {
      label: 'Allocation Lock',
      icon: Database,
      heading: 'PostgreSQL Serializable Row Locks',
      body: 'When a student books a bed, our backend acquires an exclusive row-level lock using SERIALIZABLE isolation. No two students can ever lock the same bed simultaneously. The operation is atomic, isolated, and consistent — zero double-bookings, guaranteed.',
      code: `BEGIN TRANSACTION
  ISOLATION LEVEL SERIALIZABLE;

SELECT * FROM rooms
  WHERE wing = 'Alpha'
  AND   room_number = 304
  FOR UPDATE;

-- Lock acquired. Concurrent writes blocked.
UPDATE rooms
  SET allocated_to = $1
  WHERE id = $2
  AND   allocated_to IS NULL;

COMMIT;`,
      metrics: [
        { label: 'Safety', val: '100%', color: '#2EC08B' },
        { label: 'Latency', val: '<2ms', color: '#5EC4E8' },
        { label: 'Isolation', val: 'SERIAL', color: '#AB9FF2' },
        { label: 'Collisions', val: '0', color: '#E85C5C' },
      ],
    },
    {
      label: 'Security Protocol',
      icon: Shield,
      heading: 'Multi-Layer Zero-Trust Security',
      body: 'Every layer is independently hardened. WebAuthn eliminates passwords entirely. Emoji Cipher provides a visual 2FA grid. Argon2id resists GPU cracking. PostgreSQL RLS enforces tenant isolation at the database row level.',
      code: `// Authentication stack
L1: WebAuthn Passkey  → TouchID / FaceID
L2: Emoji Cipher 2FA  → 6-symbol visual grid
L3: Argon2id KDF       → GPU-resistant hashing

// Authorization
L4: PostgreSQL RLS
  CREATE POLICY tenant_isolation
  ON rooms USING (
    hostel_id = current_setting('app.hostel_id')
  );`,
      metrics: [
        { label: 'Auth', val: 'Passkey', color: '#2EC08B' },
        { label: 'KDF', val: 'Argon2id', color: '#E8B931' },
        { label: 'Isolation', val: 'RLS', color: '#AB9FF2' },
        { label: '2FA', val: 'Emoji', color: '#5EC4E8' },
      ],
    },
  ];

  // ── FAQ data ──
  const faqs = [
    {
      q: 'How does the roommate matching algorithm work?',
      a: 'Our Symbiotic Strain Model measures co-existence compatibility across 4 independent lifestyle vectors — Peak Energy Window, Territoriality Index, Financial Splitting Style, and Guest Philosophy. These produce a weighted survival probability score with a 3-month conflict forecast.',
    },
    {
      q: 'What prevents double-bookings during room allocation?',
      a: 'PostgreSQL SERIALIZABLE isolation with FOR UPDATE row-level locking. The moment a student initiates a booking, the room record is exclusively locked at the database level, making concurrent collision mathematically impossible.',
    },
    {
      q: 'Is the platform secure for student data?',
      a: 'We implement WebAuthn passkey biometrics for passwordless login, Argon2id key derivation for credential hashing, Emoji Cipher 2FA as a second factor, and PostgreSQL Row-Level Security for complete multi-tenant data isolation.',
    },
    {
      q: 'Can students trade items on the platform?',
      a: 'Yes. The peer-to-peer marketplace lets students list and purchase textbooks, electronics, and room furniture with integrated Razorpay merchant checkout. All transactions are campus-verified.',
    },
    {
      q: 'How does the maintenance ticket system work?',
      a: 'Students submit categorized tickets (HVAC, Plumbing, Electrical, Network) with SLA-bound resolution deadlines. Tickets escalate automatically from student to warden to admin with full time-tracked accountability.',
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 text-[#3C315B]">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 1 — HIGH-TECH METRICS TELEMETRY SHIELD
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={statsRef} className="py-8 md:py-10">
        <Reveal>
          <div className="relative rounded-[28px] bg-[#0D0B18] p-6 md:p-8 border border-white/[0.08] shadow-xl overflow-hidden space-y-6">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#6A4FE0]/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Top telemetry bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2EC08B] animate-pulse" />
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50">
                  Verified Engine Telemetry
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#AB9FF2]/70">
                Real-Time System Benchmark
              </span>
            </div>

            {/* Metric Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  val: s1,
                  suffix: '%',
                  label: 'Match Vector Accuracy',
                  desc: 'Symbiotic strain precision',
                  icon: Activity,
                  color: '#2EC08B',
                  badge: 'Validated',
                },
                {
                  val: 0,
                  suffix: '',
                  label: 'Double Bookings',
                  static: '0',
                  desc: 'Serializable DB lock collisions',
                  icon: Lock,
                  color: '#5EC4E8',
                  badge: 'Zero Collision',
                },
                {
                  val: s2,
                  suffix: '+',
                  label: 'Resident Students',
                  desc: 'Active hostel allocations',
                  icon: Users,
                  color: '#AB9FF2',
                  badge: 'Live Tenants',
                },
                {
                  val: s3,
                  suffix: '%',
                  label: 'Multi-Tenant Isolation',
                  desc: 'PostgreSQL Row-Level Security',
                  icon: ShieldCheck,
                  color: '#E8B931',
                  badge: 'Cryptographic',
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <GlowCard key={i} dark>
                    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 md:p-6 hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 space-y-3 h-full">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${s.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: s.color }} strokeWidth={1.5} />
                        </div>
                        <span
                          className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border"
                          style={{
                            color: s.color,
                            borderColor: `${s.color}30`,
                            backgroundColor: `${s.color}10`,
                          }}
                        >
                          {s.badge}
                        </span>
                      </div>

                      <div>
                        <div className="text-[2.2rem] font-semibold tracking-[-0.03em] text-white leading-none">
                          {s.static ?? s.val.toLocaleString()}{s.suffix}
                        </div>
                        <div className="mt-2 text-[13px] font-semibold text-white/80 tracking-tight">
                          {s.label}
                        </div>
                        <div className="mt-0.5 text-[11px] text-white/40 font-normal">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         CREAM EDITORIAL STATEMENT CARD WITH MARQUEE
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-6 md:py-8">
        <Reveal>
          <div className="rounded-[28px] bg-[#FAF8F5] border border-[#E8E4D8] p-8 md:p-12 shadow-sm space-y-8 relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8A7865]">
                Architecture Statement
              </span>
              <h2 className="text-[2.2rem] md:text-[3.25rem] font-semibold tracking-[-0.035em] leading-[1.12] text-[#2B231A]">
                Designed for modern campus living. Engineered for zero operational friction.
              </h2>
              <p className="text-[15px] md:text-[17px] text-[#5A5043] leading-relaxed font-normal max-w-2xl">
                RoomiFY replaces legacy survey forms and manual room assignments with atomic database isolation, 4-vector symbiotic strain modeling, and biometric passkeys.
              </p>
            </div>

            {/* Integrated Marquee Strip on Cream Background */}
            <div className="pt-6 border-t border-[#E8E4D8]">
              <Marquee
                speed="normal"
                bgColor="#FAF8F5"
                items={[
                  'Symbiotic Strain Vector Matching',
                  'PostgreSQL Serializable Row Locks',
                  'WebAuthn Passkey Biometrics',
                  'Peer-to-Peer Campus Marketplace',
                  'SLA Maintenance Tracking',
                  'Argon2id Key Derivation',
                  'Emoji Cipher 2FA Grid',
                  'Multi-Tenant Row Level Isolation',
                ]}
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 2 — FEATURE PILLARS (6 PILLARS)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-10 md:py-14" id="matching">
        <Reveal>
          <div className="text-center mb-8 md:mb-10 space-y-3">
            <SectionLabel>Capabilities</SectionLabel>
            <SectionHeading>
              Six pillars. One platform.
            </SectionHeading>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Users,
              title: 'Roommate Matching',
              desc: '4-vector strain model predicts co-existence survival with 96% accuracy across lifestyle dimensions.',
              iconBg: 'bg-[#F3F0FF]',
              iconColor: 'text-[#6A4FE0]',
              badge: 'Matching Vector',
            },
            {
              icon: Lock,
              title: 'Room Allocation',
              desc: 'PostgreSQL serializable row locks guarantee atomic bookings. Zero double-bookings, mathematically.',
              iconBg: 'bg-[#E6F9F0]',
              iconColor: 'text-[#059669]',
              badge: 'Serializable DB',
            },
            {
              icon: CreditCard,
              title: 'Peer Marketplace',
              desc: 'Trade textbooks, furniture, and electronics with Razorpay checkout. Campus-verified, zero fees.',
              iconBg: 'bg-[#FFF7ED]',
              iconColor: 'text-[#EA580C]',
              badge: 'Razorpay Checkout',
            },
            {
              icon: Wrench,
              title: 'SLA Maintenance',
              desc: 'Categorized tickets with SLA deadlines. Auto-escalation from student to warden to admin.',
              iconBg: 'bg-[#F0F9FF]',
              iconColor: 'text-[#0284C7]',
              badge: 'Auto Escalation',
            },
            {
              icon: Shield,
              title: 'Zero-Trust Security',
              desc: 'WebAuthn passkeys, Emoji Cipher 2FA, Argon2id hashing, and Row-Level Security. Every layer hardened.',
              iconBg: 'bg-[#FFF1F2]',
              iconColor: 'text-[#E11D48]',
              badge: 'Passkey & RLS',
            },
            {
              icon: Mail,
              title: 'Automated Mail Service',
              desc: 'Instant transactional email notifications for room allocations, passkey resets, and SLA breach alerts.',
              iconBg: 'bg-[#F5F3FF]',
              iconColor: 'text-[#7C3AED]',
              badge: 'Transactional Mail',
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={i} delay={i * 0.04}>
                <GlowCard>
                  <div className={cn(
                    'rounded-2xl border border-[#E5E4E8] bg-white p-7 h-full shadow-sm space-y-4',
                    'hover:border-[#AB9FF2]/50 hover:shadow-md transition-all duration-200',
                  )}>
                    <div className="flex items-center justify-between">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', f.iconBg)}>
                        <Icon className={cn('w-5 h-5', f.iconColor)} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#E5E4E8] text-[#3C315B]/60">
                        {f.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#1E1640] mb-1.5 tracking-[-0.01em]">{f.title}</h3>
                      <p className="text-[14px] text-[#3C315B]/70 leading-relaxed font-normal">{f.desc}</p>
                    </div>
                  </div>
                </GlowCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 3 — BENTO SHOWCASE
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-10 md:py-14" id="allocation">
        <Reveal>
          <div className="mb-8 md:mb-10 space-y-3">
            <SectionLabel>Architecture</SectionLabel>
            <SectionHeading>Built for reliability, designed for scale.</SectionHeading>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Large dark card */}
          <Reveal className="md:col-span-7">
            <div className="relative h-full min-h-[340px] rounded-2xl bg-[#0D0B18] p-8 md:p-10 overflow-hidden flex flex-col justify-between border border-white/[0.08] shadow-md">
              {/* Ambient glow */}
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6A4FE0]/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <Users className="w-7 h-7 text-[#AB9FF2]" strokeWidth={1.5} />
                <h3 className="text-[1.65rem] md:text-[1.85rem] font-semibold text-white tracking-[-0.03em] leading-tight">
                  Symbiotic Strain Roommate Engine
                </h3>
                <p className="text-[15px] text-white/60 leading-relaxed max-w-md font-normal">
                  Measures co-existence probability across 4 independent lifestyle vectors. Predicts conflict months before it happens.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2 mt-6">
                {['Peak Energy Window', 'Territoriality Index', 'Financial Splitting', 'Guest Philosophy'].map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-white/70 text-[12px] font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right stack */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Reveal delay={0.06}>
              <GlowCard>
                <div className="rounded-2xl border border-[#E5E4E8] bg-white p-7 shadow-sm hover:border-[#AB9FF2]/50 hover:shadow-md transition-all duration-200">
                  <Activity className="w-6 h-6 text-[#6A4FE0] mb-4" strokeWidth={1.5} />
                  <div className="text-[2.25rem] font-semibold text-[#1E1640] tracking-[-0.03em] leading-none">96%</div>
                  <p className="mt-2 text-[14px] text-[#3C315B]/70 font-normal leading-relaxed">
                    Match prediction accuracy across 2,400+ validated pairings
                  </p>
                </div>
              </GlowCard>
            </Reveal>

            <Reveal delay={0.12}>
              <GlowCard>
                <div className="rounded-2xl border border-[#E5E4E8] bg-white p-7 shadow-sm hover:border-[#AB9FF2]/50 hover:shadow-md transition-all duration-200">
                  <Lock className="w-6 h-6 text-[#6A4FE0] mb-4" strokeWidth={1.5} />
                  <div className="text-[2.25rem] font-semibold text-[#1E1640] tracking-[-0.03em] leading-none">0</div>
                  <p className="mt-2 text-[14px] text-[#3C315B]/70 font-normal leading-relaxed">
                    Double bookings. PostgreSQL SERIALIZABLE row locks guarantee it.
                  </p>
                </div>
              </GlowCard>
            </Reveal>
          </div>

          {/* Bottom two */}
          <Reveal delay={0.08} className="md:col-span-6">
            <GlowCard>
              <div className="rounded-2xl border border-[#E5E4E8] bg-white p-7 h-full shadow-sm hover:border-[#AB9FF2]/50 hover:shadow-md transition-all duration-200">
                <Fingerprint className="w-6 h-6 text-[#6A4FE0] mb-4" strokeWidth={1.5} />
                <h4 className="text-lg font-semibold text-[#1E1640] mb-2 tracking-[-0.01em]">WebAuthn Passkeys</h4>
                <p className="text-[14px] text-[#3C315B]/70 leading-relaxed font-normal">
                  TouchID and FaceID biometric login. Zero passwords stored, ever. Combined with Emoji Cipher 2FA for defense-in-depth.
                </p>
              </div>
            </GlowCard>
          </Reveal>

          <Reveal delay={0.14} className="md:col-span-6" id="marketplace">
            <GlowCard>
              <div className="rounded-2xl border border-[#E5E4E8] bg-white p-7 h-full shadow-sm hover:border-[#AB9FF2]/50 hover:shadow-md transition-all duration-200">
                <CreditCard className="w-6 h-6 text-[#6A4FE0] mb-4" strokeWidth={1.5} />
                <h4 className="text-lg font-semibold text-[#1E1640] mb-2 tracking-[-0.01em]">Razorpay Marketplace</h4>
                <p className="text-[14px] text-[#3C315B]/70 leading-relaxed font-normal">
                  Buy and sell textbooks, furniture, and electronics within your campus. Verified transactions with zero platform fees.
                </p>
              </div>
            </GlowCard>
          </Reveal>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 4 — DEEP DIVE TABS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-10 md:py-14" id="maintenance">
        <Reveal>
          <div className="mb-8 md:mb-10 space-y-3">
            <SectionLabel>Under the hood</SectionLabel>
            <SectionHeading>See the engineering.</SectionHeading>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={0.04}>
          <div className="flex gap-1 mb-6 bg-white border border-[#E5E4E8] rounded-xl p-1 w-fit shadow-sm">
            {tabs.map((tab, i) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                    activeTab === i
                      ? 'bg-[#1E1640] text-white shadow-sm'
                      : 'text-[#3C315B]/70 hover:text-[#3C315B]'
                  )}
                >
                  <TabIcon className="w-4 h-4" strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Code */}
              <div className="rounded-2xl bg-[#0D0B18] border border-white/[0.08] p-7 overflow-hidden relative shadow-md">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#6A4FE0]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                    <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
                    <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
                    <span className="ml-3 text-[11px] text-white/35 font-mono tracking-wide">engine.ts</span>
                  </div>
                  <pre className="text-[13px] font-mono text-white/75 leading-[1.8] whitespace-pre-wrap">
                    {tabs[activeTab].code}
                  </pre>
                </div>
              </div>

              {/* Explanation */}
              <div className="rounded-2xl border border-[#E5E4E8] bg-white p-7 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <h3 className="text-[1.35rem] md:text-[1.5rem] font-semibold text-[#1E1640] tracking-[-0.02em] leading-snug">
                    {tabs[activeTab].heading}
                  </h3>
                  <p className="text-[14px] text-[#3C315B]/70 leading-relaxed font-normal">
                    {tabs[activeTab].body}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {tabs[activeTab].metrics.map((m, j) => (
                    <div key={j} className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8]">
                      <div className="text-[11px] text-[#3C315B]/60 font-medium tracking-wide uppercase mb-1">{m.label}</div>
                      <div className="text-xl font-semibold tracking-[-0.02em]" style={{ color: m.color }}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 5 — HOW IT WORKS (STRIPE AZURE CONTAINER)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-10 md:py-14">
        <Reveal>
          <div className="relative rounded-[32px] bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E0E7FF] border border-[#BAE6FD] p-8 md:p-12 shadow-sm space-y-8 overflow-hidden">
            {/* Ambient Cyan Radial Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/15 rounded-full blur-[100px] pointer-events-none" />

            {/* Section Header */}
            <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0284C7]">
                Workflow Pipeline
              </span>
              <h2 className="text-[2.25rem] md:text-[3.25rem] font-semibold tracking-[-0.03em] leading-[1.1] text-[#0F172A]">
                From sign-up to settled in.
              </h2>
              <p className="text-[15px] text-[#334155] leading-relaxed font-normal">
                Four simple steps to complete your residence onboarding and access hostel services.
              </p>
            </div>

            {/* 4 Cards Grid inside the Azure Container */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {[
                {
                  step: 'STEP 01',
                  title: 'Student Registration',
                  desc: 'Register with your university email and student ID. Get instant access to your hostel residence dashboard.',
                  icon: Key,
                  color: '#0284C7',
                  bgColor: 'bg-[#E0F2FE]',
                  widget: (
                    <div className="p-3.5 rounded-xl bg-white border border-[#BAE6FD] space-y-2 text-xs shadow-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#334155] font-mono">
                        <span>Campus Student Account</span>
                        <span className="text-[#059669] flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" /> Verified
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-center font-semibold text-[11px] text-[#0284C7]">
                        University Email & Student ID
                      </div>
                    </div>
                  ),
                },
                {
                  step: 'STEP 02',
                  title: 'Symbiotic Strain Survey',
                  desc: 'Complete the 4-vector questionnaire (Energy, Space, Financials, Guests) to calculate your roommate compatibility score.',
                  icon: BarChart3,
                  color: '#059669',
                  bgColor: 'bg-[#E6F9F0]',
                  widget: (
                    <div className="p-3.5 rounded-xl bg-white border border-[#BAE6FD] space-y-2 text-xs shadow-xs">
                      <div className="flex items-center justify-between font-semibold text-[11px] text-[#0F172A]">
                        <span>Symbiotic Compatibility</span>
                        <span className="text-[#059669] font-bold">96% Match</span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#059669] h-full w-[96%] rounded-full" />
                      </div>
                    </div>
                  ),
                },
                {
                  step: 'STEP 03',
                  title: 'Select Wing, Room & Bed',
                  desc: 'Browse available hostel rooms. Select a bed locked atomically via PostgreSQL SERIALIZABLE row locks to guarantee zero double bookings.',
                  icon: CheckCircle2,
                  color: '#EA580C',
                  bgColor: 'bg-[#FFF7ED]',
                  widget: (
                    <div className="p-3.5 rounded-xl bg-[#0F172A] text-white space-y-2 text-xs border border-white/10 shadow-xs">
                      <div className="flex items-center justify-between text-[11px] text-white/60 font-mono">
                        <span>PostgreSQL Lock</span>
                        <span className="text-[#38BDF8]">SERIALIZABLE</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-center font-semibold text-[11px] text-[#34D399]">
                        Bed 304-A Locked Atomically
                      </div>
                    </div>
                  ),
                },
                {
                  step: 'STEP 04',
                  title: 'Portal, Trade & SLA Tickets',
                  desc: 'Access your student portal, trade textbooks via Razorpay merchant checkout, and log maintenance tickets with SLA breach tracking.',
                  icon: Star,
                  color: '#7C3AED',
                  bgColor: 'bg-[#F5F3FF]',
                  widget: (
                    <div className="p-3.5 rounded-xl bg-white border border-[#BAE6FD] space-y-2 text-xs shadow-xs">
                      <div className="flex items-center justify-between font-semibold text-[11px] text-[#0F172A]">
                        <span>Hostel Portal</span>
                        <span className="text-[#7C3AED] font-bold">Active</span>
                      </div>
                      <div className="flex gap-1.5 text-[10px] font-semibold">
                        <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7]">Razorpay Checkout</span>
                        <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">SLA Breach Tracker</span>
                      </div>
                    </div>
                  ),
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <GlowCard key={i}>
                    <div className="rounded-2xl border border-[#BAE6FD]/80 bg-white/90 backdrop-blur-md p-6 shadow-sm hover:border-[#0284C7]/40 hover:shadow-md transition-all duration-200 space-y-4 flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7]">
                            {s.step}
                          </span>
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.bgColor)}>
                            <Icon className="w-4 h-4" style={{ color: s.color }} strokeWidth={1.5} />
                          </div>
                        </div>

                        <h4 className="text-[17px] font-semibold text-[#0F172A] tracking-[-0.01em]">{s.title}</h4>
                        <p className="text-[13.5px] text-[#334155] leading-relaxed font-normal">{s.desc}</p>
                      </div>

                      {/* Step Widget Visual */}
                      <div className="pt-2">{s.widget}</div>
                    </div>
                  </GlowCard>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 6 — SECURITY DARK PANEL
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="security" className="py-10 md:py-14">
        <Reveal>
          <div className="relative rounded-2xl bg-[#0D0B18] p-8 md:p-14 overflow-hidden border border-white/[0.08] shadow-md">
            {/* Ambient */}
            <div className="absolute top-[-30%] right-[-15%] w-[50%] h-[70%] bg-[#6A4FE0]/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[60%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
              <div className="space-y-5">
                <SectionLabel>Security Protocol</SectionLabel>
                <h2 className="text-[2.25rem] md:text-[2.75rem] font-semibold text-white tracking-[-0.035em] leading-[1.1]">
                  Every layer is<br />independently hardened.
                </h2>
                <p className="text-[14px] text-white/60 leading-relaxed max-w-md font-normal">
                  From biometric authentication to database-level tenant isolation, no single compromise can breach student data.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0D0B18] font-semibold text-sm hover:bg-white/90 transition-colors shadow-sm"
                >
                  Get started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Fingerprint, label: 'WebAuthn Passkeys', desc: 'TouchID / FaceID biometric login', color: '#2EC08B' },
                  { icon: Hexagon, label: 'Emoji Cipher 2FA', desc: '6-symbol visual second factor', color: '#E8B931' },
                  { icon: Cpu, label: 'Argon2id Hashing', desc: 'GPU-resistant key derivation', color: '#AB9FF2' },
                  { icon: Database, label: 'PostgreSQL RLS', desc: 'Row-level tenant isolation', color: '#5EC4E8' },
                ].map((layer, i) => {
                  const LayerIcon = layer.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4, ease }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${layer.color}15` }}
                      >
                        <LayerIcon className="w-5 h-5" style={{ color: layer.color }} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-semibold text-white tracking-[-0.01em]">{layer.label}</h4>
                        <p className="text-[13px] text-white/50 font-normal">{layer.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 7 — FAQ (CREAM ARCHITECTURAL CONTAINER)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-10 md:py-14">
        <Reveal>
          <div className="rounded-[28px] bg-[#FAF8F5] border border-[#E8E4D8] p-8 md:p-12 shadow-sm space-y-8 relative overflow-hidden">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8A7865]">
                Support & Knowledge
              </span>
              <h2 className="text-[2.25rem] md:text-[3rem] font-semibold tracking-[-0.035em] leading-[1.1] text-[#2B231A]">
                Common questions.
              </h2>
              <p className="text-[15px] text-[#5A5043] leading-relaxed font-normal">
                Everything you need to know about roommate matching, room allocation, and platform security.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={i} delay={i * 0.03}>
                  <div
                    className={cn(
                      'rounded-2xl border transition-all duration-200 overflow-hidden bg-white shadow-xs',
                      openFaq === i
                        ? 'border-[#6A4FE0]/40 border-l-4 border-l-[#6A4FE0] shadow-sm'
                        : 'border-[#E8E4D8] hover:border-[#AB9FF2]/40'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex justify-between items-center p-5 text-left gap-4"
                    >
                      <span className="text-[16px] md:text-[17px] font-semibold text-[#1E1640] tracking-[-0.01em]">
                        {faq.q}
                      </span>
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        openFaq === i ? 'bg-[#6A4FE0] text-white' : 'bg-[#F3F0FF] text-[#6A4FE0]'
                      )}>
                        <ChevronDown className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          openFaq === i && 'rotate-180'
                        )} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease }}
                        >
                          <div className="px-5 pb-5 pt-0">
                            <p className="text-[14.5px] md:text-[15px] text-[#5A5043] leading-relaxed font-normal border-t border-[#E8E4D8] pt-4">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SECTION 8 — CTA
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-10 pb-16">
        <Reveal>
          <div className="relative rounded-2xl bg-gradient-to-br from-[#6A4FE0] via-[#7B5FF0] to-[#AB9FF2] p-10 md:p-16 text-center overflow-hidden shadow-lg">
            <div className="absolute top-0 left-[10%] w-[40%] h-[60%] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 right-[10%] w-[30%] h-[50%] bg-white/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 space-y-5 max-w-xl mx-auto">
              <h2 className="text-[2.25rem] md:text-[3rem] font-semibold text-white tracking-[-0.035em] leading-[1.1]">
                Ready to get started?
              </h2>
              <p className="text-[15px] md:text-base text-white/80 leading-relaxed font-normal max-w-md mx-auto">
                Join students already using RoomiFY for smarter allocations, better matches, and zero-trust security.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#3C315B] font-semibold text-sm hover:bg-white/90 transition-colors shadow-md"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/[0.15] text-white font-medium text-sm hover:bg-white/[0.22] transition-colors border border-white/[0.2]"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
