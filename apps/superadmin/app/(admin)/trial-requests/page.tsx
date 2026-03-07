'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, XCircle, Clock,
  Loader2, Gift, User, Globe,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrialRequestsPage() {
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['trial-requests'],
    queryFn: async () => {
      const res = await api.get('/admin/trial-requests');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/admin/trial-requests/${id}/approve`),
    onSuccess: () => {
      toast.success('✅ Trial approved! Email sent to user.');
      queryClient.invalidateQueries({ queryKey: ['trial-requests'] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/trial-requests/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Request rejected');
      setRejectingId(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['trial-requests'] });
    },
    onError: () => toast.error('Failed to reject'),
  });

  const requests = data?.data || [];
  const pending = requests.filter((r: any) => r.status === 'pending');
  const processed = requests.filter((r: any) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trial Requests</h1>
          <p className="text-slate-400 mt-1">Review and approve trial requests</p>
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1">
          {pending.length} Pending
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Gift className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No trial requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Pending Review
              </h2>
              {pending.map((req: any) => (
                <Card key={req.id} className="bg-slate-800 border-yellow-500/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                          <span className="text-white font-semibold">
                            {req.org?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {req.org?.users?.[0]?.email || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            IP: {req.ipAddress}
                          </span>
                          <span>Domain: @{req.emailDomain}</span>
                          <span>
                            {new Date(req.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {req.cardFingerprint && (
                          <p className="text-xs text-slate-500">
                            Card verified ✅ · Fingerprint: {req.cardFingerprint.slice(0, 12)}...
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {rejectingId === req.id ? (
                        <div className="flex flex-col gap-2 min-w-64">
                          <input
                            type="text"
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 flex-1"
                              onClick={() =>
                                rejectMutation.mutate({
                                  id: req.id,
                                  reason: rejectReason,
                                })
                              }
                              disabled={rejectMutation.isPending}
                            >
                              Confirm Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400"
                              onClick={() => setRejectingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate(req.id)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <><CheckCircle className="w-4 h-4 mr-1" />Approve</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950"
                            onClick={() => setRejectingId(req.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Processed */}
          {processed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Processed
              </h2>
              {processed.map((req: any) => (
                <Card key={req.id} className="bg-slate-800 border-slate-700 opacity-70">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          req.status === 'approved'
                            ? 'bg-green-500/20 text-green-400 border-0'
                            : 'bg-red-500/20 text-red-400 border-0'
                        }>
                          {req.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </Badge>
                        <span className="text-slate-300 text-sm">{req.org?.name}</span>
                        <span className="text-slate-500 text-xs">
                          {req.org?.users?.[0]?.email}
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs">
                        {req.reviewedAt
                          ? new Date(req.reviewedAt).toLocaleDateString('en-IN')
                          : ''}
                      </span>
                    </div>
                    {req.rejectReason && (
                      <p className="text-xs text-red-400 mt-2">
                        Reason: {req.rejectReason}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}