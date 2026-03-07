'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      setError('');
      const res = await authApi.login(data);
      const { user, accessToken, refreshToken } = res.data; // ✅ tokens destructure

      if (user.role !== 'SUPER_ADMIN') {
        setError('Access denied. Super Admin only.');
        return;
      }

      Cookies.set('sa_refreshToken', refreshToken, { expires: 7 }); // ✅ refresh token save

      setAuth(
        { id: user.id, email: user.email, role: user.role },
        { id: user.orgId, name: user.orgName, slug: user.orgSlug },
        accessToken,
      );
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              Fluxypy Super Admin
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Restricted Access Only
            </p>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Super Admin credentials required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {error && (
                <div className="flex items-center gap-2 bg-red-950 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  placeholder="superadmin@fluxypy.ai"
                  {...register('email')}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In as Super Admin
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          ⚠️ Unauthorized access is prohibited and monitored
        </p>
      </div>
    </div>
  );
}