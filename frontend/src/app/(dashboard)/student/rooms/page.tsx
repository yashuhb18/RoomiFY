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
    <div className="space-y-8 pb-12">
      <PageHero
        mode="bone"
        icon={Building2}
        badges={['Hostel Inventory Discovery', 'Real-Time Availability']}
        title="Explore Available Hostel Rooms"
        description="Browse available rooms, examine bed arrangements, inspect room conditions, and select your preferred room."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Rooms"
          value={availableRooms?.length || 0}
          sublabel="Vacant or partial rooms"
          icon={Building2}
          accent="cornflower"
          index={0}
        />
        <StatCard
          label="Available Beds"
          value={totalAvailableBeds}
          sublabel="Ready for allocation"
          icon={Users}
          accent="lavender"
          index={1}
        />
        <StatCard
          label="Hostel Floors"
          value={floors?.length || 3}
          sublabel="Multi-level layout"
          icon={Layers}
          accent="periwinkle"
          index={2}
        />
        <StatCard
          label="Verified Photos"
          value="100%"
          sublabel="Warden approved"
          icon={CheckCircle2}
          accent="mint"
          index={3}
        />
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-bone/60 border border-ash space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-aubergine text-caption font-light tracking-phantom">
            <Filter className="h-4 w-4 text-cornflower-pop" /> Filter Rooms
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-fog" />
            <Input
              placeholder="Search room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-caption"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-fog font-light tracking-phantom block mb-1">
              Floor Level
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full h-9 rounded-md border border-ash bg-white px-3 text-caption text-aubergine focus:outline-none focus:ring-1 focus:ring-aubergine"
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
            <label className="text-[11px] text-fog font-light tracking-phantom block mb-1">
              Room Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-9 rounded-md border border-ash bg-white px-3 text-caption text-aubergine focus:outline-none focus:ring-1 focus:ring-aubergine"
            >
              <option value="all">All Room Types</option>
              <option value="SINGLE">Single Bed</option>
              <option value="DOUBLE">Double Sharing</option>
              <option value="TRIPLE">Triple Sharing</option>
              <option value="QUAD">4-Bed Sharing</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-fog font-light tracking-phantom block mb-1">
              Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full h-9 rounded-md border border-ash bg-white px-3 text-caption text-aubergine focus:outline-none focus:ring-1 focus:ring-aubergine"
            >
              <option value="all">All Conditions</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
        </div>
      </Card>

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
