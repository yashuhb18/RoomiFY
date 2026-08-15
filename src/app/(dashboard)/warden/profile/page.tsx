'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Key,
  User,
  Settings,
  ArrowLeft,
  Sliders,
  Building,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function WardenProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'WA';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back Link */}
      <div>
        <button
          type="button"
          onClick={() => router.push('/warden')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E4E8] text-xs font-semibold text-[#3C315B] hover:bg-[#FAFAFA] transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </button>
      </div>

      {/* Header Banner Card — Light Lavender #ECE8FE */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-4 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[11px] font-semibold tracking-wide">
              Administrator Profile &amp; Settings
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAFD] text-[#3C315B] flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#3C315B] tracking-tight">
                Warden Account Preferences
              </h1>
            </div>

            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Manage administrator credentials, hostel permissions, and security policies.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/warden')}
            className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              ROLE
            </p>
            <p className="text-lg font-bold text-[#3C315B]">{user?.role || 'WARDEN'}</p>
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
            <p className="text-lg font-bold text-[#3C315B]">TOTP Active</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">Speakeasy authenticator</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
        </div>

        {/* Scope */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              ADMIN SCOPE
            </p>
            <p className="text-lg font-bold text-[#2EC08B]">FULL ACCESS</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">All hostel blocks &amp; floors</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Info Banner */}
      <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold text-xl flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#3C315B]">{user?.email || 'warden@aegis.hostel'}</h3>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-3 py-0.5 rounded-full bg-[#EDEAFD] text-[#3C315B] font-semibold text-[11px] uppercase">
              {user?.role || 'WARDEN'}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-[#FAFAFA] border border-[#E5E4E8] text-[#3C315B]/60 font-medium text-[11px]">
              Argon2id Hash Guarded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
