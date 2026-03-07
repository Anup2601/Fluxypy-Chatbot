'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Bot, Loader2, Eye, EyeOff, ArrowRight, Check, Zap, Shield, Globe, Brain } from 'lucide-react';
import { toast } from 'sonner';
import MarketingNavbar from '@/components/layout/marketing-navbar';
import MarketingFooter from '@/components/layout/marketing-footer';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Animated benefit cycling ──────────────────────────────────────────
const benefits = [
  { icon: Brain,  title: 'RAG-Powered Accuracy',  desc: 'Answers from your own docs — never hallucinations.' },
  { icon: Zap,    title: 'Live in 2 Minutes',      desc: 'Upload docs, get a widget. No coding required.' },
  { icon: Globe,  title: '24/7 Customer Support',  desc: 'Your bot never sleeps. Handle queries around the clock.' },
  { icon: Shield, title: 'Your Data, Isolated',    desc: 'Private vector namespace — your data stays yours.' },
];

function BenefitSlider({ dark }: { dark: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % benefits.length), 3000);
    return () => clearInterval(t);
  }, []);

  const b = benefits[active];
  const Icon = b.icon;

  return (
    <div style={{ width: '100%' }}>
      {/* Indicators */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {benefits.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            height: 3, borderRadius: 100, border: 'none', cursor: 'pointer',
            transition: 'all 0.4s ease',
            background: i === active ? '#818cf8' : 'rgba(255,255,255,0.2)',
            width: i === active ? 32 : 16,
            padding: 0,
          }} />
        ))}
      </div>

      {/* Active benefit card */}
      <div key={active} style={{ animation: 'slideUp 0.45s ease both' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: 'rgba(99,102,241,0.25)',
          border: '1px solid rgba(165,180,252,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon size={22} color="#a5b4fc" />
        </div>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.2 }}>
          {b.title}
        </h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontWeight: 300, maxWidth: 320 }}>
          {b.desc}
        </p>
      </div>

      {/* Mini benefit chips */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {benefits.map((ben, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 10,
            cursor: 'pointer', transition: 'all 0.2s',
            background: i === active ? 'rgba(99,102,241,0.15)' : 'transparent',
            border: i === active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
          }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: i === active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ben.icon size={12} color={i === active ? '#a5b4fc' : 'rgba(255,255,255,0.35)'} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: i === active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>
              {ben.title}
            </span>
            {i === active && <Check size={13} color="#818cf8" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [dark, setDark] = useState(true);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    const saved = localStorage.getItem('fluxypy-theme');
    if (saved) setDark(saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('fluxypy-theme', next ? 'dark' : 'light');
  };

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

  const t = {
    bg:          dark ? '#080808' : '#f5f5f7',
    text:        dark ? '#ffffff' : '#0a0a0a',
    textMuted:   dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
    textDim:     dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)',
    cardBg:      dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
    cardBorder:  dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',
    inputBg:     dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    inputBorder: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
    inputFocus:  '#6366f1',
    labelColor:  dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    divider:     dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    btnPrimary:  dark ? 'white' : '#0a0a0a',
    btnText:     dark ? '#0a0a0a' : 'white',
    linkColor:   '#818cf8',
  };

  return (
    <div className={dark ? 'lp-root dark' : 'lp-root light'} style={{ background: t.bg, color: t.text, minHeight: '100vh', fontFamily: "'DM Sans',sans-serif", transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes slideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

        .lp-root { overflow-x: hidden; }
        .lp-layout { display: grid; grid-template-columns: 1fr 1fr; margin-top: 68px; }
        
        /* Left panel */
        .lp-left { 
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%);
          padding: 52px 52px; display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .lp-left-noise {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .lp-left-glow {
          position: absolute; bottom: -100px; right: -100px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%);
          pointer-events: none;
        }
        .lp-left-brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 1; }
        .lp-left-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 28px 0; }
        .lp-left-footer { position: relative; z-index: 1; }
        .lp-left-stats { display: flex; gap: 28px; flex-wrap: wrap; }
        .lp-left-stat { text-align: left; }
        .lp-left-stat-val { font-family:'Space Grotesk',sans-serif; font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.02em; }
        .lp-left-stat-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
        .lp-left-tagline { font-size: 13px; color: rgba(255,255,255,0.35); font-weight: 300; margin-bottom: 20px; }

        /* Right panel */
        .lp-right { padding: 52px 52px; display: flex; align-items: center; justify-content: center; }
        .lp-form-wrap { width: 100%; max-width: 400px; animation: slideUp 0.6s ease both; }

        /* Form card */
        .lp-card {
          border-radius: 20px; padding: 40px 36px;
          animation: fadeIn 0.5s ease both;
        }

        /* Input */
        .lp-input-group { margin-bottom: 20px; }
        .lp-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 7px; letter-spacing: 0.01em; }
        .lp-input-wrap { position: relative; }
        .lp-input {
          width: 100%; padding: 12px 16px; border-radius: 11px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s;
          border-width: 1px; border-style: solid;
        }
        .lp-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .lp-input-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 2px; display: flex; align-items: center; transition: opacity 0.2s; }
        .lp-input-eye:hover { opacity: 0.7; }

        /* Submit btn */
        .lp-submit {
          width: 100%; padding: 13px; border-radius: 12px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          border: none; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          margin-top: 8px;
        }
        .lp-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Divider */
        .lp-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
        .lp-divider-line { flex: 1; height: 1px; }
        .lp-divider-text { font-size: 12px; font-weight: 500; white-space: nowrap; }

        /* Dark form */
        .dark .lp-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .dark .lp-label { color: rgba(255,255,255,0.6); }
        .dark .lp-input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: white; }
        .dark .lp-input::placeholder { color: rgba(255,255,255,0.25); }
        .dark .lp-input-eye { color: rgba(255,255,255,0.4); }
        .dark .lp-submit { background: white; color: #0a0a0a; }
        .dark .lp-divider-line { background: rgba(255,255,255,0.07); }
        .dark .lp-divider-text { color: rgba(255,255,255,0.3); }
        .dark .lp-footer-text { color: rgba(255,255,255,0.4); }

        /* Light form */
        .light .lp-card { background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.09); box-shadow: 0 4px 32px rgba(0,0,0,0.06); }
        .light .lp-label { color: rgba(0,0,0,0.6); }
        .light .lp-input { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.12); color: #0a0a0a; }
        .light .lp-input::placeholder { color: rgba(0,0,0,0.25); }
        .light .lp-input-eye { color: rgba(0,0,0,0.4); }
        .light .lp-submit { background: #0a0a0a; color: white; }
        .light .lp-divider-line { background: rgba(0,0,0,0.07); }
        .light .lp-divider-text { color: rgba(0,0,0,0.3); }
        .light .lp-footer-text { color: rgba(0,0,0,0.45); }
        .light .lp-right { background: rgba(0,0,0,0.015); }

        /* Shimmer heading */
        .lp-shimmer {
          background-image: linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 50%,#a5b4fc 70%,#fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite; display: inline-block;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .lp-left { padding: 48px 40px; }
          .lp-right { padding: 48px 40px; }
        }
        @media (max-width: 768px) {
          .lp-layout { grid-template-columns: 1fr; min-height: auto; }
          .lp-left { padding: 40px 24px; min-height: auto; }
          .lp-left-content { padding: 32px 0 24px; }
          .lp-left-footer { display: none; }
          .lp-right { padding: 40px 24px; }
          .lp-card { padding: 32px 24px; }
        }
        @media (max-width: 480px) {
          .lp-left { padding: 32px 20px; }
          .lp-right { padding: 32px 20px; }
          .lp-card { padding: 28px 20px; border-radius: 16px; }
          .lp-left-stats { gap: 20px; }
        }
      `}</style>

      {/* Navbar */}
      <MarketingNavbar dark={dark} toggleTheme={toggleTheme} />

      {/* Main layout */}
      <div className="lp-layout">

        {/* ── LEFT PANEL ── */}
        <div className="lp-left">
          <div className="lp-left-noise" />
          <div className="lp-left-glow" />

          {/* Brand */}
          <div className="lp-left-brand">
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.5)' }}>
              <Bot size={17} color="white" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: 'white', letterSpacing: '-0.02em' }}>
              Fluxypy Bot
            </span>
          </div>

          {/* Content */}
          <div className="lp-left-content">
            <p className="lp-left-tagline">Trusted by growing businesses</p>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(28px,3vw,42px)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 40 }}>
              Why businesses<br />
              <span className="lp-shimmer">choose Fluxypy</span>
            </h2>
            <BenefitSlider dark={dark} />
          </div>

          {/* Stats footer */}
          <div className="lp-left-footer">
            <div className="lp-left-stats">
              {[{val:'500+',label:'Businesses'},{val:'98%',label:'Accuracy'},{val:'2min',label:'Setup Time'},{val:'24/7',label:'Uptime'}].map((s,i) => (
                <div key={i} className="lp-left-stat">
                  <div className="lp-left-stat-val">{s.val}</div>
                  <div className="lp-left-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lp-right">
          <div className="lp-form-wrap">
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(24px,3vw,32px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 8 }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 15, color: t.textMuted, fontWeight: 300 }}>
                Sign in to your dashboard to continue.
              </p>
            </div>

            {/* Form card */}
            <div className="lp-card">
              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="lp-input-group">
                  <label className="lp-label" htmlFor="email">Email address</label>
                  <input
                    id="email"
                    className="lp-input"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div className="lp-input-group">
                  <label className="lp-label" htmlFor="password">Password</label>
                  <div className="lp-input-wrap">
                    <input
                      id="password"
                      className="lp-input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      style={{ paddingRight: 44 }}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className="lp-input-eye" onClick={() => setShowPass(s => !s)}>
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading
                    ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</>
                    : <>Sign In <ArrowRight size={16} /></>
                  }
                </button>
              </form>

              {/* Divider */}
              <div className="lp-divider">
                <div className="lp-divider-line" />
                <span className="lp-divider-text">Don't have an account?</span>
                <div className="lp-divider-line" />
              </div>

              {/* Register link */}
              <Link href="/register" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                Create free account →
              </Link>
            </div>

            {/* Trial nudge */}
            <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', marginBottom: 2 }}>30-Day Free Pro Trial</p>
                <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 300 }}>Register now — no credit card needed.</p>
              </div>
              <Link href="/register" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#818cf8', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Try Free →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <MarketingFooter dark={dark} toggleTheme={toggleTheme} />
    </div>
  );
}