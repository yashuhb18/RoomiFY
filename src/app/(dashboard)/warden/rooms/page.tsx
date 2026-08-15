'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  BedDouble,
  RefreshCw,
  DoorOpen,
  Layers,
  Building,
} from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function WardenRoomsPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [capacity, setCapacity] = useState('2');

  const { data: rooms, isLoading, refetch } = useQuery({
    queryKey: ['wardenRooms'],
    queryFn: async () => {
      const res = await api.get('/rooms');
      return res.data;
    },
  });

  const totalRooms = rooms ? rooms.length : 0;
  const vacantRooms = rooms ? rooms.filter((r: any) => (r.currentOccupancy || 0) < r.capacity).length : 0;
  const fullRooms = rooms ? rooms.filter((r: any) => (r.currentOccupancy || 0) >= r.capacity).length : 0;
  const totalBeds = rooms ? rooms.reduce((acc: number, r: any) => acc + (r.capacity || 0), 0) : 0;

  const saveRoomMutation = useMutation({
    mutationFn: async (dto: any) => {
      if (editingRoom) {
        const res = await api.patch(`/rooms/${editingRoom.id}`, dto);
        return res.data;
      } else {
        const res = await api.post('/rooms', dto);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(editingRoom ? 'Room updated successfully.' : 'Room added successfully.');
      queryClient.invalidateQueries({ queryKey: ['wardenRooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomOccupancy'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save room.');
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/rooms/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['wardenRooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomOccupancy'] });
    },
  });

  const handleOpenEdit = (room: any) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setFloor(String(room.floor));
    setCapacity(String(room.capacity));
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingRoom(null);
    setRoomNumber('');
    setFloor('1');
    setCapacity('2');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    saveRoomMutation.mutate({
      roomNumber,
      floor: parseInt(floor, 10),
      capacity: parseInt(capacity, 10),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Light Purple Hero Banner Card — Exactly like Screenshot 2 */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-4 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[11px] font-semibold tracking-wide">
              Hostel Capacity &amp; Floorplan
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAFD] text-[#3C315B] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#3C315B] tracking-tight">
                Hostel Room Inventory &amp; Management
              </h1>
            </div>

            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Configure room capacities, floors, maintenance conditions, and official photographs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Inventory
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 rounded-full bg-[#9884F9] hover:bg-[#8570F8] text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Room
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row — Exactly like Screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              TOTAL ROOMS
            </p>
            <p className="text-2xl font-bold text-[#3C315B]">{totalRooms}</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">Active inventory</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Vacant Rooms */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              VACANT ROOMS
            </p>
            <p className="text-2xl font-bold text-[#3C315B]">{vacantRooms}</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">Available for booking</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <DoorOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Full Rooms */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              FULL ROOMS
            </p>
            <p className="text-2xl font-bold text-[#3C315B]">{fullRooms}</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">At max capacity</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#EDEAFD] text-[#6A4FE0] flex items-center justify-center">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>

        {/* Total Beds */}
        <div className="rounded-2xl bg-white p-5 border border-[#E5E4E8] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#3C315B]/50 uppercase tracking-wider">
              TOTAL BEDS
            </p>
            <p className="text-2xl font-bold text-[#2EC08B]">{totalBeds}</p>
            <p className="text-xs text-[#3C315B]/60 font-medium">Across floors</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table / Grid Container */}
      <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm">
        {isLoading ? (
          <p className="text-xs text-[#3C315B]/60 text-center py-12">Loading room inventory...</p>
        ) : rooms && rooms.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#3C315B]">Room Number</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">Floor</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">Capacity</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">Occupancy</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: any) => {
                const ratio = (room.currentOccupancy || 0) / room.capacity;
                let statusBadge = <Badge variant="secondary" className="bg-[#E6F9F0] text-[#2EC08B] font-semibold">Vacant</Badge>;
                if (ratio >= 1) statusBadge = <Badge variant="destructive" className="bg-red-50 text-red-600 font-semibold">Full</Badge>;
                else if (ratio > 0) statusBadge = <Badge variant="outline" className="bg-amber-50 text-amber-600 font-semibold">Partial</Badge>;

                return (
                  <TableRow key={room.id}>
                    <TableCell className="font-bold text-[#3C315B] text-sm">
                      Room {room.roomNumber}
                    </TableCell>
                    <TableCell className="text-xs text-[#3C315B]/70 font-medium">
                      Floor {room.floor}
                    </TableCell>
                    <TableCell className="text-xs text-[#3C315B]/70 font-medium">
                      {room.capacity} Beds
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[#3C315B]">
                      {room.currentOccupancy || 0} Allocated
                    </TableCell>
                    <TableCell>{statusBadge}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(room)}
                        className="h-8 w-8 p-0 text-[#3C315B]/60 hover:text-[#3C315B]"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRoomMutation.mutate(room.id)}
                        className="h-8 w-8 p-0 text-[#3C315B]/60 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="py-16 text-center text-xs text-[#3C315B]/60 font-medium">
            No rooms configured. Click &quot;Add Room&quot; to build your room inventory.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-3xl border border-[#E5E4E8] bg-white text-[#3C315B]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#3C315B]">
              {editingRoom ? 'Edit Room Configuration' : 'Add New Room'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              Configure room details in the hostel inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Room Number</label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="101"
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
              disabled={saveRoomMutation.isPending}
              className="w-full rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs h-11"
            >
              {saveRoomMutation.isPending ? 'Saving...' : 'Save Room Configuration'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
