'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, Send, RefreshCw, CheckCheck, Megaphone, User, Building2
} from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function StudentMessagesPage() {
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch student conversation with Warden
  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['studentMessages'],
    queryFn: async () => {
      const res = await api.get('/messages/my-conversation');
      return res.data;
    },
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post('/messages/to-warden', { content });
      return res.data;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['studentMessages'] });
      toast.success('Message sent to Warden.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send message.');
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
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Light Purple Hero Banner */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-4 shadow-sm border border-[#E5E4E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDEAFD] text-[#3C315B] text-[11px] font-semibold tracking-wide">
              Resident Message Center
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAFD] text-[#3C315B] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#6A4FE0]" />
              </div>
              <h1 className="text-2xl font-bold text-[#3C315B] tracking-tight">
                Hostel Warden Messaging Desk
              </h1>
            </div>

            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Direct communication line with your hostel administration. Send inquiries, receive updates, and view official notices.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Chat
          </button>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="rounded-3xl bg-white border border-[#E5E4E8] shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E4E8] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold flex items-center justify-center text-xs">
              WA
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#3C315B]">Hostel Warden Desk</h3>
              <p className="text-[11px] text-[#3C315B]/60">Official Administration Support</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[10px] font-semibold">
            Direct Messaging Active
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFAFA]/50">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-[#3C315B]/60 font-medium">
              Loading chat messages...
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg: any) => {
              const isStudent = msg.senderRole === 'STUDENT';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isStudent
                        ? 'bg-[#3C315B] text-white rounded-br-none'
                        : 'bg-white border border-[#E5E4E8] text-[#3C315B] rounded-bl-none'
                    }`}
                  >
                    <p className="font-semibold text-[10px] opacity-80 mb-1">
                      {isStudent ? 'You (Student)' : 'Warden Administration'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`mt-1.5 text-[9px] flex items-center gap-1 justify-end ${
                        isStudent ? 'text-white/70' : 'text-[#3C315B]/50'
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isStudent && <CheckCheck className="w-3 h-3 text-[#2EC08B]" />}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center space-y-2">
              <MessageSquare className="mx-auto h-8 w-8 text-[#6A4FE0]" />
              <p className="text-xs text-[#3C315B]/60 font-medium">
                No messages yet. Send a message to contact your hostel warden.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E5E4E8] bg-white flex gap-3">
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message to the warden..."
            className="flex-1 h-11 px-4 text-xs rounded-xl border border-[#E5E4E8] bg-[#FAFAFA] text-[#3C315B] placeholder:text-[#3C315B]/40 focus:outline-none focus:border-[#AB9FF2]"
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isPending || !messageText.trim()}
            className="h-11 px-6 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white font-semibold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
