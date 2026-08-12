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
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
              Resident Roster
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Search student profiles, view roommate preferences, and monitor occupancy status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-white/15 hover:bg-white/5"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-purple-400" /> Refresh Roster
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-full border-white/10 bg-black/40 h-11 text-xs"
        />
      </div>

      <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-8">Loading student directory...</p>
        ) : filteredStudents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Student</TableHead>
                <TableHead className="font-mono text-xs">Email</TableHead>
                <TableHead className="font-mono text-xs">Sleep Schedule</TableHead>
                <TableHead className="font-mono text-xs">Cleanliness</TableHead>
                <TableHead className="font-mono text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-bold text-white flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-purple-500/30">
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs">
                        {s.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{s.profile?.fullName || 'Resident Student'}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="font-mono text-xs text-purple-300 capitalize">
                    {s.profile?.sleepSchedule?.replace('_', ' ') || 'Flexible'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-cyan-300 capitalize">
                    {s.profile?.cleanliness?.replace('_', ' ') || 'Moderate'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedStudent(s)}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">No students found matching query.</p>
        )}
      </Card>

      {/* Student Profile Viewer Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="rounded-3xl border border-white/10 bg-[#1A1A1A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-400" /> Resident Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Read-only details for resident profile and roommate traits.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono">Email</span>
                  <span className="font-bold text-white">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-muted-foreground font-mono">Role</span>
                  <Badge variant="secondary">{selectedStudent.role}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-purple-300 font-mono">Lifestyle Attributes</h4>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div className="p-2.5 rounded-xl bg-card/60 border border-white/5">
                    Sleep: <span className="text-white font-semibold">{selectedStudent.profile?.sleepSchedule}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card/60 border border-white/5">
                    Cleanliness: <span className="text-white font-semibold">{selectedStudent.profile?.cleanliness}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card/60 border border-white/5">
                    Study: <span className="text-white font-semibold">{selectedStudent.profile?.studyStyle}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card/60 border border-white/5">
                    Smoking: <span className="text-white font-semibold">{selectedStudent.profile?.smoking}</span>
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
