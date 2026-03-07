'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { Gift } from 'lucide-react';


import {
  Shield,
  LayoutDashboard,
  Building2,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Overview',
  },
  {
    href: '/organizations',
    icon: Building2,
    label: 'Organizations',
  },
  { href: '/trial-requests', 
    icon: Gift, 
    label: 'Trial Requests' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              Fluxypy Admin
            </p>
            <p className="text-xs text-red-400">Super Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              <ChevronRight
                className={cn(
                  'w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity',
                  isActive && 'opacity-100',
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-slate-400 truncate max-w-[110px]">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}