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
  const [profileForm, setProfileForm] = useState<Record<string, string>>({
    sleepSchedule: 'early_bird',
    cleanliness: 'very_clean',
    studyStyle: 'silent',
    smoking: 'non_smoker',
    music: 'headphones',
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
    mutationFn: async (dto: Record<string, string>) => {
      const res = await api.patch('/users/profile', dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Lifestyle profile updated and algorithm recalibrated!');
      queryClient.invalidateQueries({ queryKey: ['roommateMatches'] });
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
            Algorithmic Compatibility Engine
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-[#6A4FE0]" /> Roommate Match Rankings
        </h1>
        <p className="text-xs text-[#3C315B]/70 max-w-2xl leading-relaxed font-normal">
          Our vector-style matching engine compares your lifestyle traits against all students in your hostel to calculate compatibility scores.
        </p>
      </div>

      {/* Roommate Requests Status Banner */}
      {(receivedRequests.length > 0 || sentRequests.length > 0) && (
        <div className="rounded-3xl bg-white border border-[#E5E4E8] p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#6A4FE0]" /> Roommate Invitations & Requests
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
        {/* Left Side: Lifestyle Preferences Card */}
        <div className="rounded-[28px] bg-white p-7 border border-[#E5E4E8] shadow-sm lg:col-span-1 space-y-5">
          <div className="border-b border-[#E5E4E8] pb-4">
            <h3 className="text-lg font-bold text-[#3C315B] flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#6A4FE0]" /> Lifestyle Preferences
            </h3>
            <p className="text-xs text-[#3C315B]/60 font-normal mt-0.5">
              Set your habits to calibrate compatibility scoring.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(LIFESTYLE_OPTIONS).map(([key, options]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-bold text-[#3C315B] capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {options.map((opt) => {
                    const isSelected = profileForm[key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setProfileForm((prev) => ({ ...prev, [key]: opt.value }))
                        }
                        className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? 'bg-[#ECE8FE] text-[#3C315B] border-[#AB9FF2] shadow-sm'
                            : 'bg-white text-[#3C315B]/70 border-[#E5E4E8] hover:bg-[#FAFAFA]'
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
                    className="rounded-[28px] bg-white p-6 border border-[#E5E4E8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar Circle Badge */}
                      <div className="h-12 w-12 rounded-full bg-[#ECE8FE] text-[#3C315B] flex items-center justify-center font-extrabold text-base shrink-0 border border-[#AB9FF2]/30">
                        #{index + 1}
                      </div>

                      {/* Candidate Email and Match Badge */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-base text-[#3C315B]">{candidate.email}</h3>
                          <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] text-xs font-bold border border-[#AB9FF2]/40">
                            {candidate.score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-[#3C315B]/60 font-normal">
                          Shared Traits ({candidate.matchingTraits.length})
                        </p>
                      </div>
                    </div>

                    {/* Action Button on Right */}
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
