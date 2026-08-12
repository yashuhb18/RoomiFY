'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Filter, Search, Clock, Terminal } from 'lucide-react';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function WardenAuditPage() {
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', actionFilter],
    queryFn: async () => {
      const res = await api.get('/audit', {
        params: { action: actionFilter || undefined },
      });
      return res.data;
    },
  });

  const logs = data?.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 gradient-text">
          <ShieldAlert className="h-6 w-6 text-purple-400" /> Immutable Audit Trail
        </h1>
        <p className="text-sm text-muted-foreground">
          Zero-trust audit logs capturing all database state mutations, user logins, and administrative actions.
        </p>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="h-5 w-5 text-purple-400" /> Activity Records
              </CardTitle>
              <CardDescription>
                Logged via TenantInterceptor and global audit service.
              </CardDescription>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by action..."
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="pl-9 bg-card/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-4">Fetching audit logs...</p>
          ) : logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">Timestamp</TableHead>
                  <TableHead className="font-mono text-xs">Action</TableHead>
                  <TableHead className="font-mono text-xs">User</TableHead>
                  <TableHead className="font-mono text-xs">IP Address</TableHead>
                  <TableHead className="font-mono text-xs">State Mutation Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase border-purple-500/30 text-purple-300">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{log.user?.email || 'System'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] max-w-xs truncate text-muted-foreground">
                      {log.newValue ? JSON.stringify(log.newValue) : log.oldValue ? JSON.stringify(log.oldValue) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              No audit logs recorded for the selected filter.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
