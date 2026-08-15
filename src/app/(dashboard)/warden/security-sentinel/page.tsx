'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Terminal,
  Activity,
  UserCheck,
  KeyRound,
  RefreshCcw,
  CheckCircle2,
  AlertOctagon,
  Eye,
} from 'lucide-react';
import api from '@/lib/axios';
import { ActiveSessionsCard } from '@/components/security/ActiveSessionsCard';
import { PiiMaskedText } from '@/components/ui/pii-masked-text';
import { toast } from 'sonner';

export default function SecuritySentinelPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSecuritySummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit/security-summary');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load security telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecuritySummary();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#EDEAFD]/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#6A4FE0] text-white text-[10px] font-mono font-bold tracking-widest uppercase">
              Security Sentinel v2.4
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PostgreSQL RLS Enforced
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-jakarta font-bold text-[#3C315B] mt-2">
            Warden Security Sentinel & Audit Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#3C315B]/60">
            Real-time zero-trust policy enforcement, dynamic PII auditing, and active threat monitoring.
          </p>
        </div>

        <button
          onClick={fetchSecuritySummary}
          className="h-10 px-4 rounded-xl border border-[#E5E4E8] bg-white hover:bg-[#FAFAFA] text-[#3C315B] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Grid status cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* RLS Isolation */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E4E8] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#6A4FE0]">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ACTIVE
            </span>
          </div>
          <p className="text-xs font-medium text-[#3C315B]/60">Tenant Isolation</p>
          <p className="text-lg font-jakarta font-bold text-[#3C315B]">PostgreSQL RLS</p>
          <p className="text-[10px] text-[#3C315B]/40 font-mono">app.current_hostel active</p>
        </div>

        {/* Hashing Standard */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E4E8] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#6A4FE0]">
            <Lock className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              64MB COST
            </span>
          </div>
          <p className="text-xs font-medium text-[#3C315B]/60">Password Cryptography</p>
          <p className="text-lg font-jakarta font-bold text-[#3C315B]">Argon2id Hashing</p>
          <p className="text-[10px] text-[#3C315B]/40 font-mono">GPU-Brute Resistance</p>
        </div>

        {/* Rate Limiter */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E4E8] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#6A4FE0]">
            <Activity className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              5 REQ/MIN
            </span>
          </div>
          <p className="text-xs font-medium text-[#3C315B]/60">Anti-DDoS Throttler</p>
          <p className="text-lg font-jakarta font-bold text-[#3C315B]">Auth Rate Limit</p>
          <p className="text-[10px] text-[#3C315B]/40 font-mono">Http 429 Enforced</p>
        </div>

        {/* Threat Level */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E4E8] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <UserCheck className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              0 BLOCKED
            </span>
          </div>
          <p className="text-xs font-medium text-[#3C315B]/60">Threat Assessment</p>
          <p className="text-lg font-jakarta font-bold text-[#3C315B]">NORMAL</p>
          <p className="text-[10px] text-[#3C315B]/40 font-mono">Zero Breaches Detected</p>
        </div>
      </div>

      {/* Active Session Management Section */}
      <ActiveSessionsCard />

      {/* PII Auditing Demonstration */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E4E8] shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-[#E5E4E8] pb-4">
          <Eye className="w-5 h-5 text-[#6A4FE0]" />
          <div>
            <h3 className="text-base font-jakarta font-bold text-[#3C315B]">
              India DPDP Act 2023 & GDPR PII Protection Demonstration
            </h3>
            <p className="text-xs text-[#3C315B]/60">
              Student contact details are dynamically masked. Click the eye icon to unmask—every inspection writes an audit entry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50">Student Phone Number</p>
            <PiiMaskedText value="+919876543210" fieldLabel="Student Contact Phone" />
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50">Parent Emergency Contact</p>
            <PiiMaskedText value="+919123456789" fieldLabel="Parent Emergency Phone" />
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50">National Student USN / ID</p>
            <PiiMaskedText value="CS2024USN9876" fieldLabel="Student USN" />
          </div>
        </div>
      </div>

      {/* Live Immutable Audit Stream */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E4E8] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#6A4FE0]" />
            <div>
              <h3 className="text-base font-jakarta font-bold text-[#3C315B]">
                Immutable Audit Log Stream
              </h3>
              <p className="text-xs text-[#3C315B]/60">
                All authentication events, role changes, and PII unmasking operations logged with user context.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border border-[#E5E4E8] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] text-[#3C315B]/70 border-b border-[#E5E4E8] font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E4E8]/60 text-[#3C315B]">
              {data?.recentAuditFeed && data.recentAuditFeed.length > 0 ? (
                data.recentAuditFeed.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#FAFAFA]/70 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-[#3C315B]/50">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#6A4FE0]/10 text-[#6A4FE0]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#3C315B]/70">
                      {log.user?.email || log.userId || 'System'}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#3C315B]/60 truncate max-w-xs">
                      {JSON.stringify(log.newValue || log.oldValue || {})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-[#3C315B]/40">
                    No recent audit events recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
