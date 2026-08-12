'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BedDouble,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  Users,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function StudentBookingsPage() {
  const queryClient = useQueryClient();

  const { data: activeBooking, isLoading: loadingActive } = useQuery({
    queryKey: ['activeBooking'],
    queryFn: async () => {
      const res = await api.get('/bookings/active');
      return res.data;
    },
  });

  const { data: myBookings, isLoading: loadingHistory } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my');
      return res.data;
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully.');
      queryClient.invalidateQueries({ queryKey: ['activeBooking'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    },
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
              Double-Booking Lock Protected
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            My Room Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            View active room reservations, track check-in status, and review booking history.
          </p>
        </div>
      </div>

      {/* Active Allocation Card */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BedDouble className="h-5 w-5 text-purple-400" /> Current Reserved Allocation
        </h2>

        {loadingActive ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Fetching allocation details...
          </div>
        ) : activeBooking ? (
          <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl shadow-2xl overflow-hidden p-6">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-white">
                    Room {activeBooking.room?.roomNumber}
                  </span>
                  <Badge variant="success" className="text-xs px-3 py-1 font-semibold">
                    {activeBooking.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Building2 className="h-4 w-4 text-purple-400" /> Floor {activeBooking.room?.floor}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Users className="h-4 w-4 text-cyan-400" /> Max Capacity: {activeBooking.room?.capacity} Beds
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center gap-2 w-fit">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>
                    Duration: {new Date(activeBooking.startDate).toLocaleDateString()} —{' '}
                    {new Date(activeBooking.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-center items-stretch border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                <Button
                  variant="destructive"
                  disabled={cancelBookingMutation.isPending}
                  onClick={() => cancelBookingMutation.mutate(activeBooking.id)}
                  className="rounded-full h-11 text-xs font-semibold"
                >
                  {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Reservation'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="rounded-3xl border border-dashed border-white/15 bg-[#1A1A1A]/40 p-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <BedDouble className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-base text-white">No Active Booking Yet</h3>
              <p className="text-xs text-muted-foreground">
                Match with a compatible roommate or request room allocation from your warden.
              </p>
            </div>
            <Link href="/student/match">
              <Button className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 text-white font-semibold text-xs px-6 shadow-lg shadow-purple-500/25 transition-all">
                <Users className="mr-2 h-4 w-4" /> Find Roommate First
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Booking History Table */}
      <div className="space-y-4 pt-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" /> Booking History Records
        </h2>

        <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6">
          {loadingHistory ? (
            <p className="text-xs text-muted-foreground text-center py-6">Loading booking history...</p>
          ) : myBookings && myBookings.length > 0 ? (
            <div className="space-y-3">
              {myBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-sm">
                        Room {b.room?.roomNumber} (Floor {b.room?.floor})
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-[11px]">
                      Created: {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="font-mono text-[11px] text-purple-300">
                    {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No historical booking records found.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
