'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi, api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Eye, Ban, Trash2, RefreshCw, Search,
  Users, BookOpen, MessageSquare, Loader2,
  CheckCircle, Clock, XCircle, CreditCard,
  Gift, TrendingUp, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Status Badge ──────────────────────────────────
function SubStatusBadge({ status, daysLeft }: { status: string; daysLeft?: number | null }) {
  if (status === 'active') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
      <CheckCircle className="w-3 h-3" /> Active
    </span>
  );
  if (status === 'trial') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
      <Gift className="w-3 h-3" /> Trial {daysLeft != null ? `· ${daysLeft}d left` : ''}
    </span>
  );
  if (status === 'expired') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
      <XCircle className="w-3 h-3" /> Expired
    </span>
  );
  if (status === 'cancelled') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
      <XCircle className="w-3 h-3" /> Cancelled
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
      Free
    </span>
  );
}

// ── Plan Badge ────────────────────────────────────
function PlanBadge({ planName, status }: { planName?: string; status: string }) {
  if (status === 'none' || !planName) return (
    <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">Free</span>
  );
  if (status === 'trial') return (
    <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">Trial</span>
  );

  const colors: Record<string, string> = {
    Starter:  'bg-blue-500/20 text-blue-400',
    Pro:      'bg-indigo-500/20 text-indigo-400',
    Business: 'bg-purple-500/20 text-purple-400',
    Enterprise: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[planName] || 'bg-slate-700 text-slate-300'}`}>
      {planName}
    </span>
  );
}

export default function OrganizationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orgs', page, search],
    queryFn: async () => {
      const res = await api.get(
        `/admin/organizations?page=${page}&search=${search}`,
      );
      return res.data;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/organizations/${id}/suspend`),
    onSuccess: () => {
      toast.success('Organization suspended');
      queryClient.invalidateQueries({ queryKey: ['admin-orgs'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/organizations/${id}/activate`),
    onSuccess: () => {
      toast.success('Organization activated');
      queryClient.invalidateQueries({ queryKey: ['admin-orgs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/organizations/${id}`),
    onSuccess: () => {
      toast.success('Organization deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-orgs'] });
    },
  });

  const orgs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Revenue summary
  const totalRevenue = orgs.reduce((sum: number, o: any) => sum + (o.monthlyRevenue || 0), 0);
  const activeOrgs = orgs.filter((o: any) => o.subscriptionStatus === 'active').length;
  const trialOrgs = orgs.filter((o: any) => o.subscriptionStatus === 'trial').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-slate-400 mt-1">{total} total customers</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Orgs', value: total, icon: Users, color: 'text-blue-400' },
          { label: 'Active Plans', value: activeOrgs, icon: CheckCircle, color: 'text-green-400' },
          { label: 'On Trial', value: trialOrgs, icon: Gift, color: 'text-yellow-400' },
          {
            label: 'MRR',
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
            icon: TrendingUp,
            color: 'text-purple-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name or slug..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-700 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Organization</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Billing Info</div>
            <div className="col-span-2">Usage</div>
            <div className="col-span-1">Actions</div>
          </div>

          {orgs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              No organizations found
            </div>
          ) : (
            orgs.map((org: any) => (
              <div
                key={org.id}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors items-center"
              >
                {/* Org Name */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 text-sm font-bold shrink-0">
                      {org.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm truncate">
                        {org.name}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {org.slug}
                      </p>
                      <p className="text-slate-600 text-xs">
                        {new Date(org.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan */}
                <div className="col-span-2 space-y-1">
                  <PlanBadge
                    planName={org.plan?.name}
                    status={org.subscriptionStatus}
                  />
                  {org.subscriptionStatus === 'active' && org.plan?.priceMonthly > 0 && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      ₹{Number(org.plan.priceMonthly).toLocaleString('en-IN')}/mo
                    </p>
                  )}
                  {org.subscriptionStatus === 'active' && (
                    <p className="text-xs text-slate-500">
                      {org.paymentType === 'subscription' ? '🔄 Auto-renew' : '💳 One-time'}
                    </p>
                  )}
                </div>

                {/* Subscription Status */}
                <div className="col-span-2 space-y-1">
                  <SubStatusBadge
                    status={org.subscriptionStatus}
                    daysLeft={org.trialDaysLeft}
                  />
                  {/* Org Active/Suspended */}
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                    org.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {org.status}
                  </span>
                </div>

                {/* Billing Info */}
                <div className="col-span-2">
                  {org.subscriptionStatus === 'trial' && org.trialEndDate && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Trial ends:
                      </p>
                      <p className="text-xs text-yellow-400 font-medium">
                        {new Date(org.trialEndDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className={`text-xs font-medium ${
                        org.trialDaysLeft <= 3 ? 'text-red-400' :
                        org.trialDaysLeft <= 7 ? 'text-yellow-400' :
                        'text-slate-400'
                      }`}>
                        {org.trialDaysLeft} days remaining
                      </p>
                    </div>
                  )}
                  {org.subscriptionStatus === 'active' && org.currentPeriodEnd && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Renews:
                      </p>
                      <p className="text-xs text-green-400 font-medium">
                        {new Date(org.currentPeriodEnd).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {org.periodDaysLeft} days left
                      </p>
                    </div>
                  )}
                  {['none', 'expired', 'cancelled'].includes(org.subscriptionStatus) && (
                    <p className="text-xs text-slate-500 italic">No active billing</p>
                  )}
                </div>

                {/* Usage */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {org._count.users} users
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {org._count.knowledgeSources} sources
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {org._count.conversations} convos
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center gap-1">
                  <button
                    onClick={() => router.push(`/organizations/${org.id}`)}
                    className="p-1.5 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (org.status === 'ACTIVE') {
                        suspendMutation.mutate(org.id);
                      } else {
                        activateMutation.mutate(org.id);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      org.status === 'ACTIVE'
                        ? 'hover:bg-yellow-900/50 text-yellow-500 hover:text-yellow-400'
                        : 'hover:bg-green-900/50 text-green-500 hover:text-green-400'
                    }`}
                    title={org.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${org.name}"? This cannot be undone.`)) {
                        deleteMutation.mutate(org.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-900/50 text-red-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-slate-600 text-slate-300"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-slate-600 text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
