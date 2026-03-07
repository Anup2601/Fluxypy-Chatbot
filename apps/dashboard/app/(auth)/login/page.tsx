'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      const { accessToken, refreshToken } = res.data;
      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      // Unverified user → redirect to OTP verify
      try {
        const errData = JSON.parse(err.response?.data?.message || '{}');
        if (errData.requiresVerification) {
          toast.warning('Email not verified. OTP sent again!');
          sessionStorage.setItem('verify_email', errData.email);
          router.push(`/register?verify=${encodeURIComponent(errData.email)}`);
          return;
        }
      } catch {}
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Fluxypy Bot</span>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-600 hover:underline font-medium">
                Sign up free
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}