'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Users, Sliders, Check, UserCheck, UserPlus, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const LIFESTYLE_OPTIONS = {
  sleepSchedule: [
    { label: 'Early Bird', value: 'early_bird' },
    { label: 'Night Owl', value: 'night_owl' },
    { label: 'Flexible', value: 'flexible' },
  ],
  cleanliness: [
    { label: 'Very Clean', value: 'very_clean' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Relaxed', value: 'relaxed' },
  ],
  studyStyle: [
    { label: 'Silent', value: 'silent' },
    { label: 'Background Noise', value: 'background_noise' },
    { label: 'Group Study', value: 'group_study' },
  ],
  smoking: [
    { label: 'Non-Smoker', value: 'non_smoker' },
    { label: 'Smoker', value: 'smoker' },
    { label: 'Outdoor Only', value: 'outdoor_only' },
  ],
  music: [
    { label: 'Headphones', value: 'headphones' },
    { label: 'Speakers', value: 'speakers' },
    { label: 'No Music', value: 'no_music' },
  ],
};

export default function RoommateMatchPage() {
  const queryClient = useQueryClient();
  const [profileForm, setProfileForm] = useState<Record<string, any>>({
    peakEnergyWindow: 'dawn',
    territoriality: '5',
    financialSplitStyle: 'equal_split',
    guestPhilosophy: 'social_hub',
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      if (res.data?.profile) {
        setProfileForm((prev) => ({
          ...prev,
          ...res.data.profile,
        }));
      }
      return res.data;
    },
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ['roommateMatches'],
    queryFn: async () => {
      const res = await api.get('/users/matches');
      return res.data;
    },
  });

  const { data: myRoommateRequests } = useQuery({
    queryKey: ['myRoommateRequests'],
    queryFn: async () => {
      const res = await api.get('/roommate-requests/my');
      return res.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (dto: Record<string, any>) => {
      const res = await api.patch('/users/profile', dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Symbiotic Strain Profile saved! Calculating peaceful survival matches...');
      queryClient.invalidateQueries({ queryKey: ['roommateMatches'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const res = await api.post('/roommate-requests', { targetId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Roommate request invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['myRoommateRequests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send roommate request.');
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await api.patch(`/roommate-requests/${requestId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Roommate request accepted! You are now paired.');
      queryClient.invalidateQueries({ queryKey: ['myRoommateRequests'] });
      queryClient.invalidateQueries({ queryKey: ['roommateMatches'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to accept request.');
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await api.patch(`/roommate-requests/${requestId}/reject`);
      return res.data;
    },
    onSuccess: () => {
      toast.info('Roommate request declined.');
      queryClient.invalidateQueries({ queryKey: ['myRoommateRequests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to decline request.');
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await api.patch(`/roommate-requests/${requestId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      toast.info('Roommate request canceled.');
      queryClient.invalidateQueries({ queryKey: ['myRoommateRequests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel request.');
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const sentRequests = myRoommateRequests?.sent || [];
  const receivedRequests = myRoommateRequests?.received || [];

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6]">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
            Symbiotic Strain Matching Engine
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-[#6A4FE0]" /> Roommate Match Rankings
        </h1>
        <p className="text-xs text-[#3C315B]/70 max-w-2xl leading-relaxed font-normal">
          Our co-existence algorithm computes your &quot;Chance of Peaceful Survival&quot; based on rhythm, territorial zoning, financial style, and guest philosophy.
        </p>
      </div>

      {/* Roommate Requests Status Banner */}
      {(receivedRequests.length > 0 || sentRequests.length > 0) && (
        <div className="rounded-3xl bg-white border border-[#E5E4E8] p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#6A4FE0]" /> Roommate Invitations &amp; Requests
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Received Requests */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#3C315B]/70 block">
                Received Invitations ({receivedRequests.length})
              </span>
              {receivedRequests.length === 0 ? (
                <p className="text-xs text-[#3C315B]/50 font-normal">No incoming roommate requests.</p>
              ) : (
                <div className="space-y-2">
                  {receivedRequests.map((req: any) => (
                    <div key={req.id} className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#3C315B]">{req.requester?.email}</p>
                        <p className="text-[10px] text-[#3C315B]/50">Status: <span className="text-[#6A4FE0] font-semibold">{req.status}</span></p>
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => acceptRequestMutation.mutate(req.id)}
                            disabled={acceptRequestMutation.isPending}
                            className="h-7 px-3 rounded-xl bg-[#2EC08B] hover:bg-[#27A97B] text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectRequestMutation.mutate(req.id)}
                            disabled={rejectRequestMutation.isPending}
                            className="h-7 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#3C315B]/70 block">
                Sent Invitations ({sentRequests.length})
              </span>
              {sentRequests.length === 0 ? (
                <p className="text-xs text-[#3C315B]/50 font-normal">No outgoing roommate requests.</p>
              ) : (
                <div className="space-y-2">
                  {sentRequests.map((req: any) => (
                    <div key={req.id} className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#3C315B]">{req.target?.email}</p>
                        <p className="text-[10px] text-[#3C315B]/50">Status: <span className="text-[#6A4FE0] font-semibold">{req.status}</span></p>
                      </div>
                      {req.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => cancelRequestMutation.mutate(req.id)}
                          disabled={cancelRequestMutation.isPending}
                          className="h-7 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors border border-slate-300 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: The Symbiotic Strain Model Controls */}
        <div className="rounded-[28px] bg-white p-7 border border-[#E5E4E8] shadow-sm lg:col-span-1 space-y-5">
          <div className="border-b border-[#E5E4E8] pb-4">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#6A4FE0]" /> Symbiotic Strain Controls
            </h3>
            <p className="text-xs text-[#3C315B]/60 font-normal mt-0.5">
              Set your co-existence parameters to calibrate matching.
            </p>
          </div>

          <div className="space-y-5">
            {/* 1. Peak Energy Window Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3C315B]">1. Peak Energy Window</label>
              <select
                value={profileForm.peakEnergyWindow || 'dawn'}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, peakEnergyWindow: e.target.value }))}
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-xs font-semibold text-[#3C315B] focus:bg-white cursor-pointer"
              >
                <option value="dawn">Dawn (5 AM - 9 AM)</option>
                <option value="midday">Midday (10 AM - 2 PM)</option>
                <option value="dusk">Dusk (5 PM - 9 PM)</option>
                <option value="midnight">Midnight (10 PM - 2 AM)</option>
              </select>
            </div>

            {/* 2. Territoriality Slider (1-10) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#3C315B]">2. Territoriality (1 - 10)</label>
                <span className="font-extrabold text-[#6A4FE0] bg-[#ECE8FE] px-2.5 py-0.5 rounded-full">
                  Level {profileForm.territoriality || '5'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={profileForm.territoriality || '5'}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, territoriality: e.target.value }))}
                className="w-full accent-[#6A4FE0] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3C315B]/60 font-medium">
                <span>1: Fully Open</span>
                <span>10: Strictly Zoned</span>
              </div>
            </div>

            {/* 3. Financial Splitting Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3C315B]">3. Financial Splitting Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Equal Split', value: 'equal_split' },
                  { label: 'Exact Usage', value: 'exact_usage' },
                ].map((opt) => {
                  const isSelected = (profileForm.financialSplitStyle || 'equal_split') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfileForm((prev) => ({ ...prev, financialSplitStyle: opt.value }))}
                      className={`p-2.5 rounded-2xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? 'bg-[#ECE8FE] border-[#AB9FF2] text-[#3C315B] shadow-sm font-bold'
                          : 'bg-white border-[#E5E4E8] text-[#3C315B]/70 hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Guest Philosophy */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3C315B]">4. Guest Philosophy</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Social Hub', value: 'social_hub' },
                  { label: 'Private Fortress', value: 'private_fortress' },
                ].map((opt) => {
                  const isSelected = (profileForm.guestPhilosophy || 'social_hub') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfileForm((prev) => ({ ...prev, guestPhilosophy: opt.value }))}
                      className={`p-2.5 rounded-2xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? 'bg-[#ECE8FE] border-[#AB9FF2] text-[#3C315B] shadow-sm font-bold'
                          : 'bg-white border-[#E5E4E8] text-[#3C315B]/70 hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#342D53] hover:bg-[#251F40] text-white text-xs font-bold transition-all shadow-md mt-6"
            >
              {updateProfileMutation.isPending ? 'Updating Engine...' : 'Save & Calculate Matches'}
            </button>
          </div>
        </div>

        {/* Right Side: Top Compatible Candidates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-[#3C315B]">
            <Users className="h-5 w-5 text-[#6A4FE0]" /> Top Compatible Candidates
          </div>

          {isLoading ? (
            <p className="text-xs text-[#3C315B]/60">Calculating match scores...</p>
          ) : matches && matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((candidate: any, index: number) => {
                const existingSentReq = sentRequests.find((r: any) => r.targetId === candidate.userId);

                return (
                  <div
                    key={candidate.userId}
                    className="rounded-[28px] bg-white p-6 border border-[#E5E4E8] shadow-sm space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div className="h-12 w-12 rounded-full bg-[#ECE8FE] text-[#3C315B] flex items-center justify-center font-extrabold text-base shrink-0 border border-[#AB9FF2]/30">
                          #{index + 1}
                        </div>

                        {/* Candidate Email and Peaceful Survival Score */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-bold text-base text-[#3C315B]">{candidate.email}</h3>
                            <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] text-xs font-extrabold border border-[#AB9FF2]/40">
                              {candidate.score}% Chance of Peaceful Survival
                            </span>
                          </div>
                          {candidate.matchingTraits && candidate.matchingTraits.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {candidate.matchingTraits.map((trait: string) => (
                                <span key={trait} className="px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[10px] font-bold">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {existingSentReq ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-4 py-2 rounded-full bg-[#ECE8FE] text-[#3C315B] text-xs font-bold border border-[#AB9FF2]/40 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#6A4FE0]" /> Request {existingSentReq.status}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendRequestMutation.mutate(candidate.userId)}
                          disabled={sendRequestMutation.isPending}
                          className="px-5 py-2.5 rounded-full bg-[#6A4FE0] hover:bg-[#5B3FD1] text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
                        >
                          <UserPlus className="h-4 w-4" />
                          {sendRequestMutation.isPending ? 'Sending...' : 'Request Roommate'}
                        </button>
                      )}
                    </div>

                    {/* The 3-Month Forecast Widget */}
                    <div className={`p-4 rounded-2xl border text-xs space-y-1 shadow-sm ${
                      candidate.score > 75
                        ? 'bg-[#E6F9F0] border-emerald-200 text-[#2EC08B]'
                        : candidate.score >= 50
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="font-bold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>The 3-Month Forecast:</span>
                      </div>
                      <p className="font-medium text-[11px] leading-relaxed pl-6">
                        {candidate.forecast ||
                          (candidate.score > 75
                            ? 'Low Stress: You two are rhythmically aligned. Expected conflict: Minimal.'
                            : candidate.score >= 50
                              ? 'Medium Stress: Compromise needed on finances/guests. Expected conflict: Occasional.'
                              : 'High Stress: Fundamental lifestyle clash detected. Expected conflict: Weekly.')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white border border-[#E5E4E8] p-8 text-center shadow-sm">
              <p className="text-xs text-[#3C315B]/60 font-normal">
                No matches found yet. Update your preferences on the left to start vector matching.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
