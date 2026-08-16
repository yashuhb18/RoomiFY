'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { QrCode, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';

export default function MfaSetupPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const startSetup = async () => {
    setStatus('loading');
    setMessage(null);
    try {
      const { data } = await api.post('/auth/mfa/setup');
      setQrCodeUrl(data.qrCode);
      setSecret(data.secret);
      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to initialize MFA setup.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length !== 6) return;

    setStatus('loading');
    setMessage(null);
    try {
      const { data } = await api.post('/auth/mfa/verify', { token });
      setStatus('success');
      setMessage(data.message || 'MFA has been successfully activated!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Invalid verification code.');
    }
  };

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8]">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
            Zero-Trust Security Enabled
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1 flex items-center gap-2">
          <KeyRound className="h-7 w-7 text-[#6A4FE0]" /> Multi-Factor Authentication (MFA)
        </h1>
        <p className="text-xs text-[#3C315B]/70 max-w-2xl leading-relaxed font-normal">
          Enhance account security by binding an Authenticator App (Google Authenticator, Authy, Microsoft Authenticator, etc.)
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl bg-white p-7 md:p-8 border border-[#E5E4E8] shadow-sm space-y-6 max-w-3xl">
        <div className="border-b border-[#E5E4E8] pb-4">
          <h3 className="text-lg font-bold text-[#3C315B] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#6A4FE0]" /> Two-Factor Setup Status
          </h3>
          <p className="text-xs text-[#3C315B]/60 font-normal mt-0.5">
            Zero-Trust security requires TOTP verification on all privileged actions.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
              status === 'success'
                ? 'bg-[#E6F9F0] text-[#2EC08B] border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        {!qrCodeUrl && status !== 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center">
              <QrCode className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-base text-[#3C315B]">Activate TOTP Protection</h3>
              <p className="text-xs text-[#3C315B]/60 font-normal">
                Click below to generate your unique TOTP secret and scan the QR code.
              </p>
            </div>
            <button
              type="button"
              onClick={startSetup}
              disabled={status === 'loading'}
              className="px-6 py-2.5 rounded-full bg-[#6A4FE0] hover:bg-[#5B3FD1] text-white text-xs font-bold transition-all shadow-md"
            >
              {status === 'loading' ? 'Generating QR Code...' : 'Generate Setup Code'}
            </button>
          </div>
        )}

        {qrCodeUrl && status !== 'success' && (
          <div className="grid md:grid-cols-2 gap-8 items-center pt-2">
            <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8]">
              <div className="relative h-48 w-48 bg-white p-2 rounded-xl border border-[#E5E4E8] shadow-sm">
                <Image
                  src={qrCodeUrl}
                  alt="MFA QR Code"
                  fill
                  className="object-contain"
                />
              </div>
              {secret && (
                <p className="font-mono text-xs text-[#3C315B]/70 tracking-widest select-all pt-1 font-semibold">
                  Secret: {secret}
                </p>
              )}
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-[#6A4FE0]" /> Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-12 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-center font-mono text-xl font-bold tracking-widest text-[#3C315B] focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading' || token.length !== 6}
                className="w-full h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {status === 'loading' ? 'Verifying...' : 'Activate MFA'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
