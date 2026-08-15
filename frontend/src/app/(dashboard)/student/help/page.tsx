'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  HelpCircle, MessageSquare, Phone, Mail, Clock, Send,
  ShieldCheck, UserCheck, ChevronRight, Sparkles, CheckCheck
} from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { MeshBackground } from '@/components/ui/mesh-background';
import { SpotlightCard } from '@/components/ui/spotlight';
import { toast } from 'sonner';

const FAQS = [
  {
    question: 'How do I request a room allocation or change?',
    answer: 'Navigate to "Room Allocation", select your preferred available room/bed, and submit your allocation request. Your warden will review and approve it.',
  },
  {
    question: 'What is the policy for reporting hostel maintenance issues?',
    answer: 'Go to "Support Tickets" or click "+ New Ticket" to report plumbing, electrical, or internet issues. Tickets are tracked under SLA predictive maintenance.',
  },
  {
    question: 'How does the P2P Student Marketplace payment work?',
    answer: 'Marketplace transactions support instant Razorpay/Stripe checkout. Funds are safely held in escrow until item verification upon delivery.',
  },
  {
    question: 'What are the hostel curfew and guest entry hours?',
    answer: 'Main gates close at 10:00 PM. Guest entry is permitted between 9:00 AM and 7:00 PM with warden approval.',
  },
];

export default function StudentHelpPage() {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Warden Contact Details
  const { data: warden, isLoading: loadingWarden } = useQuery({
    queryKey: ['wardenContact'],
    queryFn: async () => {
      const res = await api.get('/messages/warden-contact');
      return res.data;
    },
  });

  // Fetch Conversation Thread with Warden
  const { data: messages, isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['studentWardenConversation', warden?.id],
    queryFn: async () => {
      if (!warden?.id) return [];
      const res = await api.get(`/messages/conversation/${warden.id}`);
      return res.data;
    },
    enabled: !!warden?.id,
    refetchInterval: 5000, // Poll every 5s for new Warden replies
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      let receiverId = warden?.id;

      if (!receiverId) {
        const wardenRes = await api.get('/messages/warden-contact');
        receiverId = wardenRes.data.id;
      }

      const res = await api.post('/messages', {
        receiverId,
        content,
      });
      return res.data;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['studentWardenConversation', warden?.id] });
      toast.success('Message sent to Warden.');
    },
    onError: (err: any) => {
      toast.error('Failed to send message: ' + (err.response?.data?.message || 'Error'));
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText.trim());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="relative space-y-8 pb-16">
      <MeshBackground />

      <PageHero
        title="Help Centre & Warden Connect"
        description="Contact your assigned hostel warden directly via message, phone, or email, and access resident support FAQs."
        badges={['24/7 Warden Desk', 'Direct Messaging Engine']}
        icon={HelpCircle}
        mode="bone"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Warden Contact Card & FAQs */}
        <div className="space-y-6 lg:col-span-1">
          {/* Warden Contact Card */}
          <SpotlightCard className="p-6 space-y-5 border border-purple-500/20 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1D2786] to-[#6A4FE0] flex items-center justify-center text-white font-bold text-lg shadow-md">
                {warden?.fullName?.charAt(0) || 'W'}
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">{warden?.fullName || 'Hostel Chief Warden'}</h3>
                <Badge variant="secondary" className="text-[10px] bg-purple-100 text-[#6A4FE0] font-semibold mt-0.5">
                  Assigned Hostel Warden
                </Badge>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-[#475569] border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#6A4FE0]" />
                  <span className="font-mono text-[11px] truncate max-w-[160px]">{warden?.email || 'warden@aegis.hostel'}</span>
                </div>
                <a
                  href={`mailto:${warden?.email || 'warden@aegis.hostel'}`}
                  className="px-2 py-1 rounded-lg bg-[#6A4FE0]/10 text-[#6A4FE0] font-bold text-[10px] hover:bg-[#6A4FE0]/20 transition-all"
                >
                  Email
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-[11px]">{warden?.phone || '+91 98765 43210'}</span>
                </div>
                <a
                  href={`tel:${warden?.phone || '+919876543210'}`}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-[10px] hover:bg-emerald-500/20 transition-all"
                >
                  Call
                </a>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/5 text-amber-700 font-medium text-[11px]">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Office Hours: Mon - Sat (9:00 AM - 7:00 PM)</span>
              </div>
            </div>
          </SpotlightCard>

          {/* FAQs */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
            <h4 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6A4FE0]" /> Resident FAQs
            </h4>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <p className="font-semibold text-xs text-[#0F172A]">{faq.question}</p>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Direct Message Thread to Warden */}
        <div className="lg:col-span-2">
          <SpotlightCard className="p-0 border border-[#E2E8F0] bg-white shadow-sm overflow-hidden flex flex-col h-[640px]">
            {/* Header */}
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1D2786] text-white flex items-center justify-center font-bold text-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm flex items-center gap-1.5">
                    Direct Warden Messaging Desk
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Messages deliver directly to {warden?.fullName || 'Warden'}'s desk console</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600 bg-emerald-50">
                Live Response Active
              </Badge>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-[#1D2786]/20 border-t-[#1D2786] rounded-full animate-spin" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg: any) => {
                  const isMe = msg.senderId !== warden?.id;
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
                          {isMe ? 'You' : warden?.fullName || 'Warden'}
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
                <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-[#6A4FE0] flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-[#0F172A] text-sm">No messages yet</h4>
                  <p className="text-xs text-[#64748B] max-w-xs">
                    Type a message below to reach out to your Hostel Warden directly.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E2E8F0] bg-white flex gap-3">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message or inquiry for the Warden..."
                className="flex-1 h-11 text-xs rounded-xl border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white"
              />
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                className="h-11 px-5 rounded-xl bg-[#1D2786] hover:bg-[#151D68] text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
