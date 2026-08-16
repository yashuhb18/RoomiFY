'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Shield, ShieldCheck, ShieldAlert, UserCheck,
  UserX, RefreshCw, ChevronDown, CheckCircle2, XCircle,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const ROLE_OPTIONS = ['ALL', 'STUDENT', 'WARDEN', 'STAFF', 'SUPER_ADMIN'];
const ROLE_COLORS: Record<string, string> = {
  STUDENT: '#6A4FE0',
  WARDEN: '#3B82F6',
  STAFF: '#F59E0B',
  SUPER_ADMIN: '#EF4444',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/admin/users', { params });
      setUsers(res.data);
    } catch (err: any) {
      toast.error('Failed to load users: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      toast.error('Role update failed: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    setUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentActive });
      toast.success(currentActive ? 'Account disabled' : 'Account activated');
      fetchUsers();
    } catch (err: any) {
      toast.error('Status toggle failed: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleSuspension = async (userId: string, currentlySuspended: boolean) => {
    setUpdating(userId);
    const reason = !currentlySuspended
      ? prompt('Enter disciplinary suspension reason (optional):') || 'Disciplinary Action'
      : undefined;

    try {
      await api.patch(`/admin/users/${userId}/suspend`, {
        isSuspended: !currentlySuspended,
        reason,
      });
      toast.success(currentlySuspended ? 'Student unsuspended' : 'Student suspended');
      fetchUsers();
    } catch (err: any) {
      toast.error('Suspension toggle failed: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#6A4FE0]" />
            User Management
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Manage roles, access levels, account active status, and student disciplinary suspensions
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="h-9 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D2786]/20 focus:border-[#1D2786] transition-all text-[#1E293B]"
          />
        </form>
        <div className="flex gap-2">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`h-10 px-3.5 rounded-xl text-xs font-semibold transition-all border ${
                roleFilter === role
                  ? 'bg-[#1D2786] text-white border-[#1D2786]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* User Count Badge */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-lg bg-[#6A4FE0]/10 text-[#6A4FE0] text-xs font-bold">
          {users.length} users found
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-[#94A3B8] text-sm">
            No users found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Discipline</th>
                  <th className="p-3.5">MFA</th>
                  <th className="p-3.5">Hostel</th>
                  <th className="p-3.5">Created</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]/60">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#F8FAFC]/70 transition-colors text-[#1E293B]"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1D2786] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {user.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A] text-xs">{user.email}</p>
                          {user.profile?.fullName && (
                            <p className="text-[10px] text-[#94A3B8]">{user.profile.fullName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updating === user.id}
                        className="h-7 px-2 rounded-lg text-[10px] font-bold border focus:outline-none focus:ring-1 focus:ring-[#1D2786]/30 cursor-pointer"
                        style={{
                          color: ROLE_COLORS[user.role] || '#475569',
                          borderColor: (ROLE_COLORS[user.role] || '#CBD5E1') + '40',
                          backgroundColor: (ROLE_COLORS[user.role] || '#CBD5E1') + '10',
                        }}
                      >
                        {['STUDENT', 'WARDEN', 'STAFF', 'SUPER_ADMIN'].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {user.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {user.isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <UserX className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94A3B8]">Normal</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {user.isMfaEnabled ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> Enabled
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94A3B8]">Off</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[11px] text-[#475569]">
                      {user.hostel?.name || '—'}
                    </td>
                    <td className="p-3.5 text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          disabled={updating === user.id}
                          className={`h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                            user.isActive
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                          } disabled:opacity-50`}
                          title={user.isActive ? 'Disable account access' : 'Activate account access'}
                        >
                          {updating === user.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : user.isActive ? (
                            'Disable'
                          ) : (
                            'Enable'
                          )}
                        </button>
                        {user.role === 'STUDENT' && (
                          <button
                            onClick={() => handleToggleSuspension(user.id, user.isSuspended)}
                            disabled={updating === user.id}
                            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                              user.isSuspended
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            } disabled:opacity-50`}
                            title={user.isSuspended ? 'Lift suspension' : 'Impose disciplinary suspension'}
                          >
                            {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        )}
                      </div>
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
