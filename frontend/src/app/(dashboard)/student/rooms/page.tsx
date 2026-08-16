'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  Wifi,
  Tv,
  Wind,
  Search,
} from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { StatCard } from '@/components/ui/stat-card';
import { Input } from '@/components/ui/input';

export default function StudentExploreRoomsPage() {
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: availableRooms, isLoading } = useQuery({
    queryKey: ['availableRooms'],
    queryFn: async () => {
      const res = await api.get('/rooms/available');
      return res.data;
    },
  });

  const { data: floors } = useQuery({
    queryKey: ['floorsList'],
    queryFn: async () => {
      const res = await api.get('/floors');
      return res.data;
    },
  });

  const filteredRooms = availableRooms?.filter((room: any) => {
    if (selectedFloor !== 'all' && String(room.floor) !== selectedFloor) return false;
    if (selectedType !== 'all' && room.roomType !== selectedType) return false;
    if (selectedCondition !== 'all' && room.condition !== selectedCondition) return false;
    if (searchQuery && !room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];

  const totalAvailableBeds = availableRooms?.reduce(
    (sum: number, r: any) => sum + (r.capacity - r.currentOccupancy),
    0
  ) || 0;

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
            Hostel Inventory Discovery
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
            Real-Time Availability
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1">
          Explore Available Hostel Rooms
        </h1>
        <p className="text-xs text-[#3C315B]/70 max-w-2xl leading-relaxed font-normal">
          Browse available rooms, examine bed arrangements, inspect room conditions, and select your preferred room.
        </p>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              AVAILABLE ROOMS
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              {availableRooms?.length || 0}
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              Vacant or partial rooms
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              AVAILABLE BEDS
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              {totalAvailableBeds}
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              Ready for allocation
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              HOSTEL FLOORS
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              {floors?.length || 3}
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              Multi-level layout
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-[#E5E4E8] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#3C315B]/60 tracking-wider uppercase block">
              VERIFIED PHOTOS
            </span>
            <p className="text-3xl font-extrabold text-[#3C315B]">
              100%
            </p>
            <span className="text-[11px] text-[#3C315B]/50 font-normal block">
              Warden approved
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#E6F9F0] text-[#2EC08B] flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="rounded-3xl bg-[#ECE8FE]/60 p-6 border border-[#E5E4E8] space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-[#3C315B] font-bold text-sm">
            <Filter className="h-4 w-4 text-[#6A4FE0]" /> Filter Rooms
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3C315B]/50" />
            <input
              type="text"
              placeholder="Search room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#E5E4E8] text-[#3C315B] placeholder:text-[#3C315B]/50 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-[#3C315B]/70 font-semibold block mb-1">
              Floor Level
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#E5E4E8] bg-white px-4 text-xs font-semibold text-[#3C315B] focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
            >
              <option value="all">All Floors</option>
              {floors?.map((f: any) => (
                <option key={f.id} value={String(f.floorNumber)}>
                  {f.name || `Floor ${f.floorNumber}`}
                </option>
              )) || [
                  <option key="0" value="0">Ground Floor</option>,
                  <option key="1" value="1">First Floor</option>,
                  <option key="2" value="2">Second Floor</option>,
                ]}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#3C315B]/70 font-semibold block mb-1">
              Room Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#E5E4E8] bg-white px-4 text-xs font-semibold text-[#3C315B] focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
            >
              <option value="all">All Room Types</option>
              <option value="SINGLE">Single Bed</option>
              <option value="DOUBLE">Double Sharing</option>
              <option value="TRIPLE">Triple Sharing</option>
              <option value="QUAD">4-Bed Sharing</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#3C315B]/70 font-semibold block mb-1">
              Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full h-11 rounded-2xl border border-[#E5E4E8] bg-white px-4 text-xs font-semibold text-[#3C315B] focus:outline-none focus:ring-2 focus:ring-[#AB9FF2]"
            >
              <option value="all">All Conditions</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-caption text-fog animate-pulse">
          Loading available hostel inventory...
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room: any, index: number) => {
            const availableBeds = room.capacity - room.currentOccupancy;
            const primaryImage = room.images?.find((img: any) => img.isPrimary)?.secureUrl || room.images?.[0]?.secureUrl;

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden flex flex-col justify-between h-full border-ash hover:border-cornflower-pop/40 transition-all shadow-sm hover:shadow-md">
                  <div>
                    {/* Primary Image or Placeholder */}
                    <div className="relative h-44 w-full bg-bone border-b border-ash overflow-hidden flex items-center justify-center">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={`Room ${room.roomNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 space-y-1 text-fog">
                          <Building2 className="h-10 w-10 mx-auto text-cornflower-pop/40" />
                          <span className="text-[11px] font-light tracking-phantom block">
                            Room {room.roomNumber} Photo
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-aubergine font-semibold">
                          Room {room.roomNumber}
                        </Badge>
                        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-fog text-[10px]">
                          Floor {room.floor}
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={availableBeds > 0 ? 'success' : 'destructive'}
                          className="text-[10px]"
                        >
                          {availableBeds} / {room.capacity} Beds Left
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* Room Stats */}
                      <div className="flex items-center justify-between text-caption border-b border-ash pb-3">
                        <div>
                          <span className="text-fog text-[11px] block">Type</span>
                          <span className="font-light text-aubergine capitalize">
                            {room.roomType?.toLowerCase() || 'Double'}
                          </span>
                        </div>
                        <div>
                          <span className="text-fog text-[11px] block">Condition</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {room.condition?.toLowerCase() || 'good'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-fog text-[11px] block">Occupancy</span>
                          <span className="font-light text-aubergine">
                            {room.currentOccupancy} / {room.capacity}
                          </span>
                        </div>
                      </div>

                      {/* Facilities */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-fog font-light tracking-phantom block">
                          Included Facilities
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['Bed', 'Study Table', 'Cupboard', 'Fan', 'Wi-Fi'].map((f) => (
                            <span
                              key={f}
                              className="px-2 py-0.5 rounded-pill bg-bone text-fog text-[10px] border border-ash"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Current Roommates Preview */}
                      {room.allocations && room.allocations.length > 0 && (
                        <div className="p-2.5 rounded-card bg-bone/50 border border-ash text-[11px] text-fog space-y-1">
                          <span className="font-light text-aubergine block">Current Roommates:</span>
                          {room.allocations.map((alloc: any) => (
                            <div key={alloc.id} className="flex items-center gap-1.5 text-[10px]">
                              <Users className="h-3 w-3 text-cornflower-pop" />
                              <span className="truncate">{alloc.student?.profile?.fullName || alloc.student?.email}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0">
                    <Link href={`/student/rooms/${room.id}`}>
                      <Button variant="outline" className="w-full text-caption h-9">
                        View Room Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed space-y-3">
          <Building2 className="h-10 w-10 mx-auto text-fog" />
          <h3 className="text-subheading font-light text-aubergine">No Rooms Found</h3>
          <p className="text-caption text-fog max-w-sm mx-auto">
            No rooms match your filter criteria. Try expanding your search or clearing filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFloor('all');
              setSelectedType('all');
              setSelectedCondition('all');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
