'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Building2, User } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/common/logo';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  studentId: z.string().min(2, 'Student ID / USN is required'),
  college: z.string().min(2, 'College is required'),
  course: z.string().min(2, 'Course is required'),
  yearSemester: z.string().min(1, 'Year/Semester is required'),
  hostelId: z.string().uuid('Please select a hostel'),
  roomNumber: z.string().min(1, 'Room number is required'),
  emergencyContact: z.string().optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  const picture = searchParams.get('picture') || '';

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hardcode the default hostel ID for now to match default behavior
  // In a real app, we'd fetch this from /api/hostels
  const DEFAULT_HOSTEL_ID = '00000000-0000-0000-0000-000000000000'; // We will fetch actual ID in a moment or let backend handle it, but wait, the backend expects a valid UUID. Let's fetch the first hostel.

  const [hostels, setHostels] = useState<{id: string, name: string}[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: name || 'Student Resident',
      phoneNumber: '+91 98765 43210',
      studentId: 'STU-' + Math.floor(1000 + Math.random() * 9000),
      college: 'AEGIS Institute of Technology',
      course: 'Computer Science',
      yearSemester: '1st Year',
      roomNumber: 'A-101',
    },
  });

  React.useEffect(() => {
    api.get('/hostels').then(res => {
      setHostels(res.data);
      if (res.data && res.data.length > 0) {
        setValue('hostelId', res.data[0].id);
      }
    }).catch(console.error);
  }, [setValue]);

  const onSubmit = async (data: OnboardingForm) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/google/complete-profile', {
        ...data,
        email,
        avatarUrl: picture,
      });

      if (res.data.accessToken) {
        useAuthStore.setState({
          accessToken: res.data.accessToken,
          user: res.data.user,
          isAuthenticated: true,
        });
        router.push('/student');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#EDEAFD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" variant="dark" href="/" />
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-jakarta font-bold text-[#3C315B]"
          >
            Welcome to RoomiFy 👋
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-[#3C315B]/60"
          >
            Your Google account has been verified. Complete your hostel profile to continue.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E4E8]"
        >
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Account Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#EDEAFD]/50 border border-[#E5E4E8]">
              {picture ? (
                <img src={picture} alt="Avatar" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#3C315B] flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[#3C315B]">{email}</p>
                <p className="text-xs text-[#3C315B]/50">Google Account Linked</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">Full Name *</label>
                <Input
                  {...register('fullName')}
                  placeholder="John Doe"
                  className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">Phone Number *</label>
                <Input
                  {...register('phoneNumber')}
                  placeholder="+1 234 567 8900"
                  className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
                />
                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">Student ID / USN *</label>
                <Input
                  {...register('studentId')}
                  placeholder="CS2023001"
                  className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
                />
                {errors.studentId && <p className="text-xs text-red-500">{errors.studentId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">College *</label>
                <Input
                  {...register('college')}
                  placeholder="AEGIS Institute of Technology"
                  className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
                />
                {errors.college && <p className="text-xs text-red-500">{errors.college.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">Course *</label>
                <Input
                  {...register('course')}
                  placeholder="Computer Science"
                  className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
                />
                {errors.course && <p className="text-xs text-red-500">{errors.course.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">Year / Semester *</label>
                <Input
                  {...register('yearSemester')}
                  placeholder="3rd Year / 5th Sem"
                  className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
                />
                {errors.yearSemester && <p className="text-xs text-red-500">{errors.yearSemester.message}</p>}
              </div>
            </div>

            <hr className="border-[#E5E4E8]" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">Hostel *</label>
                <select 
                  {...register('hostelId')}
                  className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-[#E5E4E8] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#6A4FE0] focus:border-transparent"
                >
                  <option value="">Select a hostel...</option>
                  {hostels.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                {errors.hostelId && <p className="text-xs text-red-500">{errors.hostelId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#3C315B]">Room Number *</label>
                <Input
                  {...register('roomNumber')}
                  placeholder="A-101"
                  className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
                />
                {errors.roomNumber && <p className="text-xs text-red-500">{errors.roomNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#3C315B]">Emergency Contact (Optional)</label>
              <Input
                {...register('emergencyContact')}
                placeholder="+1 987 654 3210 (Parent/Guardian)"
                className="rounded-xl border-[#E5E4E8] bg-[#FAFAFA]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#6A4FE0] hover:bg-[#5B3FD1] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-8 shadow-[0_4px_14px_rgba(106,79,224,0.4)] hover:shadow-[0_6px_20px_rgba(106,79,224,0.6)] disabled:opacity-50"
            >
              {isLoading ? 'Creating Profile...' : 'Complete Profile & Continue'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDEAFD] flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
