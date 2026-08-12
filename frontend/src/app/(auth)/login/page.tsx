'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/student';
  const { login, validateMfa, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [mfaState, setMfaState] = useState<{
    required: boolean;
    token?: string;
  }>({ required: false });
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'student@aegis.hostel',
      password: 'Password123!',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMsg(null);
    try {
      const result = await login(values.email, values.password);

      if (result.requiresMfa && result.mfaToken) {
        setMfaState({ required: true, token: result.mfaToken });
      } else {
        const loggedInUser = useAuthStore.getState().user;
        let target = redirectPath;

        if (redirectPath === '/student' || !redirectPath) {
          if (loggedInUser?.role === 'WARDEN' || loggedInUser?.role === 'SUPER_ADMIN') {
            target = '/warden';
          } else {
            target = '/student';
          }
        }

        router.push(target);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Invalid email or password. Please try again.',
      );
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaState.token || otpCode.length !== 6) return;

    setErrorMsg(null);
    try {
      await validateMfa(mfaState.token, otpCode);
      const loggedInUser = useAuthStore.getState().user;
      const target =
        loggedInUser?.role === 'WARDEN' || loggedInUser?.role === 'SUPER_ADMIN'
          ? '/warden'
          : '/student';
      router.push(target);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP code.');
    }
  };

  const setDemoCredentials = (role: 'student' | 'warden') => {
    if (role === 'student') {
      setValue('email', 'student@aegis.hostel');
      setValue('password', 'Password123!');
    } else {
      setValue('email', 'warden@aegis.hostel');
      setValue('password', 'Password123!');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xl">
            <Shield className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ROOMIFY
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Zero-Trust Multi-Tenant Hostel &amp; PG SaaS
          </p>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-zinc-400 px-2 font-mono">Quick Sign-In:</span>
          <button
            type="button"
            onClick={() => setDemoCredentials('student')}
            className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all font-medium flex items-center justify-center gap-1 text-[11px]"
          >
            <UserCheck className="h-3.5 w-3.5" /> Student
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('warden')}
            className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all font-medium flex items-center justify-center gap-1 text-[11px]"
          >
            <Building2 className="h-3.5 w-3.5" /> Warden
          </button>
        </div>

        {/* Card */}
        <Card className="rounded-2xl border border-zinc-800 bg-[#0A0A0A] p-6 space-y-6">
          <CardHeader className="p-0 space-y-1">
            <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
              <span>{mfaState.required ? 'MFA Authentication' : 'Sign In'}</span>
              <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-[10px]">
                Live PostgreSQL
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              {mfaState.required
                ? 'Enter 6-digit authenticator OTP code'
                : 'Enter your credentials to access your dashboard'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!mfaState.required ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Email Address</label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="student@aegis.hostel"
                    className="bg-black border-zinc-800 focus:border-white h-10 text-sm text-white"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Password</label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="bg-black border-zinc-800 focus:border-white h-10 text-sm text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl transition-all"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Authenticator Code</label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="text-center font-mono text-lg tracking-[0.4em] bg-black border-zinc-800 h-11"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP Code'}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="p-0 pt-2 flex justify-center border-t border-zinc-900">
            <div className="text-[10px] text-zinc-500 font-mono flex gap-3">
              <span>Argon2id</span>
              <span>&bull;</span>
              <span>PostgreSQL RLS</span>
              <span>&bull;</span>
              <span>Speakeasy TOTP</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
