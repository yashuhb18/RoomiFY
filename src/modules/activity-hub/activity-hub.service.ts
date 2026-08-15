import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreditTier, CreditTxType, Role } from '@prisma/client';
import { ActivityHubRepository } from './activity-hub.repository';
import { AuditService } from '../audit/audit.service';

// Tier thresholds
const TIER_THRESHOLDS: { tier: CreditTier; min: number }[] = [
  { tier: CreditTier.DIAMOND, min: 5000 },
  { tier: CreditTier.PLATINUM, min: 2000 },
  { tier: CreditTier.GOLD, min: 1000 },
  { tier: CreditTier.SILVER, min: 500 },
  { tier: CreditTier.BRONZE, min: 0 },
];

// Tier discount mapping
const TIER_DISCOUNTS: Record<CreditTier, number> = {
  BRONZE: 0,
  SILVER: 5,
  GOLD: 10,
  PLATINUM: 15,
  DIAMOND: 20,
};

// Warden credit-to-cash conversion table
const CONVERSION_TABLE: { credits: number; cash: number }[] = [
  { credits: 10000, cash: 10000 },
  { credits: 5000, cash: 5000 },
  { credits: 2000, cash: 2500 },
  { credits: 1000, cash: 1000 },
  { credits: 500, cash: 500 },
];

@Injectable()
export class ActivityHubService {
  private readonly logger = new Logger(ActivityHubService.name);

  constructor(
    private readonly repo: ActivityHubRepository,
    private readonly auditService: AuditService,
  ) {}

  // ─── Dashboard ────────────────────────────────────────────────────

  async getDashboard(userId: string, role: string, hostelId: string) {
    const account = await this.repo.findOrCreateAccount(userId);
    const now = new Date();

    // Calculate period stats
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayStats, weekStats, monthStats, recentTransactions, rank] =
      await Promise.all([
        this.repo.getTransactionsByPeriod(account.id, todayStart, now),
        this.repo.getTransactionsByPeriod(account.id, weekStart, now),
        this.repo.getTransactionsByPeriod(account.id, monthStart, now),
        this.repo.getTransactions(account.id, 1, 5),
        this.repo.getUserRank(userId, hostelId),
      ]);

    // Calculate next tier
    const currentTierIndex = TIER_THRESHOLDS.findIndex(
      (t) => t.tier === account.tier,
    );
    const nextTier =
      currentTierIndex > 0 ? TIER_THRESHOLDS[currentTierIndex - 1] : null;

