'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Edit2, Trash2, BedDouble, Users, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
              Hostel Capacity &amp; Floorplan
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Room Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure room capacities, floors, and manage maintenance assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-white/15 hover:bg-white/5"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-purple-400" /> Refresh List
          </Button>
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 text-white font-semibold text-xs px-6 shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Room
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-8">Loading rooms data...</p>
        ) : rooms && rooms.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Room #</TableHead>
                <TableHead className="font-mono text-xs">Floor</TableHead>
                <TableHead className="font-mono text-xs">Capacity</TableHead>
                <TableHead className="font-mono text-xs">Current Occupancy</TableHead>
                <TableHead className="font-mono text-xs">Status</TableHead>
                <TableHead className="font-mono text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: any) => {
                const ratio = room.currentOccupancy / room.capacity;
                let statusBadge = <Badge variant="success">Vacant</Badge>;
                if (ratio >= 1) statusBadge = <Badge variant="destructive">Full</Badge>;
                else if (ratio > 0) statusBadge = <Badge variant="warning">Partial</Badge>;

                return (
                  <TableRow key={room.id}>
                    <TableCell className="font-bold text-white text-base">
                      Room {room.roomNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-purple-300">
                      Floor {room.floor}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {room.capacity} Beds
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-white">
                      {room.currentOccupancy} Allocated
                    </TableCell>
                    <TableCell>{statusBadge}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(room)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRoomMutation.mutate(room.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400"
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
          <p className="text-xs text-muted-foreground text-center py-8">
            No rooms configured. Click "Add Room" to build your room grid.
          </p>
        )}
      </Card>

      {/* Add / Edit Room Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-3xl border border-white/10 bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingRoom ? 'Edit Room Configuration' : 'Add New Room'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure room details in the hostel layout.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Room Number</label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="301"
                className="bg-black/50 border-white/10 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Floor</label>
                <Input
                  type="number"
                  min={0}
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="bg-black/50 border-white/10 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Bed Capacity</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="bg-black/50 border-white/10 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saveRoomMutation.isPending}
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] text-white font-semibold text-xs h-11"
            >
              {saveRoomMutation.isPending ? 'Saving...' : 'Save Room Configuration'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
