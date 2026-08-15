'use client';

import React from 'react';
import {
  ShieldCheck, Lock, Activity, UserCheck, KeyRound,
  CheckCircle2, Server, Database, Globe, Fingerprint,
} from 'lucide-react';
import { ActiveSessionsCard } from '@/components/security/ActiveSessionsCard';
import { PiiMaskedText } from '@/components/ui/pii-masked-text';

const securityPolicies = [
  {
    title: 'PostgreSQL Row-Level Security',
    description: 'Tenant-isolated data access via app.current_hostel config. Each hostel can only see its own data.',
    status: 'ENFORCED',
    statusColor: 'emerald',
    icon: Database,
    detail: 'SELECT set_config(\'app.current_hostel\', hostelId, true)',
  },
  {
    title: 'Argon2id Password Hashing',
    description: '64MB memory cost, 3 iterations, 4 parallelism. GPU-brute resistant.',
    status: '64MB COST',
    statusColor: 'purple',
    icon: Lock,
    detail: 'argon2id with memoryCost: 65536, timeCost: 3, parallelism: 4',
  },
  {
    title: 'Auth Rate Limiting',
    description: 'NestJS Throttler guards: 5 requests per minute on login/register/TOTP endpoints.',
    status: '5 REQ/MIN',
    statusColor: 'blue',
    icon: Activity,
    detail: '@Throttle({ default: { limit: 5, ttl: 60000 } })',
  },
  {
    title: 'JWT + HTTP-Only Cookies',
    description: 'Access token in memory (Zustand), refresh token in HTTP-only secure cookie. No localStorage exposure.',
    status: 'ACTIVE',
    statusColor: 'emerald',
    icon: KeyRound,
    detail: 'httpOnly: true, secure: true, sameSite: lax, maxAge: 7d',
  },
  {
    title: 'TOTP Multi-Factor Auth',
    description: 'Optional TOTP-based 2FA with speakeasy. QR code provisioning via otpauth:// URIs.',
    status: 'AVAILABLE',
    statusColor: 'amber',
    icon: Fingerprint,
    detail: 'speakeasy.totp.verify({ secret, token, window: 1 })',
  },
  {
    title: 'Role-Based Access Control',
    description: 'NestJS RolesGuard enforces STUDENT, WARDEN, STAFF, SUPER_ADMIN role boundaries at API level.',
    status: 'ENFORCED',
    statusColor: 'emerald',
    icon: ShieldCheck,
    detail: '@Roles(Role.SUPER_ADMIN) → RolesGuard → ForbiddenException',
  },
  {
    title: 'CORS Origin Whitelisting',
    description: 'Backend only accepts requests from configured frontend origins. Cross-origin requests blocked.',
    status: 'ACTIVE',
    statusColor: 'emerald',
    icon: Globe,
    detail: 'origin: [FRONTEND_URL], credentials: true',
  },
  {
    title: 'Immutable Audit Logging',
    description: 'All auth events, role changes, PII unmasks, and admin actions are permanently logged with user context.',
    status: 'ACTIVE',
    statusColor: 'emerald',
    icon: Server,
    detail: 'AuditLog model with userId, action, ipAddress, userAgent, timestamp',
  },
];

const statusBgMap: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function SecurityAuditPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-md bg-[#6A4FE0] text-white text-[10px] font-mono font-bold tracking-widest uppercase">
            Security Audit v2.4
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> All Systems Operational
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Security Policies & Compliance</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Zero-trust architecture with defense-in-depth security layers
        </p>
      </div>

      {/* Security Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityPolicies.map((policy) => {
          const Icon = policy.icon;
          return (
            <div
              key={policy.title}
              className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#6A4FE0]/10 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[#6A4FE0]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{policy.title}</h3>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBgMap[policy.statusColor]}`}>
                  {policy.status}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mb-2">{policy.description}</p>
              <code className="block text-[10px] font-mono text-[#94A3B8] bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0] break-all">
                {policy.detail}
              </code>
            </div>
          );
        })}
      </div>

      {/* Active Sessions */}
      <ActiveSessionsCard />

      {/* PII Masking Demo */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] mb-1">
            India DPDP Act 2023 & GDPR — PII Protection Demo
          </h3>
          <p className="text-xs text-[#64748B]">
            Student PII is dynamically masked. Click the eye icon to unmask — every inspection writes an immutable audit entry.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <p className="text-[11px] font-semibold text-[#64748B]">Student Phone Number</p>
            <PiiMaskedText value="+919876543210" fieldLabel="Student Contact Phone" />
          </div>
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <p className="text-[11px] font-semibold text-[#64748B]">Parent Emergency Contact</p>
            <PiiMaskedText value="+919123456789" fieldLabel="Parent Emergency Phone" />
          </div>
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <p className="text-[11px] font-semibold text-[#64748B]">National Student USN</p>
            <PiiMaskedText value="CS2024USN9876" fieldLabel="Student USN" />
          </div>
        </div>
      </div>
    </div>
  );
}
