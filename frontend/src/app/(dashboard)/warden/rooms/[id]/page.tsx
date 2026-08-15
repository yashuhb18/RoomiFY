'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2,
  BedDouble,
  Users,
  Upload,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import api from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { toast } from 'sonner';

export default function WardenRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const roomId = params?.id as string;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>('');

  const { data: room, isLoading, refetch } = useQuery({
    queryKey: ['wardenRoomDetail', roomId],
    queryFn: async () => {
      const res = await api.get(`/rooms/${roomId}`);
      return res.data;
    },
    enabled: !!roomId,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/rooms/${roomId}/images`, formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room photo uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['wardenRoomDetail', roomId] });
      setSelectedFile(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const res = await api.delete(`/rooms/${roomId}/images/${imageId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room photo deleted.');
      queryClient.invalidateQueries({ queryKey: ['wardenRoomDetail', roomId] });
    },
  });

  const updateConditionMutation = useMutation({
    mutationFn: async (condition: string) => {
      const res = await api.patch(`/rooms/${roomId}/condition`, { condition });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room condition updated.');
      queryClient.invalidateQueries({ queryKey: ['wardenRoomDetail', roomId] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (allocationId: string) => {
      const res = await api.patch(`/allocations/${allocationId}/check-out`, { releaseReason: 'Warden manual release' });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Student checked out and bed released.');
      queryClient.invalidateQueries({ queryKey: ['wardenRoomDetail', roomId] });
      queryClient.invalidateQueries({ queryKey: ['roomOccupancy'] });
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-caption text-fog animate-pulse">
        Loading warden room manager...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="py-20 text-center space-y-4">
        <Building2 className="h-12 w-12 mx-auto text-fog" />
        <h3 className="text-subheading font-light text-aubergine">Room Not Found</h3>
        <Button variant="outline" onClick={() => router.push('/warden/rooms')}>
          Back to Rooms List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/warden/rooms')}
        className="text-caption text-fog hover:text-aubergine"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Room Inventory
      </Button>

      <PageHero
        mode="bone"
        icon={Building2}
        badges={[`Floor ${room.floor}`, `${room.currentOccupancy} / ${room.capacity} Occupied`]}
        title={`Room ${room.roomNumber} Manager`}
        description="Upload official room photographs, manage bed allocations, and set maintenance conditions."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Photos & Beds */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Management */}
          <Card className="p-6 border-ash space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-subheading font-light text-aubergine flex items-center gap-2">
                <Upload className="h-5 w-5 text-cornflower-pop" /> Official Room Photo Gallery
              </h3>
              <span className="text-caption text-fog">{room.images?.length || 0} Photos Uploaded</span>
            </div>

            {/* Upload Area */}
            <div className="p-4 rounded-card bg-bone border border-dashed border-ash flex items-center justify-between flex-wrap gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-caption text-fog file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-cornflower-pop/10 file:text-aubergine hover:file:bg-cornflower-pop/20"
              />
              <Button
                size="sm"
                disabled={!selectedFile || uploadPhotoMutation.isPending}
                onClick={() => selectedFile && uploadPhotoMutation.mutate(selectedFile)}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </div>

            {/* Gallery Grid */}
            {room.images && room.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {room.images.map((img: any) => (
                  <div key={img.id} className="relative group h-36 rounded-card overflow-hidden border border-ash bg-bone">
                    <img src={img.secureUrl} alt="Room" className="w-full h-full object-cover" />
                    <button
                      onClick={() => deletePhotoMutation.mutate(img.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-caption text-fog text-center py-6">No official room photos uploaded yet.</p>
            )}
          </Card>

          {/* Bed Allocation Management */}
          <Card className="p-6 border-ash space-y-4">
            <h3 className="text-subheading font-light text-aubergine flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-cornflower-pop" /> Bed Allocations & Occupants
            </h3>

            <div className="space-y-3">
              {room.beds?.map((bed: any) => {
                const allocation = bed.allocations?.[0];
                const occupant = allocation?.student;

                return (
                  <div
                    key={bed.id}
                    className="p-4 rounded-card bg-bone border border-ash flex items-center justify-between flex-wrap gap-3 text-caption"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-aubergine text-body-sm">
                          {bed.label || `Bed ${bed.bedNumber}`}
                        </span>
                        <Badge variant={bed.isAvailable ? 'success' : 'outline'}>
                          {bed.isAvailable ? 'Vacant' : 'Occupied'}
                        </Badge>
                      </div>

                      {occupant ? (
                        <p className="text-fog text-[11px]">
                          Occupant: <strong className="text-aubergine">{occupant.profile?.fullName || occupant.email}</strong>
                        </p>
                      ) : (
                        <p className="text-fog text-[11px]">No student currently assigned to this bed.</p>
                      )}
                    </div>

                    {allocation && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={checkOutMutation.isPending}
                        onClick={() => checkOutMutation.mutate(allocation.id)}
                        className="text-blush-mist hover:bg-blush-mist/10 text-xs h-8"
                      >
                        <LogOut className="mr-1 h-3.5 w-3.5" /> Check-Out Student
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Col: Condition & Control */}
        <div className="space-y-6">
          <Card className="p-6 border-ash space-y-6">
            <h3 className="text-subheading font-light text-aubergine">Room Controls</h3>

            {/* Change Condition */}
            <div className="space-y-2">
              <label className="text-caption text-fog font-light block">Update Maintenance Condition</label>
              <select
                value={selectedCondition || room.condition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value);
                  updateConditionMutation.mutate(e.target.value);
                }}
                className="w-full h-10 rounded-md border border-ash bg-white px-3 text-caption text-aubergine"
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="NEEDS_MAINTENANCE">Needs Maintenance</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>

            {/* Room Info */}
            <div className="space-y-2 pt-2 border-t border-ash text-caption">
              <div className="flex justify-between py-1">
                <span className="text-fog">Room Number</span>
                <span className="font-semibold text-aubergine">{room.roomNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-fog">Floor Level</span>
                <span className="text-aubergine">Floor {room.floor}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-fog">Capacity</span>
                <span className="text-aubergine">{room.capacity} Beds</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-fog">Occupancy</span>
                <span className="text-aubergine">{room.currentOccupancy} Allocated</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
