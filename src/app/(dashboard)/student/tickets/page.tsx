'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Upload, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function StudentTicketsPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const [category, setCategory] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['myTickets'],
    queryFn: async () => {
      const res = await api.get('/tickets/my');
      return res.data;
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      setIsOpen(false);
      setCategory('plumbing');
      setDescription('');
      setPhoto(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to submit ticket.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    if (photo) {
      formData.append('photo', photo);
    }

    createTicketMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm inline-block">
            SLA Breach Protection Active
          </span>
          <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2">
            <Ticket className="h-7 w-7 text-[#6A4FE0]" /> Maintenance Support Tickets
          </h1>
          <p className="text-xs text-[#3C315B]/70 max-w-xl leading-relaxed font-normal">
            Report maintenance issues with automated SLA breach prediction and real-time tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Raise New Ticket
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-[#3C315B]/60 font-normal">Loading maintenance tickets...</p>
      ) : tickets && tickets.length > 0 ? (
        <div className="grid gap-4">
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="rounded-3xl bg-white border border-[#E5E4E8] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#3C315B] capitalize text-base">{ticket.category}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ticket.status === 'RESOLVED'
                      ? 'bg-[#E6F9F0] text-[#2EC08B]'
                      : ticket.breachRisk
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-[#ECE8FE] text-[#3C315B]'
                  }`}>
                    {ticket.status}
                  </span>
                  {ticket.breachRisk && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> SLA Risk
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#3C315B]/70 font-normal">{ticket.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-[#3C315B]/50">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3 text-[#6A4FE0]" /> SLA Deadline:{' '}
                    {new Date(ticket.slaDeadline).toLocaleString()}
                  </span>
                </div>
              </div>

              {ticket.photoUrl && (
                <a
                  href={ticket.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#ECE8FE] text-[#6A4FE0] text-xs font-bold hover:bg-[#D6CDFE] transition-colors shrink-0"
                >
                  View Photo Attachment
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-[#E5E4E8] p-8 text-center shadow-sm">
          <p className="text-xs text-[#3C315B]/60 font-normal">
            No support tickets raised yet. Click above to submit a request.
          </p>
        </div>
      )}

      {/* Raise Ticket Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-3xl bg-white border border-[#E5E4E8] text-[#3C315B]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#3C315B]">Raise Maintenance Ticket</DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              Submit details of the issue. SLA tracking begins automatically.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-11 w-full rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] px-4 text-xs font-semibold text-[#3C315B] focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
              >
                <option value="plumbing">Plumbing (SLA: 24h)</option>
                <option value="electrical">Electrical (SLA: 12h)</option>
                <option value="cleaning">Cleaning (SLA: 6h)</option>
                <option value="carpentry">Carpentry (SLA: 24h)</option>
                <option value="internet">Internet/WiFi (SLA: 8h)</option>
                <option value="other">Other (SLA: 24h)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="flex w-full rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] px-4 py-3 text-xs text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1">
                <Upload className="h-3.5 w-3.5 text-[#6A4FE0]" /> Attach Photo (Optional, Max 5MB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#3C315B] border border-[#E5E4E8] rounded-xl p-2 bg-[#FAFAFA]"
              />
            </div>

            <button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="w-full h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white text-xs font-bold transition-all shadow-md"
            >
              {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
