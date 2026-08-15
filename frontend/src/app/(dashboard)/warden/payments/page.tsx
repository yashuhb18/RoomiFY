'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, IndianRupee, Users, Clock, Search } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHero } from '@/components/ui/page-hero';
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

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['hostelInvoices'],
    queryFn: async () => {
      const res = await api.get('/invoices/hostel');
      return res.data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ['hostelStudents'],
    queryFn: async () => {
      const res = await api.get('/users?role=STUDENT');
      return res.data;
    },
  });

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
      toast.success('Fee invoice generated successfully');
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
    <div className="space-y-8 pb-12">
      <PageHero
        mode="bone"
        icon={CreditCard}
        badges={['Fee Management', 'Razorpay Integration']}
        title="Hostel Finances & Dues"
        description="Generate invoices for rent, mess, or fines, and track automated collections via Razorpay."
        actions={
          <Button onClick={() => setShowForm(!showForm)} className="bg-lavender-mist hover:bg-lavender-mist/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Issue New Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-ash bg-white shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-mint-signal/10 flex items-center justify-center">
            <IndianRupee className="h-6 w-6 text-mint-signal" />
          </div>
          <div>
            <p className="text-[11px] text-fog font-light tracking-phantom uppercase">Total Collected</p>
            <p className="text-xl font-semibold text-aubergine">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="p-4 border-ash bg-white shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] text-fog font-light tracking-phantom uppercase">Pending Dues</p>
            <p className="text-xl font-semibold text-aubergine">₹{pendingDues.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {showForm && (
        <Card className="border-ash border-l-4 border-l-lavender-mist">
          <CardHeader className="border-b border-ash bg-bone/30 pb-4">
            <CardTitle className="text-subheading font-light text-aubergine">Generate Fee Invoice</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-fog tracking-phantom uppercase">Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full h-10 rounded-md border border-ash px-3 text-caption text-aubergine focus:outline-none focus:ring-1 focus:ring-lavender-mist"
                >
                  <option value="">Select a student...</option>
                  {students?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.profile?.fullName || s.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-fog tracking-phantom uppercase">Fee Title</label>
                <Input placeholder="e.g. September Mess Fee" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-fog tracking-phantom uppercase">Amount (₹)</label>
                <Input type="number" placeholder="5000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-fog tracking-phantom uppercase">Due Date (Optional)</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-fog tracking-phantom uppercase">Description / Note</label>
              <Input placeholder="Any details for the student..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                onClick={() => createInvoiceMutation.mutate()}
                disabled={!studentId || !title || !amount || createInvoiceMutation.isPending}
                className="bg-lavender-mist hover:bg-lavender-mist/90 text-white"
              >
                {createInvoiceMutation.isPending ? 'Generating...' : 'Issue Invoice'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-ash">
        <CardHeader className="border-b border-ash bg-bone/30 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-subheading font-light text-aubergine flex items-center gap-2">
            <Users className="h-5 w-5 text-fog" /> All Issued Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead className="bg-bone/50 border-b border-ash text-[11px] text-fog uppercase tracking-phantom">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ash">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-fog animate-pulse">Loading invoices...</td>
                  </tr>
                ) : invoices?.length > 0 ? (
                  invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-bone/30">
                      <td className="px-4 py-3 font-medium text-aubergine">
                        {inv.student?.profile?.fullName || inv.student?.email || 'Unknown Student'}
                      </td>
                      <td className="px-4 py-3 text-aubergine">{inv.title}</td>
                      <td className="px-4 py-3 text-aubergine font-medium">₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'destructive' : 'outline'}
                          className="text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-fog text-[11px]">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-fog">No invoices generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
