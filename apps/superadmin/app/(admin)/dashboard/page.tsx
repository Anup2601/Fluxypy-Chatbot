'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building2,
  Users,
  MessageSquare,
  BookOpen,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminApi.getStats();
      return res.data;
    },
  });

  const statCards = [
    {
      label: 'Total Organizations',
      value: stats?.totalOrgs ?? '—',
      icon: Building2,
      color: 'text-blue-400',
      bg: 'bg-blue-950',
      href: '/organizations',
    },
    {
      label: 'Active Orgs',
      value: stats?.activeOrgs ?? '—',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-950',
      href: '/organizations',
    },
    {
      label: 'Suspended Orgs',
      value: stats?.suspendedOrgs ?? '—',
      icon: ShieldAlert,
      color: 'text-red-400',
      bg: 'bg-red-950',
      href: '/organizations',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? '—',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-950',
      href: '/organizations',
    },
    {
      label: 'Conversations',
      value: stats?.totalConversations ?? '—',
      icon: MessageSquare,
      color: 'text-yellow-400',
      bg: 'bg-yellow-950',
      href: '/organizations',
    },
    {
      label: 'Knowledge Sources',
      value: stats?.totalKnowledgeSources ?? '—',
      icon: BookOpen,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950',
      href: '/organizations',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Platform Overview
        </h1>
        <p className="text-slate-400 mt-1">
          Real-time stats across all Fluxypy Bot customers
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.label}
                </CardTitle>
                <div
                  className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {isLoading ? (
                    <div className="w-16 h-8 bg-slate-700 rounded animate-pulse" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick link */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-950 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Manage Organizations
              </p>
              <p className="text-sm text-slate-400">
                View, suspend, or delete customer accounts
              </p>
            </div>
          </div>
          <Link href="/organizations">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              View All →
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}