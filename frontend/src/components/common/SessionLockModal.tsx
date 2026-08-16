'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

interface SessionLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

export function SessionLockModal({ isOpen, onUnlock }: SessionLockModalProps) {
  const { user } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      await api.post('/auth/step-up-verify', { password });
      toast.success('Session Unlocked — Welcome back!');
      setPassword('');
      onUnlock();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Incorrect password. Access denied.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070510]/80 backdrop-blur-2xl font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#120D26]/95 border border-purple-500/30 rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] text-white space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-800/10 border border-purple-400/30 text-purple-300 shadow-inner mb-1">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Console Inactivity Lock
          </h2>
          <p className="text-xs text-white/60">
            AEGIS Sentinel auto-locked your console due to 10 minutes of inactivity.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1C1538] border border-[#2E2452] flex items-center justify-between text-xs font-semibold">
          <span className="text-white/60">Active Account:</span>
          <span className="text-purple-300 font-bold">{user?.email || 'Warden'}</span>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/70">Enter Password to Resume</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 px-4 rounded-xl bg-[#1C1538] border border-[#2E2452] text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-purple-400 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !password}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" /> Unlock Console <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
