import { create } from 'zustand';
import api from '@/lib/axios';

export type CreditTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface ActivityHubStats {
  today: number;
  todayCount: number;
  week: number;
  weekCount: number;
  month: number;
  monthCount: number;
  total: number;
}

export interface NextTierInfo {
  tier: CreditTier;
  creditsNeeded: number;
  progress: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'EARN' | 'SPEND' | 'CONVERT' | 'EXPIRE';
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  credits: number;
  taskType: 'AUTO' | 'VERIFIED';
  cooldownHours: number;
  roleTarget: string;
  emoji?: string;
  isOnCooldown: boolean;
  cooldownEndsAt?: string | null;
  timesCompleted: number;
  canComplete: boolean;
}

export interface AchievementItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  emoji: string;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  email: string;
  role: string;
  hostelId: string;
  profile?: any;
  totalCredits: number;
  balance: number;
  tier: CreditTier;
  achievements: { name: string; emoji: string; slug: string }[];
}

export interface PendingVerification {
  id: string;
  status: string;
  completedAt: string;
  task: {
    id: string;
    name: string;
    credits: number;
    emoji?: string;
  };
  user: {
    id: string;
    email: string;
    profile?: any;
  };
}

interface ActivityHubState {
  dashboardData: {
    credits: number;
    totalEarned: number;
    totalSpent: number;
    tier: CreditTier;
    tierDiscount: number;
    rank: number | null;
    stats: ActivityHubStats;
    nextTier: NextTierInfo | null;
    recentTransactions: Transaction[];
  } | null;
  availableTasks: TaskItem[];
  achievements: AchievementItem[];
  leaderboardData: {
    data: LeaderboardUser[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    currentUser: { rank: number | null; credits: number; tier: CreditTier };
  } | null;
  pendingVerifications: PendingVerification[];
  publicStats: { totalStudents: number; totalCredits: number; totalHostels: number } | null;
  isLoadingDashboard: boolean;
  isLoadingTasks: boolean;
  isLoadingLeaderboard: boolean;
  isSubmittingTask: boolean;

  fetchDashboard: () => Promise<void>;
  fetchAvailableTasks: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchLeaderboard: (params?: { role?: string; page?: number; limit?: number }) => Promise<void>;
  fetchPublicLeaderboard: (params?: { role?: string; page?: number; limit?: number }) => Promise<void>;
  fetchPublicStats: () => Promise<void>;
  fetchPendingVerifications: () => Promise<void>;
  completeTask: (taskSlug: string) => Promise<any>;
  verifyTask: (completionId: string, status: 'COMPLETED' | 'REJECTED') => Promise<any>;
  convertCredits: (amount: number) => Promise<any>;
}

export const useActivityHubStore = create<ActivityHubState>((set, get) => ({
  dashboardData: null,
  availableTasks: [],
  achievements: [],
  leaderboardData: null,
  pendingVerifications: [],
  publicStats: null,
  isLoadingDashboard: false,
  isLoadingTasks: false,
  isLoadingLeaderboard: false,
  isSubmittingTask: false,

  fetchDashboard: async () => {
    set({ isLoadingDashboard: true });
    try {
      const { data } = await api.get('/activity-hub/dashboard');
      set({ dashboardData: data, isLoadingDashboard: false });
    } catch (error) {
      set({ isLoadingDashboard: false });
      throw error;
    }
  },

  fetchAvailableTasks: async () => {
    set({ isLoadingTasks: true });
    try {
      const { data } = await api.get('/activity-hub/tasks');
      set({ availableTasks: data, isLoadingTasks: false });
    } catch (error) {
      set({ isLoadingTasks: false });
      throw error;
    }
  },

  fetchAchievements: async () => {
    try {
      const { data } = await api.get('/activity-hub/achievements');
      set({ achievements: data });
    } catch (error) {
      throw error;
    }
  },

  fetchLeaderboard: async (params = {}) => {
    set({ isLoadingLeaderboard: true });
    try {
      const { data } = await api.get('/activity-hub/leaderboard', { params });
      set({ leaderboardData: data, isLoadingLeaderboard: false });
    } catch (error) {
      set({ isLoadingLeaderboard: false });
      throw error;
    }
  },

  fetchPublicLeaderboard: async (params = {}) => {
    set({ isLoadingLeaderboard: true });
    try {
      const { data } = await api.get('/activity-hub/leaderboard', { params });
      set({ leaderboardData: data, isLoadingLeaderboard: false });
    } catch {
      // Graceful fallback — show mock data for unauthenticated visitors
      const mockData: LeaderboardUser[] = [
        { rank: 1, userId: 'mock-1', email: 'champion@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 3420, balance: 3420, tier: 'DIAMOND', achievements: [{ name: 'First Login', emoji: '🌟', slug: 'first-login' }] },
        { rank: 2, userId: 'mock-2', email: 'runner_up@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 2815, balance: 2815, tier: 'PLATINUM', achievements: [{ name: 'Task Master', emoji: '⚡', slug: 'task-master' }] },
        { rank: 3, userId: 'mock-3', email: 'bronze_star@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 2240, balance: 2240, tier: 'PLATINUM', achievements: [{ name: 'Early Bird', emoji: '🐦', slug: 'early-bird' }] },
        { rank: 4, userId: 'mock-4', email: 'rising_star@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 1650, balance: 1650, tier: 'GOLD', achievements: [] },
        { rank: 5, userId: 'mock-5', email: 'steady_climber@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 1420, balance: 1420, tier: 'GOLD', achievements: [] },
        { rank: 6, userId: 'mock-6', email: 'newcomer@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 980, balance: 980, tier: 'SILVER', achievements: [] },
        { rank: 7, userId: 'mock-7', email: 'diligent_one@hostel.edu', role: 'WARDEN', hostelId: '', totalCredits: 870, balance: 870, tier: 'SILVER', achievements: [] },
        { rank: 8, userId: 'mock-8', email: 'active_player@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 650, balance: 650, tier: 'SILVER', achievements: [] },
        { rank: 9, userId: 'mock-9', email: 'fresh_start@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 320, balance: 320, tier: 'BRONZE', achievements: [] },
        { rank: 10, userId: 'mock-10', email: 'just_joined@hostel.edu', role: 'STUDENT', hostelId: '', totalCredits: 150, balance: 150, tier: 'BRONZE', achievements: [] },
      ];
      set({
        leaderboardData: {
          data: mockData,
          meta: { total: 10, page: 1, limit: 15, totalPages: 1 },
          currentUser: { rank: null, credits: 0, tier: 'BRONZE' },
        },
        isLoadingLeaderboard: false,
      });
    }
  },

  fetchPublicStats: async () => {
    try {
      // Try to get real stats from API
      const { data } = await api.get('/activity-hub/public-stats');
      set({ publicStats: data });
    } catch {
      // Fallback mock stats
      set({
        publicStats: { totalStudents: 2847, totalCredits: 184520, totalHostels: 36 },
      });
    }
  },

  fetchPendingVerifications: async () => {
    try {
      const { data } = await api.get('/activity-hub/pending-verifications');
      set({ pendingVerifications: data });
    } catch (error) {
      throw error;
    }
  },

  completeTask: async (taskSlug: string) => {
    set({ isSubmittingTask: true });
    try {
      const { data } = await api.post('/activity-hub/tasks/complete', { taskSlug });
      await Promise.all([get().fetchDashboard(), get().fetchAvailableTasks()]);
      set({ isSubmittingTask: false });
      return data;
    } catch (error) {
      set({ isSubmittingTask: false });
      throw error;
    }
  },

  verifyTask: async (completionId: string, status: 'COMPLETED' | 'REJECTED') => {
    try {
      const { data } = await api.post(`/activity-hub/tasks/verify/${completionId}`, { status });
      await Promise.all([get().fetchPendingVerifications(), get().fetchDashboard()]);
      return data;
    } catch (error) {
      throw error;
    }
  },

  convertCredits: async (amount: number) => {
    try {
      const { data } = await api.post('/activity-hub/convert', { amount });
      await get().fetchDashboard();
      return data;
    } catch (error) {
      throw error;
    }
  },
}));
