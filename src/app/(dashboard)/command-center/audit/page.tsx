'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, RefreshCw, Search, Filter, Clock,
  User, Activity, Shield,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: '#10B981',
  USER_REGISTERED: '#3B82F6',
  USER_ROLE_UPDATED: '#F59E0B',
  USER_ACTIVATED: '#10B981',
  USER_SUSPENDED: '#EF4444',
  HOSTEL_BRANCH_CREATED: '#6A4FE0',
  PII_UNMASK: '#F59E0B',
  SESSION_REVOKED: '#EF4444',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/metrics');
      setLogs(res.data?.recentAuditLogs || []);
    } catch (err: any) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Extract unique action types for filtering
  const actionTypes = ['ALL', ...Array.from(new Set(logs.map((l: any) => l.action)))];

  const filteredLogs = actionFilter === 'ALL'
    ? logs
    : logs.filter((l: any) => l.action === actionFilter);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#6A4FE0]" />
            Immutable Audit Log
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Complete chronological record of all system events — logins, role changes, PII access, and admin actions
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="h-9 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Action Type Filters */}
      <div className="flex flex-wrap gap-2">
        {actionTypes.map((action) => (
          <button
            key={action}
            onClick={() => setActionFilter(action)}
            className={`h-8 px-3 rounded-xl text-[10px] font-bold transition-all border ${
              actionFilter === action
                ? 'bg-[#1D2786] text-white border-[#1D2786]'
                : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {action === 'ALL' ? 'All Events' : action}
          </button>
        ))}
      </div>

      {/* Count Badge */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-lg bg-[#6A4FE0]/10 text-[#6A4FE0] text-xs font-bold">
          {filteredLogs.length} events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
            <p className="text-sm text-[#64748B]">No audit events recorded yet.</p>
            <p className="text-xs text-[#94A3B8] mt-1">Events will appear as users interact with the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Timestamp</span>
                  </th>
                  <th className="p-3.5">
                    <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Action</span>
                  </th>
                  <th className="p-3.5">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> User</span>
                  </th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60">
                {filteredLogs.map((log: any, i: number) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-[#F8FAFC]/70 transition-colors text-[#1E293B]"
                  >
                    <td className="p-3.5 font-mono text-[11px] text-[#94A3B8] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </td>
                    <td className="p-3.5">
                      <span
                        className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border"
                        style={{
                          color: ACTION_COLORS[log.action] || '#6A4FE0',
                          backgroundColor: (ACTION_COLORS[log.action] || '#6A4FE0') + '15',
                          borderColor: (ACTION_COLORS[log.action] || '#6A4FE0') + '30',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] text-[#475569]">
                        {log.user?.email || 'System'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#94A3B8]">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-[#94A3B8] max-w-[250px] truncate">
                      {log.newValue ? JSON.stringify(log.newValue) : log.oldValue ? JSON.stringify(log.oldValue) : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
