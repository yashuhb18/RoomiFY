'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { validateMfa } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [mfaState, setMfaState] = useState<{ required: boolean; token?: string }>({ required: false });
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const requiresMfa = searchParams.get('requiresMfa');
    const mfaToken = searchParams.get('mfaToken');
    const requiresProfile = searchParams.get('requiresProfile');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const picture = searchParams.get('picture');

    if (requiresProfile === 'true' && email) {
      router.push(`/onboarding?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}&picture=${encodeURIComponent(picture || '')}`);
      return;
    }

    if (requiresMfa === 'true' && mfaToken) {
      setMfaState({ required: true, token: mfaToken });
      return;
    }

    if (accessToken) {
      // Need to fetch user profile since OAuth returns token in redirect
      api.get('/users/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }).then(res => {
        useAuthStore.setState({
          accessToken,
          user: res.data,
          isAuthenticated: true,
        });
        // Sanitize URL query parameters to prevent token exposure in browser history
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        const target = res.data.role === 'WARDEN' || res.data.role === 'SUPER_ADMIN' ? '/warden' : '/student';
        window.location.href = target;
      }).catch(err => {
        console.error('Failed to fetch profile', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => router.push('/login'), 2000);
      });
    } else if (!requiresMfa) {
      setError('No authentication token received.');
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [searchParams, router]);

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaState.token || otpCode.length !== 6) return;

    setError(null);
    try {
      await validateMfa(mfaState.token, otpCode);
      const loggedInUser = useAuthStore.getState().user;
      const target = loggedInUser?.role === 'WARDEN' || loggedInUser?.role === 'SUPER_ADMIN' ? '/warden' : '/student';
      window.location.href = target;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEAFD] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm">
        {error ? (
          <div className="text-center text-red-500 text-sm font-medium">{error}</div>
        ) : mfaState.required ? (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
             <div className="space-y-1 text-center mb-6">
                <h2 className="text-xl font-bold text-[#3C315B]">Two-Factor Auth</h2>
                <p className="text-xs text-[#3C315B]/50">Enter the 6-digit code from your app</p>
             </div>
             <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full rounded-xl border-[#E5E4E8] bg-[#FAFAFA] focus:bg-white text-center text-2xl tracking-[0.5em] font-bold h-14"
                autoFocus
              />
              <button
                type="submit"
                disabled={otpCode.length !== 6}
                className="w-full h-11 rounded-xl bg-[#3C315B] text-white text-sm font-semibold disabled:opacity-50"
              >
                Verify OTP
              </button>
          </form>
        ) : (
          <div className="text-center text-sm font-medium text-[#3C315B]/50">
            Completing authentication...
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDEAFD] flex items-center justify-center">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