    return {
      credits: account.balance,
      totalEarned: account.totalEarned,
      totalSpent: account.totalSpent,
      tier: account.tier,
      tierDiscount: TIER_DISCOUNTS[account.tier],
      rank,
      stats: {
        today: todayStats._sum.amount || 0,
        todayCount: todayStats._count,
        week: weekStats._sum.amount || 0,
        weekCount: weekStats._count,
        month: monthStats._sum.amount || 0,
        monthCount: monthStats._count,
        total: account.totalEarned,
      },
      nextTier: nextTier
        ? {
            tier: nextTier.tier,
            creditsNeeded: nextTier.min - account.totalEarned,
            progress: Math.min(
              100,
              Math.round((account.totalEarned / nextTier.min) * 100),
            ),
          }
        : null,
      recentTransactions: recentTransactions.data,
    };
  }

  // ─── Tasks ────────────────────────────────────────────────────────

  async getAvailableTasks(userId: string, role: string) {
    const tasks = await this.repo.getTasksByRole(role as Role);
    const completions = await this.repo.getCompletionsByUser(userId);

    const now = new Date();

    return tasks.map((task) => {
      const lastCompletion = completions.find(
        (c) => c.taskId === task.id && c.status === 'COMPLETED',
      );
      const cooldownEnd = lastCompletion
        ? new Date(
            new Date(lastCompletion.completedAt).getTime() +
              task.cooldownHours * 60 * 60 * 1000,
          )
        : null;
      const isOnCooldown = cooldownEnd ? now < cooldownEnd : false;
      const timesCompleted = completions.filter(
        (c) => c.taskId === task.id && c.status === 'COMPLETED',
      ).length;

      return {
        ...task,
        isOnCooldown,
        cooldownEndsAt: isOnCooldown ? cooldownEnd : null,
        timesCompleted,
        canComplete: !isOnCooldown,
      };
    });
  }

  async completeTask(userId: string, taskSlug: string, role: string, hostelId: string) {
    const task = await this.repo.getTaskBySlug(taskSlug);
    if (!task) {
      throw new NotFoundException(`Task "${taskSlug}" not found.`);
    }
    if (!task.isActive) {
      throw new BadRequestException('This task is currently disabled.');
    }

    // Validate role target (daily-login is for all)
    if (task.slug !== 'daily-login' && task.roleTarget !== role) {
      throw new ForbiddenException('This task is not available for your role.');
    }

    // Check cooldown
    const lastCompletion = await this.repo.getLastCompletion(userId, task.id);
    if (lastCompletion) {
      const cooldownEnd = new Date(
        new Date(lastCompletion.completedAt).getTime() +
          task.cooldownHours * 60 * 60 * 1000,
      );
      if (new Date() < cooldownEnd) {
        const remainingMs = cooldownEnd.getTime() - Date.now();
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
        throw new BadRequestException(
          `Task on cooldown. Try again in ${remainingHours} hour(s).`,
        );
      }
    }

    // For VERIFIED tasks, create a pending completion
    if (task.taskType === 'VERIFIED') {
      const completion = await this.repo.createTaskCompletion({
        userId,
        taskId: task.id,
        status: 'PENDING_VERIFICATION',
      });

      await this.auditService.log({
        action: 'TASK_SUBMITTED_FOR_VERIFICATION',
        newValue: { task: task.name, credits: task.credits },
        hostelId,
        userId,
      });

      return {
        message: `Task "${task.name}" submitted for warden verification.`,
        completion,
        creditsAwarded: 0,
        pendingVerification: true,
      };
    }

    // For AUTO tasks, complete immediately and award credits
    return this.awardCreditsForTask(userId, task, hostelId);
  }

  async verifyTask(
    wardenId: string,
    completionId: string,
    status: 'COMPLETED' | 'REJECTED',
    hostelId: string,
  ) {
    const completion = await this.repo.updateCompletionStatus(
      completionId,
      status,
      wardenId,
    );

    if (status === 'COMPLETED') {
      // Award credits
      const result = await this.awardCreditsForTask(
        completion.userId,
        completion.task,
        hostelId,
      );

      await this.auditService.log({
        action: 'TASK_VERIFIED',
        newValue: {
          task: completion.task.name,
          student: completion.user.email,
          credits: completion.task.credits,
        },
        hostelId,
        userId: wardenId,
      });

      return result;
    }

    await this.auditService.log({
      action: 'TASK_REJECTED',
      newValue: {
        task: completion.task.name,
        student: completion.user.email,
      },
      hostelId,
      userId: wardenId,
    });

    return { message: `Task "${completion.task.name}" rejected.`, completion };
  }

  private async awardCreditsForTask(
    userId: string,
    task: { id: string; name: string; credits: number },
    hostelId: string,
  ) {
    const account = await this.repo.findOrCreateAccount(userId);
    const newBalance = account.balance + task.credits;
    const newTotalEarned = account.totalEarned + task.credits;
    const newTier = this.calculateTier(newTotalEarned);

    // Create completion record (for auto tasks)
    const completion = await this.repo.createTaskCompletion({
      userId,
      taskId: task.id,
      status: 'COMPLETED',
    });

    // Create transaction
    await this.repo.createTransaction({
      amount: task.credits,
      type: CreditTxType.EARN,
      description: `Earned from: ${task.name}`,
      balanceAfter: newBalance,
      accountId: account.id,
      taskCompletionId: completion.id,
    });

    // Update account
    await this.repo.updateAccountBalance(
      account.id,
      newBalance,
      newTotalEarned,
      account.totalSpent,
      newTier,
    );

    // Check achievements
    const unlockedAchievements = await this.checkAchievements(
      userId,
      newTotalEarned,
      newTier,
    );

    const tierChanged = newTier !== account.tier;

    if (tierChanged) {
      await this.auditService.log({
        action: 'TIER_PROMOTED',
        newValue: { from: account.tier, to: newTier, totalEarned: newTotalEarned },
        hostelId,
        userId,
      });
    }

    return {
      message: `Earned ${task.credits} credits for "${task.name}"!`,
      creditsAwarded: task.credits,
      newBalance,
      tier: newTier,
      tierChanged,
      previousTier: tierChanged ? account.tier : undefined,
      unlockedAchievements,
      completion,
    };
  }

  // ─── Achievements ─────────────────────────────────────────────────

  async getAchievements(userId: string) {
    const [allAchievements, userAchievements] = await Promise.all([
      this.repo.getAllAchievements(),
      this.repo.getUserAchievements(userId),
    ]);

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return allAchievements.map((achievement) => ({
      ...achievement,
      isUnlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find(
        (ua) => ua.achievementId === achievement.id,
      )?.unlockedAt,
    }));
  }

  private async checkAchievements(
    userId: string,
    totalEarned: number,
    tier: CreditTier,
  ) {
    const allAchievements = await this.repo.getAllAchievements();
    const completionCount = await this.repo.getCompletionCount(userId);
    const unlocked: { name: string; emoji: string }[] = [];

    for (const achievement of allAchievements) {
      const alreadyHas = await this.repo.hasAchievement(
        userId,
        achievement.id,
      );
      if (alreadyHas) continue;

      const criteria = achievement.criteria as any;
      let earned = false;

      switch (criteria.type) {
        case 'credits_total':
          earned = totalEarned >= criteria.threshold;
          break;
        case 'tasks_count':
          earned = completionCount >= criteria.threshold;
          break;
        case 'tier_reached':
          earned = tier === criteria.tier;
          break;
        case 'leaderboard_top':
          const rank = await this.repo.getUserRank(userId);
          earned = rank !== null && rank <= criteria.threshold;
          break;
      }

      if (earned) {
        await this.repo.unlockAchievement(userId, achievement.id);
        unlocked.push({ name: achievement.name, emoji: achievement.emoji });
      }
    }

    return unlocked;
  }

  // ─── Leaderboard ──────────────────────────────────────────────────

  async getLeaderboard(
    userId: string,
    hostelId: string,
    options: {
      role?: Role;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const leaderboard = await this.repo.getLeaderboard({
      ...options,
      hostelId,
    });
    const userRank = await this.repo.getUserRank(userId, hostelId);
    const userAccount = await this.repo.getAccountByUserId(userId);

    return {
      ...leaderboard,
      currentUser: {
        rank: userRank,
        credits: userAccount?.totalEarned || 0,
        tier: userAccount?.tier || CreditTier.BRONZE,
      },
    };
  }

  // ─── Transactions ─────────────────────────────────────────────────

  async getTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const account = await this.repo.findOrCreateAccount(userId);
    return this.repo.getTransactions(account.id, page, limit);
  }

  // ─── Stats ────────────────────────────────────────────────────────

  async getStats(userId: string) {
    const account = await this.repo.findOrCreateAccount(userId);
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.repo.getTransactionsByPeriod(account.id, todayStart, now),
      this.repo.getTransactionsByPeriod(account.id, weekStart, now),
      this.repo.getTransactionsByPeriod(account.id, monthStart, now),
    ]);

    return {
      today: todayStats._sum.amount || 0,
      todayCount: todayStats._count,
      week: weekStats._sum.amount || 0,
      weekCount: weekStats._count,
      month: monthStats._sum.amount || 0,
      monthCount: monthStats._count,
      total: account.totalEarned,
      balance: account.balance,
    };
  }

  // ─── Warden Bonus Conversion ──────────────────────────────────────

  async convertCredits(wardenId: string, amount: number, hostelId: string) {
    if (amount < 500) {
      throw new BadRequestException('Minimum 500 credits required for conversion.');
    }

    const account = await this.repo.findOrCreateAccount(wardenId);
    if (account.balance < amount) {
      throw new BadRequestException(
        `Insufficient credits. You have ${account.balance} credits.`,
      );
    }

    // Find matching conversion tier
    const conversion = CONVERSION_TABLE.find((c) => amount >= c.credits);
    if (!conversion) {
      throw new BadRequestException('Invalid conversion amount.');
    }

    // Calculate proportional cash value
    const cashValue = Math.floor((amount / conversion.credits) * conversion.cash);

    const newBalance = account.balance - amount;
    const newTotalSpent = account.totalSpent + amount;

    // Create transaction
    await this.repo.createTransaction({
      amount: -amount,
      type: CreditTxType.CONVERT,
      description: `Converted ${amount} credits to ₹${cashValue}`,
      balanceAfter: newBalance,
      accountId: account.id,
    });

    // Update account
    await this.repo.updateAccountBalance(
      account.id,
      newBalance,
      account.totalEarned,
      newTotalSpent,
      account.tier,
    );

    await this.auditService.log({
      action: 'CREDITS_CONVERTED',
      newValue: { credits: amount, cashValue, newBalance },
      hostelId,
      userId: wardenId,
    });

    return {
      message: `Successfully converted ${amount} credits to ₹${cashValue}.`,
      creditsDeducted: amount,
      cashValue,
      newBalance,
    };
  }

  async getConversionHistory(wardenId: string) {
    const account = await this.repo.getAccountByUserId(wardenId);
    if (!account) return { data: [] };

    const transactions = await this.repo.getTransactions(account.id, 1, 50);
    return {
      data: transactions.data.filter((t) => t.type === CreditTxType.CONVERT),
    };
  }

  // ─── Pending Verifications (Warden) ───────────────────────────────

  async getPendingVerifications(hostelId: string) {
    return this.repo.getPendingVerifications(hostelId);
  }

  // ─── Seeding ──────────────────────────────────────────────────────

  async seedTasksAndAchievements() {
    const tasks = [
      // Student AUTO tasks
      { slug: 'daily-login', name: 'Daily Login', description: 'Log in to RoomiFY', credits: 5, taskType: 'AUTO' as const, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '📱' },
      { slug: 'pay-fees', name: 'Pay Hostel Fees', description: 'Complete a fee payment', credits: 50, taskType: 'AUTO' as const, cooldownHours: 720, roleTarget: Role.STUDENT, emoji: '💰' },
      { slug: 'report-maintenance', name: 'Report Maintenance', description: 'Submit a maintenance ticket', credits: 10, taskType: 'AUTO' as const, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '🔧' },
      { slug: '7-day-attendance', name: '7-Day Attendance', description: 'Maintain 7-day attendance streak', credits: 15, taskType: 'AUTO' as const, cooldownHours: 168, roleTarget: Role.STUDENT, emoji: '📅' },
      { slug: 'zero-complaints', name: 'Zero Complaints Month', description: 'No complaints for 30 days', credits: 20, taskType: 'AUTO' as const, cooldownHours: 720, roleTarget: Role.STUDENT, emoji: '✨' },
      { slug: 'submit-feedback', name: 'Submit Feedback', description: 'Provide hostel feedback', credits: 5, taskType: 'AUTO' as const, cooldownHours: 168, roleTarget: Role.STUDENT, emoji: '📝' },
      { slug: 'good-behavior-30d', name: 'Good Behavior (30 Days)', description: 'Maintain good behavior for 30 days', credits: 100, taskType: 'AUTO' as const, cooldownHours: 720, roleTarget: Role.STUDENT, emoji: '🌟' },
      { slug: 'refer-friend', name: 'Refer a Friend', description: 'Refer a friend to the hostel', credits: 100, taskType: 'AUTO' as const, cooldownHours: 0, roleTarget: Role.STUDENT, emoji: '🤝' },

      // Student VERIFIED tasks
      { slug: 'clean-room', name: 'Clean Room Inspection', description: 'Pass a room cleanliness inspection', credits: 25, taskType: 'VERIFIED' as const, cooldownHours: 168, roleTarget: Role.STUDENT, emoji: '🧹' },
      { slug: 'help-student', name: 'Help Another Student', description: 'Help a fellow student', credits: 30, taskType: 'VERIFIED' as const, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '🤗' },
      { slug: 'participate-event', name: 'Participate in Event', description: 'Participate in a hostel event', credits: 20, taskType: 'VERIFIED' as const, cooldownHours: 24, roleTarget: Role.STUDENT, emoji: '🎉' },
      { slug: 'join-committee', name: 'Join Hostel Committee', description: 'Join the hostel committee', credits: 200, taskType: 'VERIFIED' as const, cooldownHours: 8760, roleTarget: Role.STUDENT, emoji: '🏛️' },

      // Warden AUTO tasks
      { slug: 'approve-listing', name: 'Approve Listing', description: 'Approve a marketplace listing', credits: 10, taskType: 'AUTO' as const, cooldownHours: 1, roleTarget: Role.WARDEN, emoji: '✅' },
      { slug: 'verify-clean-room', name: 'Verify Clean Room', description: 'Verify a student room inspection', credits: 5, taskType: 'AUTO' as const, cooldownHours: 1, roleTarget: Role.WARDEN, emoji: '🔍' },
      { slug: 'resolve-complaint', name: 'Resolve Complaint', description: 'Resolve a student complaint', credits: 20, taskType: 'AUTO' as const, cooldownHours: 1, roleTarget: Role.WARDEN, emoji: '🛠️' },
      { slug: 'maintain-cleanliness', name: 'Maintain Cleanliness >90%', description: 'Keep hostel cleanliness above 90%', credits: 50, taskType: 'AUTO' as const, cooldownHours: 720, roleTarget: Role.WARDEN, emoji: '🏠' },
      { slug: 'student-satisfaction', name: 'Student Satisfaction >80%', description: 'Achieve >80% student satisfaction', credits: 100, taskType: 'AUTO' as const, cooldownHours: 720, roleTarget: Role.WARDEN, emoji: '😊' },
      { slug: 'organize-event', name: 'Organize Event', description: 'Organize a hostel event', credits: 100, taskType: 'AUTO' as const, cooldownHours: 168, roleTarget: Role.WARDEN, emoji: '🎪' },
      { slug: 'submit-report', name: 'Submit Report', description: 'Submit a hostel report', credits: 50, taskType: 'AUTO' as const, cooldownHours: 168, roleTarget: Role.WARDEN, emoji: '📊' },
      { slug: 'warden-daily-attendance', name: 'Daily Attendance', description: 'Mark daily attendance', credits: 5, taskType: 'AUTO' as const, cooldownHours: 24, roleTarget: Role.WARDEN, emoji: '📋' },
      { slug: 'good-performance-3m', name: 'Good Performance (3 Months)', description: 'Maintain good performance for 3 months', credits: 200, taskType: 'AUTO' as const, cooldownHours: 2160, roleTarget: Role.WARDEN, emoji: '🏅' },
    ];

    const achievements = [
      { slug: 'streak-7', name: '7-Day Streak', description: 'Log in for 7 consecutive days', emoji: '🔥', criteria: { type: 'tasks_count', threshold: 7 } },
      { slug: 'tasks-50', name: '50 Tasks Complete', description: 'Complete 50 tasks', emoji: '⭐', criteria: { type: 'tasks_count', threshold: 50 } },
      { slug: 'tasks-100', name: '100 Tasks Complete', description: 'Complete 100 tasks', emoji: '💪', criteria: { type: 'tasks_count', threshold: 100 } },
      { slug: 'credits-500', name: '500 Credits Earned', description: 'Earn a total of 500 credits', emoji: '🏆', criteria: { type: 'credits_total', threshold: 500 } },
      { slug: 'credits-1000', name: '1000 Credits Earned', description: 'Earn a total of 1000 credits', emoji: '🌟', criteria: { type: 'credits_total', threshold: 1000 } },
      { slug: 'diamond-tier', name: 'Diamond Tier', description: 'Reach Diamond tier', emoji: '👑', criteria: { type: 'tier_reached', tier: 'DIAMOND' } },
      { slug: 'top-5', name: 'Top 5 Leaderboard', description: 'Reach top 5 on the leaderboard', emoji: '🏅', criteria: { type: 'leaderboard_top', threshold: 5 } },
    ];

    for (const task of tasks) {
      await this.repo.upsertTask(task);
    }

    for (const achievement of achievements) {
      await this.repo.upsertAchievement(achievement);
    }

    return {
      message: 'Tasks and achievements seeded successfully.',
      tasksCount: tasks.length,
      achievementsCount: achievements.length,
    };
  }

  // ─── Admin Stats ──────────────────────────────────────────────────

  async getGlobalStats() {
    return this.repo.getGlobalStats();
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private calculateTier(totalEarned: number): CreditTier {
    for (const { tier, min } of TIER_THRESHOLDS) {
      if (totalEarned >= min) return tier;
    }
    return CreditTier.BRONZE;
  }
}
