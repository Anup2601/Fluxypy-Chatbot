'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Loader2, Bot } from 'lucide-react';

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = Cookies.get('accessToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        // api instance use karo — interceptor automatically handle karega
        const res = await api.get('/auth/me');
        const data = res.data;

        setAuth(
          { id: data.id, email: data.email, role: data.role },
          {
            id: data.org.id,
            name: data.org.name,
            slug: data.org.slug,
            apiKey: data.org.apiKey,
            status: data.org.status,
            subscriptionStatus: data.org.subscriptionStatus,
            plan: data.org.plan ?? null,
          },
          token,
        );

        setChecking(false);
      } catch {
        // api.ts interceptor already handles 401 + redirect
        // Baaki errors ke liye logout
        clearAuth();
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        router.replace('/login');
      }
    };

    verifyAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}