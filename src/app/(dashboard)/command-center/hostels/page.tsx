'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Plus, BedDouble, Users, Ticket,
  RefreshCw, MapPin, Calendar, X,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function HostelPropertiesPage() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/hostels');
      setHostels(res.data);
    } catch (err: any) {
      toast.error('Failed to load hostels: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setCreating(true);
    try {
      await api.post('/admin/hostels', {
        name: formName.trim(),
        address: formAddress.trim() || undefined,
      });
      toast.success(`Hostel "${formName}" created successfully`);
      setFormName('');
      setFormAddress('');
      setShowForm(false);
      fetchHostels();
    } catch (err: any) {
      toast.error('Failed to create hostel: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#6A4FE0]" />
            Hostel Properties
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Manage all hostel branches, view room counts, and create new properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHostels}
            disabled={loading}
            className="h-9 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-9 px-4 rounded-xl bg-[#1D2786] hover:bg-[#161F6A] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? 'Cancel' : 'New Hostel'}
          </button>
        </div>
      </div>

      {/* Create Hostel Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">Create New Hostel Branch</h3>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Hostel Name (e.g. AEGIS North Wing)"
              required
              className="flex-1 h-10 px-4 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D2786]/20 text-[#1E293B]"
            />
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Address (optional)"
              className="flex-1 h-10 px-4 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D2786]/20 text-[#1E293B]"
            />
            <button
              type="submit"
              disabled={creating}
              className="h-10 px-6 rounded-xl bg-[#1D2786] hover:bg-[#161F6A] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create
            </button>
          </form>
        </motion.div>
      )}

      {/* Count Badge */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-lg bg-[#6A4FE0]/10 text-[#6A4FE0] text-xs font-bold">
          {hostels.length} hostel{hostels.length !== 1 ? 's' : ''} registered
        </span>
      </div>

      {/* Hostels Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
        </div>
      ) : hostels.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center">
          <Building2 className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-sm text-[#64748B]">No hostels configured yet.</p>
          <p className="text-xs text-[#94A3B8] mt-1">Click "New Hostel" to create your first hostel branch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostels.map((hostel, i) => (
            <motion.div
              key={hostel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{hostel.name}</h3>
                  {hostel.address && (
                    <p className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {hostel.address}
                    </p>
                  )}
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#1D2786]/10 flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5 text-[#1D2786]" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E2E8F0]">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#3B82F6] mb-1">
                    <BedDouble className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-lg font-bold text-[#0F172A]">{hostel._count?.rooms ?? 0}</p>
                  <p className="text-[10px] text-[#94A3B8] font-medium">Rooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#6A4FE0] mb-1">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-lg font-bold text-[#0F172A]">{hostel._count?.users ?? 0}</p>
                  <p className="text-[10px] text-[#94A3B8] font-medium">Users</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#F59E0B] mb-1">
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-lg font-bold text-[#0F172A]">{hostel._count?.tickets ?? 0}</p>
                  <p className="text-[10px] text-[#94A3B8] font-medium">Tickets</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center gap-1 text-[10px] text-[#94A3B8]">
                <Calendar className="w-3 h-3" />
                Created {new Date(hostel.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
