'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BedDouble,
  Ticket,
  Users,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-white/10 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-card glass-card">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-64 w-64 text-purple-400" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
              <Zap className="mr-1 h-3 w-3 text-cyan-400" /> Student Portal Active
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
              Tenant Isolated
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text-glow">
            Welcome back, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage room allocations, request maintenance support with SLA prediction, and find your ideal roommate.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/student/tickets">
              <Button className="gradient-brand hover:opacity-90 text-white font-semibold text-xs shadow-lg glow-purple">
                <Ticket className="mr-1.5 h-3.5 w-3.5" /> Raise Ticket
              </Button>
            </Link>
            <Link href="/student/match">
              <Button variant="outline" className="border-white/15 hover:bg-white/5 text-xs">
                <Users className="mr-1.5 h-3.5 w-3.5 text-purple-400" /> Match Roommates
              </Button>
            </Link>
            <Link href="/student/marketplace">
              <Button variant="outline" className="border-white/15 hover:bg-white/5 text-xs">
                <ShoppingBag className="mr-1.5 h-3.5 w-3.5 text-cyan-400" /> Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Booking Card */}
        <Card className="glass-card glass-card-hover border-white/10 relative overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-purple-400" /> Active Room Allocation
              </CardTitle>
              <Badge variant={activeBooking ? 'success' : 'outline'}>
                {activeBooking ? activeBooking.status : 'No Booking'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loadingBooking ? (
              <p className="text-xs text-muted-foreground py-6 text-center animate-pulse">
                Fetching allocation status...
              </p>
            ) : activeBooking ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-card/60 border border-white/5 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground font-mono">ROOM NUMBER</span>
                    <span className="text-3xl font-extrabold text-white">
                      Room {activeBooking.room?.roomNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-white/5">
                    <span>Floor {activeBooking.room?.floor}</span>
                    <span>Max Capacity: {activeBooking.room?.capacity} Beds</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-purple-300 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>
                    Valid: {new Date(activeBooking.startDate).toLocaleDateString()} —{' '}
                    {new Date(activeBooking.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  You currently have no active room allocations reserved.
                </p>
                <Button size="sm" variant="secondary" className="w-full text-xs">
                  Browse Available Hostels
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Tickets Summary */}
        <Card className="glass-card glass-card-hover border-white/10 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-400" /> Maintenance Tickets
              </CardTitle>
              <Badge variant={pendingTickets.length > 0 ? 'warning' : 'outline'}>
                {pendingTickets.length} Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {loadingTickets ? (
              <p className="text-xs text-muted-foreground py-6 text-center animate-pulse">
                Loading support tickets...
              </p>
            ) : pendingTickets.length > 0 ? (
              <div className="space-y-2.5">
                {pendingTickets.slice(0, 2).map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-card/60 border border-white/5 flex items-center justify-between text-xs space-y-1"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize text-white">{t.category}</span>
                        {t.breachRisk && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                            SLA Risk
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[180px] pt-0.5">
                        {t.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300 shrink-0">
                      {t.status}
                    </Badge>
                  </div>
                ))}

                <Link
                  href="/student/tickets"
                  className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 pt-1 font-semibold"
                >
                  View all tickets <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400/80" />
                <p className="text-xs text-muted-foreground">No active maintenance issues reported.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roommate Matches Summary */}
        <Card className="glass-card glass-card-hover border-white/10 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" /> Vector Roommate Match
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-[10px]">
                Vector Engine
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {matches && matches.length > 0 ? (
              <div className="space-y-2.5">
                {matches.slice(0, 2).map((m: any) => (
                  <div
                    key={m.userId}
                    className="p-3 rounded-xl bg-card/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white truncate max-w-[150px]">{m.email}</p>
                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        {m.matchingTraits.length} Shared Lifestyle Traits
                      </p>
                    </div>
                    <span className="font-extrabold text-base gradient-text-glow">{m.score}%</span>
                  </div>
                ))}

                <Link
                  href="/student/match"
                  className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 pt-1 font-semibold"
                >
                  View full match rankings <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="py-4 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  Set your habits to calculate real-time roommate compatibility scores.
                </p>
                <Link href="/student/match">
                  <Button size="sm" variant="outline" className="w-full text-xs border-white/15">
                    Configure Lifestyle Profile
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
