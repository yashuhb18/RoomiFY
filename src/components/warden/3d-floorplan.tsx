'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Building2, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface Room3DProps {
  rooms: any[];
  onSelectRoom?: (room: any) => void;
}

export function Floorplan3DVisualizer({ rooms, onSelectRoom }: Room3DProps) {
  const [activeFloor, setActiveFloor] = useState<number>(1);

  // Group rooms by floor
  const roomsByFloor: Record<number, any[]> = {};
  rooms.forEach((r) => {
    const f = r.floor || 0;
    if (!roomsByFloor[f]) roomsByFloor[f] = [];
    roomsByFloor[f].push(r);
  });

  const floors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);
  const currentRooms = roomsByFloor[activeFloor] || [];

  return (
    <Card className="rounded-2xl border border-zinc-800 bg-[#0A0A0A] p-6 space-y-6">
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-white" /> 3D Isometric Floorplan Heatmap
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Interactive room matrix with bed capacity indicators and depth tilt.
          </CardDescription>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black border border-zinc-800">
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFloor(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeFloor === f
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {currentRooms.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
            {currentRooms.map((room, idx) => {
              const ratio = room.currentOccupancy / room.capacity;
              let borderStyle = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
              let badgeVariant: any = 'success';
              let statusText = 'Vacant';

              if (ratio >= 1) {
                borderStyle = 'border-red-500/40 bg-red-950/20 text-red-300';
                badgeVariant = 'destructive';
                statusText = 'Full';
              } else if (ratio > 0) {
                borderStyle = 'border-amber-500/40 bg-amber-950/20 text-amber-300';
                badgeVariant = 'warning';
                statusText = 'Partial';
              }

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => onSelectRoom && onSelectRoom(room)}
                  whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5, zIndex: 10 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-xl space-y-3 ${borderStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-white font-mono">
                      #{room.roomNumber}
                    </span>
                    <Badge variant={badgeVariant} className="text-[9px] font-mono px-2 py-0">
                      {statusText}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="opacity-70">Capacity</span>
                      <span className="font-bold">
                        {room.currentOccupancy}/{room.capacity}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden p-[1px]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ratio >= 1
                            ? 'bg-red-400'
                            : ratio > 0
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No rooms configured on Floor {activeFloor}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
