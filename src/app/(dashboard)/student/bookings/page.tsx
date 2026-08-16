'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

  const activeCount = activeBooking ? 1 : 0;
  const totalCount = myBookings?.length || 0;
  const completedCount = myBookings?.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'CHECKED_OUT').length || 0;
  const cancelledCount = myBookings?.filter((b: any) => b.status === 'CANCELLED').length || 0;

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6]">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
            Double-Booking Lock Protected
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1 flex items-center gap-2">
          <BedDouble className="h-7 w-7 text-[#6A4FE0]" /> My Room Bookings
        </h1>
        <p className="text-xs text-[#3C315B]/70 max-w-2xl leading-relaxed font-normal">
          View active room reservations, track check-in status, and review booking history.
        </p>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              ACTIVE NOW
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              {activeCount}
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              {activeBooking ? `Room ${activeBooking.room?.roomNumber}` : 'None reserved'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center shrink-0">
            <BedDouble className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              TOTAL RECORDS
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              {totalCount}
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              All time
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              COMPLETED
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              {completedCount}
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              Past allocations
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              CANCELLED
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              {cancelledCount}
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              Released slots
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Active Allocation Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#3C315B] flex items-center gap-2">
          <BedDouble className="h-5 w-5 text-[#6A4FE0]" /> Current Reserved Allocation
        </h2>

        {loadingActive ? (
          <div className="py-12 text-center text-xs text-[#3C315B]/60 animate-pulse">
            Fetching allocation details...
          </div>
        ) : activeBooking ? (
          <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-[#3C315B]">
                    Room {activeBooking.room?.roomNumber}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-xs font-bold">
                    {activeBooking.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#3C315B]/70 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="h-4 w-4 text-[#6A4FE0]" /> Floor {activeBooking.room?.floor}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="h-4 w-4 text-[#2EC08B]" /> Max Capacity: {activeBooking.room?.capacity} Beds
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#ECE8FE] border border-[#AB9FF2]/40 text-xs font-medium text-[#3C315B] flex items-center gap-2 w-fit">
                  <Clock className="h-4 w-4 shrink-0 text-[#6A4FE0]" />
                  <span>
                    Duration: {new Date(activeBooking.startDate).toLocaleDateString()} —{' '}
                    {new Date(activeBooking.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-center items-stretch border-t md:border-t-0 md:border-l border-[#E5E4E8] pt-4 md:pt-0 md:pl-6">
                <button
                  type="button"
                  disabled={cancelBookingMutation.isPending}
                  onClick={() => cancelBookingMutation.mutate(activeBooking.id)}
                  className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all border border-red-200"
                >
                  {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Reservation'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#E5E4E8] bg-white p-12 text-center space-y-4 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center mx-auto">
              <BedDouble className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-base text-[#3C315B]">No Active Booking Yet</h3>
              <p className="text-xs text-[#3C315B]/60 font-normal">
                Match with a compatible roommate or request room allocation from your warden.
              </p>
            </div>
            <Link href="/student/match">
              <button
                type="button"
                className="px-6 py-2.5 rounded-full bg-[#6A4FE0] hover:bg-[#5B3FD1] text-white font-semibold text-xs transition-all shadow-md"
              >
                <Users className="mr-2 h-4 w-4 inline" /> Find Roommate First
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Booking History Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-[#3C315B] flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#6A4FE0]" /> Booking History Records
        </h2>

        <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 shadow-sm">
          {loadingHistory ? (
            <p className="text-xs text-[#3C315B]/60 text-center py-6">Loading booking history...</p>
          ) : myBookings && myBookings.length > 0 ? (
            <div className="space-y-3">
              {myBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#3C315B] text-sm">
                        Room {b.room?.roomNumber} (Floor {b.room?.floor})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[10px] font-bold">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[#3C315B]/60 text-[11px]">
                      Created: {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="text-[11px] text-[#6A4FE0] font-semibold">
                    {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#3C315B]/60 text-center py-6 font-normal">
              No historical booking records found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
