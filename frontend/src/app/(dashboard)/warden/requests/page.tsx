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
      const res = await api.patch(`/room-requests/${requestId}/approve`, { bedId });
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
      toast.error(err.response?.data?.message || 'Failed to approve request.');
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
    <div className="relative space-y-8 pb-12">
      <MeshBackground />

      <PageHero
        title="Student Room Requests Console"
        description="Review student room allocation requests, verify bed availability, and execute atomic allocations."
        badges={['Warden Authority', 'Double-Booking Protected']}
        icon={ShieldCheck}
        mode="bone"
        actions={
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Requests
          </Button>
        }
      />

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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SpotlightCard className="p-6 space-y-4">
          <h2 className="text-subheading font-light tracking-phantom text-aubergine flex items-center gap-2">
            <Clock className="h-5 w-5 text-cornflower-pop" /> Pending Student Requests
          </h2>

          {isLoading ? (
            <p className="text-caption text-fog text-center py-8 animate-pulse">Loading pending requests...</p>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((req: any) => {
                const availableBeds = req.room?.beds?.filter((b: any) => b.isAvailable) || [];
                const isRoomFull = req.room?.currentOccupancy >= req.room?.capacity;

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-card bg-bone border border-ash flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-caption"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-aubergine text-body-sm">
                          {req.student?.profile?.fullName || req.student?.email}
                        </span>
                        <Badge variant="warning" className="text-[10px]">
                          Pending Review
                        </Badge>
                        <span className="text-[11px] text-fog">
                          Submitted {new Date(req.requestedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-fog text-[11px] flex-wrap">
                        <span>Requested: <strong className="text-aubergine">Room {req.room?.roomNumber}</strong></span>
                        <span>Capacity: {req.room?.capacity} Beds ({req.room?.currentOccupancy} Occupied)</span>
                        <span>Vacant Slots: <strong className="text-mint-signal">{Math.max(0, req.room?.capacity - req.room?.currentOccupancy)} Space</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReject(req)}
                        className="text-blush-mist hover:bg-blush-mist/10"
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenApprove(req)}
                        disabled={isRoomFull}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve Allocation
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-caption text-fog text-center py-8">
              No pending room requests awaiting review.
            </p>
          )}
        </SpotlightCard>
      </motion.div>

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
