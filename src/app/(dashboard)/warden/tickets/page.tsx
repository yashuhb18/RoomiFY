'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, AlertTriangle, CheckCircle2, UserPlus, RefreshCw, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';

export default function WardenTicketsPage() {
  const queryClient = useQueryClient();

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
      toast.success('Ticket status updated.');
      queryClient.invalidateQueries({ queryKey: ['wardenTickets'] });
      queryClient.invalidateQueries({ queryKey: ['breachRisks'] });
    },
  });

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide">
              Predictive SLA Maintenance Engine
            </span>
            <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2 pt-1">
              <Ticket className="h-7 w-7 text-[#6A4FE0]" /> SLA &amp; Support Ticket Control
            </h1>
            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Monitor automated SLA breach risks, assign maintenance staff, and update ticket lifecycle status.
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#3C315B]">CATEGORY</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">DESCRIPTION</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">SLA DEADLINE</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">BREACH RISK</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B] text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t: any) => (
                <TableRow key={t.id} className={t.breachRisk ? 'bg-rose-50/50' : 'hover:bg-[#FAFAFA]'}>
                  <TableCell className="font-bold text-[#3C315B] capitalize text-xs">{t.category}</TableCell>
                  <TableCell className="text-xs text-[#3C315B]/70 max-w-xs truncate font-medium">
                    {t.description}
                  </TableCell>
                  <TableCell className="text-xs text-[#6A4FE0] font-semibold">
                    {new Date(t.slaDeadline).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {t.breachRisk ? (
                      <Badge variant="destructive" className="bg-rose-100 text-rose-700 font-bold border-rose-200 text-[10px]">
                        HIGH RISK
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 font-bold border-emerald-200 text-[10px]">
                        NORMAL
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[#ECE8FE] text-[#3C315B] font-bold text-[10px]">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {t.status !== 'RESOLVED' ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatusMutation.mutate({ ticketId: t.id, status: 'RESOLVED' })
                        }
                        className="rounded-full bg-[#2EC08B] hover:bg-[#28A87A] text-white font-bold text-xs h-8 px-4 shadow-sm"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
                      </Button>
                    ) : (
                      <span className="text-xs text-[#2EC08B] font-bold">Resolved</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">
            No support tickets reported.
          </p>
        )}
      </div>
    </div>
  );
}
