'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, History, AlertCircle, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { toast } from 'sonner';

export default function StudentPaymentsPage() {
  const queryClient = useQueryClient();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => toast.error('Failed to load Razorpay SDK');
    document.body.appendChild(script);
  }, []);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['myInvoices'],
    queryFn: async () => {
      const res = await api.get('/invoices/my');
      return res.data;
    },
  });

  const payMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      // 1. Create Order on Backend
      const { data: orderData } = await api.post('/payments/create-order', { invoiceId });
      
      // 2. Open Razorpay Checkout Modal
      return new Promise((resolve, reject) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Roomify Hostel Fees',
          description: `Payment for Invoice ${invoiceId.substring(0, 8)}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              // 3. Verify Payment Signature on Backend
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve(true);
            } catch (err) {
              reject(err);
            }
          },
          prefill: {
            name: 'Student',
            email: 'student@example.com',
          },
          theme: {
            color: '#6366f1', // cornflower pop
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          reject(new Error(response.error.description));
        });
        rzp.open();
      });
    },
    onSuccess: () => {
      toast.success('Payment Successful!');
      queryClient.invalidateQueries({ queryKey: ['myInvoices'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Payment failed or cancelled.');
    },
  });

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6]">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm">
            Secure Razorpay Integration
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight pt-1 flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-[#6A4FE0]" /> Fee Payments & Dues
        </h1>
        <p className="text-xs text-[#3C315B]/70 max-w-2xl leading-relaxed font-normal">
          View your pending hostel invoices and pay them securely via UPI, Cards, or Netbanking.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl bg-white border border-[#E5E4E8] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2 border-b border-[#E5E4E8] pb-3">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Pending Dues
            </h3>

            {isLoading ? (
              <div className="p-8 text-center text-[#3C315B]/60 animate-pulse text-xs">Loading invoices...</div>
            ) : invoices?.filter((i: any) => i.status !== 'PAID').length > 0 ? (
              <div className="divide-y divide-[#E5E4E8]">
                {invoices.filter((i: any) => i.status !== 'PAID').map((invoice: any) => (
                  <div key={invoice.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#3C315B] text-sm">{invoice.title}</h4>
                        {invoice.status === 'OVERDUE' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#3C315B]/60 font-normal">{invoice.description}</p>
                      {invoice.dueDate && (
                        <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium pt-0.5">
                          <Clock className="h-3.5 w-3.5" /> Due by {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-2 shrink-0">
                      <div className="text-xl font-extrabold text-[#3C315B] flex items-center justify-end">
                        ₹ {invoice.amount.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => payMutation.mutate(invoice.id)}
                        disabled={!isRazorpayLoaded || payMutation.isPending}
                        className="px-5 py-2 rounded-xl bg-[#6A4FE0] hover:bg-[#5B3FD1] text-white text-xs font-bold transition-all shadow-md"
                      >
                        {payMutation.isPending ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-[#3C315B]/60 space-y-3">
                <CheckCircle2 className="h-12 w-12 mx-auto text-[#2EC08B]" />
                <p className="text-xs font-medium">All caught up! No pending dues.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-[#E5E4E8] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#3C315B] flex items-center gap-2 border-b border-[#E5E4E8] pb-3">
              <History className="h-5 w-5 text-[#6A4FE0]" /> Payment History
            </h3>

            {invoices?.filter((i: any) => i.status === 'PAID').length > 0 ? (
              <div className="divide-y divide-[#E5E4E8]">
                {invoices.filter((i: any) => i.status === 'PAID').map((invoice: any) => (
                  <div key={invoice.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#3C315B]">{invoice.title}</p>
                      <p className="text-[10px] text-[#3C315B]/50">{new Date(invoice.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2EC08B]">
                        ₹{invoice.amount.toLocaleString('en-IN')}
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2EC08B] text-[9px] font-bold inline-block mt-0.5">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#3C315B]/50 font-normal">
                No past payments found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
