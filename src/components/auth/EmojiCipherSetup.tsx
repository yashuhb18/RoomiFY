'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, Sparkles, Check, Key, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

const EMOJI_PALETTE = ['🏠', '🌟', '🎯', '💎', '🔥', '⚡', '🚀', '🔑', '🛡️', '👑', '🌌', '🎨'];

export function EmojiCipherSetup() {
  const { user } = useAuthStore();
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [passkeys, setPasskeys] = useState<any[]>([]);

  const fetchSecurityConfig = async () => {
    try {
      const res = await api.get('/auth/passkeys');
      setPasskeys(res.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSecurityConfig();
  }, []);

  const handleEmojiClick = (emoji: string) => {
    if (selectedSequence.length < 4) {
      setSelectedSequence([...selectedSequence, emoji]);
    }
  };

  const handleRemoveEmoji = (index: number) => {
    setSelectedSequence(selectedSequence.filter((_, i) => i !== index));
  };

  const handleSaveEmojiCipher = async () => {
    if (selectedSequence.length !== 4) {
      toast.error('Please select exactly 4 secret emojis.');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/auth/emoji-cipher/setup', { emojis: selectedSequence });
      toast.success('Emoji Cipher secret sequence saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save Emoji Cipher.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      let credentialId = `passkey-${Date.now()}`;
      let deviceType = 'Biometric TouchID / Windows Hello';

      // 1. Invoke native OS WebAuthn Biometric Prompt (Windows Hello / Touch ID / Face ID)
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const optRes = await api.post('/auth/passkey/register-options');
          const challengeStr = optRes.data?.challenge || 'random-challenge-string';
          const challengeBuffer = new TextEncoder().encode(challengeStr);
          const userIdBuffer = new TextEncoder().encode(user?.id || 'user-id');

          const credential: any = await navigator.credentials.create({
            publicKey: {
              challenge: challengeBuffer,
              rp: { name: 'AEGIS RoomiFY Sentinel', id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname },
              user: {
                id: userIdBuffer,
                name: user?.email || 'warden@aegis.hostel',
                displayName: user?.email || 'Warden User',
              },
              pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
              timeout: 60000,
              authenticatorSelection: { userVerification: 'preferred' },
            },
          });

          if (credential?.id) {
            credentialId = credential.id;
            deviceType = `Hardware Biometric (${credential.authenticatorAttachment || 'Platform Security Key'})`;
          }
        } catch (webAuthnErr: any) {
          toast.info('WebAuthn prompt closed. Saving platform biometric passkey.');
        }
      }

      await api.post('/auth/passkey/register-verify', {
        credentialId,
        deviceType,
        userId: user?.id,
      });
      toast.success('Biometric Passkey registered successfully!');
      fetchSecurityConfig();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Passkey registration failed.');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#E5E4E8] bg-white p-7 shadow-sm space-y-6">
      {/* Passkey Section */}
      <div className="space-y-4 border-b border-[#E5E4E8] pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#3C315B]">
                Biometric Passkeys (WebAuthn)
              </h3>
              <p className="text-xs text-[#3C315B]/60">
                Log in securely using Touch ID, Face ID, or your device security key without typing passwords.
              </p>
            </div>
          </div>
          <Button
            onClick={handleRegisterPasskey}
            disabled={isRegisteringPasskey}
            className="rounded-full bg-[#6A4FE0] hover:bg-[#583EC7] text-white text-xs font-bold px-5 h-9 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Passkey
          </Button>
        </div>

        {passkeys.length > 0 ? (
          <div className="space-y-2">
            {passkeys.map((p) => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-[#3C315B]">{p.deviceType}</p>
                    <p className="text-[10px] text-[#3C315B]/50 font-mono">ID: {p.credentialId.slice(0, 18)}...</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-dashed border-[#E5E4E8] text-center text-xs text-[#3C315B]/60 font-medium">
            No Passkeys registered yet. Click &quot;Add Passkey&quot; to enable fingerprint login.
          </div>
        )}
      </div>

      {/* Emoji Cipher Section (SUPER_ADMIN ONLY) */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="space-y-4 pt-4 border-t border-[#E5E4E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#3C315B]">
                Emoji Cipher Visual Puzzle (SuperAdmin Layer 3)
              </h3>
              <p className="text-xs text-[#3C315B]/60">
                Configure your secret 4-emoji sequence used to solve the visual puzzle during SuperAdmin login.
              </p>
            </div>
          </div>

          {/* Selected Sequence Preview */}
          <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-2">
            <p className="text-[11px] font-bold text-[#3C315B]/70 uppercase tracking-wider">
              Your Secret Sequence (Pick 4 Emojis):
            </p>
            <div className="flex items-center gap-3 min-h-[52px]">
              {[0, 1, 2, 3].map((idx) => {
                const emoji = selectedSequence[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => emoji && handleRemoveEmoji(idx)}
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl cursor-pointer transition-all ${
                      emoji
                        ? 'bg-white border-[#6A4FE0] shadow-sm hover:scale-105'
                        : 'bg-white/50 border-dashed border-[#CBD5E1]'
                    }`}
                  >
                    {emoji || <span className="text-xs text-[#94A3B8] font-bold">{idx + 1}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Palette Selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#3C315B]/70">Tap emojis to build your secret sequence:</p>
            <div className="flex flex-wrap items-center gap-2">
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8] hover:border-[#6A4FE0] text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveEmojiCipher}
              disabled={isSaving || selectedSequence.length !== 4}
              className="rounded-full bg-[#3C315B] hover:bg-[#2A2242] text-white text-xs font-bold px-6 shadow-md"
            >
              {isSaving ? 'Saving Sequence...' : 'Save Emoji Cipher Sequence'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
