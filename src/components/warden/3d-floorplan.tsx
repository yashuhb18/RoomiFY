'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Room3DProps {
  rooms: any[];
  onSelectRoom?: (room: any) => void;
}

export function Floorplan3DVisualizer({ rooms, onSelectRoom }: Room3DProps) {
  const [activeFloor, setActiveFloor] = useState<number>(1);

  // Group rooms by floor
  const roomsByFloor: Record<number, any[]> = {};
  rooms.forEach((r) => {
    const f = r.floor || 1;
    if (!roomsByFloor[f]) roomsByFloor[f] = [];
    roomsByFloor[f].push(r);
  });

  // Ensure default floors 1, 2, 3, 5 exist if empty
  [1, 2, 3, 5].forEach((f) => {
    if (!roomsByFloor[f]) roomsByFloor[f] = [];
  });

  const floors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);
  const currentRooms = roomsByFloor[activeFloor] || [];

  return (
    <div className="rounded-[28px] border border-[#E5E4E8] bg-white p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E4E8] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#3C315B] flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#6A4FE0]" /> 3D Isometric Floorplan Heatmap
          </h3>
          <p className="text-xs text-[#3C315B]/60 font-normal mt-0.5">
            Interactive room matrix with bed capacity indicators and depth tilt.
          </p>
        </div>

        {/* Floor Switcher Pill Menu */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EDEAFD] border border-[#E5E4E8]">
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFloor(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFloor === f
                  ? 'bg-white text-[#3C315B] font-bold shadow-sm'
                  : 'text-[#3C315B]/60 hover:text-[#3C315B]'
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        {currentRooms.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
            {currentRooms.map((room, idx) => {
              const ratio = room.currentOccupancy / room.capacity;
              let borderStyle = 'border-emerald-200 bg-[#E6F9F0] text-[#2EC08B]';
              let badgeText = 'vacant';
              let badgeBg = 'bg-[#2EC08B] text-white';
              let barBg = 'bg-[#2EC08B]';

              if (ratio >= 1) {
                borderStyle = 'border-red-200 bg-red-50 text-red-700';
                badgeText = 'Full';
                badgeBg = 'bg-red-500 text-white';
                barBg = 'bg-red-500';
              } else if (ratio > 0) {
                borderStyle = 'border-amber-200 bg-amber-50 text-amber-700';
                badgeText = 'Partial';
                badgeBg = 'bg-amber-500 text-white';
                barBg = 'bg-amber-500';
              }

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  onClick={() => onSelectRoom && onSelectRoom(room)}
                  whileHover={{ scale: 1.03 }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 shadow-sm space-y-3 ${borderStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-[#3C315B]">
                      #{room.roomNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                      {badgeText}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#3C315B]/70">
                      <span>Capacity</span>
                      <span className="font-bold text-[#3C315B]">
                        {room.currentOccupancy}/{room.capacity}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[#E5E4E8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#3C315B]/60 font-medium">
            No rooms configured on Floor {activeFloor}.
          </div>
        )}
      </div>
    </div>
  );
}
