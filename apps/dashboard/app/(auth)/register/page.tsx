'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardHeader,
  CardTitle, CardDescription,
} from '@/components/ui/card';
import { Loader2, Bot, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

import { useSearchParams } from 'next/navigation';

// component ke andar, useState ke baad:


export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState({
    orgName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const searchParams = useSearchParams();
  useEffect(() => {
    const verifyParam = searchParams.get('verify');
    if (verifyParam) {
      setVerifyEmail(verifyParam);
      setStep('verify');
      startResendTimer();
    }
  }, []);

  // ── Register ────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, {
        orgName: form.orgName,
        email: form.email,
        password: form.password,
      });

      setVerifyEmail(form.email);
      setStep('verify');
      toast.success('📧 OTP sent! Check your inbox.');
      startResendTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input ───────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    text.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const lastIdx = Math.min(text.length, 5);
    inputRefs.current[lastIdx]?.focus();
  };

  // ── Verify OTP ──────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      toast.error('Enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, {
        email: verifyEmail,
        otp: otpStr,
      });

      const { accessToken, refreshToken } = res.data;
      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });

      toast.success('✅ Email verified! Welcome to Fluxypy Bot!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend Timer ────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await axios.post(`${API}/auth/resend-otp`, { email: verifyEmail });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      startResendTimer();
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResendLoading(false);
    }
  };

  // ── REGISTER FORM ────────────────────────────────
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Start your AI chatbot journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Company / Organization Name</Label>
                <Input
                  placeholder="ABC Company"
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                ) : (
                  <><ArrowRight className="w-4 h-4 mr-2" />Create Account</>
                )}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── OTP VERIFY FORM ──────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            6-digit OTP sent to<br />
            <strong className="text-slate-700">{verifyEmail}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Boxes */}
            <div>
              <Label className="text-center block mb-3 text-slate-600">
                Enter OTP
              </Label>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                      ${digit
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-800'
                      }
                      focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">
                💡 You can paste the OTP directly
              </p>
            </div>

            {/* Timer */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-slate-400">
                  Resend OTP in <span className="font-bold text-indigo-600">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mx-auto"
                >
                  {resendLoading ? (
                    <><Loader2 className="w-3 h-3 animate-spin" />Sending...</>
                  ) : (
                    <><RefreshCw className="w-3 h-3" />Resend OTP</>
                  )}
                </button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
              ) : (
                <><ArrowRight className="w-4 h-4 mr-2" />Verify & Continue</>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setStep('register')}
              className="w-full text-sm text-slate-400 hover:text-slate-600"
            >
              ← Back to Register
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}