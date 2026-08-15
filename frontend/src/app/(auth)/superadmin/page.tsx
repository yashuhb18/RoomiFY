'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Crown,
  Zap,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/common/logo';
import { toast } from 'sonner';

const superAdminLoginSchema = z.object({
  email: z.string().email('Valid platform owner email required'),
  password: z.string().min(1, 'Password is required'),
});

type SuperAdminLoginForm = z.infer<typeof superAdminLoginSchema>;

function SuperAdminLoginContent() {
  const router = useRouter();
  const { login, validateMfa } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaState, setMfaState] = useState<{ required: boolean; token?: string }>({
    required: false,
  });
  const [otpCode, setOtpCode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SuperAdminLoginForm>({
    resolver: zodResolver(superAdminLoginSchema),
  });

  const onSubmit = async (data: SuperAdminLoginForm) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await login(data.email.trim().toLowerCase(), data.password);

      if (result?.requiresMfa) {
        setMfaState({ required: true, token: result.mfaToken });
        setIsLoading(false);
        return;
      }

      const loggedInUser = useAuthStore.getState().user;
      if (loggedInUser?.role === 'SUPER_ADMIN') {
        toast.success('Welcome to AEGIS Command Hub!');
        router.push('/command-center');
      } else {
        setErrorMsg('Access denied. Super Admin Command Centre requires Platform Owner privilege.');
        useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Invalid super admin credentials. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaState.token || otpCode.length !== 6) return;

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await validateMfa(mfaState.token, otpCode);
      const loggedInUser = useAuthStore.getState().user;
      if (loggedInUser?.role === 'SUPER_ADMIN') {
        toast.success('2FA Verified — Entering Command Hub');
        router.push('/command-center');
      } else {
        setErrorMsg('Access denied. Super Admin Command Centre requires Platform Owner privilege.');
        useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid 2FA verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070510] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-b from-amber-500/15 via-[#6A4FE0]/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] rounded-full bg-[#1D2786]/20 blur-[150px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 p-6 md:px-12 flex items-center justify-between">
        <Logo size="md" variant="dark" href="/" />
        <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono tracking-wider">
          <Crown className="w-3.5 h-3.5 text-amber-400" /> Super Admin Executive Hub
        </span>
      </header>

      {/* Main Login Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[460px]"
        >
          {/* Main Glassmorphism Form Card */}
          <div className="rounded-3xl border border-amber-500/20 bg-[#120D26]/90 backdrop-blur-2xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] space-y-6">
            
            {/* Header Badge & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 text-amber-400 shadow-inner mb-1">
                <Crown className="w-7 h-7" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Super Admin Login
              </h1>
              <p className="text-xs text-white/50">
                AEGIS Platform Owner Executive Command Centre
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {!mfaState.required ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/60">Platform Owner Email</label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="roomify.org@gmail.com"
                    className="h-11 rounded-xl bg-[#1C1538] border-[#2E2452] text-white placeholder:text-white/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs transition-all"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/60">Password</label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      className="h-11 rounded-xl bg-[#1C1538] border-[#2E2452] text-white placeholder:text-white/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#070510] font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#070510]/30 border-t-[#070510] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Authenticate as Super Admin
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <p className="text-xs font-bold text-amber-300">2FA Security Challenge</p>
                  <p className="text-[11px] text-white/60">Enter the 6-digit TOTP code from Google Authenticator</p>
                </div>

                <Input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="h-14 rounded-xl bg-[#1C1538] border-amber-500/40 text-white text-center text-2xl tracking-[0.5em] font-extrabold focus:border-amber-400"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#070510] font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify 2FA & Enter Command Hub'}
                </button>
              </form>
            )}

            {/* Security Badges */}
            <div className="pt-4 border-t border-[#2E2452] flex items-center justify-center gap-3 text-[10px] font-mono text-white/30">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> Argon2id</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-amber-400" /> TOTP 2FA</span>
              <span className="flex items-center gap-1"><KeyRound className="w-3 h-3 text-purple-400" /> JWT HttpOnly</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-white/20 font-mono">
        AEGIS RoomiFY Security Infrastructure • Super Admin Command Console
      </footer>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070510] flex items-center justify-center text-white/40 font-mono text-xs">
        Loading Super Admin Console...
      </div>
    }>
      <SuperAdminLoginContent />
    </Suspense>
  );
}
