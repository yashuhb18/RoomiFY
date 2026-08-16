'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Plus, Tag, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function StudentMarketplacePage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const isCanceled = searchParams.get('canceled') === 'true';

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const { data: listings, isLoading } = useQuery({
    queryKey: ['marketplaceListings'],
    queryFn: async () => {
      const res = await api.get('/marketplace/listings');
      return res.data;
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/marketplace/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setImage(null);
      toast.success('Marketplace item published!');
    },
  });

  const handleBuy = async (item: any) => {
    setBuyingId(item.id);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your connection.');
        return;
      }

      const { data } = await api.post('/marketplace/buy', { itemId: item.id });

      if (!data.orderId) {
        toast.error('Failed to create Razorpay checkout order.');
        return;
      }

      const options = {
        key: data.keyId || 'rzp_test_TPIYuQtsDMqe9j',
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'RoomiFY Marketplace',
        description: `Purchase ${item.title}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await api.post('/marketplace/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('🎉 Payment verified! Item purchased successfully.');
            queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
          } catch (err: any) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: 'Resident Student',
          email: 'student@aegis.hostel',
        },
        theme: {
          color: '#3C315B',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate Razorpay checkout.');
    } finally {
      setBuyingId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    if (image) {
      formData.append('image', image);
    }

    createListingMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#ECE8FE] p-7 md:p-8 space-y-3 shadow-sm border border-[#E5E4E8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide shadow-sm inline-block">
            Peer-to-Peer Hostel Commerce
          </span>
          <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-[#6A4FE0]" /> Student Marketplace
          </h1>
          <p className="text-xs text-[#3C315B]/70 max-w-xl leading-relaxed font-normal">
            Buy and sell pre-loved books, electronics, and room essentials directly within your hostel campus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Sell an Item
        </button>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#E6F9F0] border border-emerald-200 text-[#2EC08B] text-xs font-bold flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Payment successful! Your order has been placed and verified.</span>
        </div>
      )}

      {isCanceled && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Payment was canceled. No charges were made to your account.</span>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-[#3C315B]/60 font-normal">Loading marketplace items...</p>
      ) : listings && listings.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {listings.map((item: any) => (
            <div key={item.id} className="rounded-3xl bg-white border border-[#E5E4E8] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Item Product Photo Display */}
                {item.imageUrl ? (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-[#E5E4E8] bg-[#FAFAFA]">
                    <img
                      src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://127.0.0.1:5000/${item.imageUrl}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-44 rounded-2xl border border-[#E5E4E8] bg-[#ECE8FE]/50 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-[#6A4FE0]/40" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 border-b border-[#E5E4E8] pb-3">
                  <h3 className="text-base font-bold text-[#3C315B] line-clamp-1">{item.title}</h3>
                  <span className="px-3 py-1 rounded-full bg-[#ECE8FE] text-[#3C315B] font-extrabold text-xs shrink-0">
                    ₹{item.price}
                  </span>
                </div>
                <p className="text-xs text-[#3C315B]/70 font-normal line-clamp-2">
                  {item.description || 'No description provided.'}
                </p>
                <div className="text-[11px] text-[#3C315B]/50">
                  Seller: {item.seller?.email}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBuy(item)}
                disabled={buyingId === item.id}
                className="w-full py-2.5 rounded-xl bg-[#6A4FE0] hover:bg-[#5B3FD1] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {buyingId === item.id ? 'Initiating Checkout...' : 'Buy Now with Razorpay'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-[#E5E4E8] p-8 text-center shadow-sm">
          <p className="text-xs text-[#3C315B]/60 font-normal">
            No marketplace listings active. Be the first to list an item!
          </p>
        </div>
      )}

      {/* Create Listing Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-3xl bg-white border border-[#E5E4E8] text-[#3C315B]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#3C315B]">List Item for Sale</DialogTitle>
            <DialogDescription className="text-xs text-[#3C315B]/60">
              Provide item details, upload a photo, and set a price in INR.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Product Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#3C315B] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#ECE8FE] file:text-[#3C315B] hover:file:bg-[#E5E4E8] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Engineering Mathematics Textbook"
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-xs font-semibold text-[#3C315B]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Price (INR ₹)</label>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
                className="w-full h-11 px-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-xs font-semibold text-[#3C315B]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3C315B]">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Condition, edition, etc."
                className="w-full p-4 rounded-2xl border border-[#E5E4E8] bg-[#FAFAFA] text-xs text-[#3C315B]"
              />
            </div>

            <button
              type="submit"
              disabled={createListingMutation.isPending}
              className="w-full h-11 rounded-xl bg-[#3C315B] hover:bg-[#2D2447] text-white text-xs font-bold transition-all shadow-md"
            >
              {createListingMutation.isPending ? 'Publishing...' : 'Publish Listing'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
