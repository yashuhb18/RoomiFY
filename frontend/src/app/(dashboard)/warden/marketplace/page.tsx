'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Trash2, ShieldCheck, RefreshCw, DollarSign } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function WardenMarketplacePage() {
  const queryClient = useQueryClient();

  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['wardenListings'],
    queryFn: async () => {
      const res = await api.get('/marketplace/listings');
      return res.data;
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/marketplace/listings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Marketplace listing removed by moderator.');
      queryClient.invalidateQueries({ queryKey: ['wardenListings'] });
    },
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase">
              Hostel Peer-to-Peer Moderation
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Marketplace Moderation
          </h1>
          <p className="text-sm text-muted-foreground">
            Review peer-to-peer student item listings, enforce safety guidelines, and remove inappropriate posts.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          className="border-white/15 hover:bg-white/5"
        >
          <RefreshCw className="mr-2 h-4 w-4 text-purple-400" /> Refresh Listings
        </Button>
      </div>

      <Card className="rounded-3xl border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-8">Loading listings...</p>
        ) : listings && listings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Title</TableHead>
                <TableHead className="font-mono text-xs">Description</TableHead>
                <TableHead className="font-mono text-xs">Price</TableHead>
                <TableHead className="font-mono text-xs">Seller Email</TableHead>
                <TableHead className="font-mono text-xs">Status</TableHead>
                <TableHead className="font-mono text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold text-white text-sm">{item.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {item.description}
                  </TableCell>
                  <TableCell className="font-extrabold text-sm text-emerald-400 font-mono">
                    ${item.price}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-purple-300">
                    {item.seller?.email || 'Student'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteListingMutation.mutate(item.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Listing
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">No active marketplace listings.</p>
        )}
      </Card>
    </div>
  );
}
