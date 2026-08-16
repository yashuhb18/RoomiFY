'use client';

// RoomiFY Profile Page Component
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  User,
  Shield,
  KeyRound,
  Trash2,
  AlertTriangle,
  Upload,
  Check,
  Save,
  Lock,
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PasswordStrengthMeter } from '@/components/common/PasswordStrengthMeter';
import { EmojiCipherSetup } from '@/components/auth/EmojiCipherSetup';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const [profileForm, setProfileForm] = useState<Record<string, string>>({
    sleepSchedule: 'early_bird',
    cleanliness: 'very_clean',
    studyStyle: 'silent',
    smoking: 'non_smoker',
    music: 'headphones',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const isStudent = user?.role === 'STUDENT';

  const { data: activeBooking } = useQuery({
    queryKey: ['activeBookingProfile'],
    queryFn: async () => {
      if (!isStudent) return null;
      const res = await api.get('/bookings/active');
      return res.data;
    },
    enabled: isStudent,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (dto: Record<string, string>) => {
      const res = await api.patch('/users/profile', dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Behavioral lifestyle preferences updated successfully!');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New password and confirmation do not match.');
      }
      if (passwordForm.newPassword.length < 12) {
        throw new Error('New password must be at least 12 characters.');
      }
      const res = await api.patch('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: any) => {
      toast.error(err.message || err.response?.data?.message || 'Failed to update password.');
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return;

    try {
      await api.delete('/users/me', { data: { password: deletePassword } });
      toast.success('Account deleted successfully.');
      setIsDeleteModalOpen(false);
      logout();
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Top Back to Dashboard Button */}
      <div>
        <button
          type="button"
          onClick={() => router.push(isStudent ? '/student' : '/warden')}
          className="px-4 py-2 rounded-full bg-white text-[#3C315B] text-xs font-bold border border-[#E5E4E8] shadow-sm hover:bg-[#FAFAFA] transition-all flex items-center gap-1.5"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#E0D8FE] text-[#3C315B] text-[11px] font-semibold tracking-wide">
            {isStudent ? 'Student Profile & Settings' : 'Warden Console & Administrative Account'}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2 pt-1">
            <User className="h-6 w-6 text-[#6A4FE0]" /> Account Preferences
          </h1>
          <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
            {isStudent
              ? 'Manage your personal profile, lifestyle parameters, and account security.'
              : 'Manage your warden administrative credentials, office details, and account security.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-1.5 rounded-full bg-white text-[#3C315B] text-xs font-bold border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all shrink-0 self-start md:self-auto"
        >
          &larr; Back
        </button>
      </div>

      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Role */}
        <div className="rounded-3xl bg-white p-5 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#3C315B]/60 font-bold tracking-wider uppercase block">ROLE</span>
            <p className="text-sm font-bold text-[#3C315B]">{isStudent ? 'STUDENT' : 'WARDEN'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Security / MFA */}
        <div className="rounded-3xl bg-white p-5 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#3C315B]/60 font-bold tracking-wider uppercase block">SECURITY</span>
            <p className="text-sm font-bold text-[#3C315B]">Argon2id</p>
            <p className="text-[11px] text-[#3C315B]/60 font-normal">Encrypted hash guard</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Preferences / Authority */}
        <div className="rounded-3xl bg-white p-5 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-[#3C315B]/60 font-bold tracking-wider uppercase block">
              {isStudent ? 'PREFERENCES' : 'AUTHORITY'}
            </span>
            <p className="text-sm font-bold text-emerald-600">
              {isStudent ? '3 Set' : 'Tenant RLS'}
            </p>
            <p className="text-[11px] text-[#3C315B]/60 font-normal">
              {isStudent ? 'Lifestyle parameters active' : 'Full hostel management'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Info Badge Card */}
      <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center gap-5">
        <div className="h-14 w-14 rounded-full bg-[#ECE8FE] text-[#3C315B] font-extrabold text-lg flex items-center justify-center border-2 border-[#AB9FF2]">
          {initials}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#3C315B]">{user?.email}</h2>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECE8FE] text-[#3C315B] text-xs font-bold">
              {isStudent ? 'STUDENT' : 'WARDEN'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAFAFA] text-[#3C315B]/60 text-[10px] font-semibold border border-[#E5E4E8]">
              {isStudent ? 'Resident Account' : 'Warden Administrative Account'}
            </span>
          </div>
        </div>
      </div>

      {/* STUDENT ONLY: Roommate Behavioral Profile Card */}
      {isStudent ? (
        <div className="rounded-3xl bg-white p-7 border border-[#E5E4E8] shadow-sm space-y-5">
          <div className="border-b border-[#E5E4E8] pb-3">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
              <User className="h-5 w-5 text-[#6A4FE0]" /> Roommate Behavioral Profile
            </h3>
            <p className="text-xs text-[#3C315B]/60 font-normal mt-0.5">
              Updating habits recalibrates compatibility scoring in real-time.
            </p>
          </div>

          {/* Current Compatibility Parameters Summary Box */}
          <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-1.5 text-xs text-[#3C315B]/80 font-medium">
            <p className="font-bold text-[#3C315B]">Current Compatibility Parameters:</p>
            <p>&bull; Sleep Schedule: Early Bird / Night Owl vector</p>
            <p>&bull; Study Habits: Silent focus / Group discussion</p>
            <p>&bull; Cleanliness Score: High priority</p>
          </div>

          {/* Habit Option Pills */}
          <div className="space-y-5">
            {[
              {
                key: 'sleepSchedule',
                title: 'Sleep Schedule',
                options: [
                  { label: 'Early Bird', value: 'early_bird' },
                  { label: 'Night Owl', value: 'night_owl' },
                  { label: 'Flexible', value: 'flexible' },
                ],
              },
              {
                key: 'cleanliness',
                title: 'Cleanliness Standard',
                options: [
                  { label: 'Very Clean', value: 'very_clean' },
                  { label: 'Moderate', value: 'moderate' },
                  { label: 'Relaxed', value: 'relaxed' },
                ],
              },
              {
                key: 'studyStyle',
                title: 'Study Environment',
                options: [
                  { label: 'Silent', value: 'silent' },
                  { label: 'Background Noise', value: 'background_noise' },
                  { label: 'Group Study', value: 'group_study' },
                ],
              },
              {
                key: 'smoking',
                title: 'Smoking Preference',
                options: [
                  { label: 'Non-Smoker', value: 'non_smoker' },
                  { label: 'Smoker', value: 'smoker' },
                  { label: 'Outdoor Only', value: 'outdoor_only' },
                ],
              },
              {
                key: 'music',
                title: 'Music Preference',
                options: [
                  { label: 'Headphones', value: 'headphones' },
                  { label: 'Speakers', value: 'speakers' },
                  { label: 'No Music', value: 'no_music' },
                ],
              },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-xs font-bold text-[#3C315B]">{field.title}</label>
                <div className="grid grid-cols-3 gap-2">
                  {field.options.map((opt) => {
                    const isSelected = profileForm[field.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setProfileForm((prev) => ({ ...prev, [field.key]: opt.value }))
                        }
                        className={`py-2.5 px-4 rounded-full text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? 'bg-[#ECE8FE] border-[#AB9FF2] text-[#3C315B] shadow-sm'
                            : 'bg-white border-[#E5E4E8] text-[#3C315B]/70 hover:bg-[#FAFAFA]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="w-full h-11 rounded-2xl bg-[#342D53] hover:bg-[#251F40] text-white font-bold text-xs shadow-md transition-all mt-4"
            >
              {updateProfileMutation.isPending ? 'Saving Preferences...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      ) : (
        /* WARDEN / SUPER ADMIN ONLY: Warden Administrative Contact Card */
        <div className="rounded-3xl bg-white p-7 border border-[#E5E4E8] shadow-sm space-y-5">
          <div className="border-b border-[#E5E4E8] pb-3">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#6A4FE0]" /> Warden Administrative &amp; Contact Details
            </h3>
            <p className="text-xs text-[#3C315B]/60 font-normal mt-0.5">
              Official warden desk information displayed on resident support &amp; contact channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="space-y-1.5">
              <label className="font-bold text-[#3C315B]">Warden Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || 'warden@aegis.hostel'}
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-[#3C315B]/70 cursor-not-allowed font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#3C315B]">Designation / Authority Level</label>
              <input
                type="text"
                disabled
                value="Hostel Chief Warden"
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-[#3C315B] cursor-not-allowed font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#3C315B]">Assigned Hostel Domain</label>
              <input
                type="text"
                disabled
                value="AEGIS Campus Hostel 1"
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-[#3C315B]/70 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#3C315B]">Security Protocol</label>
              <input
                type="text"
                disabled
                value="Tenant-isolated RLS & JWT Auth"
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-emerald-600 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Password & Security Card */}
      <div className="rounded-3xl bg-white p-7 border border-[#E5E4E8] shadow-sm space-y-4">
        <div className="border-b border-[#E5E4E8] pb-3">
          <h3 className="text-lg font-bold text-[#3C315B] flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#6A4FE0]" /> Password &amp; Security
          </h3>
          <p className="text-sm text-[#3C315B]/70 font-normal mt-0.5">
            Update your account password. Requires current password verification and minimum 12 characters.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#3C315B]">Current Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-sm font-medium text-[#3C315B] focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#3C315B]">New Password (Min 12 Chars)</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-sm font-medium text-[#3C315B] focus:bg-white"
              />
              <div className="pt-1">
                <PasswordStrengthMeter password={passwordForm.newPassword} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#3C315B]">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-sm font-medium text-[#3C315B] focus:bg-white"
              />
              {passwordForm.confirmPassword.length > 0 && (
                <div className={`text-xs font-semibold flex items-center gap-1.5 pt-1 ${
                  passwordForm.newPassword === passwordForm.confirmPassword ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {passwordForm.newPassword === passwordForm.confirmPassword ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Passwords do not match
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => changePasswordMutation.mutate()}
            disabled={
              changePasswordMutation.isPending ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword ||
              passwordForm.newPassword.length < 12 ||
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#6A4FE0] hover:bg-[#5B3FD1] text-white font-bold text-sm transition-all shadow-md disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* WARDEN & SUPER ADMIN ONLY: One in a Million Auth System Setup (Passkey & Emoji Cipher) */}
      {(!isStudent || user?.role === 'WARDEN' || user?.role === 'SUPER_ADMIN') && (
        <EmojiCipherSetup />
      )}

      {/* MFA Security Quick Settings (Students Only) */}
      {isStudent && (
        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-[#3C315B] text-base flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#6A4FE0]" /> Multi-Factor Authentication (MFA)
            </h3>
            <p className="text-xs text-[#3C315B]/60 font-normal">
              Bind Google Authenticator or Speakeasy TOTP for privileged actions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/student/mfa-setup')}
            className="rounded-full bg-[#ECE8FE] hover:bg-[#D6CDFE] text-[#3C315B] text-xs font-bold h-10 px-6 shrink-0 transition-colors"
          >
            Configure TOTP MFA
          </button>
        </div>
      )}

      {/* Danger Zone - Account Deletion */}
      <div className="rounded-3xl border border-rose-200 bg-red-50/50 p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
          <AlertTriangle className="h-5 w-5" /> Danger Zone
        </div>
        <p className="text-xs text-[#3C315B]/70 leading-relaxed font-normal">
          Deleting your account soft-deletes resident profiles and revokes all active JWT tokens.
        </p>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
        >
          <Trash2 className="h-4 w-4" /> Delete Account
        </button>
      </div>

      {/* Account Deletion Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-3xl border border-[#E5E4E8] bg-white text-[#3C315B]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600">Confirm Account Deletion</DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              This action is permanent. Enter your password to authorize soft deletion.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B] flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-xs text-[#3C315B]"
                required
              />
            </div>

            <button type="submit" className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white h-11 text-xs font-bold transition-all shadow-md">
              Authorize Account Deletion
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
