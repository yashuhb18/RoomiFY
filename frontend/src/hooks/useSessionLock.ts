'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes

export function useSessionLock() {
  const { user, isAuthenticated } = useAuthStore();
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const isPrivilegedUser = isAuthenticated && (user?.role === 'WARDEN' || user?.role === 'SUPER_ADMIN');

  const lockSession = useCallback(() => {
    if (isPrivilegedUser) {
      setIsLocked(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aegis_session_locked', 'true');
      }
    }
  }, [isPrivilegedUser]);

  const unlockSession = useCallback(() => {
    setIsLocked(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aegis_session_locked');
    }
  }, []);

  useEffect(() => {
    if (!isPrivilegedUser) return;

    // Check existing lock flag
    if (typeof window !== 'undefined' && sessionStorage.getItem('aegis_session_locked') === 'true') {
      setIsLocked(true);
    }

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lockSession();
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isPrivilegedUser, lockSession]);

  return { isLocked, unlockSession, lockSession };
}
