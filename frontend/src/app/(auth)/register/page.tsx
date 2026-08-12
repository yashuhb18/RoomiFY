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
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A] overflow-hidden">
      {/* Background Animated Orbs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[150px] animate-float" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-pink-600/15 blur-[150px] animate-float style={{ animationDelay: '-5s' }}" />

      <div className="relative z-10 w-full max-w-xl space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-105">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              ROOMIFY
            </span>
          </Link>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Step {step} of 3 &bull; Student Account Creation
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-sm shadow-purple-500/50' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">
              {step === 1 && 'Credentials Setup'}
              {step === 2 && 'Personal Information'}
              {step === 3 && 'Behavioral Lifestyle Matching'}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {step === 1 && 'Create a secure password with Argon2id protection.'}
              {step === 2 && 'Enter your contact info for hostel resident records.'}
              {step === 3 && 'Calibrate your profile for algorithmic roommate matching.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center gap-2 text-xs text-destructive">
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
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-purple-400" /> Email Address
                      </label>
                      <Input
                        {...register('email')}
                        type="email"
                        placeholder="student@roomify.app"
                        className="rounded-xl border-white/10 bg-black/40 h-11 text-sm focus:border-purple-500"
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-purple-400" /> Password
                      </label>
                      <Input
                        {...register('password')}
                        type="password"
                        placeholder="••••••••"
                        className="rounded-xl border-white/10 bg-black/40 h-11 text-sm focus:border-purple-500"
                      />
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-purple-400" /> Confirm Password
                      </label>
                      <Input
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="••••••••"
                        className="rounded-xl border-white/10 bg-black/40 h-11 text-sm focus:border-purple-500"
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] text-white font-semibold shadow-lg shadow-purple-500/25 transition-all"
                    >
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-purple-400" /> Full Name
                      </label>
                      <Input
                        {...register('fullName')}
                        placeholder="Alex Morgan"
                        className="rounded-xl border-white/10 bg-black/40 h-11 text-sm focus:border-purple-500"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-purple-400" /> Phone Number
                      </label>
                      <Input
                        {...register('phone')}
                        placeholder="+61 400 000 000"
                        className="rounded-xl border-white/10 bg-black/40 h-11 text-sm focus:border-purple-500"
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="h-11 rounded-full border-white/15 hover:bg-white/5"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] text-white font-semibold shadow-lg shadow-purple-500/25 transition-all"
                      >
                        Continue to Preferences <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
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
                    {/* Lifestyle Choices */}
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Sleep Schedule</label>
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
                              className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                                formValues.sleepSchedule === opt.value
                                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                                  : 'bg-black/40 border-white/10 text-muted-foreground hover:border-white/20'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Cleanliness Standard</label>
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
                              className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                                formValues.cleanliness === opt.value
                                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                                  : 'bg-black/40 border-white/10 text-muted-foreground hover:border-white/20'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Study Environment</label>
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
                              className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                                formValues.studyStyle === opt.value
                                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                                  : 'bg-black/40 border-white/10 text-muted-foreground hover:border-white/20'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="h-11 rounded-full border-white/15 hover:bg-white/5"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] text-white font-semibold shadow-lg shadow-purple-500/25 transition-all"
                      >
                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:underline font-semibold">
            Sign In to Portal
          </Link>
        </p>
      </div>
    </main>
  );
}
