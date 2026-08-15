import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/axios';

interface User {
  id: string;
  email: string;
  role: string;
  hostelId: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;

  login: (email: string, password: string) => Promise<{
    requiresMfa: boolean;
    mfaToken?: string;
  }>;

  validateMfa: (mfaToken: string, otpToken: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });

          if (data.requiresMfa) {
            set({ isLoading: false });
            return { requiresMfa: true, mfaToken: data.mfaToken };
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { requiresMfa: false };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      validateMfa: async (mfaToken: string, otpToken: string) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/mfa/validate', {
            mfaToken,
            token: otpToken,
          });

          set({
            user: data.user,
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refresh: async () => {
        try {
          const { data } = await api.post('/auth/refresh');
          set({ accessToken: data.accessToken });
        } catch {
          get().logout();
        }
      },

      logout: () => {
        // Call backend to clear HTTP-only cookie
        api.post('/auth/logout').catch(() => {});

        // Clear Zustand state & localStorage
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
