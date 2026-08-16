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
    <div className="space-y-6 pb-12 bg-[#EDEAFD] min-h-screen">
      {/* Hero Banner Card */}
      <div className="rounded-[28px] bg-[#D7CBFE] p-7 md:p-8 space-y-3 shadow-sm border border-[#B7A6F6]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-[#3C315B] text-white text-[11px] font-semibold tracking-wide">
              Hostel Peer-to-Peer Moderation
            </span>
            <h1 className="text-3xl font-bold text-[#3C315B] tracking-tight flex items-center gap-2 pt-1">
              <ShoppingBag className="h-7 w-7 text-[#6A4FE0]" /> Marketplace Moderation
            </h1>
            <p className="text-xs text-[#3C315B]/70 max-w-xl font-normal">
              Review peer-to-peer student item listings, enforce safety guidelines, and remove inappropriate posts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-full bg-white text-[#3C315B] font-semibold text-xs border border-[#E5E4E8] hover:bg-[#FAFAFA] transition-all flex items-center gap-2 shadow-sm w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Listings
          </button>
        </div>
      </div>

      {/* Listings Table Card */}
      <div className="rounded-3xl border border-[#E5E4E8] bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">Loading listings...</p>
        ) : listings && listings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#3C315B]">TITLE</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">DESCRIPTION</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">PRICE</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">SELLER EMAIL</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B]">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-[#3C315B] text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-[#FAFAFA]">
                  <TableCell className="font-bold text-[#3C315B] text-sm">{item.title}</TableCell>
                  <TableCell className="text-xs text-[#3C315B]/70 max-w-xs truncate font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell className="font-extrabold text-sm text-[#2EC08B]">
                    ${item.price}
                  </TableCell>
                  <TableCell className="text-xs text-[#6A4FE0] font-semibold">
                    {item.seller?.email || 'Student'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[#E6F9F0] text-[#2EC08B] font-bold text-[10px]">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteListingMutation.mutate(item.id)}
                      className="text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Listing
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-[#3C315B]/60 text-center py-8">No active marketplace listings.</p>
        )}
      </div>
    </div>
  );
}
