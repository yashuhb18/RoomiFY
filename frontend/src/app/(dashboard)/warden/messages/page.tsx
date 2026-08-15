'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, User, Search, RefreshCw,
  CheckCheck, Mail, Phone, Building2, Sparkles, Megaphone
} from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { MeshBackground } from '@/components/ui/mesh-background';
import { SpotlightCard } from '@/components/ui/spotlight';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function WardenMessageDeskPage() {
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendBroadcastMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const res = await api.post('/messages/broadcast', { title, content });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Broadcast announcement sent to all residents!');
      setIsBroadcastOpen(false);
      setBroadcastTitle('');
      setBroadcastContent('');
      queryClient.invalidateQueries({ queryKey: ['wardenMessageThreads'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send broadcast announcement.');
    },
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;
    sendBroadcastMutation.mutate({
      title: broadcastTitle.trim(),
      content: broadcastContent.trim(),
    });
  };

  // Fetch all student conversation threads for Warden
  const { data: threads, isLoading: loadingThreads, refetch: refetchThreads } = useQuery({
    queryKey: ['wardenMessageThreads'],
    queryFn: async () => {
      const res = await api.get('/messages/warden-threads');
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Auto select first student thread when loaded
  useEffect(() => {
    if (threads && threads.length > 0 && !selectedStudentId) {
      setSelectedStudentId(threads[0].student.id);
    }
  }, [threads, selectedStudentId]);

  // Fetch Selected Student Thread Conversation
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['wardenStudentConversation', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const res = await api.get(`/messages/conversation/${selectedStudentId}`);
      return res.data;
    },
    enabled: !!selectedStudentId,
    refetchInterval: 3000,
  });

  const activeThread = threads?.find((t: any) => t.student.id === selectedStudentId);

  const sendReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedStudentId) return;
      const res = await api.post('/messages', {
        receiverId: selectedStudentId,
        content,
      });
      return res.data;
    },
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['wardenStudentConversation', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['wardenMessageThreads'] });
      toast.success('Reply sent to student.');
    },
    onError: (err: any) => {
      toast.error('Failed to send reply: ' + (err.response?.data?.message || 'Error'));
    },
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedStudentId) return;
    sendReplyMutation.mutate(replyText.trim());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredThreads = threads?.filter((t: any) =>
    t.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.student.profile?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="relative space-y-8 pb-16">
      <MeshBackground />

      <PageHero
        title="Warden Message Desk"
        description="Direct student support inbox. Review student messages, answer inquiries, and reply to residents in real-time."
        badges={['Resident Support Inbox', 'Live Chat Engine']}
        icon={MessageSquare}
        mode="bone"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="default" onClick={() => setIsBroadcastOpen(true)} size="sm">
              <Megaphone className="mr-2 h-4 w-4" /> Send Announcement
            </Button>
            <Button variant="outline" onClick={() => refetchThreads()} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Inbox
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[660px]">
        {/* Left Column: Student Threads Roster */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] space-y-3 bg-[#F8FAFC]">
            <h3 className="font-bold text-[#0F172A] text-sm flex items-center justify-between">
              <span>Resident Messages</span>
              <Badge variant="secondary" className="text-[10px] bg-purple-100 text-[#6A4FE0] font-semibold">
                {threads?.length || 0} Threads
              </Badge>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
              <Input
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-xs bg-white border-[#CBD5E1]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]/60">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-[#94A3B8]">Loading message inbox...</div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map((t: any) => {
                const isSelected = t.student.id === selectedStudentId;
                return (
                  <button
                    key={t.student.id}
                    onClick={() => setSelectedStudentId(t.student.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 relative ${
                      isSelected ? 'bg-purple-500/10 border-l-4 border-[#6A4FE0]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Avatar className="h-9 w-9 border border-[#E2E8F0]">
                      <AvatarFallback className="bg-[#1D2786] text-white font-bold text-xs">
                        {t.student.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-[#0F172A] truncate">
                          {t.student.profile?.fullName || t.student.email}
                        </p>
                        {t.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-extrabold">
                            {t.unreadCount} NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {t.latestMessage?.content || 'No message content'}
                      </p>
                      <span className="text-[9px] text-[#94A3B8] block mt-1">
                        {new Date(t.latestMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#94A3B8]">
                No student message threads found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Active Student Header */}
              <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-[#E2E8F0]">
                    <AvatarFallback className="bg-[#6A4FE0] text-white font-bold text-xs">
                      {activeThread.student.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-xs text-[#0F172A]">
                      {activeThread.student.profile?.fullName || 'Resident Student'}
                    </h3>
                    <p className="text-[11px] text-[#64748B] font-mono">{activeThread.student.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-purple-300 text-[#6A4FE0]">
                  Resident Thread Active
                </Badge>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg: any) => {
                    const isMe = msg.senderId !== selectedStudentId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-[#1D2786] text-white rounded-br-none'
                              : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-none'
                          }`}
                        >
                          <p className="font-semibold text-[10px] opacity-75 mb-1">
                            {isMe ? 'Warden (You)' : activeThread.student.profile?.fullName || activeThread.student.email}
                          </p>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={`mt-1.5 text-[9px] flex items-center gap-1 justify-end ${
                              isMe ? 'text-white/70' : 'text-[#94A3B8]'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-[#94A3B8]">No messages in this conversation.</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-[#E2E8F0] bg-white flex gap-3">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeThread.student.profile?.fullName || activeThread.student.email}...`}
                  className="flex-1 h-11 text-xs rounded-xl border-[#CBD5E1] bg-[#F8FAFC]"
                />
                <Button
                  type="submit"
                  disabled={sendReplyMutation.isPending || !replyText.trim()}
                  className="h-11 px-5 rounded-xl bg-[#1D2786] hover:bg-[#151D68] text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendReplyMutation.isPending ? 'Replying...' : 'Send Reply'}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-[#6A4FE0] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#0F172A]">Select a Resident Conversation</h4>
              <p className="text-xs text-[#64748B] max-w-xs">
                Choose a student thread from the left roster to view messages and send direct replies.
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blush-mist" /> Send Hostel Broadcast Announcement
            </DialogTitle>
            <DialogDescription>
              Broadcast an urgent notification or notice to ALL active resident students in your hostel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-caption font-light text-fog tracking-phantom">Announcement Subject / Title</label>
              <Input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Water Supply Maintenance, Mess Schedule Update"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-caption font-light text-fog tracking-phantom">Message Content</label>
              <textarea
                rows={4}
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                placeholder="Type full announcement notice details here..."
                className="flex w-full rounded-card border border-ash bg-paper-white px-5 py-3 text-body-sm text-obsidian tracking-phantom focus-visible:outline-none focus-visible:border-aubergine"
                required
              />
            </div>

            <Button
              type="submit"
              variant="default"
              disabled={sendBroadcastMutation.isPending}
              className="w-full"
            >
              {sendBroadcastMutation.isPending ? 'Broadcasting...' : '📢 Broadcast to All Students'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
