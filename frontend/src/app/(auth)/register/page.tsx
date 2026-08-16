'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import api from '@/lib/axios';
import { Logo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  hostelId: z.string().optional(),
  sleepSchedule: z.string().default('early_bird'),
  cleanliness: z.string().default('very_clean'),
  studyStyle: z.string().default('silent'),
  smoking: z.string().default('non_smoker'),
  music: z.string().default('headphones'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sleepSchedule: 'early_bird',
      cleanliness: 'very_clean',
      studyStyle: 'silent',
      smoking: 'non_smoker',
      music: 'headphones',
    },
  });

  const formValues = watch();

  const handleNextStep = async () => {
    setErrorMsg(null);
    if (step === 1) {
      const isValid = await trigger(['email', 'password', 'confirmPassword']);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(['fullName', 'phone']);
      if (isValid) setStep(3);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.post('/auth/register', {
        email: values.email,
        password: values.password,
        role: 'STUDENT',
        profile: {
          fullName: values.fullName,
          phone: values.phone,
          sleepSchedule: values.sleepSchedule,
          cleanliness: values.cleanliness,
          studyStyle: values.studyStyle,
          smoking: values.smoking,
          music: values.music,
        },
      });

      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Registration failed. Email may already be in use.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEAFD] flex flex-col">
      {/* Hero band */}
      <div className="relative overflow-hidden bg-[#3C315B] pt-12 pb-24 px-6 md:px-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-[#AB9FF2]/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[500px] mx-auto text-center space-y-4">
          <div className="flex justify-center pb-2">
            <Logo size="lg" variant="dark" href="/" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[32px] md:text-[42px] font-sans font-bold tracking-tight leading-[1] text-white"
          >
            Create Resident Account
          </motion.h1>

          <p className="text-xs text-white/70 font-normal">
            Step {step} of 3 &bull; Student Registration &amp; Roommate Profiling
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 max-w-[520px] mx-auto px-4 -mt-12 w-full pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4"
        >
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s <= step ? 'bg-[#6A4FE0] shadow-sm' : 'bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-[#E5E4E8] bg-white p-7 md:p-8 space-y-6 shadow-[0_16px_48px_rgba(60,49,91,0.08)]">
            <div className="space-y-1 border-b border-[#E5E4E8] pb-4">
              <h2 className="text-xl font-bold text-[#3C315B]">
                {step === 1 && 'Credentials Setup'}
                {step === 2 && 'Personal Information'}
                {step === 3 && 'Behavioral Lifestyle Matching'}
              </h2>
              <p className="text-xs text-[#3C315B]/60 font-normal">
                {step === 1 && 'Create a secure password with Argon2id protection.'}
                {step === 2 && 'Enter your contact info for hostel resident records.'}
                {step === 3 && 'Calibrate your profile for algorithmic roommate matching.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#6A4FE0]" /> Email Address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="student@roomify.app"
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-[#6A4FE0]" /> Password
                      </label>
                      <input
                        {...register('password')}
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
                      />
                      {errors.password && (
                        <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-[#6A4FE0]" /> Confirm Password
                      </label>
                      <input
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      Next Step <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#6A4FE0]" /> Full Name
                      </label>
                      <input
                        {...register('fullName')}
                        placeholder="Alex Morgan"
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#6A4FE0]" /> Phone Number
                      </label>
                      <input
                        {...register('phone')}
                        placeholder="+91 98765 43210"
                        className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="h-11 px-5 rounded-xl border border-[#E5E4E8] text-[#3C315B] font-semibold text-xs hover:bg-[#FAFAFA] transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        Continue to Preferences <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3C315B]">Sleep Schedule</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Early Bird', value: 'early_bird' },
                            { label: 'Night Owl', value: 'night_owl' },
                            { label: 'Flexible', value: 'flexible' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setValue('sleepSchedule', opt.value)}
                              className={`p-2.5 rounded-full text-xs font-semibold border transition-all text-center ${
                                formValues.sleepSchedule === opt.value
                                  ? 'bg-[#ECE8FE] text-[#3C315B] border-[#AB9FF2] shadow-sm'
                                  : 'bg-white text-[#3C315B]/70 border-[#E5E4E8] hover:bg-[#FAFAFA]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3C315B]">Cleanliness Standard</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Very Clean', value: 'very_clean' },
                            { label: 'Moderate', value: 'moderate' },
                            { label: 'Relaxed', value: 'relaxed' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setValue('cleanliness', opt.value)}
                              className={`p-2.5 rounded-full text-xs font-semibold border transition-all text-center ${
                                formValues.cleanliness === opt.value
                                  ? 'bg-[#ECE8FE] text-[#3C315B] border-[#AB9FF2] shadow-sm'
                                  : 'bg-white text-[#3C315B]/70 border-[#E5E4E8] hover:bg-[#FAFAFA]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3C315B]">Study Environment</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Silent', value: 'silent' },
                            { label: 'Background', value: 'background_noise' },
                            { label: 'Group Study', value: 'group_study' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setValue('studyStyle', opt.value)}
                              className={`p-2.5 rounded-full text-xs font-semibold border transition-all text-center ${
                                formValues.studyStyle === opt.value
                                  ? 'bg-[#ECE8FE] text-[#3C315B] border-[#AB9FF2] shadow-sm'
                                  : 'bg-white text-[#3C315B]/70 border-[#E5E4E8] hover:bg-[#FAFAFA]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="h-11 px-5 rounded-xl border border-[#E5E4E8] text-[#3C315B] font-semibold text-xs hover:bg-[#FAFAFA] transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-bold text-xs transition-all shadow-md"
                      >
                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Footer Link */}
          <p className="text-center text-xs text-[#3C315B]/60 font-normal">
            Already have an account?{' '}
            <Link href="/login" className="text-[#6A4FE0] hover:text-[#3C315B] font-bold transition-colors">
              Sign In to Portal
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
