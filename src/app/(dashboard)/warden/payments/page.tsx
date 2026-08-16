'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, IndianRupee, Users, Clock, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function WardenPaymentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [studentId, setStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['hostelInvoices'],
    queryFn: async () => {
      const res = await api.get('/invoices/hostel');
      return res.data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['hostelStudents'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    },
  });

  const students = users?.filter((u: any) => u.role === 'STUDENT') || [];

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/invoices', {
        title,
        description,
        amount: parseFloat(amount),
        studentId,
        dueDate: dueDate || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Fee invoice generated & issued to student');
      queryClient.invalidateQueries({ queryKey: ['hostelInvoices'] });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setAmount('');
      setStudentId('');
      setDueDate('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    },
  });

  const totalCollected = invoices?.filter((i: any) => i.status === 'PAID').reduce((sum: number, i: any) => sum + i.amount, 0) || 0;
  const pendingDues = invoices?.filter((i: any) => i.status !== 'PAID').reduce((sum: number, i: any) => sum + i.amount, 0) || 0;

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
              Fee Management Engine
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
              Razorpay Integration
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1 flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-[#6A4FE0]" /> Hostel Finances &amp; Dues
          </h1>
          <p className="text-sm text-[#3C315B]/80 max-w-xl leading-relaxed font-medium">
            Generate fee invoices for rent, mess, or fines, and track automated student collections via Razorpay.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2.5 rounded-full bg-white text-[#3C315B] font-semibold text-sm border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white text-sm font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Issue New Invoice
          </button>
        </div>
      </div>

      {/* 2 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#3C315B]/60 uppercase tracking-wider block">
              TOTAL COLLECTED
            </span>
            <p className="text-3xl font-extrabold text-[#2EC08B]">
              ₹{totalCollected.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-[#3C315B]/70 font-medium block">
              Verified Razorpay transactions
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-center shrink-0">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#3C315B]/60 uppercase tracking-wider block">
              PENDING DUES
            </span>
            <p className="text-3xl font-extrabold text-amber-600">
              ₹{pendingDues.toLocaleString('en-IN')}
            </p>
            <span className="text-xs text-[#3C315B]/70 font-medium block">
              Outstanding invoices
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Form Card (Issue Invoice) */}
      {showForm && (
        <div className="rounded-3xl bg-white border border-[#E5E4E8] p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#3C315B] flex items-center gap-2 border-b border-[#E5E4E8] pb-3">
            <FileText className="h-5 w-5 text-[#6A4FE0]" /> Generate &amp; Issue Fee Invoice
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Target Student</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] px-4 text-xs font-semibold text-[#3C315B] focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
              >
                <option value="">Select a resident student...</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.profile?.fullName || s.email} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Fee Title</label>
              <Input
                placeholder="e.g. Hostel Rent / Mess Charges"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-2xl border-[#E5E4E8] bg-[#FAFAFA] text-xs font-semibold text-[#3C315B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Amount (INR ₹)</label>
              <Input
                type="number"
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 rounded-2xl border-[#E5E4E8] bg-[#FAFAFA] text-xs font-semibold text-[#3C315B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Due Date (Optional)</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 rounded-2xl border-[#E5E4E8] bg-[#FAFAFA] text-xs font-semibold text-[#3C315B]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3C315B]">Description / Note</label>
            <Input
              placeholder="Provide breakdown details for the student..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 rounded-2xl border-[#E5E4E8] bg-[#FAFAFA] text-xs text-[#3C315B]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => createInvoiceMutation.mutate()}
              disabled={!studentId || !title || !amount || createInvoiceMutation.isPending}
              className="px-6 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {createInvoiceMutation.isPending ? 'Issuing...' : 'Issue Invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table Card */}
      <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#3C315B] flex items-center gap-2 border-b border-[#E5E4E8] pb-3">
          <Users className="h-5 w-5 text-[#6A4FE0]" /> All Issued Hostel Invoices
        </h2>

        {isLoading ? (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">Loading invoices...</p>
        ) : invoices && invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#3C315B]">STUDENT</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">TITLE</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">AMOUNT</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">DATE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id} className="hover:bg-[#FAFAFA]">
                  <TableCell className="font-bold text-[#3C315B] text-sm">
                    {inv.student?.profile?.fullName || inv.student?.email || 'Resident Student'}
                  </TableCell>
                  <TableCell className="text-xs text-[#3C315B]/70 font-medium">
                    {inv.title}
                  </TableCell>
                  <TableCell className="font-extrabold text-sm text-[#3C315B]">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'PAID'
                        ? 'bg-[#E6F9F0] text-[#2EC08B]'
                        : inv.status === 'OVERDUE'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-[#ECE8FE] text-[#3C315B]'
                    }`}>
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-[#3C315B]/50">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-[#3C315B]/60 text-center py-8 font-medium">
            No invoices generated yet.
          </p>
        )}
      </div>
    </div>
  );
}

