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
    <div className="space-y-8 pb-12">
      <PageHero
        mode="bone"
        icon={CreditCard}
        badges={['Secure Payments', 'Powered by Razorpay']}
        title="Fee Payments & Dues"
        description="View your pending hostel invoices and pay them securely via UPI, Cards, or Netbanking."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-ash">
            <CardHeader className="border-b border-ash bg-bone/30 pb-4">
              <CardTitle className="text-subheading font-light text-aubergine flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" /> Pending Dues
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-fog animate-pulse text-caption">Loading invoices...</div>
              ) : invoices?.filter((i: any) => i.status !== 'PAID').length > 0 ? (
                <div className="divide-y divide-ash">
                  {invoices.filter((i: any) => i.status !== 'PAID').map((invoice: any) => (
                    <div key={invoice.id} className="p-6 flex items-center justify-between hover:bg-bone/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-aubergine">{invoice.title}</h4>
                          {invoice.status === 'OVERDUE' && (
                            <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                          )}
                        </div>
                        <p className="text-caption text-fog">{invoice.description}</p>
                        {invoice.dueDate && (
                          <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> Due by {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-3">
                        <div className="text-xl font-light text-aubergine flex items-center justify-end">
                          <IndianRupee className="h-5 w-5 mr-0.5" /> {invoice.amount.toLocaleString('en-IN')}
                        </div>
                        <Button
                          onClick={() => payMutation.mutate(invoice.id)}
                          disabled={!isRazorpayLoaded || payMutation.isPending}
                          size="sm"
                          className="bg-cornflower-pop hover:bg-cornflower-pop/90 text-white w-full"
                        >
                          {payMutation.isPending ? 'Processing...' : 'Pay Now'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-fog space-y-3">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-mint-signal/50" />
                  <p className="text-caption">All caught up! No pending dues.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-ash">
            <CardHeader className="border-b border-ash bg-bone/30 pb-4">
              <CardTitle className="text-subheading font-light text-aubergine flex items-center gap-2">
                <History className="h-5 w-5 text-cornflower-pop" /> Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoices?.filter((i: any) => i.status === 'PAID').length > 0 ? (
                <div className="divide-y divide-ash">
                  {invoices.filter((i: any) => i.status === 'PAID').map((invoice: any) => (
                    <div key={invoice.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-caption font-medium text-aubergine">{invoice.title}</p>
                        <p className="text-[10px] text-fog">{new Date(invoice.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-caption text-mint-signal font-medium">
                          ₹{invoice.amount.toLocaleString('en-IN')}
                        </p>
                        <Badge variant="outline" className="text-[9px] mt-1 bg-mint-signal/10 text-mint-signal border-mint-signal/20">
                          Paid
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[11px] text-fog">
                  No past payments found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
