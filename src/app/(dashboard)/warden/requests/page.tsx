'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Clock,
  User,
  Building2,
  BedDouble,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { StatCard } from '@/components/ui/stat-card';
import { MeshBackground } from '@/components/ui/mesh-background';
import { SpotlightCard } from '@/components/ui/spotlight';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function WardenRoomRequestsPage() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['wardenRoomRequests'],
    queryFn: async () => {
      const res = await api.get('/room-requests');
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, bedId }: { requestId: string; bedId: string }) => {
      const payload: any = {};
      if (bedId && bedId !== 'AUTO_BED') {
        payload.bedId = bedId;
      }
      const res = await api.patch(`/room-requests/${requestId}/approve`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room request approved & bed officially allocated!');
      queryClient.invalidateQueries({ queryKey: ['wardenRoomRequests'] });
      queryClient.invalidateQueries({ queryKey: ['roomOccupancy'] });
      setApproveModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      const responseData = err.response?.data;
      let msg = 'Failed to approve request.';
      if (typeof responseData?.message === 'string') {
        msg = responseData.message;
      } else if (Array.isArray(responseData?.message) && responseData.message.length > 0) {
        msg = responseData.message[0];
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const res = await api.patch(`/room-requests/${requestId}/reject`, { rejectionReason: reason });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room request rejected.');
      queryClient.invalidateQueries({ queryKey: ['wardenRoomRequests'] });
      setRejectModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject request.');
    },
  });

  const handleOpenApprove = (req: any) => {
    setSelectedRequest(req);
    const availableBeds = req.room?.beds?.filter((b: any) => b.isAvailable) || [];
    const prefBed = availableBeds.find((b: any) => b.id === req.preferredBedId);
    setSelectedBedId(prefBed?.id || availableBeds[0]?.id || 'AUTO_BED');
    setApproveModalOpen(true);
  };

  const handleOpenReject = (req: any) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const pendingRequests = requests?.filter((r: any) => r.status === 'PENDING') || [];
  const approvedRequests = requests?.filter((r: any) => r.status === 'APPROVED') || [];
  const rejectedRequests = requests?.filter((r: any) => r.status === 'REJECTED') || [];

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Light Purple Hero Banner */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full bg-[#3C315B] text-white font-bold text-[10px]">Warden Authority</span>
            <span className="px-3 py-0.5 rounded-full bg-[#3C315B] text-white font-bold text-[10px]">Double-Booking Protected</span>
          </div>
          <h1 className="text-2xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#6A4FE0]" /> Student Room Requests Console
          </h1>
          <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
            Review student room allocation requests, verify bed availability, and execute atomic allocations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#6A4FE0]" /> Refresh Requests
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Requests"
          value={pendingRequests.length}
          sublabel="Awaiting approval"
          icon={Clock}
          accent="cornflower"
          index={0}
        />
        <StatCard
          label="Approved Allocations"
          value={approvedRequests.length}
          sublabel="Total processed"
          icon={Check}
          accent="mint"
          index={1}
        />
        <StatCard
          label="Rejected Requests"
          value={rejectedRequests.length}
          sublabel="Not allocated"
          icon={X}
          accent="blush"
          index={2}
        />
        <StatCard
          label="Total Handled"
          value={requests?.length || 0}
          sublabel="Historical log"
          icon={Building2}
          accent="lavender"
          index={3}
        />
      </div>

      <div className="rounded-3xl bg-white border border-[#E5E4E8] p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#3C315B] flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#6A4FE0]" /> Pending Student Requests
        </h2>

        {isLoading ? (
          <p className="text-xs text-[#3C315B]/60 text-center py-8 animate-pulse font-normal">Loading pending requests...</p>
        ) : pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((req: any) => {
              const availableBeds = req.room?.beds?.filter((b: any) => b.isAvailable) || [];
              const isRoomFull = req.room?.currentOccupancy >= req.room?.capacity;

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-[#3C315B] text-sm">
                        {req.student?.profile?.fullName || req.student?.email}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Pending Review
                      </span>
                      <span className="text-[11px] text-[#3C315B]/50 font-normal">
                        Submitted {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[#3C315B]/70 text-xs flex-wrap font-normal">
                      <span>Requested: <strong className="text-[#3C315B] font-bold">Room {req.room?.roomNumber}</strong></span>
                      <span>Capacity: {req.room?.capacity} Beds ({req.room?.currentOccupancy} Occupied)</span>
                      <span>Vacant Slots: <strong className="text-emerald-600 font-bold">{Math.max(0, req.room?.capacity - req.room?.currentOccupancy)} Space</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenReject(req)}
                      className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-all flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenApprove(req)}
                      disabled={isRoomFull}
                      className="px-4 py-2 rounded-2xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve Allocation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#3C315B]/60 text-center py-8 font-normal">
            No pending room requests awaiting review.
          </p>
        )}
      </div>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Room Allocation</DialogTitle>
            <DialogDescription>
              Select a bed or confirm auto-assignment for {selectedRequest?.student?.email} in Room {selectedRequest?.room?.roomNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-caption text-fog">Select Bed for Student</label>
              <select
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                className="w-full h-10 rounded-md border border-ash bg-white px-3 text-caption text-aubergine"
              >
                {selectedRequest?.room?.beds?.filter((b: any) => b.isAvailable).length > 0 ? (
                  selectedRequest?.room?.beds
                    ?.filter((b: any) => b.isAvailable)
                    .map((bed: any) => (
                      <option key={bed.id} value={bed.id}>
                        {bed.label || `Bed ${bed.bedNumber}`} {bed.id === selectedRequest?.preferredBedId ? '(Student Preferred)' : ''}
                      </option>
                    ))
                ) : (
                  <option value="AUTO_BED">Auto-assign Bed Slot (Auto-created)</option>
                )}
              </select>
            </div>

            <Button
              onClick={() =>
                approveMutation.mutate({
                  requestId: selectedRequest.id,
                  bedId: selectedBedId,
                })
              }
              disabled={approveMutation.isPending || !selectedBedId}
              className="w-full"
            >
              {approveMutation.isPending ? 'Processing Allocation...' : 'Confirm Bed Allocation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Room Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the room request for {selectedRequest?.student?.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-caption text-fog">Rejection Reason</label>
              <Input
                placeholder="e.g. Room reserved for maintenance, invalid eligibility"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>

            <Button
              variant="destructive"
              onClick={() =>
                rejectMutation.mutate({
                  requestId: selectedRequest.id,
                  reason: rejectionReason || 'Request rejected by Warden',
                })
              }
              disabled={rejectMutation.isPending}
              className="w-full"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
