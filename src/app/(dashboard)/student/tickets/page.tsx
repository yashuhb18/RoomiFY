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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 gradient-text">
            <Ticket className="h-6 w-6 text-purple-400" /> Maintenance Tickets
          </h1>
          <p className="text-sm text-muted-foreground">
            Report maintenance issues with automated SLA breach prediction.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white">
          <Plus className="mr-2 h-4 w-4" /> Raise New Ticket
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading maintenance tickets...</p>
      ) : tickets && tickets.length > 0 ? (
        <div className="grid gap-4">
          {tickets.map((ticket: any) => (
            <Card key={ticket.id} className="glass border-white/10">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold capitalize text-base">{ticket.category}</span>
                    <Badge
                      variant={
                        ticket.status === 'RESOLVED'
                          ? 'success'
                          : ticket.breachRisk
                          ? 'destructive'
                          : 'warning'
                      }
                    >
                      {ticket.status}
                    </Badge>
                    {ticket.breachRisk && (
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertCircle className="mr-1 h-3 w-3" /> SLA Risk
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground/70">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> SLA Deadline:{' '}
                      {new Date(ticket.slaDeadline).toLocaleString()}
                    </span>
                  </div>
                </div>

                {ticket.photoUrl && (
                  <a
                    href={ticket.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-400 hover:underline shrink-0"
                  >
                    View Photo Attachment
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass border-white/10 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No support tickets raised yet. Click above to submit a request.
          </p>
        </Card>
      )}

      {/* Raise Ticket Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Raise Maintenance Ticket</DialogTitle>
            <DialogDescription>
              Submit details of the issue. SLA tracking begins automatically.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/15 text-destructive text-xs border border-destructive/30 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="plumbing">Plumbing (SLA: 24h)</option>
                <option value="electrical">Electrical (SLA: 12h)</option>
                <option value="cleaning">Cleaning (SLA: 6h)</option>
                <option value="carpentry">Carpentry (SLA: 24h)</option>
                <option value="internet">Internet/WiFi (SLA: 8h)</option>
                <option value="other">Other (SLA: 24h)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" /> Attach Photo (Optional, Max 5MB)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="bg-card/50"
              />
            </div>

            <Button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white"
            >
              {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
