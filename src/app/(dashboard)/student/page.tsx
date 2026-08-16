'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BedDouble,
  Ticket,
  Users,
  ArrowRight,
  Clock,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export default function StudentDashboardPage() {
  const { user } = useAuthStore();

  const { data: activeBooking, isLoading: loadingBooking } = useQuery({
    queryKey: ['activeBooking'],
    queryFn: async () => {
      const res = await api.get('/bookings/active');
      return res.data;
    },
  });

  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['myTickets'],
    queryFn: async () => {
      const res = await api.get('/tickets/my');
      return res.data;
    },
  });

  const { data: matches } = useQuery({
    queryKey: ['roommateMatches'],
    queryFn: async () => {
      const res = await api.get('/users/matches');
      return res.data;
    },
  });

  const pendingTickets = tickets?.filter((t: any) => t.status !== 'RESOLVED') || [];

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Welcome Hero Banner Card — Richer Lavender #D7CBFE */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-4 shadow-sm border border-[#B7A6F6]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-xs font-semibold tracking-wide">
              Student Portal Active
            </span>
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-xs font-semibold tracking-wide">
              Tenant Isolated
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#3C315B] tracking-tight">
            Welcome back, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-sm text-[#3C315B]/80 leading-relaxed font-medium">
            Manage room allocations, request maintenance support with SLA prediction, and find your ideal roommate.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/student/tickets">
              <button
                type="button"
                className="px-4 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5"
              >
                <Ticket className="w-4 h-4 text-[#AB9FF2]" /> Raise Ticket
              </button>
            </Link>
            <Link href="/student/match">
              <button
                type="button"
                className="px-4 py-2.5 rounded-full bg-white text-[#3C315B] font-semibold text-sm border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Users className="w-4 h-4 text-[#6A4FE0]" /> Match Roommates
              </button>
            </Link>
            <Link href="/student/marketplace">
              <button
                type="button"
                className="px-4 py-2.5 rounded-full bg-white text-[#3C315B] font-semibold text-sm border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-[#2EC08B]" /> Marketplace
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Booking Card */}
        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-3">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-[#6A4FE0]" /> Active Room Allocation
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[11px] font-semibold">
              {activeBooking ? activeBooking.status : 'No Booking'}
            </span>
          </div>

          <div className="space-y-4">
            {loadingBooking ? (
              <p className="text-xs text-[#3C315B]/60 py-6 text-center">
                Fetching allocation status...
              </p>
            ) : activeBooking ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-[#3C315B]/50 font-semibold uppercase">ROOM NUMBER</span>
                    <span className="text-3xl font-extrabold text-[#3C315B]">
                      Room {activeBooking.room?.roomNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#3C315B]/70 pt-1 border-t border-[#E5E4E8]">
                    <span>Floor {activeBooking.room?.floor}</span>
                    <span>Max Capacity: {activeBooking.room?.capacity} Beds</span>
                  </div>
                </div>

                <div className="text-xs text-[#3C315B] p-3 rounded-xl bg-[#ECE8FE] border border-[#AB9FF2]/40 flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 shrink-0 text-[#6A4FE0]" />
                  <span>
                    Valid: {new Date(activeBooking.startDate).toLocaleDateString()} —{' '}
                    {new Date(activeBooking.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4 text-center">
                <p className="text-xs text-[#3C315B]/60 font-medium">
                  You currently have no active room allocations reserved.
                </p>
                <Link href="/student/rooms">
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-[#EDEAFD] text-[#3C315B] font-semibold text-xs hover:bg-[#D6CDFE] transition-colors"
                  >
                    Browse Available Hostels
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Tickets Summary */}
        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-3">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
              <Ticket className="h-5 w-5 text-[#6A4FE0]" /> Maintenance Tickets
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[11px] font-semibold">
              {pendingTickets.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {loadingTickets ? (
              <p className="text-xs text-[#3C315B]/60 py-6 text-center">
                Loading support tickets...
              </p>
            ) : pendingTickets.length > 0 ? (
              <div className="space-y-2.5">
                {pendingTickets.slice(0, 2).map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize text-[#3C315B]">{t.category}</span>
                        {t.breachRisk && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold">
                            SLA Risk
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#3C315B]/60 truncate max-w-[180px] pt-0.5">
                        {t.description}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDEAFD] text-[#3C315B] font-semibold">
                      {t.status}
                    </span>
                  </div>
                ))}

                <Link
                  href="/student/tickets"
                  className="text-xs text-[#6A4FE0] hover:underline inline-flex items-center gap-1 pt-1 font-semibold"
                >
                  View all tickets <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#2EC08B]" />
                <p className="text-xs text-[#3C315B]/60 font-medium">No active maintenance issues reported.</p>
              </div>
            )}
          </div>
        </div>

        {/* Roommate Matches Summary */}
        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-3">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#6A4FE0]" /> Vector Roommate Match
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[10px] font-semibold">
              Vector Engine
            </span>
          </div>

          <div className="space-y-3">
            {matches && matches.length > 0 ? (
              <div className="space-y-2.5">
                {matches.slice(0, 2).map((m: any) => (
                  <div
                    key={m.userId}
                    className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#3C315B] truncate max-w-[150px]">{m.email}</p>
                      <p className="text-[11px] text-[#3C315B]/60 pt-0.5">
                        {m.matchingTraits.length} Shared Lifestyle Traits
                      </p>
                    </div>
                    <span className="font-extrabold text-base text-[#6A4FE0]">{m.score}%</span>
                  </div>
                ))}

                <Link
                  href="/student/match"
                  className="text-xs text-[#6A4FE0] hover:underline inline-flex items-center gap-1 pt-1 font-semibold"
                >
                  View full match rankings <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="py-4 text-center space-y-3">
                <p className="text-xs text-[#3C315B]/60 font-medium">
                  Set your habits to calculate real-time roommate compatibility scores.
                </p>
                <Link href="/student/match">
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-[#EDEAFD] text-[#3C315B] font-semibold text-xs hover:bg-[#D6CDFE] transition-colors"
                  >
                    Configure Lifestyle Profile
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
