'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Users, Sliders, Check, UserCheck } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const updateProfileMutation = useMutation({
    mutationFn: async (dto: Record<string, string>) => {
      const res = await api.patch('/users/profile', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roommateMatches'] });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 gradient-text">
          <Sparkles className="h-6 w-6 text-purple-400" /> Algorithmic Roommate Match
        </h1>
        <p className="text-sm text-muted-foreground">
          Our vector-style matching engine compares your lifestyle traits against all students in your hostel.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Settings Form */}
        <Card className="glass border-white/10 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4 text-purple-400" /> Lifestyle Preferences
            </CardTitle>
            <CardDescription>
              Set your habits to calibrate compatibility scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(LIFESTYLE_OPTIONS).map(([key, options]) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold capitalize text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setProfileForm((prev) => ({ ...prev, [key]: opt.value }))
                      }
                      className={`px-2 py-1.5 rounded-md text-[11px] font-medium border transition-all text-center ${
                        profileForm[key] === opt.value
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                          : 'bg-card/40 text-muted-foreground border-white/5 hover:border-white/20'
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
              className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white"
            >
              {updateProfileMutation.isPending ? 'Updating Engine...' : 'Save & Calculate Matches'}
            </Button>
          </CardContent>
        </Card>

        {/* Matches Display */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" /> Top 5 Compatible Candidates
          </h2>

          {isLoading ? (
            <p className="text-xs text-muted-foreground">Calculating match scores...</p>
          ) : matches && matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((candidate: any, index: number) => (
                <Card
                  key={candidate.userId}
                  className="glass border-white/10 hover:border-purple-500/30 transition-all duration-200"
                >
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-purple-950/80 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-purple-300 text-lg">
                        #{index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base">{candidate.email}</h3>
                          <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
                            {candidate.score}% Match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Shared Traits ({candidate.matchingTraits.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {candidate.matchingTraits.map((trait: string) => (
                            <Badge key={trait} variant="success" className="text-[10px] capitalize">
                              <Check className="mr-1 h-3 w-3" /> {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button size="sm" className="bg-purple-600/80 hover:bg-purple-500 text-white shrink-0">
                      <UserCheck className="mr-2 h-4 w-4" /> Request Roommate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass border-white/10 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No matches found yet. Update your preferences on the left to start vector matching.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
