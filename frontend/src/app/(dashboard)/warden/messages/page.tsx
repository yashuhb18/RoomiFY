'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, User, Search, RefreshCw,
  CheckCheck, Mail, Phone, Building2, Sparkles, Megaphone
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
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
  const { user } = useAuthStore();
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
    refetchInterval: 2000,
  });

  // Auto select first student thread when loaded
  useEffect(() => {
    if (threads && threads.length > 0 && !selectedStudentId) {
      setSelectedStudentId(threads[0].student.id);
    }
  }, [threads, selectedStudentId]);

  // Fetch Selected Student Thread Conversation
  const { data: messages, isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['wardenStudentConversation', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const res = await api.get(`/messages/conversation/${selectedStudentId}`);
      return res.data;
    },
    enabled: !!selectedStudentId,
    refetchInterval: 1000,
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
      refetchMessages();
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
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Light Purple Hero Banner */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-4 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[11px] font-semibold tracking-wide">
              Resident Support Inbox
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAFD] text-[#3C315B] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#6A4FE0]" />
              </div>
              <h1 className="text-2xl font-bold text-[#3C315B] tracking-tight">
                Warden Message Desk
              </h1>
            </div>

            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Direct student support inbox. Review student messages, answer inquiries, and reply to residents in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBroadcastOpen(true)}
              className="px-4 py-2 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs shadow-sm flex items-center gap-2"
            >
              <Megaphone className="w-3.5 h-3.5" /> Send Announcement
            </button>
            <button
              type="button"
              onClick={() => refetchThreads()}
              className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Inbox
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[640px]">
        {/* Left Column: Student Threads Roster */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-[#E5E4E8] shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E5E4E8] space-y-3 bg-[#FAFAFA]">
            <h3 className="font-bold text-[#3C315B] text-xs flex items-center justify-between">
              <span>Resident Messages</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECE8FE] text-[#3C315B] text-[10px] font-bold">
                {threads?.length || 0} Threads
              </span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#3C315B]/50" />
              <input
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 h-9 text-xs rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:border-[#6A4FE0]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E5E4E8]/60">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-[#3C315B]/60 font-medium">Loading message inbox...</div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map((t: any) => {
                const isSelected = t.student.id === selectedStudentId;
                return (
                  <button
                    key={t.student.id}
                    onClick={() => setSelectedStudentId(t.student.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 relative ${
                      isSelected ? 'bg-[#ECE8FE] border-l-4 border-[#6A4FE0]' : 'hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <Avatar className="h-9 w-9 border border-[#E5E4E8]">
                      <AvatarFallback className="bg-[#3C315B] text-white font-bold text-xs">
                        {t.student.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-[#3C315B] truncate">
                          {t.student.profile?.fullName || t.student.email}
                        </p>
                        {t.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                            {t.unreadCount} NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#3C315B]/70 truncate mt-0.5 font-medium">
                        {t.latestMessage?.content || 'No message content'}
                      </p>
                      <span className="text-[9px] text-[#3C315B]/50 block mt-1">
                        {new Date(t.latestMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#3C315B]/60 font-medium">
                No student message threads found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E4E8] shadow-sm flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Active Student Header */}
              <div className="p-4 border-b border-[#E5E4E8] bg-[#FAFAFA] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-[#E5E4E8]">
                    <AvatarFallback className="bg-[#6A4FE0] text-white font-bold text-xs">
                      {activeThread.student.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-xs text-[#3C315B]">
                      {activeThread.student.profile?.fullName || 'Resident Student'}
                    </h3>
                    <p className="text-[11px] text-[#3C315B]/60 font-medium">{activeThread.student.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[10px] font-semibold">
                  Resident Thread Active
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFAFA]/50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-[#3C315B]/20 border-t-[#3C315B] rounded-full animate-spin" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg: any) => {
                    const isMe = user?.id ? msg.senderId === user.id : msg.senderId !== selectedStudentId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-[#3C315B] text-white rounded-br-none'
                              : 'bg-white border border-[#E5E4E8] text-[#3C315B] rounded-bl-none'
                          }`}
                        >
                          <p className="font-semibold text-[10px] opacity-80 mb-1">
                            {isMe ? 'Warden Administration (You)' : activeThread.student.profile?.fullName || activeThread.student.email}
                          </p>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={`mt-1.5 text-[9px] flex items-center gap-1 justify-end ${
                              isMe ? 'text-white/70' : 'text-[#3C315B]/50'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-[#2EC08B]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-[#3C315B]/60 font-medium">No messages in this conversation.</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-[#E5E4E8] bg-white flex gap-3">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeThread.student.profile?.fullName || activeThread.student.email}...`}
                  className="flex-1 h-11 px-4 text-xs font-semibold rounded-xl border border-[#E5E4E8] bg-white text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:border-[#6A4FE0]"
                />
                <button
                  type="submit"
                  disabled={sendReplyMutation.isPending || !replyText.trim()}
                  className="h-11 px-6 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendReplyMutation.isPending ? 'Replying...' : 'Send Reply'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#ECE8FE] text-[#6A4FE0] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#3C315B]">Select a Resident Conversation</h4>
              <p className="text-xs text-[#3C315B]/70 max-w-xs font-normal">
                Choose a student thread from the left roster to view messages and send direct replies.
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent className="rounded-3xl border border-[#E5E4E8] bg-white text-[#3C315B]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#3C315B] font-bold">
              <Megaphone className="h-5 w-5 text-[#6A4FE0]" /> Send Hostel Broadcast Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              Broadcast an urgent notification or notice to ALL active resident students in your hostel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Announcement Subject / Title</label>
              <Input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Water Supply Maintenance, Mess Schedule Update"
                className="rounded-xl border-[#E5E4E8] bg-white text-[#3C315B]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Message Content</label>
              <textarea
                rows={4}
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                placeholder="Type full announcement notice details here..."
                className="flex w-full rounded-xl border border-[#E5E4E8] bg-white px-4 py-3 text-xs text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:border-[#6A4FE0]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={sendBroadcastMutation.isPending}
              className="w-full rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs h-11"
            >
              {sendBroadcastMutation.isPending ? 'Broadcasting...' : '📢 Broadcast to All Students'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
