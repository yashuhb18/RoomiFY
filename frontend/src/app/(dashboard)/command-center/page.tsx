'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, Building2, BedDouble, CreditCard, Ticket,
  TrendingUp, TrendingDown, Activity, Clock, AlertTriangle,
  CheckCircle2, RefreshCw, IndianRupee,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function CommandHubOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<'activity' | 'revenue'>('activity');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/metrics');
      setData(res.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired. Please re-authenticate.');
      } else {
        toast.error('Failed to load metrics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const s = data?.summary;

  const kpiCards = [
    {
      title: 'Total Students',
      value: s?.studentsCount ?? 0,
      subtitle: `of ${s?.totalUsers ?? 0} total users`,
      icon: Users,
      color: '#6A4FE0',
      bgColor: '#6A4FE0/10',
    },
    {
      title: 'Total Rooms',
      value: s?.totalRooms ?? 0,
      subtitle: `${s?.occupancyRate ?? 0}% occupancy rate`,
      icon: BedDouble,
      color: '#10B981',
      bgColor: '#10B981/10',
    },
    {
      title: 'Active Allocations',
      value: s?.activeAllocations ?? 0,
      subtitle: `${s?.totalOccupied ?? 0} of ${s?.totalCapacity ?? 0} beds filled`,
      icon: Building2,
      color: '#3B82F6',
      bgColor: '#3B82F6/10',
    },
    {
      title: 'Total Revenue',
      value: `₹${(s?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      subtitle: `₹${(s?.pendingRevenue ?? 0).toLocaleString('en-IN')} pending`,
      icon: IndianRupee,
      color: '#F59E0B',
      bgColor: '#F59E0B/10',
    },
  ];

  const bookingCards = [
    { title: 'Total Bookings', value: s?.totalBookings ?? 0, icon: Activity, color: '#6366F1' },
    { title: 'Confirmed', value: s?.confirmedBookings ?? 0, icon: CheckCircle2, color: '#10B981' },
    { title: 'Pending', value: s?.pendingBookings ?? 0, icon: Clock, color: '#F59E0B' },
    { title: 'Cancelled', value: s?.cancelledBookings ?? 0, icon: TrendingDown, color: '#EF4444' },
  ];

  const ticketCards = [
    { title: 'Open Tickets', value: s?.openTickets ?? 0, color: '#EF4444' },
    { title: 'Resolved', value: s?.resolvedTickets ?? 0, color: '#10B981' },
    { title: 'SLA Breach Risk', value: s?.breachTickets ?? 0, color: '#F59E0B' },
  ];

  const DONUT_COLORS = ['#6A4FE0', '#AB9FF2', '#3C315B', '#F59E0B'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Dashboard Overview</h2>
          <p className="text-xs text-[#64748B] mt-1">Real-time platform metrics from your PostgreSQL database</p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="h-9 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#64748B]">{card.title}</p>
                      <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{card.value}</p>
                      <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">{card.subtitle}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Booking Status Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {bookingCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#0F172A]">{card.value}</p>
                    <p className="text-[11px] text-[#64748B] font-medium">{card.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row: Interactive Activity / Revenue Chart + Role Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Timeline Chart Card */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    {chartTab === 'activity' ? 'Student Registration & Login Activity' : 'Revenue Timeline'}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8]">
                    {chartTab === 'activity' ? 'Real student onboarding & session activity over time' : 'Monthly fee collections from PostgreSQL database'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] text-xs font-semibold">
                  <button
                    onClick={() => setChartTab('activity')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      chartTab === 'activity'
                        ? 'bg-[#1D2786] text-white shadow-sm font-bold'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Student Activity
                  </button>
                  <button
                    onClick={() => setChartTab('revenue')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      chartTab === 'revenue'
                        ? 'bg-[#1D2786] text-white shadow-sm font-bold'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Revenue
                  </button>
                </div>
              </div>

              <div className="h-56 w-full">
                {chartTab === 'activity' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.userActivityTimeline || []}>
                      <defs>
                        <linearGradient id="registrationsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6A4FE0" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#6A4FE0" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="loginsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Area type="natural" dataKey="registrations" name="Registrations" stroke="#6A4FE0" strokeWidth={2.5} fill="url(#registrationsGrad)" dot={{ r: 4, fill: '#6A4FE0' }} />
                      <Area type="natural" dataKey="logins" name="Student Logins" stroke="#10B981" strokeWidth={2.5} fill="url(#loginsGrad)" dot={{ r: 4, fill: '#10B981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.revenueTimeline || []}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6A4FE0" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#6A4FE0" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Area type="natural" dataKey="revenue" name="Room Fee Collection (₹)" stroke="#6A4FE0" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ r: 4, fill: '#6A4FE0' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Role Distribution Donut */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">User Role Distribution</h3>
              <p className="text-[11px] text-[#94A3B8] mb-4">Real breakdown from database</p>
              <div className="h-44 w-full">
                {data?.roleDistribution && data.roleDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {data.roleDistribution.map((entry: any, idx: number) => (
                          <Cell key={idx} fill={entry.color || DONUT_COLORS[idx % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[#94A3B8]">
                    No users registered yet.
                  </div>
                )}
              </div>
              {/* Legend */}
              <div className="space-y-2 pt-2">
                {data?.roleDistribution?.map((role: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: role.color || DONUT_COLORS[idx] }} />
                      {role.name}
                    </span>
                    <span className="font-bold font-mono">{role.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Occupancy + Ticket Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Branch Occupancy Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Hostel Branch Occupancy</h3>
                  <p className="text-[11px] text-[#94A3B8]">Capacity vs occupied per hostel branch</p>
                </div>
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="h-52 w-full">
                {data?.branchStats && data.branchStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.branchStats} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Bar dataKey="capacity" fill="#CBD5E1" radius={[6, 6, 0, 0]} name="Capacity" />
                      <Bar dataKey="occupied" fill="#6A4FE0" radius={[6, 6, 0, 0]} name="Occupied" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[#94A3B8]">
                    No hostel branches configured yet.
                  </div>
                )}
              </div>
            </div>

            {/* Ticket SLA & Today's Stats */}
            <div className="space-y-4">
              {/* Ticket Status */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className="w-4 h-4 text-[#6A4FE0]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">Ticket Status</h3>
                </div>
                <div className="space-y-3">
                  {ticketCards.map((t) => (
                    <div key={t.title} className="flex items-center justify-between">
                      <span className="text-xs text-[#64748B] font-medium">{t.title}</span>
                      <span className="text-sm font-bold font-mono" style={{ color: t.color }}>{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Activity */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#6A4FE0]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">Today's Activity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748B] font-medium">New Bookings</span>
                    <span className="text-sm font-bold font-mono text-[#0F172A]">{s?.todayBookings ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748B] font-medium">New Allocations</span>
                    <span className="text-sm font-bold font-mono text-[#0F172A]">{s?.todayAllocations ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748B] font-medium">Hostel Branches</span>
                    <span className="text-sm font-bold font-mono text-[#0F172A]">{s?.totalHostels ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748B] font-medium">Total Invoices</span>
                    <span className="text-sm font-bold font-mono text-[#0F172A]">{s?.totalInvoices ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Audit Logs Preview */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Recent Audit Events</h3>
                <p className="text-[11px] text-[#94A3B8]">Latest 10 system events from audit log</p>
              </div>
              <a href="/command-center/audit" className="text-xs text-[#2563EB] font-semibold hover:underline">
                View All →
              </a>
            </div>
            <div className="overflow-hidden border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] font-semibold">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/60 text-[#1E293B]">
                  {data?.recentAuditLogs && data.recentAuditLogs.length > 0 ? (
                    data.recentAuditLogs.slice(0, 10).map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-[#94A3B8] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#6A4FE0]/10 text-[#6A4FE0]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#475569]">
                          {log.user?.email || 'System'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#94A3B8] truncate max-w-[200px]">
                          {JSON.stringify(log.newValue || log.oldValue || {})}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[#94A3B8]">
                        No audit events recorded yet. Events will appear as users interact with the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
