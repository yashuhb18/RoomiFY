import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditTier, CreditTxType, Role } from '@prisma/client';

@Injectable()
export class ActivityHubRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Credit Account ────────────────────────────────────────────────

  async findOrCreateAccount(userId: string) {
    return this.prisma.creditAccount.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async getAccountByUserId(userId: string) {
    return this.prisma.creditAccount.findUnique({
      where: { userId },
    });
  }

  async updateAccountBalance(
    accountId: string,
    balance: number,
    totalEarned: number,
    totalSpent: number,
    tier: CreditTier,
  ) {
    return this.prisma.creditAccount.update({
      where: { id: accountId },
      data: { balance, totalEarned, totalSpent, tier },
    });
  }

  // ─── Credit Transactions ──────────────────────────────────────────

  async createTransaction(data: {
    amount: number;
    type: CreditTxType;
    description: string;
    balanceAfter: number;
    accountId: string;
    taskCompletionId?: string;
  }) {
    return this.prisma.creditTransaction.create({ data });
  }

  async getTransactions(
    accountId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          taskCompletion: {
            include: { task: true },
          },
        },
      }),
      this.prisma.creditTransaction.count({ where: { accountId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTransactionsByPeriod(
    accountId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.creditTransaction.aggregate({
      where: {
        accountId,
        type: CreditTxType.EARN,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    });
  }

  // ─── Tasks ────────────────────────────────────────────────────────

  async getAllTasks() {
    return this.prisma.task.findMany({
      where: { isActive: true },
      orderBy: { credits: 'desc' },
    });
  }

  async getTasksByRole(role: Role) {
    // Return tasks for the specific role + tasks for ALL (daily login)
    return this.prisma.task.findMany({
      where: {
        isActive: true,
        OR: [
          { roleTarget: role },
          { slug: 'daily-login' }, // Available to all roles
        ],
      },
      orderBy: { credits: 'desc' },
    });
  }

  async getTaskBySlug(slug: string) {
    return this.prisma.task.findUnique({ where: { slug } });
  }

  // ─── Task Completions ─────────────────────────────────────────────

  async createTaskCompletion(data: {
    userId: string;
    taskId: string;
    status?: string;
  }) {
    return this.prisma.taskCompletion.create({
      data,
      include: { task: true },
    });
  }

  async getLastCompletion(userId: string, taskId: string) {
    return this.prisma.taskCompletion.findFirst({
      where: { userId, taskId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    });
  }

  async getCompletionsByUser(userId: string) {
    return this.prisma.taskCompletion.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  async getCompletionCount(userId: string) {
    return this.prisma.taskCompletion.count({
      where: { userId, status: 'COMPLETED' },
    });
  }

  async getPendingVerifications(hostelId: string) {
    return this.prisma.taskCompletion.findMany({
      where: {
        status: 'PENDING_VERIFICATION',
        user: { hostelId },
      },
      include: {
        task: true,
        user: { select: { id: true, email: true, profile: true } },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  async updateCompletionStatus(
    completionId: string,
    status: string,
    verifiedById?: string,
  ) {
    return this.prisma.taskCompletion.update({
      where: { id: completionId },
      data: {
        status,
        verifiedById,
        verifiedAt: new Date(),
      },
      include: { task: true, user: true },
    });
  }

  // ─── Achievements ─────────────────────────────────────────────────

  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async hasAchievement(userId: string, achievementId: string) {
    const existing = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });
    return !!existing;
  }

  async unlockAchievement(userId: string, achievementId: string) {
    return this.prisma.userAchievement.create({
      data: { userId, achievementId },
      include: { achievement: true },
    });
  }

  // ─── Leaderboard ──────────────────────────────────────────────────

  async getLeaderboard(
    options: {
      role?: Role;
      hostelId?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.role) {
      where.user = { ...where.user, role: options.role };
    }
    if (options.hostelId) {
      where.user = { ...where.user, hostelId: options.hostelId };
    }

    const [data, total] = await Promise.all([
      this.prisma.creditAccount.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              hostelId: true,
              profile: true,
              userAchievements: {
                include: { achievement: true },
              },
            },
          },
        },
        orderBy: { totalEarned: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.creditAccount.count({ where }),
    ]);

    return {
      data: data.map((account, index) => ({
        rank: skip + index + 1,
        userId: account.userId,
        email: account.user.email,
        role: account.user.role,
        hostelId: account.user.hostelId,
        profile: account.user.profile,
        totalCredits: account.totalEarned,
        balance: account.balance,
        tier: account.tier,
        achievements: account.user.userAchievements.map((ua) => ({
          name: ua.achievement.name,
          emoji: ua.achievement.emoji,
          slug: ua.achievement.slug,
        })),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserRank(userId: string, hostelId?: string) {
    // Count how many accounts have more totalEarned than this user
    const account = await this.getAccountByUserId(userId);
    if (!account) return null;

    const where: any = {
      totalEarned: { gt: account.totalEarned },
    };
    if (hostelId) {
      where.user = { hostelId };
    }

    const aheadCount = await this.prisma.creditAccount.count({ where });
    return aheadCount + 1;
  }

  // ─── Seeding ──────────────────────────────────────────────────────

  async upsertTask(data: {
    slug: string;
    name: string;
    description?: string;
    credits: number;
    taskType: 'AUTO' | 'VERIFIED';
    cooldownHours: number;
    roleTarget: Role;
    emoji?: string;
  }) {
    return this.prisma.task.upsert({
      where: { slug: data.slug },
      create: data,
      update: data,
    });
  }

  async upsertAchievement(data: {
    slug: string;
    name: string;
    description?: string;
    emoji: string;
    criteria: any;
  }) {
    return this.prisma.achievement.upsert({
      where: { slug: data.slug },
      create: data,
      update: data,
    });
  }

  // ─── Global Stats (Admin) ─────────────────────────────────────────

  async getGlobalStats() {
    const [
      totalAccounts,
      totalCreditsIssued,
      totalTransactions,
      tierDistribution,
    ] = await Promise.all([
      this.prisma.creditAccount.count(),
      this.prisma.creditAccount.aggregate({ _sum: { totalEarned: true } }),
      this.prisma.creditTransaction.count(),
      this.prisma.creditAccount.groupBy({
        by: ['tier'],
        _count: true,
      }),
    ]);

    return {
      totalAccounts,
      totalCreditsIssued: totalCreditsIssued._sum.totalEarned || 0,
      totalTransactions,
      tierDistribution: tierDistribution.reduce((acc, item) => {
        acc[item.tier] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
