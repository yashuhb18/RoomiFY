'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Clock,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActivityHubStore, TaskItem } from '@/store/useActivityHubStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { StatCard } from '@/components/ui/stat-card';
import { TierBadge } from '@/components/ui/tier-badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Input } from '@/components/ui/input';

export default function WardenActivityHubPage() {
  const {
    dashboardData,
    availableTasks,
    pendingVerifications,
    isLoadingDashboard,
    isLoadingTasks,
    isSubmittingTask,
    fetchDashboard,
    fetchAvailableTasks,
    fetchPendingVerifications,
    completeTask,
    verifyTask,
    convertCredits,
  } = useActivityHubStore();

  const [convertAmount, setConvertAmount] = useState<number>(500);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboard().catch(() => {});
    fetchAvailableTasks().catch(() => {});
    fetchPendingVerifications().catch(() => {});
  }, [fetchDashboard, fetchAvailableTasks, fetchPendingVerifications]);

  const handleClaimTask = async (task: TaskItem) => {
    try {
      const res = await completeTask(task.slug);
      toast.success(res.message || `Claimed ${task.credits} credits!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to claim task.');
    }
  };

  const handleVerifyStudentTask = async (
    completionId: string,
    status: 'COMPLETED' | 'REJECTED',
  ) => {
    try {
      const res = await verifyTask(completionId, status);
      toast.success(res.message || `Task ${status.toLowerCase()}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed.');
    }
  };

  const handleCashConversion = async () => {
    if (convertAmount < 500) {
      toast.error('Minimum 500 credits required.');
      return;
    }
    setIsConverting(true);
    try {
      const res = await convertCredits(convertAmount);
      toast.success(res.message || `Converted ${convertAmount} credits to cash!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Conversion failed.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="relative space-y-8 pb-12">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
              Warden Console
            </span>
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
              Activity &amp; Bonus Hub
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1 flex items-center gap-2">
            <Flame className="h-7 w-7 text-[#6A4FE0]" /> Warden Activity Hub &amp; Bonus System
          </h1>
          <p className="text-sm text-[#3C315B]/80 max-w-xl leading-relaxed font-medium">
            Verify student task submissions, complete management goals, and convert your credits to real cash bonuses.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/warden/activity-hub/leaderboard">
            <button
              type="button"
              className="px-4 py-2.5 rounded-full bg-white text-[#3C315B] font-semibold text-sm border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm"
            >
              <Trophy className="w-4 h-4 text-[#6A4FE0]" /> Leaderboard
            </button>
          </Link>
          <button
            type="button"
            onClick={() => {
              fetchDashboard();
              fetchAvailableTasks();
              fetchPendingVerifications();
            }}
            className="px-5 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white text-sm font-bold transition-all shadow-md flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Desk
          </button>
        </div>
      </div>

      {/* Credit Balance & Cash Conversion Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-8 rounded-card bg-gradient-to-r from-[#3C315B] via-[#2E2447] to-[#3C315B] text-white shadow-xl relative overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          <div className="space-y-2">
            <span className="text-caption uppercase tracking-wider text-ghost-lavender">
              Warden Credit Balance
            </span>
            <div className="text-heading-lg font-light tracking-phantom text-white flex items-baseline gap-2">
              <AnimatedCounter value={dashboardData?.credits || 0} />
              <span className="text-body-sm font-normal text-ghost-lavender">PTS</span>
            </div>
            <TierBadge tier={dashboardData?.tier || 'BRONZE'} showDiscount />
          </div>

          {/* Bonus Cash Conversion Card */}
          <div className="bg-white/10 p-5 rounded-card backdrop-blur-md border border-white/10 md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-semibold">
                <IndianRupee className="h-5 w-5 text-mint-signal" /> Warden Cash Bonus Conversion
              </div>
              <Badge variant="outline" className="text-white border-ghost-lavender/40">
                Min 500 PTS = ₹500
              </Badge>
            </div>

            <p className="text-caption text-ghost-lavender/80">
              Convert your earned management credits directly into cash bonuses: 500 = ₹500, 1000 = ₹1000, 2000 = ₹2500, 5000 = ₹5000, 10000 = ₹10000.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Input
                type="number"
                min={500}
                step={100}
                value={convertAmount}
                onChange={(e) => setConvertAmount(Number(e.target.value))}
                className="max-w-[160px] bg-white/20 text-white border-white/30 placeholder:text-white/50"
              />
              <Button
                size="sm"
                variant="default"
                disabled={isConverting || (dashboardData?.credits || 0) < convertAmount}
                onClick={handleCashConversion}
                className="bg-mint-signal hover:bg-mint-signal/80 text-white"
              >
                <IndianRupee className="mr-1 h-3.5 w-3.5" /> Convert to Cash
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid: Warden Tasks & Pending Verifications */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Warden Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cornflower-pop" /> Warden Management Tasks
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {availableTasks.length} Available
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {isLoadingTasks ? (
                <p className="text-caption text-fog py-6 text-center animate-pulse">
                  Loading tasks...
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
                          {task.emoji || '📋'}
                        </div>
                        <div>
                          <span className="font-semibold text-aubergine text-body-sm">
                            {task.name}
                          </span>
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
                            Claim
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-mint-signal" />
                  <p className="text-caption text-fog">All warden tasks completed!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Student Task Verifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-mint-signal" /> Student Verification Queue
                </CardTitle>
                <Badge variant="warning" className="text-xs">
                  {pendingVerifications.length} Pending
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {pendingVerifications.length > 0 ? (
                pendingVerifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-card bg-bone border border-ash space-y-2 text-caption"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-aubergine">
                        {item.user?.email?.split('@')[0]}
                      </span>
                      <span className="text-cornflower-pop font-bold">
                        +{item.task?.credits} pts
                      </span>
                    </div>

                    <p className="text-fog">
                      Task: <span className="text-aubergine font-medium">{item.task?.name}</span>
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        className="w-full bg-mint-signal hover:bg-mint-signal/80 text-white text-xs h-7"
                        onClick={() => handleVerifyStudentTask(item.id, 'COMPLETED')}
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Approve (+5 Warden Pts)
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs h-7"
                        onClick={() => handleVerifyStudentTask(item.id, 'REJECTED')}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-mint-signal" />
                  <p className="text-caption text-fog">No student tasks awaiting verification.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
