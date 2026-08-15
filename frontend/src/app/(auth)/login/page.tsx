'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Shield,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/logo';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PasswordStrengthMeter } from '@/components/common/PasswordStrengthMeter';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
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

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Default values empty so user can freely enter email & password
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
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
      if (!err.response) {
        setErrorMsg('Network error: Unable to connect to server. Please check your connection.');
        return;
      }
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaState.token || otpCode.length !== 6) return;

    setErrorMsg(null);
    try {
      await validateMfa(mfaState.token, otpCode);
      const loggedInUser = useAuthStore.getState().user;
      let target = redirectPath;
      if (!target || target === '/login') {
        target = loggedInUser?.role === 'WARDEN' || loggedInUser?.role === 'SUPER_ADMIN' ? '/warden' : '/student';
      }
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

  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/api/auth/google/start';
  };

  return (
    <div className="min-h-screen bg-[#EDEAFD]">
      {/* Hero band */}
      <div className="relative overflow-hidden bg-[#3C315B] pt-12 pb-24 px-6 md:px-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-[#AB9FF2]/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[480px] mx-auto text-center space-y-5">
          <div className="flex justify-center pb-2">
            <Logo size="lg" variant="dark" href="/" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[36px] md:text-[48px] font-sans font-bold tracking-tight leading-[1] text-white"
          >
            Welcome back
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-white/70 font-normal"
          >
            Sign in to access your hostel dashboard
          </motion.p>
        </div>
      </div>

      {/* Form card */}
      <div className="relative z-10 max-w-[440px] mx-auto px-4 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-5"
        >
          {/* Quick Sign-In Pills */}
          <div className="rounded-2xl border border-[#E5E4E8] bg-white p-3 flex items-center justify-between gap-2 shadow-sm text-xs font-medium text-[#3C315B]">
            <span className="text-[#3C315B]/60 pl-2">Quick Sign-In:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('student')}
                className="px-3 py-1.5 rounded-xl bg-[#EDEAFD] hover:bg-[#D6CDFE] text-[#3C315B] font-semibold transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" /> Student
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('warden')}
                className="px-3 py-1.5 rounded-xl bg-[#EDEAFD] hover:bg-[#D6CDFE] text-[#3C315B] font-semibold transition-colors flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" /> Warden
              </button>
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-3xl border border-[#E5E4E8] bg-white p-7 md:p-8 space-y-6 shadow-[0_16px_48px_rgba(60,49,91,0.08)]">
            {!mfaState.required ? (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-sans font-bold text-[#3C315B] tracking-tight">
                    Sign in
                  </h2>
                  <p className="text-xs text-[#3C315B]/60 font-normal">
                    Enter your credentials or use Google Single Sign-On
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex flex-col gap-1.5 text-xs text-red-700">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    {errorMsg.toLowerCase().includes('invalid email') && (
                      <Link href="/register" className="text-xs font-bold text-[#6A4FE0] hover:underline ml-6">
                        👉 Don&apos;t have an account yet? Click here to Create One →
                      </Link>
                    )}
                  </div>
                )}

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 rounded-xl bg-white border border-[#E5E4E8] hover:bg-[#FAFAFA] text-[#3C315B] text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-[#E5E4E8] w-full" />
                  <span className="bg-white px-3 text-[11px] text-[#3C315B]/50 uppercase tracking-wider font-semibold absolute">
                    or
                  </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#3C315B]">Email address</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:border-[#AB9FF2] focus:ring-2 focus:ring-[#AB9FF2]/30 text-sm font-medium transition-all"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#3C315B]">Password</label>
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-xs font-semibold text-[#6A4FE0] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="w-full h-11 pl-4 pr-11 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:border-[#AB9FF2] focus:ring-2 focus:ring-[#AB9FF2]/30 text-sm font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3C315B]/40 hover:text-[#3C315B] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {isLoading ? 'Authenticating...' : 'Sign in'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-sans font-bold text-[#3C315B] tracking-tight">
                    Two-Factor Auth
                  </h2>
                  <p className="text-xs text-[#3C315B]/60 font-normal">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleMfaSubmit} className="space-y-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-[#E5E4E8] bg-[#FAFAFA] text-[#3C315B] focus:bg-white focus:border-[#AB9FF2] text-center text-2xl tracking-[0.5em] font-sans font-bold h-14"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              </>
            )}

            {/* Security footer */}
            <div className="pt-2 border-t border-[#E5E4E8] flex items-center justify-center gap-4 text-[10px] text-[#3C315B]/50 font-medium">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Argon2id</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> RLS</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> TOTP</span>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-xs text-[#3C315B]/60 font-normal">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#6A4FE0] hover:text-[#3C315B] font-bold transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotModalOpen} onOpenChange={setIsForgotModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#3C315B]">
              {forgotStep === 1 ? 'Forgot Password — Reset via Email' : 'Enter Verification Code'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              {forgotStep === 1
                ? 'Enter your account email address. We will dispatch a 6-digit verification code directly to your Gmail inbox.'
                : `We sent a 6-digit code to ${forgotEmail}. Enter the code and your new 12+ character password.`}
            </DialogDescription>
          </DialogHeader>

          {forgotStep === 1 ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!forgotEmail) return;
                setIsForgotSubmitting(true);
                try {
                  const res = await api.post('/auth/forgot-password', { email: forgotEmail });
                  toast.success(res.data.message || 'Verification code sent to your email!');
                  setForgotStep(2);
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Failed to dispatch reset code.');
                } finally {
                  setIsForgotSubmitting(false);
                }
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3C315B]">Your Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:border-[#AB9FF2] text-sm font-medium"
                />
              </div>

              <Button type="submit" disabled={isForgotSubmitting} className="w-full bg-[#3C315B] hover:bg-[#2D2447] text-white">
                {isForgotSubmitting ? 'Dispatching Email...' : 'Send Verification Code to Email'}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (forgotNewPassword.length < 12) {
                  toast.error('Password must be at least 12 characters.');
                  return;
                }
                setIsForgotSubmitting(true);
                try {
                  const res = await api.post('/auth/reset-password-with-otp', {
                    email: forgotEmail,
                    otp: forgotOtp,
                    newPassword: forgotNewPassword,
                  });
                  toast.success(res.data.message || 'Password reset successfully!');
                  setIsForgotModalOpen(false);
                  setForgotStep(1);
                  setForgotEmail('');
                  setForgotOtp('');
                  setForgotNewPassword('');
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Failed to reset password. Please check your verification code.');
                } finally {
                  setIsForgotSubmitting(false);
                }
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3C315B]">6-Digit Verification Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  required
                  className="w-full h-11 px-4 font-mono text-center tracking-widest text-lg rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3C315B]">New Password (Min 12 Chars)</label>
                <input
                  type="password"
                  placeholder="Password123!@#"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B]"
                />
                <div className="pt-1">
                  <PasswordStrengthMeter password={forgotNewPassword} />
                </div>
              </div>

              <Button type="submit" disabled={isForgotSubmitting || forgotNewPassword.length < 12} className="w-full bg-[#3C315B] hover:bg-[#2D2447] text-white">
                {isForgotSubmitting ? 'Resetting Password...' : 'Reset Password & Sign In'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="h-16" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EDEAFD] flex items-center justify-center">
        <div className="text-sm text-[#3C315B]/60 font-semibold">Loading...</div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
