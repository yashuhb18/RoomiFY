'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket, AlertTriangle, Clock, CheckCircle2, RefreshCw,
  Search, ShieldAlert, UserCheck, ChevronDown, Filter, Building2,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#EF4444',
  ASSIGNED: '#3B82F6',
  IN_PROGRESS: '#F59E0B',
  RESOLVED: '#10B981',
};

export default function SuperAdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, usersRes] = await Promise.all([
        api.get('/admin/tickets', { params: { status: statusFilter } }),
        api.get('/admin/users', { params: { role: 'WARDEN' } }),
      ]);
      setTickets(ticketsRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      toast.error('Failed to load tickets: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdating(ticketId);
    try {
      await api.patch(`/admin/tickets/${ticketId}/status`, { status: newStatus });
      toast.success(`Ticket status updated to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update ticket status');
    } finally {
      setUpdating(null);
    }
  };

  const handleAssignStaff = async (ticketId: string, staffId: string) => {
    setUpdating(ticketId);
    try {
      await api.patch(`/admin/tickets/${ticketId}/assign`, { staffId });
      toast.success('Staff assigned to ticket');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to assign staff');
    } finally {
      setUpdating(null);
    }
  };

  const [evictionTicket, setEvictionTicket] = useState<any | null>(null);
  const [evictionReason, setEvictionReason] = useState('Disciplinary violation & physical rule breach');
  const [evicting, setEvicting] = useState(false);

  const handleEvictStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evictionTicket) return;
    setEvicting(true);
    try {
      const res = await api.post('/admin/evict-student', {
        studentId: evictionTicket.studentId,
        ticketId: evictionTicket.id,
        evictionReason: evictionReason.trim(),
      });
      toast.success(res.data.message || 'Student evicted & allocation cancelled successfully!');
      setEvictionTicket(null);
      fetchData();
    } catch (err: any) {
      toast.error('Eviction failed: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setEvicting(false);
    }
  };

  const breachRisksCount = tickets.filter(t => t.breachRisk).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#6A4FE0]" />
            Ticket SLA & Disciplinary Escalation Engine
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Predictive SLA breach detection, Warden disciplinary escalations, and 1-click student eviction
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="h-9 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] font-semibold">Total Tickets</p>
          <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{tickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm">
          <div className="flex items-center gap-1.5 text-red-600 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" /> High SLA / Rule Risks
          </div>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{breachRisksCount} high risk</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] font-semibold">Open / Unassigned</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {tickets.filter(t => t.status === 'OPEN').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] font-semibold">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {tickets.filter(t => t.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#E2E8F0] pb-3 text-xs font-semibold">
        {['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === st
                ? 'bg-[#1D2786] text-white font-bold'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-[#94A3B8] text-sm">
            No tickets found for this status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Category & Issue</th>
                  <th className="p-3.5">Hostel</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">SLA Deadline</th>
                  <th className="p-3.5">Breach Risk</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Disciplinary Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60">
                {tickets.map(ticket => {
                  const isDisciplinary = ticket.category?.toLowerCase().includes('disciplinary');

                  return (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-[#F8FAFC]/70 transition-colors text-[#1E293B] ${
                        isDisciplinary ? 'bg-red-500/5' : ticket.breachRisk ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div>
                          {isDisciplinary ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider animate-pulse">
                              DISCIPLINARY ESCALATION
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6A4FE0]/10 text-[#6A4FE0] uppercase">
                              {ticket.category}
                            </span>
                          )}
                          <p className="font-semibold text-[#0F172A] text-xs mt-1 max-w-xs">{ticket.description}</p>
                        </div>
                      </td>
                      <td className="p-3.5 text-[#475569]">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#94A3B8]" />
                          {ticket.hostel?.name || '—'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#475569]">
                        {ticket.student?.email || '—'}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                        {new Date(ticket.slaDeadline).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="p-3.5">
                        {ticket.breachRisk ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> HIGH RISK
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold">Low Risk</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ticket.assignedTo || ''}
                          onChange={(e) => handleAssignStaff(ticket.id, e.target.value)}
                          disabled={updating === ticket.id}
                          className="h-7 px-2 rounded-lg text-[10px] font-bold bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155]"
                        >
                          <option value="">Unassigned</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          disabled={updating === ticket.id}
                          className="h-7 px-2 rounded-lg text-[10px] font-bold border focus:outline-none"
                          style={{
                            color: STATUS_COLORS[ticket.status] || '#475569',
                            borderColor: (STATUS_COLORS[ticket.status] || '#CBD5E1') + '40',
                            backgroundColor: (STATUS_COLORS[ticket.status] || '#CBD5E1') + '15',
                          }}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        {ticket.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => setEvictionTicket(ticket)}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Fire & Evict Student
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold">Closed</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Eviction Confirmation Modal */}
      {evictionTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-red-200">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg border-b border-[#E2E8F0] pb-3">
              <ShieldAlert className="w-6 h-6" /> Evict Student & Cancel Allotment
            </div>

            <div className="space-y-2 text-xs text-[#334155]">
              <p className="font-semibold text-sm text-[#0F172A]">
                Are you sure you want to fire and evict student <span className="font-mono text-red-600 underline">{evictionTicket.student?.email}</span>?
              </p>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1 font-medium text-red-800">
                <p>⚠️ <strong>Atomic Eviction Actions Triggered:</strong></p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Email address permanently <strong>BLACK-LISTED</strong> from re-registering or logging in.</li>
                  <li>Student's room allocation will be <strong>CANCELLED</strong>.</li>
                  <li>Bed slot will be <strong>FREED</strong> & room occupancy decremented.</li>
                  <li>Account permanently <strong>EVICTED</strong> (<code className="font-mono bg-black/5 px-1 rounded">isEvicted = true</code>).</li>
                  <li>Disciplinary ticket will be <strong>RESOLVED</strong> & audited.</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleEvictStudent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475569]">Eviction Reason & Record</label>
                <input
                  type="text"
                  value={evictionReason}
                  onChange={(e) => setEvictionReason(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvictionTicket(null)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-[#475569] text-xs font-semibold hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={evicting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
                >
                  {evicting ? 'Evicting Student...' : 'Execute Eviction & Cancel Allotment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
