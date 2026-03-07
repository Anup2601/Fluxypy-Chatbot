'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';


import {
  Bot,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart3,
  LogOut,
  Key,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/knowledge', icon: BookOpen, label: 'Knowledge Base' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Test Chat' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { organization, user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white">Fluxypy Bot</p>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">
              {organization?.name || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* API Key */}
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">Widget API Key</span>
          </div>
          <p className="text-xs text-indigo-300 font-mono truncate">
            {organization?.apiKey || 'Loading...'}
          </p>
        </div>

        {/* User + Logout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-xs text-slate-300 truncate max-w-[100px]">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}