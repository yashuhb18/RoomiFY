'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, ShieldCheck, Key, ArrowRight, Smartphone } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/useAuthStore';

interface PasskeyPromptModalProps {
  isOpen: boolean;
  userId: string;
  userRole: string;
  onSuccess: (res: { requiresEmojiCipher: boolean }) => void;
  onCancel?: () => void;
}

export function PasskeyPromptModal({
  isOpen,
  userId,
  userRole,
  onSuccess,
  onCancel,
}: PasskeyPromptModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleAuthenticatePasskey = async () => {
    setIsVerifying(true);
    try {
      let authCredId: string | undefined = undefined;

      // 1. Invoke native OS WebAuthn Biometric Prompt (Windows Hello / Touch ID / Face ID)
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const authOptRes = await api.post('/auth/passkey/auth-options', { userId });
          const challengeStr = authOptRes.data?.challenge || 'random-challenge-string';
          const challengeBuffer = new TextEncoder().encode(challengeStr);

          const credential: any = await navigator.credentials.get({
            publicKey: {
              challenge: challengeBuffer,
              rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
              userVerification: 'preferred',
            },
          });

          if (credential?.id) {
            authCredId = credential.id;
          }
        } catch (e) {
          // Native WebAuthn prompt fallback
        }
      }

      // 2. Verify Passkey authentication
      const res = await api.post('/auth/passkey/auth-verify', { userId, credentialId: authCredId });
      toast.success('Passkey Biometric Verified!');
      if (res.data?.accessToken && res.data?.user) {
        useAuthStore.setState({
          user: res.data.user,
          accessToken: res.data.accessToken,
          isAuthenticated: true,
        });
      }
      onSuccess({ requiresEmojiCipher: userRole === 'SUPER_ADMIN' });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Passkey verification failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070510]/85 backdrop-blur-2xl font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#120D26]/95 border border-purple-500/30 rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] text-white space-y-6 text-center"
      >
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
            Layer 2 Security · WebAuthn Passkey
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white pt-1">
            Biometric Passkey Required
          </h2>
          <p className="text-xs text-white/60">
            Touch fingerprint sensor, use Face ID, or click the authorization button below to verify {userRole === 'SUPER_ADMIN' ? 'SuperAdmin' : 'Warden'} identity.
          </p>
        </div>

        {/* Animated Fingerprint Sensor Graphic */}
        <div className="py-6 flex justify-center">
          <button
            type="button"
            onClick={handleAuthenticatePasskey}
            disabled={isVerifying}
            className="group relative w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600/30 to-indigo-800/20 border-2 border-purple-400/40 hover:border-purple-400 flex items-center justify-center text-purple-300 transition-all shadow-inner hover:scale-105"
          >
            <Fingerprint className={`w-12 h-12 transition-all ${isVerifying ? 'animate-pulse text-purple-400 scale-110' : 'group-hover:text-white'}`} />
            {isVerifying && (
              <span className="absolute inset-0 rounded-3xl border-2 border-purple-400 animate-ping opacity-30" />
            )}
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1C1538] border border-[#2E2452] flex items-center justify-between text-xs font-semibold text-white/70">
          <span className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-400" /> Platform Authenticator
          </span>
          <span className="text-emerald-400 font-mono">Touch ID / Passkey Ready</span>
        </div>

        <button
          type="button"
          onClick={handleAuthenticatePasskey}
          disabled={isVerifying}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isVerifying ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" /> Click to Authorize Passkey <ArrowRight className="w-4 h-4" />
            </>
          )}
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
      </motion.div>
    </div>
  );
}
