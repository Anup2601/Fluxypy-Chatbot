'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Loader2, Bot, ArrowRight, RefreshCw, Eye, EyeOff, Sparkles, Zap, Globe, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import MarketingNavbar from '@/components/layout/marketing-navbar';
import MarketingFooter from '@/components/layout/marketing-footer';

const API = process.env.NEXT_PUBLIC_API_URL;

const benefits = [
  { icon: Sparkles, title: 'Free Forever Plan',  desc: 'Start with no credit card. Upgrade only when ready.' },
  { icon: Zap,      title: '30-Day Pro Trial',   desc: 'Request a free Pro trial — admin approves in 24 hrs.' },
  { icon: Globe,    title: 'Embed Anywhere',     desc: 'One script tag. Any website. Live in under 2 minutes.' },
  { icon: Shield,   title: 'Data Privacy First', desc: 'Isolated vector namespace — your knowledge stays private.' },
];

function BenefitSlider() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % benefits.length), 3200);
    return () => clearInterval(t);
  }, []);
  const b = benefits[active];
  const Icon = b.icon;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {benefits.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            height: 3, borderRadius: 100, border: 'none', cursor: 'pointer',
            transition: 'all 0.4s ease', padding: 0,
            background: i === active ? '#818cf8' : 'rgba(255,255,255,0.2)',
            width: i === active ? 32 : 16,
          }} />
        ))}
      </div>
      <div key={active} style={{ animation: 'slideUp 0.45s ease both' }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(165,180,252,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={22} color="#a5b4fc" />
        </div>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.2 }}>
          {b.title}
        </h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontWeight: 300, maxWidth: 320 }}>
          {b.desc}
        </p>
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {benefits.map((ben, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', background: i === active ? 'rgba(99,102,241,0.15)' : 'transparent', border: i === active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: i === active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ben.icon size={12} color={i === active ? '#a5b4fc' : 'rgba(255,255,255,0.35)'} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: i === active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>{ben.title}</span>
            {i === active && <Check size={13} color="#818cf8" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function OtpBoxes({ otp, setOtp, inputRefs, dark, onPaste }: {
  otp: string[]; setOtp: (v: string[]) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  dark: boolean; onPaste: (e: React.ClipboardEvent) => void;
}) {
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }} onPaste={onPaste}>
      {otp.map((digit, i) => (
        <input key={i} ref={el => { inputRefs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          style={{ width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", outline: 'none', transition: 'all 0.2s', borderRadius: 12, border: `1px solid ${digit ? '#6366f1' : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)')}`, background: digit ? (dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.07)') : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'), color: dark ? 'white' : '#0a0a0a', boxShadow: digit ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none' }}
        />
      ))}
    </div>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [dark, setDark] = useState(true);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ orgName: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const saved = localStorage.getItem('fluxypy-theme');
    if (saved) setDark(saved === 'dark');
    const verifyParam = searchParams.get('verify');
    if (verifyParam) {
      setVerifyEmail(verifyParam);
      setStep('verify');
      startResendTimer();
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('fluxypy-theme', next ? 'dark' : 'light');
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, { orgName: form.orgName, email: form.email, password: form.password });
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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    text.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, { email: verifyEmail, otp: otpStr });
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

  const t = {
    bg:        dark ? '#080808' : '#f5f5f7',
    text:      dark ? '#ffffff' : '#0a0a0a',
    textMuted: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
  };

  return (
    <div className={dark ? 'rp-root dark' : 'rp-root light'} style={{ background: t.bg, color: t.text, minHeight: '100vh', fontFamily: "'DM Sans',sans-serif", transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .rp-root { overflow-x: hidden; }
        .rp-layout { display: grid; grid-template-columns: 1fr 1fr; margin-top: 68px; }

        /* LEFT — same as login */
        .rp-left {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%);
          padding: 52px 52px; display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .rp-left-noise { position: absolute; inset: 0; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); }
        .rp-left-glow { position: absolute; bottom: -100px; right: -100px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%); pointer-events: none; }
        .rp-left-brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
        .rp-left-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 28px 0; }
        .rp-left-footer { position: relative; z-index: 1; }
        .rp-left-stats { display: flex; gap: 28px; flex-wrap: wrap; }
        .rp-left-stat-val { font-family:'Space Grotesk',sans-serif; font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.02em; }
        .rp-left-stat-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
        .rp-left-tagline { font-size: 13px; color: rgba(255,255,255,0.35); font-weight: 300; margin-bottom: 20px; }
        .rp-shimmer { background-image: linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 50%,#a5b4fc 70%,#fff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; display: inline-block; }

        /* RIGHT — same as login */
        .rp-right { padding: 52px 52px; display: flex; align-items: center; justify-content: center; }
        .rp-form-wrap { width: 100%; max-width: 400px; animation: slideUp 0.6s ease both; }

        /* CARD — same as login */
        .rp-card { border-radius: 20px; padding: 40px 36px; animation: fadeIn 0.5s ease both; }

        /* INPUTS — same as login */
        .rp-input-group { margin-bottom: 20px; }
        .rp-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 7px; letter-spacing: 0.01em; }
        .rp-input-wrap { position: relative; }
        .rp-input { width: 100%; padding: 12px 16px; border-radius: 11px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; border-width: 1px; border-style: solid; }
        .rp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rp-input-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 2px; display: flex; align-items: center; transition: opacity 0.2s; }
        .rp-input-eye:hover { opacity: 0.7; }

        /* SUBMIT — same as login */
        .rp-submit { width: 100%; padding: 13px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .rp-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .rp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* DIVIDER — same as login */
        .rp-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
        .rp-divider-line { flex: 1; height: 1px; }
        .rp-divider-text { font-size: 12px; font-weight: 500; white-space: nowrap; }

        /* STEP INDICATOR */
        .rp-steps { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .rp-step { display: flex; align-items: center; gap: 7px; }
        .rp-step-dot { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; flex-shrink: 0; }
        .rp-step-line { flex: 1; height: 1px; }

        /* RESEND */
        .rp-resend { background: transparent; border: none; cursor: pointer; font-size: 13px; font-weight: 600; color: #818cf8; transition: opacity 0.2s; padding: 0; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 5px; }
        .rp-resend:hover:not(:disabled) { opacity: 0.7; }
        .rp-resend:disabled { opacity: 0.4; cursor: default; }

        /* DARK — same as login */
        .dark .rp-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .dark .rp-label { color: rgba(255,255,255,0.6); }
        .dark .rp-input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: white; }
        .dark .rp-input::placeholder { color: rgba(255,255,255,0.25); }
        .dark .rp-input-eye { color: rgba(255,255,255,0.4); }
        .dark .rp-submit { background: white; color: #0a0a0a; }
        .dark .rp-divider-line { background: rgba(255,255,255,0.07); }
        .dark .rp-divider-text { color: rgba(255,255,255,0.3); }
        .dark .rp-step-line { background: rgba(255,255,255,0.07); }

        /* LIGHT — same as login */
        .light .rp-card { background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.09); box-shadow: 0 4px 32px rgba(0,0,0,0.06); }
        .light .rp-label { color: rgba(0,0,0,0.6); }
        .light .rp-input { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.12); color: #0a0a0a; }
        .light .rp-input::placeholder { color: rgba(0,0,0,0.25); }
        .light .rp-input-eye { color: rgba(0,0,0,0.4); }
        .light .rp-submit { background: #0a0a0a; color: white; }
        .light .rp-divider-line { background: rgba(0,0,0,0.07); }
        .light .rp-divider-text { color: rgba(0,0,0,0.3); }
        .light .rp-right { background: rgba(0,0,0,0.015); }
        .light .rp-step-line { background: rgba(0,0,0,0.07); }

        /* RESPONSIVE — same as login */
        @media (max-width: 1024px) {
          .rp-left { padding: 48px 40px; }
          .rp-right { padding: 48px 40px; }
        }
        @media (max-width: 768px) {
          .rp-layout { grid-template-columns: 1fr; min-height: auto; }
          .rp-left { padding: 40px 24px; min-height: auto; }
          .rp-left-content { padding: 32px 0 24px; }
          .rp-left-footer { display: none; }
          .rp-right { padding: 40px 24px; }
          .rp-card { padding: 32px 24px; }
        }
        @media (max-width: 480px) {
          .rp-left { padding: 32px 20px; }
          .rp-right { padding: 32px 20px; }
          .rp-card { padding: 28px 20px; border-radius: 16px; }
          .rp-left-stats { gap: 20px; }
        }
      `}</style>

      <MarketingNavbar dark={dark} toggleTheme={toggleTheme} />

      <div className="rp-layout">

        {/* ── LEFT ── */}
        <div className="rp-left">
          <div className="rp-left-noise" />
          <div className="rp-left-glow" />
          <div className="rp-left-brand">
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.5)' }}>
              <Bot size={17} color="white" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: 'white', letterSpacing: '-0.02em' }}>Fluxypy Bot</span>
          </div>
          <div className="rp-left-content">
            <p className="rp-left-tagline">Join 500+ growing businesses</p>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(28px,3vw,42px)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 40 }}>
              Start for free.<br />
              <span className="rp-shimmer">Scale with AI.</span>
            </h2>
            <BenefitSlider />
          </div>
          <div className="rp-left-footer">
            <div className="rp-left-stats">
              {[{val:'Free',label:'Forever Plan'},{val:'2min',label:'Setup Time'},{val:'30d',label:'Pro Trial'},{val:'24/7',label:'Uptime'}].map((s,i) => (
                <div key={i}>
                  <div className="rp-left-stat-val">{s.val}</div>
                  <div className="rp-left-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="rp-right">
          <div className="rp-form-wrap">

            {/* Step indicator */}
            <div className="rp-steps">
              <div className="rp-step">
                <div className="rp-step-dot" style={{ background: step === 'register' ? '#6366f1' : '#22c55e', color: 'white' }}>
                  {step === 'verify' ? <Check size={11} /> : '1'}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: dark ? (step === 'register' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)') : (step === 'register' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)') }}>Account</span>
              </div>
              <div className="rp-step-line" />
              <div className="rp-step">
                <div className="rp-step-dot" style={{ background: step === 'verify' ? '#6366f1' : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), color: step === 'verify' ? 'white' : (dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)') }}>2</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: dark ? (step === 'verify' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)') : (step === 'verify' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)') }}>Verify Email</span>
              </div>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(24px,3vw,32px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 8 }}>
                {step === 'register' ? 'Create your account' : 'Verify your email'}
              </h1>
              <p style={{ fontSize: 15, color: t.textMuted, fontWeight: 300 }}>
                {step === 'register' ? 'Free forever. No credit card needed.' : 'Enter the 6-digit code we sent you.'}
              </p>
            </div>

            {/* ── REGISTER FORM ── */}
            {step === 'register' && (
              <>
                <div className="rp-card">
                  <form onSubmit={handleRegister}>
                    <div className="rp-input-group">
                      <label className="rp-label">Company / Organization Name</label>
                      <input className="rp-input" type="text" placeholder="ABC Company" required autoComplete="organization"
                        value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })} />
                    </div>
                    <div className="rp-input-group">
                      <label className="rp-label">Email Address</label>
                      <input className="rp-input" type="email" placeholder="you@company.com" required autoComplete="email"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="rp-input-group">
                      <label className="rp-label">Password</label>
                      <div className="rp-input-wrap">
                        <input className="rp-input" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" required minLength={8} autoComplete="new-password"
                          style={{ paddingRight: 44 }}
                          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        <button type="button" className="rp-input-eye" onClick={() => setShowPass(s => !s)}>
                          {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <div className="rp-input-group">
                      <label className="rp-label">Confirm Password</label>
                      <div className="rp-input-wrap">
                        <input className="rp-input" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" required autoComplete="new-password"
                          style={{ paddingRight: 44 }}
                          value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                        <button type="button" className="rp-input-eye" onClick={() => setShowConfirm(s => !s)}>
                          {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="rp-submit" disabled={loading}>
                      {loading
                        ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />Creating account...</>
                        : <>Create Account <ArrowRight size={16} /></>}
                    </button>
                  </form>
                  <div className="rp-divider">
                    <div className="rp-divider-line" />
                    <span className="rp-divider-text">Already have an account?</span>
                    <div className="rp-divider-line" />
                  </div>
                  <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    Sign in instead →
                  </Link>
                </div>
                {/* Trial nudge */}
                <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🎁</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', marginBottom: 2 }}>30-Day Free Pro Trial</p>
                    <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 300 }}>After signup, request from your dashboard.</p>
                  </div>
                </div>
              </>
            )}

            {/* ── VERIFY / OTP FORM ── */}
            {step === 'verify' && (
              <div className="rp-card">
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <p style={{ fontSize: 14, color: t.textMuted, fontWeight: 300, marginBottom: 10 }}>6-digit OTP sent to:</p>
                  <span style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                    {verifyEmail}
                  </span>
                </div>
                <form onSubmit={handleVerify}>
                  <OtpBoxes otp={otp} setOtp={setOtp} inputRefs={inputRefs} dark={dark} onPaste={handleOtpPaste} />
                  <p style={{ textAlign: 'center', fontSize: 12, color: t.textMuted, marginTop: 10 }}>💡 You can paste the OTP directly</p>
                  <button type="submit" className="rp-submit" disabled={loading || otp.join('').length !== 6} style={{ marginTop: 20 }}>
                    {loading
                      ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />Verifying...</>
                      : <>Verify & Continue <ArrowRight size={16} /></>}
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  {resendTimer > 0
                    ? <p style={{ fontSize: 14, color: t.textMuted }}>Resend OTP in <span style={{ fontWeight: 700, color: '#818cf8' }}>{resendTimer}s</span></p>
                    : <button className="rp-resend" disabled={resendLoading} onClick={handleResend}>
                        {resendLoading
                          ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />Sending...</>
                          : <><RefreshCw size={13} />Resend OTP</>}
                      </button>
                  }
                </div>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button onClick={() => setStep('register')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: t.textMuted, fontFamily: "'DM Sans',sans-serif" }}>
                    ← Back to Register
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <MarketingFooter dark={dark} toggleTheme={toggleTheme} />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080808' }} />}>
      <RegisterPageContent />
    </Suspense>
  );
}