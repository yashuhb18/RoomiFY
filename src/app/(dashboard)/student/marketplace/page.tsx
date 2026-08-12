'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Plus, Tag, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
    },
  });

  const handleBuy = async (itemId: string) => {
    setBuyingId(itemId);
    try {
      const { data } = await api.post('/marketplace/buy', { itemId });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate checkout session.');
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 gradient-text">
            <ShoppingBag className="h-6 w-6 text-purple-400" /> Student Marketplace
          </h1>
          <p className="text-sm text-muted-foreground">
            Buy and sell pre-loved books, electronics, and room essentials directly within your hostel.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white">
          <Plus className="mr-2 h-4 w-4" /> Sell an Item
        </Button>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Payment successful! Your order has been placed and verified via Stripe Webhook.</span>
        </div>
      )}

      {isCanceled && (
        <div className="p-4 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Payment was canceled. No charges were made to your account.</span>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading marketplace items...</p>
      ) : listings && listings.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {listings.map((item: any) => (
            <Card key={item.id} className="glass border-white/10 flex flex-col justify-between">
              <CardHeader className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold line-clamp-1">{item.title}</CardTitle>
                  <Badge variant="secondary" className="font-mono text-purple-300">
                    ₹{item.price}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description || 'No description provided.'}
                </p>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Seller: {item.seller?.email}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  onClick={() => handleBuy(item.id)}
                  disabled={buyingId === item.id}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {buyingId === item.id ? 'Redirecting to Stripe...' : 'Buy Now with Stripe'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass border-white/10 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No marketplace listings active. Be the first to list an item!
          </p>
        </Card>
      )}

      {/* Create Listing Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>List Item for Sale</DialogTitle>
            <DialogDescription>
              Provide item details and set a price in INR.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Engineering Mathematics Textbook"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Price (INR ₹)</label>
              <Input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Condition, edition, etc."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button
              type="submit"
              disabled={createListingMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white"
            >
              {createListingMutation.isPending ? 'Publishing...' : 'Publish Listing'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
