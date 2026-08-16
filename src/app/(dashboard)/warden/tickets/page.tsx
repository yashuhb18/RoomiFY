'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Ticket,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Eye,
  ImageIcon,
  User,
  Phone,
  Mail,
  Home,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Helper function to resolve backend upload URLs correctly
const getMediaUrl = (url: string | null | undefined): string | null => {
  if (!url || url === 'null' || url === 'undefined') return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `http://localhost:5000${cleanPath}`;
};

export default function WardenTicketsPage() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['wardenTickets'],
    queryFn: async () => {
      const res = await api.get('/tickets');
      return res.data;
    },
  });

  const { data: breachRisks } = useQuery({
    queryKey: ['breachRisks'],
    queryFn: async () => {
      const res = await api.get('/tickets/breach-risks');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const res = await api.patch(`/tickets/${ticketId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Ticket status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['wardenTickets'] });
      queryClient.invalidateQueries({ queryKey: ['breachRisks'] });
      if (selectedTicket) {
        setSelectedTicket((prev: any) => (prev ? { ...prev, status: 'RESOLVED' } : null));
      }
    },
  });

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen font-sans">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide">
              Predictive SLA Maintenance Engine
            </span>
            <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2 pt-1">
              <Ticket className="h-7 w-7 text-[#6A4FE0]" /> Maintenance Tickets &amp; Support Control
            </h1>
            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Review student complaints, inspect attached photos, verify room numbers, and manage SLA resolution timelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Tickets
          </button>
        </div>
      </div>

      {/* SLA Breach Warning Banner */}
      {breachRisks && breachRisks.length > 0 && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
            <AlertTriangle className="h-5 w-5 text-rose-600" /> Predictive SLA Breach Risk Warning
          </div>
          <p className="text-xs text-rose-700/80 leading-relaxed font-normal">
            The predictive model identified {breachRisks.length} tickets with estimated resolution time exceeding maximum SLA policy threshold.
          </p>
        </div>
      )}

      {/* Ticket Table Card */}
      <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">Loading ticket system...</p>
        ) : tickets && tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E5E4E8]">
                  <TableHead className="text-xs font-bold text-[#3C315B]">STUDENT &amp; ROOM</TableHead>
                  <TableHead className="text-xs font-bold text-[#3C315B]">CATEGORY</TableHead>
                  <TableHead className="text-xs font-bold text-[#3C315B]">DESCRIPTION</TableHead>
                  <TableHead className="text-xs font-bold text-[#3C315B]">IMAGE ATTACHMENT</TableHead>
                  <TableHead className="text-xs font-bold text-[#3C315B]">SLA DEADLINE</TableHead>
                  <TableHead className="text-xs font-bold text-[#3C315B]">STATUS</TableHead>
                  <TableHead className="text-xs font-bold text-[#3C315B] text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t: any) => {
                  const studentProfile = t.student?.profile || {};
                  const studentName = studentProfile.fullName || t.student?.email || 'Student';
                  const roomNumber = studentProfile.roomNumber || 'Room N/A';

                  const rawPhoto = t.photoUrl || t.attachmentUrl || t.photo;
                  const photoUrl = getMediaUrl(rawPhoto);

                  return (
                    <TableRow key={t.id} className={t.breachRisk ? 'bg-rose-50/50 hover:bg-rose-100/50' : 'hover:bg-[#FAFAFA]'}>
                      {/* Student & Room Column */}
                      <TableCell className="align-top py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#3C315B] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#6A4FE0]" />
                            {studentName}
                          </p>
                          <p className="text-[11px] text-[#3C315B]/60 flex items-center gap-1 font-medium">
                            <Home className="w-3 h-3 text-[#3C315B]/40" /> {roomNumber}
                          </p>
                          <p className="text-[10px] text-[#3C315B]/40 font-mono">{t.student?.email}</p>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="align-top py-4">
                        <Badge variant="secondary" className="bg-[#ECE8FE] text-[#3C315B] font-bold text-[11px] capitalize px-2.5 py-1">
                          {t.category}
                        </Badge>
                      </TableCell>

                      {/* Description Preview */}
                      <TableCell className="align-top py-4 max-w-xs">
                        <p className="text-xs text-[#3C315B]/80 font-normal leading-relaxed line-clamp-2">
                          {t.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(t)}
                          className="text-[11px] text-[#6A4FE0] font-bold hover:underline mt-1 inline-flex items-center gap-1"
                        >
                          Read Full Details →
                        </button>
                      </TableCell>

                      {/* Image Attachment Column */}
                      <TableCell className="align-top py-4">
                        {photoUrl ? (
                          <div
                            onClick={() => setSelectedTicket(t)}
                            className="group relative cursor-pointer inline-flex items-center gap-2.5 p-2 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] hover:border-[#6A4FE0] hover:bg-[#F3EFFF] transition-all shadow-sm"
                          >
                            <img
                              src={photoUrl}
                              alt="Attachment thumbnail"
                              className="w-12 h-12 rounded-xl object-cover border border-[#E5E4E8] shadow-inner bg-white shrink-0"
                            />
                            <div className="text-left pr-1">
                              <span className="text-[11px] font-bold text-[#6A4FE0] flex items-center gap-1">
                                <ImageIcon className="w-3.5 h-3.5" /> View Photo
                              </span>
                              <span className="text-[9px] text-[#3C315B]/50 block font-medium">Click to enlarge</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#3C315B]/40 italic">No image attached</span>
                        )}
                      </TableCell>

                      {/* SLA Deadline */}
                      <TableCell className="align-top py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <p className="text-xs text-[#6A4FE0] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(t.slaDeadline).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                          {t.breachRisk ? (
                            <Badge variant="destructive" className="bg-rose-100 text-rose-700 font-bold border-rose-200 text-[10px]">
                              HIGH SLA RISK
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 font-bold border-emerald-200 text-[10px]">
                              NORMAL SLA
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="align-top py-4">
                        <Badge
                          className={`font-bold text-[10px] px-2.5 py-1 ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-[#ECE8FE] text-[#3C315B]'
                          }`}
                        >
                          {t.status}
                        </Badge>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="align-top py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTicket(t)}
                            className="rounded-full border-[#E5E4E8] text-[#3C315B] font-bold text-xs h-8 px-3 hover:bg-[#ECE8FE]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-[#6A4FE0]" /> Inspect
                          </Button>

                          {t.status !== 'RESOLVED' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({ ticketId: t.id, status: 'RESOLVED' })
                              }
                              className="rounded-full bg-[#2EC08B] hover:bg-[#28A87A] text-white font-bold text-xs h-8 px-3 shadow-sm"
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">
            No support tickets reported.
          </p>
        )}
      </div>

      {/* Interactive Ticket Detail & Image Viewer Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="rounded-3xl bg-white border border-[#E5E4E8] text-[#3C315B] max-w-xl p-6 sm:p-7 space-y-5">
            <DialogHeader className="border-b border-[#E5E4E8] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-[#ECE8FE] text-[#3C315B] font-bold text-xs capitalize">
                    {selectedTicket.category}
                  </Badge>
                  {selectedTicket.breachRisk && (
                    <Badge variant="destructive" className="bg-rose-100 text-rose-700 font-bold border-rose-200 text-xs">
                      High SLA Risk
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-[#3C315B]/50 font-mono">
                  Ticket ID: {selectedTicket.id?.slice(0, 8)}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-[#3C315B] pt-2">
                Ticket Details &amp; Student Complaint
              </DialogTitle>
              <DialogDescription className="text-xs text-[#3C315B]/60">
                Created on {new Date(selectedTicket.createdAt || Date.now()).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {/* Student Info Card */}
            <div className="rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] p-4 space-y-2">
              <h4 className="text-xs font-bold text-[#3C315B] uppercase tracking-wider">Student Profile &amp; Contact</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-[#3C315B]/50 text-[10px] font-medium">Student Name</p>
                  <p className="font-bold text-[#3C315B] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6A4FE0]" />
                    {selectedTicket.student?.profile?.fullName || selectedTicket.student?.email || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#3C315B]/50 text-[10px] font-medium">Hostel Room</p>
                  <p className="font-bold text-[#3C315B] flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#6A4FE0]" />
                    {selectedTicket.student?.profile?.roomNumber || 'Room N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#3C315B]/50 text-[10px] font-medium">Email Address</p>
                  <p className="font-medium text-[#3C315B] flex items-center gap-1.5 font-mono text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-[#6A4FE0]" />
                    {selectedTicket.student?.email || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#3C315B]/50 text-[10px] font-medium">Phone Number</p>
                  <p className="font-medium text-[#3C315B] flex items-center gap-1.5 font-mono text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-[#6A4FE0]" />
                    {selectedTicket.student?.profile?.phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#3C315B] uppercase tracking-wider">Complaint Description</h4>
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] text-xs text-[#3C315B] leading-relaxed whitespace-pre-wrap font-medium">
                {selectedTicket.description}
              </div>
            </div>

            {/* Photo Attachment Section */}
            <div className="space-y-2">
              {(() => {
                const rawPhoto = selectedTicket.photoUrl || selectedTicket.attachmentUrl || selectedTicket.photo;
                const fullPhotoUrl = getMediaUrl(rawPhoto);

                return (
                  <>
                    <h4 className="text-xs font-bold text-[#3C315B] uppercase tracking-wider flex items-center justify-between">
                      <span>Attached Photo Evidence</span>
                      {fullPhotoUrl && (
                        <a
                          href={fullPhotoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#6A4FE0] font-bold hover:underline flex items-center gap-1 capitalize"
                        >
                          Open Full Size <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </h4>

                    {fullPhotoUrl ? (
                      <div className="rounded-2xl border border-[#E5E4E8] overflow-hidden bg-black/5 flex items-center justify-center p-3">
                        <img
                          src={fullPhotoUrl}
                          alt="Ticket Evidence Attachment"
                          className="max-h-72 w-auto object-contain rounded-xl shadow-md bg-white"
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] text-xs text-[#3C315B]/50 italic text-center">
                        No image photo was attached to this support ticket.
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E5E4E8] flex items-center justify-between">
              <div className="text-xs text-[#3C315B]/60 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#6A4FE0]" /> SLA Deadline:{' '}
                {new Date(selectedTicket.slaDeadline).toLocaleString()}
              </div>

              <div className="flex items-center gap-2">
                {selectedTicket.status !== 'RESOLVED' && (
                  <Button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        ticketId: selectedTicket.id,
                        status: 'RESOLVED',
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="rounded-full bg-[#2EC08B] hover:bg-[#28A87A] text-white font-bold text-xs px-5 h-9"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    {updateStatusMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-full border-[#E5E4E8] text-[#3C315B] font-bold text-xs h-9 px-4"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
