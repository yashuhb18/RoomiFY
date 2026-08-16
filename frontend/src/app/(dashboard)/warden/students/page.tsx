'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, UserCheck, ShieldAlert, Eye, RefreshCw } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function WardenStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['wardenStudents'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    },
  });

  const students = users?.filter((u: any) => u.role === 'STUDENT') || [];
  const filteredStudents = students.filter(
    (s: any) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide">
              Resident Roster
            </span>
            <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2 pt-1">
              <Users className="h-7 w-7 text-[#6A4FE0]" /> Student Management
            </h1>
            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Search student profiles, view roommate preferences, and monitor occupancy status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Roster
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#3C315B]/50" />
        <Input
          placeholder="Search by student name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-full border-[#E5E4E8] bg-white h-11 text-xs text-[#3C315B] shadow-sm"
        />
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">Loading student directory...</p>
        ) : filteredStudents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#3C315B]">STUDENT</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">EMAIL</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">SLEEP SCHEDULE</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">CLEANLINESS</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B] text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s: any) => (
                <TableRow key={s.id} className="hover:bg-[#FAFAFA]">
                  <TableCell className="font-bold text-[#3C315B] flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-[#E5E4E8]">
                      <AvatarFallback className="bg-[#ECE8FE] text-[#3C315B] font-bold text-xs">
                        {s.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{s.profile?.fullName || 'Resident Student'}</span>
                  </TableCell>
                  <TableCell className="text-xs text-[#3C315B]/70 font-medium">{s.email}</TableCell>
                  <TableCell className="text-xs text-[#3C315B] font-semibold capitalize">
                    {s.profile?.sleepSchedule?.replace('_', ' ') || 'Flexible'}
                  </TableCell>
                  <TableCell className="text-xs text-emerald-700 font-semibold capitalize">
                    {s.profile?.cleanliness?.replace('_', ' ') || 'Moderate'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedStudent(s)}
                      className="text-xs text-[#6A4FE0] font-bold hover:bg-[#ECE8FE]"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">No students found matching query.</p>
        )}
      </div>

      {/* Student Profile Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="rounded-3xl border border-[#E5E4E8] bg-white text-[#3C315B]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[#3C315B]">
              <UserCheck className="h-5 w-5 text-[#6A4FE0]" /> Resident Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              Read-only details for resident profile and roommate traits.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E4E8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#3C315B]/60 font-medium">Email</span>
                  <span className="font-bold text-[#3C315B]">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E5E4E8] pt-2">
                  <span className="text-[#3C315B]/60 font-medium">Role</span>
                  <Badge variant="secondary" className="bg-[#ECE8FE] text-[#3C315B] font-bold">{selectedStudent.role}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#3C315B]">Lifestyle Attributes</h4>
                <div className="grid grid-cols-2 gap-2 text-[#3C315B]">
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8]">
                    Sleep: <span className="font-semibold">{selectedStudent.profile?.sleepSchedule || 'Flexible'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8]">
                    Cleanliness: <span className="font-semibold">{selectedStudent.profile?.cleanliness || 'Moderate'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8]">
                    Study: <span className="font-semibold">{selectedStudent.profile?.studyStyle || 'Quiet'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E4E8]">
                    Smoking: <span className="font-semibold">{selectedStudent.profile?.smoking || 'Non-Smoker'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
