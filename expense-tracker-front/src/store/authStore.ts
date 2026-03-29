'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  getRefreshToken: () => string | null;
}

const REFRESH_KEY = 'refresh_token';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(REFRESH_KEY, refreshToken);
          document.cookie = 'isLoggedIn=1; path=/; SameSite=Lax';
        }
        set({ user, accessToken });
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(REFRESH_KEY);
          document.cookie = 'isLoggedIn=; path=/; max-age=0';
        }
        set({ user: null, accessToken: null });
      },
      getRefreshToken: () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_KEY);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
);
