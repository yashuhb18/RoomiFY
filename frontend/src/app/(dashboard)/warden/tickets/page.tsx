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
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
              Predictive SLA Maintenance Engine
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            SLA &amp; Support Ticket Control
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor automated SLA breach risks, assign maintenance staff, and update ticket lifecycle status.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          className="border-white/15 hover:bg-white/5"
        >
          <RefreshCw className="mr-2 h-4 w-4 text-purple-400" /> Refresh Tickets
        </Button>
      </div>

      {/* SLA Breach Warning Banner */}
      {breachRisks && breachRisks.length > 0 && (
        <Card className="rounded-3xl border border-rose-500/40 bg-rose-950/20 shadow-xl shadow-rose-500/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
            <AlertTriangle className="h-5 w-5 animate-bounce" /> Predictive SLA Breach Risk Warning
          </div>
          <p className="text-xs text-rose-300/80 leading-relaxed">
            The predictive model identified {breachRisks.length} tickets with estimated resolution time exceeding maximum SLA policy threshold.
          </p>
        </Card>
      )}

      {/* Ticket Table */}
      <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-8">Loading ticket system...</p>
        ) : tickets && tickets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Category</TableHead>
                <TableHead className="font-mono text-xs">Description</TableHead>
                <TableHead className="font-mono text-xs">SLA Deadline</TableHead>
                <TableHead className="font-mono text-xs">Breach Risk</TableHead>
                <TableHead className="font-mono text-xs">Status</TableHead>
                <TableHead className="font-mono text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t: any) => (
                <TableRow key={t.id} className={t.breachRisk ? 'bg-rose-950/15' : ''}>
                  <TableCell className="font-bold text-white capitalize">{t.category}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {t.description}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-purple-300">
                    {new Date(t.slaDeadline).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {t.breachRisk ? (
                      <Badge variant="destructive" className="text-[10px]">
                        HIGH RISK
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                        NORMAL
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-mono">
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
                        className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 px-4"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
                      </Button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-400 font-semibold">Resolved</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">
            No support tickets reported.
          </p>
        )}
      </Card>
    </div>
  );
}
