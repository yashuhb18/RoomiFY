'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/useAuthStore';

interface EmojiCipherGridProps {
  isOpen: boolean;
  userId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const EMOJI_OPTIONS = ['🏠', '🌟', '🎯', '💎', '🔥', '⚡', '🚀', '🔑', '🛡️', '👑'];

export function EmojiCipherGrid({
  isOpen,
  userId,
  onSuccess,
  onCancel,
}: EmojiCipherGridProps) {
  const [gridData, setGridData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [chosenEmoji, setChosenEmoji] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/auth/emoji-cipher/challenge?userId=${userId}`);
      setGridData(res.data);
      // Pre-highlight the locked slot
      const locked = res.data.grid?.find((g: any) => g.isLocked);
      if (locked) setSelectedSlot(locked.id);
    } catch (err) {
      toast.error('Failed to load Emoji Cipher challenge.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChallenge();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyPuzzle = async (emoji: string) => {
    setChosenEmoji(emoji);
    setIsVerifying(true);
    try {
      const res = await api.post('/auth/emoji-cipher/verify', {
        userId,
        selectedEmoji: emoji,
        slotIndex: selectedSlot ?? 0,
      });
      toast.success('Emoji Cipher Solved — Access Granted!');
      if (res.data?.accessToken && res.data?.user) {
        useAuthStore.setState({
          user: res.data.user,
          accessToken: res.data.accessToken,
          isAuthenticated: true,
        });
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Incorrect Emoji Cipher solution.');
      setChosenEmoji(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070510]/85 backdrop-blur-2xl font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#120D26]/95 border border-purple-500/30 rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] text-white space-y-6"
      >
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Layer 3 Security · Emoji Cipher
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white pt-1">
            SuperAdmin Visual Puzzle
          </h2>
          <p className="text-xs text-white/60">
            Identify the locked <span className="font-mono text-amber-400">🔒</span> target slot and replace it with your 1st secret emoji!
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#1C1538] border border-[#2E2452] rounded-3xl shadow-inner">
              {gridData?.grid?.map((slot: any) => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`h-20 rounded-2xl text-2xl flex items-center justify-center transition-all border ${
                      slot.isLocked
                        ? 'bg-amber-500/20 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse'
                        : isSelected
                        ? 'bg-purple-600/40 border-purple-400 scale-105'
                        : 'bg-[#120D26] border-[#2E2452] hover:border-purple-500/40'
                    }`}
                  >
                    {slot.isLocked ? (chosenEmoji || '🔒') : slot.emoji}
                  </button>
                );
              })}
            </div>

            {/* Secret Emoji Selector Palette */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-white/70 block text-center uppercase tracking-wider">
                Select Your Secret 1st Emoji
              </label>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleVerifyPuzzle(emoji)}
                    disabled={isVerifying}
                    className="w-11 h-11 rounded-xl bg-[#1C1538] border border-[#2E2452] hover:border-amber-400 text-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#2E2452]">
          <button
            type="button"
            onClick={fetchChallenge}
            className="text-xs text-purple-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Grid
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-white/40 hover:text-white/70 font-medium transition-colors"
            >
              Cancel Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
