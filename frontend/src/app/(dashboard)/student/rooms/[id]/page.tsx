'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2,
  BedDouble,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { toast } from 'sonner';

export default function StudentRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const roomId = params?.id as string;

  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  const { data: room, isLoading } = useQuery({
    queryKey: ['roomDetail', roomId],
    queryFn: async () => {
      const res = await api.get(`/rooms/${roomId}`);
      return res.data;
    },
    enabled: !!roomId,
  });

  const { data: activeAllocation } = useQuery({
    queryKey: ['myAllocation'],
    queryFn: async () => {
      const res = await api.get('/allocations/my');
      return res.data;
    },
  });

  const { data: myRequests } = useQuery({
    queryKey: ['myRoomRequests'],
    queryFn: async () => {
      const res = await api.get('/room-requests/my');
      return res.data;
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/room-requests', {
        roomId,
        preferredBedId: selectedBedId || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room request submitted to Warden for review!');
      queryClient.invalidateQueries({ queryKey: ['myRoomRequests'] });
      router.push('/student/bookings');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit room request.');
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-caption text-fog animate-pulse">
        Loading room specifications and photo gallery...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="py-20 text-center space-y-4">
        <Building2 className="h-12 w-12 mx-auto text-fog" />
        <h3 className="text-subheading font-light text-aubergine">Room Not Found</h3>
        <Button variant="outline" onClick={() => router.push('/student/rooms')}>
          Back to Rooms List
        </Button>
      </div>
    );
  }

  const availableBeds = room.capacity - room.currentOccupancy;
  const isFull = availableBeds <= 0 || room.status === 'FULL';
  const isUnderMaintenance = room.condition === 'UNDER_MAINTENANCE' || room.status === 'UNDER_MAINTENANCE';
  const hasActiveAllocation = !!activeAllocation;
  const pendingRequest = myRequests?.find((r: any) => r.status === 'PENDING');

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => router.push('/student/rooms')}
          className="px-4 py-2 rounded-full bg-white text-[#3C315B] text-xs font-bold border border-[#E5E4E8] shadow-sm hover:bg-[#FAFAFA] transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore Rooms
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8]">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide">
            Floor {room.floor}
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[11px] font-bold tracking-wide">
            {availableBeds} / {room.capacity} Beds Available
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2 pt-1">
          <Building2 className="h-7 w-7 text-[#6A4FE0]" /> Room {room.roomNumber} Detail
        </h1>
        <p className="text-xs text-[#3C315B]/70 max-w-2xl leading-relaxed font-normal">
          {room.description || `Inspect room specifications, bed arrangement, and submit a room allocation request to your warden.`}
        </p>
      </div>

      {/* Warning Banners */}
      {hasActiveAllocation && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900 flex items-center gap-3 shadow-sm text-xs">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold block">Active Allocation Detected</span>
            <span className="text-amber-800/80 font-normal">
              You are currently allocated to Room {activeAllocation.room?.roomNumber}. Request a room transfer if you wish to move.
            </span>
          </div>
        </div>
      )}

      {pendingRequest && (
        <div className="p-5 bg-[#ECE8FE] border border-[#AB9FF2]/40 rounded-3xl text-[#3C315B] flex items-center gap-3 shadow-sm text-xs">
          <Clock className="h-5 w-5 shrink-0 text-[#6A4FE0]" />
          <div>
            <span className="font-bold block">Request Pending Review</span>
            <span className="text-[#3C315B]/70 font-normal">
              You have a pending request for Room {pendingRequest.room?.roomNumber}. Awaiting Warden approval.
            </span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Photos & Beds */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery Card */}
          <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2 border-b border-[#E5E4E8] pb-3">
              <Sparkles className="h-5 w-5 text-[#6A4FE0]" /> Approved Room Photographs
            </h3>

            {room.images && room.images.length > 0 ? (
              <div className="space-y-4">
                <div className="h-72 w-full rounded-2xl overflow-hidden bg-[#FAFAFA] border border-[#E5E4E8]">
                  <img
                    src={room.images[0].secureUrl}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {room.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {room.images.slice(1).map((img: any) => (
                      <div key={img.id} className="h-20 rounded-xl overflow-hidden border border-[#E5E4E8] bg-[#FAFAFA]">
                        <img src={img.secureUrl} alt="Room detail" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 rounded-2xl bg-[#FAFAFA] border border-dashed border-[#E5E4E8] flex flex-col items-center justify-center p-6 text-center text-[#3C315B]/60 space-y-2">
                <Building2 className="h-10 w-10 text-[#6A4FE0]/30" />
                <p className="text-xs font-medium">Official photographs pending warden upload.</p>
              </div>
            )}
          </div>

          {/* Bed Arrangement Card */}
          <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2 border-b border-[#E5E4E8] pb-3">
              <BedDouble className="h-5 w-5 text-[#6A4FE0]" /> Bed Arrangement &amp; Occupancy
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {room.beds?.map((bed: any) => {
                const isSelected = selectedBedId === bed.id;
                const occupant = bed.allocations?.[0]?.student;

                return (
                  <div
                    key={bed.id}
                    onClick={() => {
                      if (bed.isAvailable && !hasActiveAllocation && !pendingRequest) {
                        setSelectedBedId(bed.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                        ? 'border-[#6A4FE0] bg-[#ECE8FE] shadow-sm'
                        : bed.isAvailable
                          ? 'border-[#E5E4E8] bg-white hover:border-[#AB9FF2]'
                          : 'border-[#E5E4E8] bg-[#FAFAFA] opacity-70 cursor-not-allowed'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3C315B] text-xs">
                        {bed.label || `Bed ${bed.bedNumber}`}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        bed.isAvailable ? 'bg-[#E6F9F0] text-[#2EC08B]' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {bed.isAvailable ? 'Available' : 'Occupied'}
                      </span>
                    </div>

                    {occupant ? (
                      <div className="mt-3 pt-2 border-t border-[#E5E4E8] text-[11px] text-[#3C315B]/70 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-[#6A4FE0] shrink-0" />
                        <span className="truncate font-semibold">{occupant.profile?.fullName || occupant.email}</span>
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-[#3C315B]/60 font-normal">
                        {isSelected ? 'Selected for request' : 'Click to select this bed'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Room Specifications */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 space-y-6 shadow-sm">
            <div className="space-y-3 border-b border-[#E5E4E8] pb-4">
              <h3 className="text-base font-bold text-[#3C315B]">Room Specifications</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E5E4E8]">
                  <span className="text-[#3C315B]/60 font-medium">Room Number</span>
                  <span className="font-bold text-[#3C315B]">{room.roomNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E4E8]">
                  <span className="text-[#3C315B]/60 font-medium">Floor</span>
                  <span className="font-semibold text-[#3C315B]">Floor {room.floor}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E4E8]">
                  <span className="text-[#3C315B]/60 font-medium">Capacity</span>
                  <span className="font-semibold text-[#3C315B]">{room.capacity} Beds</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E4E8]">
                  <span className="text-[#3C315B]/60 font-medium">Current Occupancy</span>
                  <span className="font-bold text-[#3C315B]">{room.currentOccupancy} Allocated</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E4E8]">
                  <span className="text-[#3C315B]/60 font-medium">Condition</span>
                  <Badge variant="outline" className="capitalize text-[10px] bg-[#FAFAFA] border-[#E5E4E8] text-[#3C315B] font-bold">
                    {room.condition?.toLowerCase() || 'Good'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Room Facilities */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#3C315B] block">Room Facilities</span>
              <div className="flex flex-wrap gap-2">
                {['Bed', 'Study Table', 'Cupboard', 'Fan', 'Wi-Fi'].map((fac) => (
                  <span key={fac} className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#6A4FE0]" /> {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {isUnderMaintenance ? (
                <Button disabled className="w-full text-xs font-bold bg-amber-500 text-white rounded-2xl h-11">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Under Maintenance
                </Button>
              ) : isFull ? (
                <Button disabled className="w-full text-xs font-bold bg-zinc-200 text-zinc-500 rounded-2xl h-11">
                  Currently Full
                </Button>
              ) : pendingRequest ? (
                <Button disabled className="w-full text-xs font-bold bg-[#ECE8FE] text-[#3C315B] rounded-2xl h-11 border border-[#AB9FF2]/40">
                  <Clock className="mr-2 h-4 w-4 text-[#6A4FE0]" /> Request Pending Review
                </Button>
              ) : hasActiveAllocation ? (
                <Button disabled className="w-full text-xs font-bold bg-zinc-200 text-zinc-500 rounded-2xl h-11">
                  Already Allocated
                </Button>
              ) : (
                <Button
                  onClick={() => createRequestMutation.mutate()}
                  disabled={createRequestMutation.isPending}
                  className="w-full text-xs font-bold bg-[#3C315B] hover:bg-[#2D2447] text-white rounded-2xl h-11 shadow-sm"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {createRequestMutation.isPending
                    ? 'Submitting Request...'
                    : selectedBedId
                      ? 'Request Selected Bed'
                      : 'Request Room Allocation'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
