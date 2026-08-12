'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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

  const updateProfileMutation = useMutation({
    mutationFn: async (dto: Record<string, string>) => {
      const res = await api.patch('/users/profile', dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Behavioral lifestyle preferences updated successfully!');
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return;

    try {
      if (user?.id) {
        await api.delete(`/users/${user.id}`);
      }
      toast.success('Account soft-deleted successfully.');
      logout();
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'US';

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
              User Profile &amp; Settings
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Account Preferences
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal profile, lifestyle parameters, and multi-factor security.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-purple-500/40 shadow-xl shadow-purple-500/20">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-extrabold text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{user?.email}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {user?.role}
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                Argon2id Hash Guarded
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Behavioral Profile Editor */}
      <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" /> Roommate Behavioral Profile
          </CardTitle>
          <CardDescription className="text-xs">
            Updating habits recalibrates compatibility scoring in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                { label: 'Background', value: 'background_noise' },
                { label: 'Group Study', value: 'group_study' },
              ],
            },
          ].map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{field.title}</label>
              <div className="grid grid-cols-3 gap-2">
                {field.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setProfileForm((prev) => ({ ...prev, [field.key]: opt.value }))
                    }
                    className={`p-3 rounded-2xl text-xs font-medium border transition-all text-center ${
                      profileForm[field.key] === opt.value
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                        : 'bg-black/40 border-white/10 text-muted-foreground hover:border-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="w-full h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.01] text-white font-semibold text-xs shadow-lg shadow-purple-500/25 transition-all mt-4"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateProfileMutation.isPending ? 'Saving Preferences...' : 'Save Profile Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* MFA Security Quick Settings */}
      <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-purple-400" /> Multi-Factor Authentication (MFA)
          </h3>
          <p className="text-xs text-muted-foreground">
            Bind Google Authenticator or Speakeasy TOTP for privileged actions.
          </p>
        </div>
        <Button
          onClick={() => router.push('/mfa-setup')}
          className="rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold h-10 px-6 shrink-0"
        >
          Configure TOTP MFA
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-3xl border border-rose-500/30 bg-rose-950/10 p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
          <AlertTriangle className="h-5 w-5" /> Danger Zone
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Deleting your account soft-deletes resident profiles and revokes all active JWT tokens.
        </p>
        <Button
          variant="destructive"
          onClick={() => setIsDeleteModalOpen(true)}
          className="rounded-full text-xs font-semibold px-6 h-10"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
        </Button>
      </Card>

      {/* Account Deletion Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-3xl border border-white/10 bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-400">Confirm Account Deletion</DialogTitle>
            <DialogDescription className="text-xs">
              This action is permanent. Enter your password to authorize soft deletion.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> Password
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                className="bg-black/50 border-white/10 rounded-xl"
                required
              />
            </div>

            <Button type="submit" variant="destructive" className="w-full rounded-full h-11 text-xs font-semibold">
              Authorize Account Deletion
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
