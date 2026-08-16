'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Activity,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Floorplan3DVisualizer } from '@/components/warden/3d-floorplan';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function WardenDashboardPage() {
  const queryClient = useQueryClient();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoomDrawer, setSelectedRoomDrawer] = useState<any>(null);

  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [capacity, setCapacity] = useState('2');

  const { data: occupancy, isLoading: loadingOccupancy, refetch: refetchOccupancy } = useQuery({
    queryKey: ['roomOccupancy'],
    queryFn: async () => {
      const res = await api.get('/rooms/occupancy');
      return res.data;
    },
  });

  const { data: breachRisks } = useQuery({
    queryKey: ['breachRisks'],
    queryFn: async () => {
      const res = await api.get('/tickets/breach-risks');
      return res.data;
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (dto: any) => {
      const res = await api.post('/rooms', dto);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room added to floorplan matrix.');
      queryClient.invalidateQueries({ queryKey: ['roomOccupancy'] });
      setIsRoomModalOpen(false);
      setRoomNumber('');
    },
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    createRoomMutation.mutate({
      roomNumber,
      floor: parseInt(floor, 10),
      capacity: parseInt(capacity, 10),
    });
  };

  // Demo data if DB is empty so heatmap renders rooms like in screenshot
  const roomsData = occupancy && occupancy.length > 0 ? occupancy : [
    { id: '1', roomNumber: '101', floor: 1, capacity: 2, currentOccupancy: 2 },
    { id: '2', roomNumber: '102', floor: 1, capacity: 2, currentOccupancy: 0 },
    { id: '3', roomNumber: '103', floor: 1, capacity: 3, currentOccupancy: 2 },
    { id: '4', roomNumber: '201', floor: 2, capacity: 2, currentOccupancy: 1 },
    { id: '5', roomNumber: '301', floor: 3, capacity: 2, currentOccupancy: 0 },
    { id: '6', roomNumber: '501', floor: 5, capacity: 4, currentOccupancy: 2 },
  ];

  let totalRooms = roomsData.length;
  let totalBeds = 0;
  let totalOccupied = 0;

  roomsData.forEach((r: any) => {
    totalBeds += r.capacity;
    totalOccupied += r.currentOccupancy;
  });

  const occupancyRate = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Light Purple Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-4 shadow-sm border border-[#B7A6F6]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-xs font-semibold tracking-wide">
                Control Room Engine
              </span>
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-xs font-semibold tracking-wide">
                RLS Policy Active
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#3C315B] tracking-tight">
              Warden Admin Console
            </h1>

            <p className="text-sm text-[#3C315B]/80 max-w-xl font-medium">
              3D floorplan heatmap analytics, SLA predictive maintenance, and audit controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetchOccupancy()}
              className="px-4 py-2.5 rounded-full bg-white text-[#3C315B] font-semibold text-sm border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Grid
            </button>
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#9884F9] hover:bg-[#8570F8] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Room
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row — Clean White Cards on Lavender Background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Occupancy Rate */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#3C315B]/60 uppercase tracking-wider">
              OCCUPANCY RATE
            </p>
            <p className="text-3xl font-bold text-[#3C315B]">{occupancyRate}%</p>
            <p className="text-xs md:text-sm text-[#3C315B]/70 font-medium">
              {totalOccupied} / {totalBeds} Beds Booked
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Total Rooms */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#3C315B]/60 uppercase tracking-wider">
              TOTAL ROOMS
            </p>
            <p className="text-3xl font-bold text-[#3C315B]">{totalRooms}</p>
            <p className="text-xs md:text-sm text-[#3C315B]/70 font-medium">Capacity Matrix</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* SLA Health */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#3C315B]/60 uppercase tracking-wider">
              SLA HEALTH
            </p>
            <p className="text-3xl font-bold text-[#2EC08B]">
              {breachRisks && breachRisks.length > 0 ? 'Warning' : '100%'}
            </p>
            <p className="text-xs md:text-sm text-[#3C315B]/70 font-medium">Predictive Engine</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Breach Risks */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#3C315B]/60 uppercase tracking-wider">
              BREACH RISKS
            </p>
            <p className="text-3xl font-bold text-red-500">
              {breachRisks ? breachRisks.length : 0}
            </p>
            <p className="text-xs md:text-sm text-[#3C315B]/70 font-medium">Predicted Overruns</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3D Isometric Floorplan Heatmap Container */}
      <Floorplan3DVisualizer
        rooms={roomsData}
        onSelectRoom={(room) => setSelectedRoomDrawer(room)}
      />

      {/* Bottom Notification Banner */}
      <div className="flex justify-end pt-2">
        <div className="px-4 py-2 rounded-full bg-[#3C315B] text-white text-xs font-semibold flex items-center gap-2 shadow-md">
          <CheckCircle className="w-3.5 h-3.5 text-[#2EC08B]" /> Welcome to Warden Management Portal!
        </div>
      </div>

      {/* Create Room Modal */}
      <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
        <DialogContent className="rounded-3xl border border-[#E5E4E8] bg-white text-[#3C315B]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#3C315B]">Configure Room</DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              Add a new room to the 3D floorplan visualizer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRoom} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Room Number</label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., 301"
                className="rounded-xl border-[#E5E4E8] bg-white text-[#3C315B]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3C315B]">Floor</label>
                <Input
                  type="number"
                  min={0}
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="rounded-xl border-[#E5E4E8] bg-white text-[#3C315B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3C315B]">Bed Capacity</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="rounded-xl border-[#E5E4E8] bg-white text-[#3C315B]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={createRoomMutation.isPending}
              className="w-full rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs h-11"
            >
              {createRoomMutation.isPending ? 'Saving...' : 'Add Room to Heatmap'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
