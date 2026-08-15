'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Key,
  User,
  Settings,
  ArrowLeft,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';

export default function StudentProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back Link */}
      <div>
        <button
          type="button"
          onClick={() => router.push('/student')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E4E8] text-xs font-semibold text-[#3C315B] hover:bg-[#FAFAFA] transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>

      {/* Header Banner Card — Light Lavender #ECE8FE */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-4 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[11px] font-semibold tracking-wide">
              User Profile &amp; Settings
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAFD] text-[#3C315B] flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#3C315B] tracking-tight">
                Account Preferences
              </h1>
            </div>

            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Manage your personal profile, lifestyle parameters, and multi-factor security.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/student')}
            className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </div>

      {/* 3 Stat / Info Cards — Exactly like Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              ROLE
            </p>
            <p className="text-lg font-bold text-[#3C315B]">{user?.role || 'STUDENT'}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* MFA Status */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              MFA STATUS
            </p>
            <p className="text-lg font-bold text-[#3C315B]">TOTP</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">Speakeasy authenticator</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              PREFERENCES
            </p>
            <p className="text-lg font-bold text-[#2EC08B]">3</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">Lifestyle categories set</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Info Banner Card — Exactly like Screenshot 3 */}
      <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold text-xl flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#3C315B]">{user?.email || 'student@aegis.hostel'}</h3>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-3 py-0.5 rounded-full bg-[#EDEAFD] text-[#3C315B] font-semibold text-[11px] uppercase">
              {user?.role || 'STUDENT'}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E4E8] text-[#3C315B]/60 font-medium text-[11px]">
              Argon2id Hash Guarded
            </span>
          </div>
        </div>
      </div>

      {/* Behavioral Profile Section */}
      <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#6A4FE0]" />
          <h2 className="text-lg font-bold text-[#3C315B]">Roommate Behavioral Profile</h2>
        </div>
        <p className="text-xs text-[#3C315B]/60 font-normal">
          Updating habits recalibrates compatibility scoring in real-time.
        </p>

        <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-2">
          <p className="text-xs font-semibold text-[#3C315B]">Current Compatibility Parameters:</p>
          <ul className="text-xs text-[#3C315B]/70 space-y-1 list-disc list-inside">
            <li>Sleep Schedule: Early Bird / Night Owl vector</li>
            <li>Study Habits: Silent focus / Group discussion</li>
            <li>Cleanliness Score: High priority</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
