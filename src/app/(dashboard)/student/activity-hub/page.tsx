'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
  TrendingUp,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActivityHubStore, TaskItem } from '@/store/useActivityHubStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { StatCard } from '@/components/ui/stat-card';
import { TierBadge } from '@/components/ui/tier-badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

export default function StudentActivityHubPage() {
  const { user } = useAuthStore();
  const {
    dashboardData,
    availableTasks,
    achievements,
    leaderboardData,
    isLoadingDashboard,
    isLoadingTasks,
    isSubmittingTask,
    fetchDashboard,
    fetchAvailableTasks,
    fetchAchievements,
    fetchLeaderboard,
    completeTask,
  } = useActivityHubStore();

  useEffect(() => {
    fetchDashboard().catch(() => {});
    fetchAvailableTasks().catch(() => {});
    fetchAchievements().catch(() => {});
    fetchLeaderboard({ limit: 5 }).catch(() => {});
  }, [fetchDashboard, fetchAvailableTasks, fetchAchievements, fetchLeaderboard]);

  const handleClaimTask = async (task: TaskItem) => {
    try {
      const res = await completeTask(task.slug);
      toast.success(res.message || `Claimed ${task.credits} credits!`);
      if (res.tierChanged) {
        toast.success(`🎉 Congratulations! You reached ${res.tier} Tier!`);
      }
      if (res.unlockedAchievements && res.unlockedAchievements.length > 0) {
        res.unlockedAchievements.forEach((ach: any) => {
          toast.success(`🏆 Achievement Unlocked: ${ach.name}!`);
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to claim task.');
    }
  };

  const top5 = leaderboardData?.data.slice(0, 5) || [];
  const currentRank = dashboardData?.rank;

  return (
    <div className="relative space-y-8 pb-12">
      {/* Hero Header */}
      <PageHero
        mode="bone"
        icon={Flame}
        badges={['Gamification Active', 'RoomiFY Activity Hub']}
        title={
          <span className="inline-flex items-center gap-2 flex-wrap">
            Activity Hub & Rewards
            <Sparkles className="h-7 w-7 text-cornflower-pop animate-pulse" />
          </span>
        }
        description="Earn credits by maintaining hostel discipline, completing tasks, and unlock tier discounts & exclusive rewards."
        actions={
          <>
            <Link href="/student/activity-hub/leaderboard">
              <Button size="sm">
                <Trophy className="mr-1.5 h-3.5 w-3.5" /> Full Leaderboard
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchDashboard();
                fetchAvailableTasks();
              }}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh Stats
            </Button>
          </>
        }
      />

      {/* Credit Balance & Tier Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-8 rounded-card bg-gradient-to-r from-[#3C315B] via-[#4A3B73] to-[#3C315B] text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Trophy className="w-80 h-80 text-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          <div className="space-y-2">
            <span className="text-caption uppercase tracking-wider text-ghost-lavender">
              Current Credit Balance
            </span>
            <div className="text-heading-lg font-light tracking-phantom text-white flex items-baseline gap-2">
              <AnimatedCounter value={dashboardData?.credits || 0} />
              <span className="text-body-sm font-normal text-ghost-lavender">PTS</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <TierBadge tier={dashboardData?.tier || 'BRONZE'} showDiscount />
              {currentRank && (
                <Badge variant="outline" className="text-white border-ghost-lavender/40 bg-white/10">
                  Hostel Rank #{currentRank}
                </Badge>
              )}
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="space-y-3 bg-white/10 p-5 rounded-card backdrop-blur-md border border-white/10 md:col-span-2">
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-ghost-lavender font-light">
                Progress to {dashboardData?.nextTier?.tier || 'MAX TIER'}
              </span>
              <span className="font-semibold text-white">
                {dashboardData?.nextTier
                  ? `${dashboardData.nextTier.creditsNeeded} pts needed`
                  : 'Highest Tier Achieved! 🎉'}
              </span>
            </div>

            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dashboardData?.nextTier?.progress || 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-periwinkle via-cornflower-pop to-buttercream rounded-full"
              />
            </div>

            <div className="flex justify-between text-caption text-ghost-lavender/80">
              <span>Current Tier: {dashboardData?.tier} ({dashboardData?.tierDiscount}% Discount)</span>
              <span>
                {dashboardData?.nextTier
                  ? `Next Tier Discount: ${
                      dashboardData.nextTier.tier === 'SILVER'
                        ? '5%'
                        : dashboardData.nextTier.tier === 'GOLD'
                        ? '10%'
                        : dashboardData.nextTier.tier === 'PLATINUM'
                        ? '15%'
                        : '20%'
                    }`
                  : 'Max Marketplace Discount Active'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Breakdown Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Earnings"
          value={`+${dashboardData?.stats?.today || 0}`}
          sublabel={`${dashboardData?.stats?.todayCount || 0} tasks completed`}
          icon={Zap}
          accent="lavender"
          index={0}
        />
        <StatCard
          label="This Week"
          value={`+${dashboardData?.stats?.week || 0}`}
          sublabel={`${dashboardData?.stats?.weekCount || 0} tasks completed`}
          icon={TrendingUp}
          accent="lavender"
          index={1}
        />
        <StatCard
          label="This Month"
          value={`+${dashboardData?.stats?.month || 0}`}
          sublabel={`${dashboardData?.stats?.monthCount || 0} tasks completed`}
          icon={Clock}
          accent="lavender"
          index={2}
        />
        <StatCard
          label="Lifetime Total"
          value={dashboardData?.totalEarned || 0}
          sublabel={`Spent: ${dashboardData?.totalSpent || 0} pts`}
          icon={Trophy}
          accent="lavender"
          index={3}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Tasks Section (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-5 w-5 text-cornflower-pop" /> Available Tasks
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {availableTasks.length} Active Tasks
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {isLoadingTasks ? (
                <p className="text-caption text-fog py-6 text-center animate-pulse">
                  Loading activity hub tasks...
                </p>
              ) : availableTasks.length > 0 ? (
                <div className="grid gap-3">
                  {availableTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 rounded-card bg-bone border border-ash flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-ghost-lavender/50 flex items-center justify-center text-xl shrink-0">
                          {task.emoji || '⭐'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-aubergine text-body-sm">
                              {task.name}
                            </span>
                            <Badge
                              variant={task.taskType === 'VERIFIED' ? 'secondary' : 'outline'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {task.taskType === 'VERIFIED' ? 'Warden Verified' : 'Auto Complete'}
                            </Badge>
                          </div>
                          <p className="text-caption text-fog pt-0.5">{task.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-body-sm font-bold text-cornflower-pop bg-cornflower-pop/10 px-2.5 py-1 rounded-pill">
                          +{task.credits} pts
                        </span>

                        {task.isOnCooldown ? (
                          <Button size="sm" variant="ghost" disabled className="text-caption">
                            <Clock className="mr-1 h-3.5 w-3.5" /> Cooldown
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isSubmittingTask}
                            onClick={() => handleClaimTask(task)}
                          >
                            {task.taskType === 'VERIFIED' ? 'Submit' : 'Claim'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-mint-signal" />
                  <p className="text-caption text-fog">No pending tasks right now. Check back tomorrow!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top 5 Leaderboard Widget (1 Column) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#EAB308]" /> Top 5 Hostel Earners
                </CardTitle>
                <Link
                  href="/student/activity-hub/leaderboard"
                  className="text-caption text-aubergine hover:text-periwinkle inline-flex items-center gap-1 font-light"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5">
              {top5.length > 0 ? (
                top5.map((item) => {
                  const isSelf = item.userId === user?.id;
                  return (
                    <div
                      key={item.userId}
                      className={cn(
                        'p-3 rounded-card border flex items-center justify-between text-body-sm transition-all',
                        isSelf
                          ? 'bg-[#DCD4FF] border-periwinkle font-semibold shadow-sm'
                          : 'bg-bone border-ash hover:border-ghost-lavender',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            item.rank === 1
                              ? 'bg-amber-400 text-white'
                              : item.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : item.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-ash text-fog',
                          )}
                        >
                          {item.rank}
                        </span>
                        <div className="truncate max-w-[130px]">
                          <p className="text-aubergine font-normal truncate">
                            {item.email.split('@')[0]} {isSelf && '(You)'}
                          </p>
                          <TierBadge tier={item.tier} className="text-[9px] py-0 px-1.5" />
                        </div>
                      </div>

                      <span className="font-semibold text-aubergine text-caption">
                        {item.totalCredits} pts
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-caption text-fog text-center py-4">No rankings yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Achievements Carousel/Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-periwinkle" /> Badges & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={cn(
                      'p-2.5 rounded-card border text-center transition-all flex flex-col items-center justify-center gap-1',
                      ach.isUnlocked
                        ? 'bg-ghost-lavender/30 border-periwinkle text-aubergine'
                        : 'bg-bone border-ash opacity-50 grayscale',
                    )}
                    title={ach.description || ach.name}
                  >
                    <span className="text-2xl">{ach.emoji}</span>
                    <span className="text-[11px] font-medium truncate max-w-full">
                      {ach.name}
                    </span>
                    {!ach.isUnlocked && <Lock className="h-3 w-3 text-fog" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
