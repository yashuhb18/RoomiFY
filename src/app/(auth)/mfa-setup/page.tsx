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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Multi-Factor Authentication (MFA)</h1>
            <p className="text-sm text-muted-foreground">
              Enhance account security by binding an Authenticator App (Google Authenticator, Authy, etc.)
            </p>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-purple-400" /> Two-Factor Setup Status
              </CardTitle>
              <CardDescription>
                Zero-Trust security requires TOTP verification on all privileged actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
                    status === 'success'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-destructive/15 text-destructive border border-destructive/30'
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
                  <div className="mx-auto h-16 w-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="font-semibold text-base">Activate TOTP Protection</h3>
                    <p className="text-xs text-muted-foreground">
                      Click below to generate your unique TOTP secret and scan the QR code.
                    </p>
                  </div>
                  <Button
                    onClick={startSetup}
                    disabled={status === 'loading'}
                    className="bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    {status === 'loading' ? 'Generating QR Code...' : 'Generate Setup Code'}
                  </Button>
                </div>
              )}

              {qrCodeUrl && status !== 'success' && (
                <div className="grid md:grid-cols-2 gap-8 items-center pt-4">
                  <div className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-card border border-white/5">
                    <div className="relative h-48 w-48 bg-white p-2 rounded-lg shadow-inner">
                      <Image
                        src={qrCodeUrl}
                        alt="MFA QR Code"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {secret && (
                      <p className="font-mono text-xs text-muted-foreground tracking-widest select-all">
                        Secret: {secret}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-purple-400" /> Enter 6-Digit OTP
                      </label>
                      <Input
                        type="text"
                        maxLength={6}
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="font-mono text-center tracking-widest text-lg"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={status === 'loading' || token.length !== 6}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      {status === 'loading' ? 'Verifying...' : 'Activate MFA'}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
