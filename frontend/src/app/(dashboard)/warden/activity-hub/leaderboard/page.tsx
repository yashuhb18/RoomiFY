'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useActivityHubStore } from '@/store/useActivityHubStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { TierBadge } from '@/components/ui/tier-badge';
import { cn } from '@/lib/utils';

export default function WardenLeaderboardPage() {
  const { user } = useAuthStore();
  const { leaderboardData, isLoadingLeaderboard, fetchLeaderboard } =
    useActivityHubStore();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchLeaderboard({
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      page,
      limit: 15,
    }).catch(() => {});
  }, [roleFilter, page, fetchLeaderboard]);

  const leaderboard = leaderboardData?.data || [];
  const meta = leaderboardData?.meta;
  const currentUserStats = leaderboardData?.currentUser;

  return (
    <div className="relative space-y-8 pb-12">
      {/* Header */}
      <PageHero
        mode="bone"
        icon={Trophy}
        badges={['Global Hostel Leaderboard', 'Real-time Rankings']}
        title="Hostel Leaderboard"
        description="Rankings based on total activity credits earned. Climb the tiers to unlock exclusive hostel discounts."
        actions={
          <Link href="/warden/activity-hub">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Activity Hub
            </Button>
          </Link>
        }
      />

      {/* User Own Highlight Banner */}
      {currentUserStats && (
        <Card className="bg-gradient-to-r from-ghost-lavender/60 via-bone to-ghost-lavender/60 border-periwinkle">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-aubergine text-white flex items-center justify-center font-bold text-lg shrink-0">
                #{currentUserStats.rank || 'N/A'}
              </div>
              <div>
                <p className="font-semibold text-aubergine">
                  Your Current Hostel Position
                </p>
                <p className="text-caption text-fog">
                  {user?.email} • Total Credits: {currentUserStats.credits} pts
                </p>
              </div>
            </div>

            <TierBadge tier={currentUserStats.tier} showDiscount />
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-fog" />
          <span className="text-caption text-fog font-medium">Filter Role:</span>
          {['ALL', 'STUDENT', 'WARDEN', 'STAFF'].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? 'default' : 'outline'}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className="text-xs capitalize"
            >
              {r.toLowerCase()}
            </Button>
          ))}
        </div>

        {meta && (
          <span className="text-caption text-fog">
            Showing {leaderboard.length} of {meta.total} users
          </span>
        )}
      </div>

      {/* Leaderboard Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoadingLeaderboard ? (
            <p className="text-caption text-fog py-12 text-center animate-pulse">
              Fetching leaderboard rankings...
            </p>
          ) : leaderboard.length > 0 ? (
            <div className="divide-y divide-ash">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 p-4 text-caption text-fog font-medium uppercase tracking-wider bg-bone">
                <span className="col-span-2 md:col-span-1">Rank</span>
                <span className="col-span-5 md:col-span-4">User</span>
                <span className="col-span-3 md:col-span-2 text-center">Tier</span>
                <span className="hidden md:block col-span-3">Badges</span>
                <span className="col-span-2 md:col-span-2 text-right">Credits</span>
              </div>

              {/* Rows */}
              {leaderboard.map((item) => {
                const isSelf = item.userId === user?.id;
                return (
                  <motion.div
                    key={item.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'grid grid-cols-12 gap-4 p-4 items-center text-body-sm transition-all',
                      isSelf
                        ? 'bg-[#DCD4FF]/60 border-l-4 border-l-aubergine font-semibold'
                        : 'hover:bg-bone/80',
                    )}
                  >
                    {/* Rank */}
                    <div className="col-span-2 md:col-span-1 flex items-center gap-1.5">
                      <span
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          item.rank === 1
                            ? 'bg-amber-400 text-white shadow-sm'
                            : item.rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-ash text-fog',
                        )}
                      >
                        {item.rank}
                      </span>
                    </div>

                    {/* User */}
                    <div className="col-span-5 md:col-span-4 flex items-center gap-2.5 truncate">
                      <div className="truncate">
                        <p className="text-aubergine font-medium truncate">
                          {item.email.split('@')[0]} {isSelf && '(You)'}
                        </p>
                        <p className="text-[11px] text-fog capitalize">
                          {item.role.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    {/* Tier */}
                    <div className="col-span-3 md:col-span-2 text-center">
                      <TierBadge tier={item.tier} className="text-[10px]" />
                    </div>

                    {/* Badges */}
                    <div className="hidden md:flex col-span-3 items-center gap-1 flex-wrap">
                      {item.achievements && item.achievements.length > 0 ? (
                        item.achievements.map((ach) => (
                          <span
                            key={ach.slug}
                            className="text-base"
                            title={ach.name}
                          >
                            {ach.emoji}
                          </span>
                        ))
                      ) : (
                        <span className="text-caption text-fog">-</span>
                      )}
                    </div>

                    {/* Credits */}
                    <div className="col-span-2 md:col-span-2 text-right">
                      <span className="font-bold text-cornflower-pop text-body-sm">
                        {item.totalCredits} pts
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Users className="mx-auto h-8 w-8 text-fog" />
              <p className="text-caption text-fog">No users found for this filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-caption text-fog">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
