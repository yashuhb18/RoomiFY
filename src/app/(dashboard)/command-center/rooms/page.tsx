'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BedDouble, Plus, RefreshCw, Layers, Image as ImageIcon,
  Building2, Users, CheckCircle2, AlertCircle, Upload, X, MapPin,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function SuperAdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [selectedRoomForImage, setSelectedRoomForImage] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');

  // New Room Form
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelId, setHostelId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [roomType, setRoomType] = useState('DOUBLE');
  const [condition, setCondition] = useState('GOOD');
  const [creating, setCreating] = useState(false);

  // New Floor Form
  const [floorHostelId, setFloorHostelId] = useState('');
  const [floorNumber, setFloorNumber] = useState(1);
  const [floorName, setFloorName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, floorsRes, hostelsRes] = await Promise.all([
        api.get('/admin/rooms'),
        api.get('/admin/floors'),
        api.get('/admin/hostels'),
      ]);
      setRooms(roomsRes.data);
      setFloors(floorsRes.data);
      setHostels(hostelsRes.data);
      if (hostelsRes.data.length > 0) {
        setHostelId(hostelsRes.data[0].id);
        setFloorHostelId(hostelsRes.data[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load room data: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !hostelId) return;
    setCreating(true);
    try {
      await api.post('/admin/rooms', {
        roomNumber: roomNumber.trim(),
        hostelId,
        floorId: floorId || undefined,
        capacity: Number(capacity),
        roomType,
        condition,
      });
      toast.success(`Room ${roomNumber} created cleanly`);
      setShowRoomModal(false);
      setRoomNumber('');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to create room: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floorHostelId) return;
    setCreating(true);
    try {
      await api.post('/admin/floors', {
        hostelId: floorHostelId,
        floorNumber: Number(floorNumber),
        name: floorName.trim() || undefined,
      });
      toast.success(`Floor ${floorNumber} created`);
      setShowFloorModal(false);
      setFloorName('');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to create floor: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setCreating(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || !selectedRoomForImage) return;
    try {
      await api.post(`/admin/rooms/${selectedRoomForImage.id}/images`, {
        secureUrl: imageUrl.trim(),
      });
      toast.success('Room photo added successfully');
      setImageUrl('');
      setSelectedRoomForImage(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to upload photo: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const handleStatusToggle = async (room: any, newStatus: string) => {
    try {
      await api.patch(`/admin/rooms/${room.id}`, { status: newStatus });
      toast.success(`Room ${room.roomNumber} set to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-[#6A4FE0]" />
            Rooms, Floors & Vacancy Management
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Super Admin control over all hostel rooms, floorplans, vacancy tracking, and photo updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="h-9 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowFloorModal(true)}
            className="h-9 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#1D2786] text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            + Add Floor
          </button>
          <button
            onClick={() => setShowRoomModal(true)}
            className="h-9 px-4 rounded-xl bg-[#1D2786] hover:bg-[#161F6A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            + New Room
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] font-semibold">Total Rooms</p>
          <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{rooms.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] font-semibold">Available Vacancies</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {rooms.filter(r => r.currentOccupancy < r.capacity).length} rooms
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] font-semibold">Total Floors</p>
          <p className="text-2xl font-extrabold text-[#6A4FE0] mt-1">{floors.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-xs text-[#64748B] font-semibold">Under Maintenance</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {rooms.filter(r => r.status === 'UNDER_MAINTENANCE').length}
          </p>
        </div>
      </div>

      {/* Floor Overview Strip */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#0F172A]">Hostel Floor Overview</h3>
        <div className="flex flex-wrap gap-3">
          {floors.map(f => (
            <div key={f.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
              <span className="font-bold text-[#1D2786]">{f.name || `Floor ${f.floorNumber}`}</span>
              <p className="text-[10px] text-[#94A3B8]">{f.hostel?.name}</p>
              <p className="text-[11px] text-[#64748B] font-mono">{f.rooms?.length || 0} rooms assigned</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">All Rooms & Live Vacancies</h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8] text-sm">
            No rooms found. Click "+ New Room" to add rooms.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => {
              const vacancy = room.capacity - room.currentOccupancy;
              const primaryImg = room.images?.[0]?.secureUrl;

              return (
                <div key={room.id} className="rounded-2xl border border-[#E2E8F0] p-4 bg-white shadow-sm space-y-3 hover:shadow-md transition-shadow">
                  {/* Photo Banner */}
                  <div className="h-32 w-full rounded-xl bg-[#F1F5F9] overflow-hidden relative border border-[#E2E8F0]">
                    {primaryImg ? (
                      <img src={primaryImg} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs flex-col gap-1">
                        <ImageIcon className="w-6 h-6 opacity-40" />
                        <span>No Room Photo</span>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedRoomForImage(room)}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm hover:bg-black/80 flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Update Photo
                    </button>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[#0F172A] text-[10px] font-bold shadow-sm">
                      {room.roomType}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#0F172A]">Room {room.roomNumber}</h4>
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusToggle(room, e.target.value)}
                        className="h-6 px-2 text-[10px] font-bold rounded-md bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] focus:outline-none"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="FULL">FULL</option>
                        <option value="UNDER_MAINTENANCE">MAINTENANCE</option>
                        <option value="RESERVED">RESERVED</option>
                      </select>
                    </div>
                    <p className="text-xs text-[#64748B] flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {room.hostel?.name}
                      {room.floorRef && <span>• {room.floorRef.name || `Floor ${room.floorRef.floorNumber}`}</span>}
                    </p>
                  </div>

                  {/* Occupancy Indicator Bar */}
                  <div className="pt-2 border-t border-[#F1F5F9] space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#64748B]">Occupancy ({room.currentOccupancy}/{room.capacity})</span>
                      <span className={vacancy > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                        {vacancy > 0 ? `${vacancy} Vacant` : 'FULL'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full bg-[#6A4FE0] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (room.currentOccupancy / room.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Room */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">Create New Room</h3>
              <button onClick={() => setShowRoomModal(false)}><X className="w-4 h-4 text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475569]">Room Number</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 101, 204"
                  required
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569]">Hostel Branch</label>
                <select
                  value={hostelId}
                  onChange={(e) => setHostelId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                >
                  {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#475569]">Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min={1}
                    max={6}
                    className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475569]">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                  >
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="TRIPLE">TRIPLE</option>
                    <option value="DORMITORY">DORMITORY</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full h-10 rounded-xl bg-[#1D2786] text-white text-xs font-bold shadow-md hover:bg-[#161F6A]"
              >
                {creating ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Floor */}
      {showFloorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">Add Floor to Hostel</h3>
              <button onClick={() => setShowFloorModal(false)}><X className="w-4 h-4 text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleCreateFloor} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475569]">Hostel Branch</label>
                <select
                  value={floorHostelId}
                  onChange={(e) => setFloorHostelId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                >
                  {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569]">Floor Number</label>
                <input
                  type="number"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#475569]">Floor Label / Name</label>
                <input
                  type="text"
                  value={floorName}
                  onChange={(e) => setFloorName(e.target.value)}
                  placeholder="e.g. Ground Floor, Wing A Floor 1"
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full h-10 rounded-xl bg-[#1D2786] text-white text-xs font-bold shadow-md hover:bg-[#161F6A]"
              >
                {creating ? 'Creating...' : 'Add Floor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Room Photo URL */}
      {selectedRoomForImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">Update Photo — Room {selectedRoomForImage.roomNumber}</h3>
              <button onClick={() => setSelectedRoomForImage(null)}><X className="w-4 h-4 text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleAddImage} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475569]">Photo URL (Supabase Storage / Unsplash)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                  className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A]"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#1D2786] text-white text-xs font-bold shadow-md hover:bg-[#161F6A]"
              >
                Save Room Photo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
