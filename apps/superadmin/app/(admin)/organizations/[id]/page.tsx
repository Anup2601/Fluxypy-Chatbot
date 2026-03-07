'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  ShieldOff,
  ShieldCheck,
  Key,
  Calendar,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: org, isLoading } = useQuery({
    queryKey: ['admin-org', id],
    queryFn: async () => {
      const res = await adminApi.getOrganization(id);
      return res.data;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: () => adminApi.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-org', id] });
      toast.success('Organization suspended');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => adminApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-org', id] });
      toast.success('Organization activated');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/organizations">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {org.name}
              </h1>
              <Badge
                className={
                  org.status === 'ACTIVE'
                    ? 'bg-green-900 text-green-300 border-0'
                    : 'bg-red-900 text-red-300 border-0'
                }
              >
                {org.status}
              </Badge>
              {org.plan && (
                <Badge className="bg-indigo-900 text-indigo-300 border-0">
                  {org.plan.name}
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {org.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {org.status === 'ACTIVE' ? (
            <Button
              onClick={() => suspendMutation.mutate()}
              disabled={suspendMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700"
              size="sm"
            >
              <ShieldOff className="w-4 h-4 mr-2" />
              Suspend
            </Button>
          ) : (
            <Button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Users',
            value: org._count.users,
            icon: Users,
            color: 'text-purple-400',
          },
          {
            label: 'Knowledge Sources',
            value: org._count.knowledgeSources,
            icon: BookOpen,
            color: 'text-green-400',
          },
          {
            label: 'Conversations',
            value: org._count.conversations,
            icon: MessageSquare,
            color: 'text-blue-400',
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="bg-slate-800 border-slate-700"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">
                  {s.value}
                </p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Org Details */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              Organization Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'ID', value: org.id, mono: true },
              { label: 'Name', value: org.name },
              { label: 'Slug', value: org.slug, mono: true },
              {
                label: 'Created',
                value: new Date(org.createdAt).toLocaleString(),
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-500 mb-0.5">
                  {item.label}
                </p>
                <p
                  className={`text-sm text-white ${item.mono ? 'font-mono text-xs bg-slate-700 px-2 py-1 rounded' : ''}`}
                >
                  {item.value}
                </p>
              </div>
            ))}

            <div>
              <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                <Key className="w-3 h-3" />
                API Key
              </p>
              <p className="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-indigo-300 truncate">
                {org.apiKey}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Users ({org.users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 bg-slate-700 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-white">
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      Last login:{' '}
                      {user.lastLogin
                        ? new Date(
                            user.lastLogin,
                          ).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <Badge className="bg-slate-600 text-slate-300 border-0 text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Sources */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              Knowledge Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.knowledgeSources.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No sources yet
                </p>
              ) : (
                org.knowledgeSources.map((source: any) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-2 bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-white">
                          {source.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {source.chunkCount} chunks
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        source.status === 'READY'
                          ? 'bg-green-900 text-green-300 border-0 text-xs'
                          : 'bg-yellow-900 text-yellow-300 border-0 text-xs'
                      }
                    >
                      {source.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.conversations.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No conversations yet
                </p>
              ) : (
                org.conversations.map((conv: any) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-2 bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-mono text-slate-300 truncate max-w-32">
                          {conv.sessionId}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(
                            conv.startedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-slate-600 text-slate-300 border-0 text-xs">
                      {conv._count.messages} msgs
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}