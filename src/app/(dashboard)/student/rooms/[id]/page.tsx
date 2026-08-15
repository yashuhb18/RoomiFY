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
    <div className="space-y-8 pb-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/student/rooms')}
        className="text-caption text-fog hover:text-aubergine"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Explore Rooms
      </Button>

      <PageHero
        mode="bone"
        icon={Building2}
        badges={[`Floor ${room.floor}`, `${availableBeds} / ${room.capacity} Beds Available`]}
        title={`Room ${room.roomNumber} Detail`}
        description={room.description || `Inspect facilities, bed arrangement, and submit a room allocation request to the warden.`}
      />

      {/* Warning Banners */}
      {hasActiveAllocation && (
        <Card className="p-4 bg-blush-mist/30 border border-blush-mist text-caption text-aubergine flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold block">Active Allocation Detected</span>
            <span>
              You are currently allocated to Room {activeAllocation.room?.roomNumber}. Request a room transfer if you wish to move.
            </span>
          </div>
        </Card>
      )}

      {pendingRequest && (
        <Card className="p-4 bg-cornflower-pop/10 border border-cornflower-pop/20 text-caption text-aubergine flex items-center gap-3">
          <Clock className="h-5 w-5 shrink-0 text-cornflower-pop" />
          <div>
            <span className="font-semibold block">Request Pending</span>
            <span>
              You have a pending request for Room {pendingRequest.room?.roomNumber}. Awaiting Warden review.
            </span>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Photos & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <Card className="overflow-hidden border-ash p-6 space-y-4">
            <h3 className="text-subheading font-light text-aubergine flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cornflower-pop" /> Approved Room Photographs
            </h3>

            {room.images && room.images.length > 0 ? (
              <div className="space-y-4">
                <div className="h-72 w-full rounded-card overflow-hidden bg-bone border border-ash">
                  <img
                    src={room.images[0].secureUrl}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {room.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {room.images.slice(1).map((img: any) => (
                      <div key={img.id} className="h-20 rounded-card overflow-hidden border border-ash bg-bone">
                        <img src={img.secureUrl} alt="Room detail" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 rounded-card bg-bone border border-dashed border-ash flex flex-col items-center justify-center p-6 text-center text-fog space-y-2">
                <Building2 className="h-10 w-10 text-cornflower-pop/30" />
                <p className="text-caption">Official photographs pending warden upload.</p>
              </div>
            )}
          </Card>

          {/* Bed Allocation Grid */}
          <Card className="p-6 border-ash space-y-4">
            <h3 className="text-subheading font-light text-aubergine flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-cornflower-pop" /> Bed Arrangement & Occupancy
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
                    className={`p-4 rounded-card border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cornflower-pop bg-cornflower-pop/10 shadow-sm'
                        : bed.isAvailable
                        ? 'border-ash bg-bone hover:border-cornflower-pop/40'
                        : 'border-ash bg-bone/40 opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-light text-aubergine text-body-sm">
                        {bed.label || `Bed ${bed.bedNumber}`}
                      </span>
                      <Badge variant={bed.isAvailable ? 'success' : 'outline'}>
                        {bed.isAvailable ? 'Available' : 'Occupied'}
                      </Badge>
                    </div>

                    {occupant ? (
                      <div className="mt-3 pt-2 border-t border-ash text-[11px] text-fog flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-cornflower-pop shrink-0" />
                        <span className="truncate">{occupant.profile?.fullName || occupant.email}</span>
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-fog font-light">
                        {isSelected ? 'Selected for request' : 'Click to select this bed'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Col: Specifications & Request Panel */}
        <div className="space-y-6">
          <Card className="p-6 border-ash space-y-6">
            <div className="space-y-4 border-b border-ash pb-4">
              <h3 className="text-subheading font-light text-aubergine">Room Specifications</h3>

              <div className="space-y-2 text-caption">
                <div className="flex justify-between py-1 border-b border-ash/50">
                  <span className="text-fog">Room Number</span>
                  <span className="font-semibold text-aubergine">{room.roomNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ash/50">
                  <span className="text-fog">Floor</span>
                  <span className="text-aubergine">Floor {room.floor}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ash/50">
                  <span className="text-fog">Capacity</span>
                  <span className="text-aubergine">{room.capacity} Beds</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ash/50">
                  <span className="text-fog">Current Occupancy</span>
                  <span className="text-aubergine">{room.currentOccupancy} Allocated</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ash/50">
                  <span className="text-fog">Condition</span>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {room.condition?.toLowerCase() || 'Good'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="space-y-2">
              <span className="text-caption font-light text-aubergine block">Room Facilities</span>
              <div className="flex flex-wrap gap-2">
                {['Bed', 'Study Table', 'Cupboard', 'Fan', 'Wi-Fi'].map((fac) => (
                  <Badge key={fac} variant="secondary" className="text-caption">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-mint-signal" /> {fac}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {isUnderMaintenance ? (
                <Button disabled className="w-full text-caption bg-amber-500">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Under Maintenance
                </Button>
              ) : isFull ? (
                <Button disabled className="w-full text-caption">
                  Currently Full
                </Button>
              ) : pendingRequest ? (
                <Button disabled className="w-full text-caption variant-outline">
                  <Clock className="mr-2 h-4 w-4 text-cornflower-pop" /> Request Pending Review
                </Button>
              ) : hasActiveAllocation ? (
                <Button disabled className="w-full text-caption">
                  Already Allocated
                </Button>
              ) : (
                <Button
                  onClick={() => createRequestMutation.mutate()}
                  disabled={createRequestMutation.isPending}
                  className="w-full text-caption h-11"
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
          </Card>
        </div>
      </div>
    </div>
  );
}
