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
  Upload,
  Sliders,
  ArrowLeft,
  Check,
  Image as ImageIcon,
  User,
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
  const [managingRoomId, setManagingRoomId] = useState<string | null>(null);

  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [capacity, setCapacity] = useState('2');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch all rooms
  const { data: rooms, isLoading, refetch } = useQuery({
    queryKey: ['wardenRooms'],
    queryFn: async () => {
      const res = await api.get('/rooms');
      return res.data;
    },
  });

  // Fetch single room details when managing
  const { data: managedRoom, refetch: refetchManagedRoom } = useQuery({
    queryKey: ['managedRoomDetail', managingRoomId],
    queryFn: async () => {
      if (!managingRoomId) return null;
      const res = await api.get(`/rooms/${managingRoomId}`);
      return res.data;
    },
    enabled: !!managingRoomId,
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

  const updateConditionMutation = useMutation({
    mutationFn: async ({ id, condition }: { id: string; condition: string }) => {
      const res = await api.patch(`/rooms/${id}/condition`, { condition });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room maintenance condition updated.');
      queryClient.invalidateQueries({ queryKey: ['wardenRooms'] });
      queryClient.invalidateQueries({ queryKey: ['managedRoomDetail', managingRoomId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update condition.');
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (!selectedFile) throw new Error('Please select an image file first.');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('isPrimary', 'true');

      const res = await api.post(`/rooms/${roomId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room photo uploaded successfully!');
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['managedRoomDetail', managingRoomId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload photo.');
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async ({ roomId, imageId }: { roomId: string; imageId: string }) => {
      const res = await api.delete(`/rooms/${roomId}/images/${imageId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Photo removed from room gallery.');
      queryClient.invalidateQueries({ queryKey: ['managedRoomDetail', managingRoomId] });
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

  // IF MANAGING A ROOM, SHOW DETAILED MANAGE VIEW (SCREENSHOT 2)
  if (managingRoomId && managedRoom) {
    const roomPhotos = managedRoom.images || [];

    return (
      <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => setManagingRoomId(null)}
            className="px-4 py-2 rounded-full bg-white text-[#3C315B] text-xs font-bold border border-[#E5E4E8] shadow-sm hover:bg-[#FAFAFA] transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Room Inventory
          </button>
        </div>

        {/* Hero Banner Card */}
        <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-2 shadow-sm border border-[#E5E4E8]">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide">
            Room Controls &amp; Photo Inventory
          </span>
          <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1">
            Managing Room {managedRoom.roomNumber}
          </h1>
          <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
            Floor {managedRoom.floor} &bull; Bed Capacity: {managedRoom.capacity} Beds &bull; Current Occupancy: {managedRoom.currentOccupancy || 0} Allocated
          </p>
        </div>

        {/* 2 Column Section: Official Room Photo Gallery & Room Controls */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Official Room Photo Gallery */}
          <div className="lg:col-span-2 rounded-[28px] bg-white p-7 border border-[#E5E4E8] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E4E8] pb-4">
              <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#6A4FE0]" /> Official Room Photo Gallery
              </h3>
              <span className="text-xs text-[#3C315B]/60 font-semibold">
                {roomPhotos.length} Photos Uploaded
              </span>
            </div>

            {/* Upload File Input Bar */}
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="px-4 py-2 rounded-xl bg-white border border-[#E5E4E8] text-[#3C315B] text-xs font-semibold cursor-pointer hover:bg-[#FAFAFA] shadow-sm">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-[#3C315B]/60 font-medium truncate max-w-[200px]">
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => uploadPhotoMutation.mutate(managedRoom.id)}
                disabled={uploadPhotoMutation.isPending || !selectedFile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ECE8FE] hover:bg-[#D6CDFE] text-[#3C315B] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-[#6A4FE0]" />
                {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>

            {/* Photo Gallery Grid Preview */}
            <div className="pt-2">
              {roomPhotos.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {roomPhotos.map((img: any) => (
                    <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-[#E5E4E8] shadow-sm w-48 h-32 bg-[#FAFAFA]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.imageUrl}
                        alt="Room Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => deletePhotoMutation.mutate({ roomId: managedRoom.id, imageId: img.id })}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#FAFAFA] border border-dashed border-[#E5E4E8] text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center mx-auto">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#3C315B]/60 font-medium">
                    No photos uploaded for Room {managedRoom.roomNumber} yet. Select a photo above to upload.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right 1 Col: Room Controls */}
          <div className="rounded-[28px] bg-white p-7 border border-[#E5E4E8] shadow-sm space-y-6">
            <h3 className="text-base font-bold text-[#3C315B]">Room Controls</h3>

            {/* Maintenance Condition Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#3C315B]/70 block">
                Update Maintenance Condition
              </label>
              <select
                value={managedRoom.condition || 'Good'}
                onChange={(e) => updateConditionMutation.mutate({ id: managedRoom.id, condition: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-[#E5E4E8] bg-white text-xs font-bold text-[#3C315B] focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
              >
                <option value="Good">Good</option>
                <option value="Excellent">Excellent</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>

            {/* Details Table */}
            <div className="space-y-3 pt-2 text-xs border-t border-[#E5E4E8]">
              <div className="flex items-center justify-between">
                <span className="text-[#3C315B]/60 font-medium">Room Number</span>
                <span className="font-bold text-[#3C315B]">{managedRoom.roomNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3C315B]/60 font-medium">Floor Level</span>
                <span className="font-semibold text-[#3C315B]">Floor {managedRoom.floor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3C315B]/60 font-medium">Capacity</span>
                <span className="font-semibold text-[#3C315B]">{managedRoom.capacity} Beds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3C315B]/60 font-medium">Occupancy</span>
                <span className="font-bold text-[#3C315B]">{managedRoom.currentOccupancy || 0} Allocated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card: Bed Allocations & Occupants */}
        <div className="rounded-[28px] bg-white p-7 border border-[#E5E4E8] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2 border-b border-[#E5E4E8] pb-4">
            <BedDouble className="h-5 w-5 text-[#6A4FE0]" /> Bed Allocations &amp; Occupants
          </h3>

          {managedRoom.beds && managedRoom.beds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {managedRoom.beds.map((bed: any, idx: number) => {
                const isOccupied = bed.isOccupied;
                const occupant = bed.occupant || bed.allocation?.student;

                return (
                  <div key={bed.id} className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3C315B]">
                        Bed {bed.bedNumber || idx + 1}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isOccupied ? 'bg-[#ECE8FE] text-[#3C315B]' : 'bg-[#E6F9F0] text-[#2EC08B]'
                        }`}>
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    {isOccupied && occupant ? (
                      <div className="text-xs text-[#3C315B] pt-1 space-y-0.5">
                        <p className="font-bold flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#6A4FE0]" /> {occupant.email || occupant.fullName}
                        </p>
                        <p className="text-[10px] text-[#3C315B]/60 font-medium">Resident Student</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#3C315B]/50 font-normal pt-1">Bed available for student allocation.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#3C315B]/60 py-4">No specific bed slot details recorded.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Light Purple Hero Banner Card — Exactly like Screenshot 1 */}
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

      {/* 4 Stat Cards Row */}
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

      {/* Main Table Container — Exactly like Screenshot 1 */}
      <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm">
        {isLoading ? (
          <p className="text-xs text-[#3C315B]/60 text-center py-12">Loading room inventory...</p>
        ) : rooms && rooms.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#3C315B]">ROOM NUMBER</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">FLOOR</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">CAPACITY</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">OCCUPANCY</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: any) => {
                const ratio = (room.currentOccupancy || 0) / room.capacity;
                let statusBadge = <Badge variant="secondary" className="bg-[#E6F9F0] text-[#2EC08B] font-semibold rounded-full px-3 py-1 text-xs">Vacant</Badge>;
                if (ratio >= 1) statusBadge = <Badge variant="destructive" className="bg-red-50 text-red-600 font-semibold rounded-full px-3 py-1 text-xs">Full</Badge>;
                else if (ratio > 0) statusBadge = <Badge variant="outline" className="bg-amber-50 text-amber-600 font-semibold rounded-full px-3 py-1 text-xs">Partial</Badge>;

                return (
                  <TableRow key={room.id} className="hover:bg-[#FAFAFA] cursor-pointer" onClick={() => setManagingRoomId(room.id)}>
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
                    <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setManagingRoomId(room.id)}
                        title="Manage Room Photos & Controls"
                        className="h-8 px-2.5 text-[#6A4FE0] font-bold text-xs hover:bg-[#ECE8FE] rounded-xl"
                      >
                        <Sliders className="h-4 w-4 mr-1" /> Manage
                      </Button>
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
