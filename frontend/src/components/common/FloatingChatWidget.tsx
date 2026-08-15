'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Phone, Mail, CheckCheck, Sparkles } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function FloatingChatWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Warden Contact Details (Eagerly pre-loaded for students)
  const { data: warden } = useQuery({
    queryKey: ['wardenContactWidget'],
    queryFn: async () => {
      const res = await api.get('/messages/warden-contact');
      return res.data;
    },
    enabled: user?.role === 'STUDENT',
  });

  // Fetch Conversation Thread with Warden
  const { data: messages } = useQuery({
    queryKey: ['widgetWardenConversation', warden?.id],
    queryFn: async () => {
      const wardenId = warden?.id || '';
      const res = await api.get(`/messages/conversation/${wardenId}`);
      return res.data;
    },
    enabled: user?.role === 'STUDENT' && isOpen && !!warden?.id,
    refetchInterval: isOpen ? 3000 : false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      let receiverId = warden?.id;

      if (!receiverId) {
        // Fetch warden contact on the fly if not loaded
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
      queryClient.invalidateQueries({ queryKey: ['widgetWardenConversation', warden?.id] });
      queryClient.invalidateQueries({ queryKey: ['studentWardenConversation', warden?.id] });
      toast.success('Message sent to Warden.');
    },
    onError: (err: any) => {
      toast.error('Failed to send: ' + (err.response?.data?.message || 'Error'));
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText.trim());
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (user?.role !== 'STUDENT') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popover Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-96 h-[500px] bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Drawer Header */}
            <div className="bg-[#1D2786] text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">{warden?.fullName || 'Hostel Chief Warden'}</h4>
                  <p className="text-[10px] text-white/80 font-mono mt-0.5">{warden?.phone || '+91 98765 43210'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warden Quick Info Bar */}
            <div className="p-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] px-4">
              <span className="text-[#64748B] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#6A4FE0]" />
                <span className="truncate max-w-[170px]">{warden?.email || 'warden@aegis.hostel'}</span>
              </span>
              <a
                href={`tel:${warden?.phone || '+919876543210'}`}
                className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> Call Warden
              </a>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
              {messages && messages.length > 0 ? (
                messages.map((msg: any) => {
                  const isMe = msg.senderId !== warden?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs shadow-sm ${
                          isMe
                            ? 'bg-[#1D2786] text-white rounded-br-none'
                            : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span className={`text-[9px] block text-right mt-1 ${isMe ? 'text-white/70' : 'text-[#94A3B8]'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
                  <Sparkles className="w-8 h-8 text-[#6A4FE0]" />
                  <p className="font-bold text-xs text-[#0F172A]">Direct Warden Desk</p>
                  <p className="text-[11px] text-[#64748B]">
                    Send a message directly to your hostel warden. Replies will appear here in real-time.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#E2E8F0] bg-white flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Message your Warden..."
                className="flex-1 h-9 text-xs rounded-xl border-[#CBD5E1] bg-[#F8FAFC]"
              />
              <Button
                type="submit"
                size="sm"
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                className="h-9 px-3.5 rounded-xl bg-[#1D2786] hover:bg-[#151D68] text-white font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1D2786] to-[#6A4FE0] text-white flex items-center justify-center shadow-2xl border-2 border-white relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        </span>
      </motion.button>
    </div>
  );
}
