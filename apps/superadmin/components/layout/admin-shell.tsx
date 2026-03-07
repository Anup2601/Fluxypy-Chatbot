'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from './sidebar';
import Cookies from 'js-cookie';
import { Shield } from 'lucide-react';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setAuth, clearAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const check = async () => {
      const token = Cookies.get('sa_accessToken'); // ✅ sa_ prefix hata diya

      if (!token) {
        clearAuth();
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          clearAuth();
          router.replace('/login');
          return;
        }

        const data = await res.json();

        if (data.role !== 'SUPER_ADMIN') {
          clearAuth();
          router.replace('/login');
          return;
        }

        setAuth(
          { id: data.id, email: data.email, role: data.role },
          { id: data.org.id, name: data.org.name, slug: data.org.slug }, // ✅ data.org
          token,
        );
      } catch {
        clearAuth();
        router.replace('/login');
      }
    };

    check();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">{children}</main>
    </div>
  );
}