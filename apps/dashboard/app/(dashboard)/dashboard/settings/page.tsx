'use client';

import { useAuthStore } from '@/store/auth.store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bot, Key, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { organization, user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(organization?.apiKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your account and bot configuration
        </p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={organization?.name || ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={organization?.slug || ''} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div>
              <Badge
                className={
                  organization?.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 border-0'
                    : 'bg-red-100 text-red-700 border-0'
                }
              >
                {organization?.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Widget API Key
          </CardTitle>
          <CardDescription>
            Use this key in your website script tag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={organization?.apiKey || ''}
              readOnly
              className="font-mono text-sm"
            />
            <Button variant="outline" onClick={copyApiKey}>
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ⚠️ Keep this key safe. It identifies your organization.
          </p>
        </CardContent>
      </Card>

      {/* Bot Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
          <CardDescription>
            Current settings (customization coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bot Name</Label>
              <Input
                value={
                  (organization?.settings as any)?.botName || 'Fluxypy Bot'
                }
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  value={
                    (organization?.settings as any)?.primaryColor || '#6366F1'
                  }
                  readOnly
                />
                <div
                  className="w-10 h-10 rounded-lg border border-slate-200 shrink-0"
                  style={{
                    backgroundColor:
                      (organization?.settings as any)?.primaryColor ||
                      '#6366F1',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Input
              value={
                (organization?.settings as any)?.welcomeMessage ||
                'Hi! How can I help you?'
              }
              readOnly
            />
          </div>

          <Button disabled className="w-full">
            Save Changes (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge variant="outline">{user?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}