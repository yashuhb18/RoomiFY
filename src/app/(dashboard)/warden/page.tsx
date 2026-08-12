'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/ui/spotlight';
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

  // Metrics calculation
  let totalRooms = 0;
  let totalBeds = 0;
  let totalOccupied = 0;

  if (occupancy) {
    totalRooms = occupancy.length;
    occupancy.forEach((r: any) => {
      totalBeds += r.capacity;
      totalOccupied += r.currentOccupancy;
    });
  }

  const occupancyRate = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
              Control Room Engine
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
              RLS Policy Active
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Warden Admin Console
          </h1>
          <p className="text-sm text-zinc-400">
            3D floorplan heatmap analytics, SLA predictive maintenance, and audit controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetchOccupancy()}
            className="border-zinc-800 hover:bg-zinc-900 text-xs"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Refresh Grid
          </Button>
          <Button
            onClick={() => setIsRoomModalOpen(true)}
            className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-5 h-9 rounded-xl transition-all"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Room
          </Button>
        </div>
      </div>

      {/* Spotlight Control Dials */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
              Occupancy Rate
            </p>
            <div className="text-3xl font-extrabold text-white">{occupancyRate}%</div>
            <p className="text-[11px] text-zinc-500 font-mono">
              {totalOccupied} / {totalBeds} Beds Booked
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
            <Activity className="h-5 w-5" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
              Total Rooms
            </p>
            <div className="text-3xl font-extrabold text-white">{totalRooms}</div>
            <p className="text-[11px] text-zinc-500 font-mono">Capacity Matrix</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
            <Building2 className="h-5 w-5" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
              SLA Health
            </p>
            <div className="text-3xl font-extrabold text-emerald-400">
              {breachRisks && breachRisks.length > 0 ? 'Warning' : '100%'}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Predictive Engine</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
              Breach Risks
            </p>
            <div className="text-3xl font-extrabold text-red-400">
              {breachRisks ? breachRisks.length : 0}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Predicted Overruns</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </SpotlightCard>
      </div>

      {/* SLA Breach Alert Banner */}
      {breachRisks && breachRisks.length > 0 && (
        <Card className="rounded-2xl border border-red-800/40 bg-red-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertTriangle className="h-4 w-4 animate-bounce" /> Predictive SLA Breach Risk Warning
          </div>
          <p className="text-xs text-red-300/80 leading-relaxed">
            Predictive SLA model identified {breachRisks.length} tickets with estimated resolution time exceeding maximum policy threshold window.
          </p>
        </Card>
      )}

      {/* 3D Floorplan Heatmap Visualizer */}
      <Floorplan3DVisualizer
        rooms={occupancy || []}
        onSelectRoom={(room) => setSelectedRoomDrawer(room)}
      />

      {/* Create Room Modal */}
      <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
        <DialogContent className="rounded-2xl border border-zinc-800 bg-[#0A0A0A] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Configure Room</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Add a new room to the 3D floorplan visualizer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRoom} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Room Number</label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., 301"
                className="bg-black border-zinc-800 h-10 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Floor</label>
                <Input
                  type="number"
                  min={0}
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="bg-black border-zinc-800 h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Bed Capacity</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="bg-black border-zinc-800 h-10 text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={createRoomMutation.isPending}
              className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl"
            >
              {createRoomMutation.isPending ? 'Saving...' : 'Add Room to Heatmap'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
