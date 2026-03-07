'use client';

import { useState, useEffect, useRef } from 'react';
import MarketingNavbar from '@/components/layout/marketing-navbar';
import MarketingFooter from '@/components/layout/marketing-footer';
import Link from 'next/link';
import {
  Bot, Zap, Shield, Globe, Check, Menu, X,
  MessageSquare, BookOpen, Code2, BarChart3,
  ShoppingCart, GraduationCap, Building2, Headphones,
  ArrowRight, Sparkles, Brain, Upload, Settings2, Star, Sun, Moon,
} from 'lucide-react';

// ── Counter ───────────────────────────────────────────────────────────
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = end / 80;
        const t = setInterval(() => {
          s += step;
          if (s >= end) { setCount(end); clearInterval(t); }
          else setCount(Math.floor(s));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Theme Toggle ──────────────────────────────────────────────────────
function ThemeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <button onClick={toggle} className="theme-toggle" aria-label="Toggle theme">
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

// ── Shimmer Text ──────────────────────────────────────────────────────
function ShimmerText({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <span className={dark ? 'shimmer-dark' : 'shimmer-light'}>
      {children}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fluxypy-theme');
    if (saved) setDark(saved === 'dark');
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('fluxypy-theme', next ? 'dark' : 'light');
  };

  const d = dark;

  const features = [
    { icon: Brain,     title: 'RAG-Powered AI',    desc: 'Answers from YOUR data — not hallucinations. Pinecone vector search + Gemini generation.' },
    { icon: Upload,    title: 'Upload Any Format',  desc: 'PDF, DOCX, TXT — upload your docs and we handle parsing, chunking, embedding.' },
    { icon: Code2,     title: 'One-Line Embed',     desc: 'One script tag. Paste on your site. AI chatbot goes live instantly — zero dev needed.' },
    { icon: Shield,    title: 'Data Isolated',      desc: 'Every org gets its own namespace. Your data never mixes with other customers.' },
    { icon: BarChart3, title: 'Live Analytics',     desc: 'Track API calls, conversations, visitors in real-time from your dashboard.' },
    { icon: Globe,     title: '24/7 Availability',  desc: 'While you sleep, your bot handles queries, qualifies leads, delights users.' },
  ];

  const useCases = [
    { icon: ShoppingCart,  title: 'E-Commerce',   desc: 'Product recommendations, order tracking, return policies — all automated.' },
    { icon: GraduationCap, title: 'Education',    desc: 'Course FAQs, admissions, campus info — instant answers for students.' },
    { icon: Building2,     title: 'Real Estate',  desc: 'Property details, pricing, availability — qualify leads automatically.' },
    { icon: Headphones,    title: 'SaaS Support', desc: 'Docs, troubleshooting, onboarding — cut support tickets by 60%.' },
  ];

  const plans = [
    { name: 'Free',     price: '₹0',      period: '',    badge: null, highlight: false, features: ['50 API calls/day', '15 conversations/day', '10MB knowledge base', '5 messages/convo', 'Basic analytics'],                                               cta: 'Start Free'    },
    { name: 'Starter',  price: '₹1,499',  period: '/mo', badge: null, highlight: false, features: ['400 API calls/day', '70 conversations/day', '100MB knowledge base', '20 messages/convo', 'Email support'],                                              cta: 'Get Starter'   },
    { name: 'Pro',      price: '₹3,999',  period: '/mo', badge: 'Most Popular', highlight: true, features: ['3,500 API calls/day', '500 conversations/day', '500MB knowledge base', '50 messages/convo', 'Priority support', 'Custom domain'],              cta: 'Get Pro'       },
    { name: 'Business', price: '₹11,999', period: '/mo', badge: null, highlight: false, features: ['10,000 API calls/day', '2,500 conversations/day', '2GB knowledge base', '100 messages/convo', 'Remove branding', 'Dedicated support'],                  cta: 'Get Business'  },
  ];

  return (
    <div className={d ? 'root dark' : 'root light'}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        /* ── Base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .root { font-family: 'DM Sans', sans-serif; min-height: 100vh; transition: background 0.3s, color 0.3s; overflow-x: hidden; }
        .h { font-family: 'Space Grotesk', sans-serif !important; }

        /* ── Themes ── */
        .dark  { background: #080808; color: #ffffff; }
        .light { background: #f5f5f7; color: #0a0a0a; }

        /* ── Animations ── */
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pring   { 0%{transform:scale(0.85);opacity:0.5} 100%{transform:scale(1.65);opacity:0} }

        .afu1{animation:fadeUp 0.65s ease 0s both}
        .afu2{animation:fadeUp 0.65s ease 0.12s both}
        .afu3{animation:fadeUp 0.65s ease 0.24s both}
        .afu4{animation:fadeUp 0.65s ease 0.36s both}

        .shimmer-dark {
          background-image: linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 50%,#a5b4fc 70%,#fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite; display: inline-block;
        }
        .shimmer-light {
          background-image: linear-gradient(90deg,#111 0%,#6366f1 30%,#111 50%,#6366f1 70%,#111 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite; display: inline-block;
        }

        /* ── Layout helpers ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
        .section    { padding: 120px 0; }
        .section-alt { padding: 120px 0; }

        /* ── Grid layouts ── */
        .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; align-items: start; }
        .grid-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .grid-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; position: relative; }

        /* ── Section BG ── */
        .dark  .bg-alt { background: rgba(255,255,255,0.012); }
        .light .bg-alt { background: rgba(0,0,0,0.025); }

        /* ── Cards ── */
        .dark  .card { background: rgba(255,255,255,0.028); border: 1px solid rgba(255,255,255,0.07); }
        .light .card { background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 8px rgba(0,0,0,0.05); }
        .card { border-radius: 16px; padding: 28px 26px; transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
        .dark  .card:hover { transform: translateY(-5px); border-color: rgba(165,180,252,0.25); box-shadow: 0 20px 60px rgba(99,102,241,0.1); }
        .light .card:hover { transform: translateY(-5px); border-color: rgba(99,102,241,0.3); box-shadow: 0 20px 60px rgba(99,102,241,0.08); }

        .card-row { border-radius: 16px; padding: 28px; display: flex; gap: 20px; align-items: flex-start; transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
        .dark  .card-row { background: rgba(255,255,255,0.028); border: 1px solid rgba(255,255,255,0.07); }
        .light .card-row { background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 8px rgba(0,0,0,0.05); }
        .dark  .card-row:hover { transform: translateY(-5px); border-color: rgba(165,180,252,0.25); }
        .light .card-row:hover { transform: translateY(-5px); border-color: rgba(99,102,241,0.3); }

        /* ── Icon box ── */
        .dark  .icon-box { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.15); }
        .light .icon-box { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); }
        .icon-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; flex-shrink: 0; }
        .icon-box-lg { width: 50px; height: 50px; border-radius: 14px; }

        /* ── Text colors ── */
        .dark  .muted { color: rgba(255,255,255,0.38); }
        .light .muted { color: rgba(0,0,0,0.45); }
        .dark  .dim   { color: rgba(255,255,255,0.18); }
        .light .dim   { color: rgba(0,0,0,0.25); }

        /* ── Pill tag ── */
        .pill { display: inline-flex; align-items: center; gap: 6px; border-radius: 100px; padding: 6px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 20px; }
        .dark  .pill { border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); }
        .light .pill { border: 1px solid rgba(0,0,0,0.1); color: rgba(0,0,0,0.4); }

        /* ── Section heading ── */
        .sec-head { text-align: center; margin-bottom: 60px; }

        /* ── Buttons ── */
        .dark  .btn-primary { background: white; color: #0a0a0a; }
        .light .btn-primary { background: #0a0a0a; color: white; }
        .btn-primary { font-weight: 700; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; font-size: 15px; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }

        .dark  .btn-ghost { border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.55); }
        .light .btn-ghost { border: 1px solid rgba(0,0,0,0.15); color: rgba(0,0,0,0.5); }
        .btn-ghost { background: transparent; border-radius: 12px; cursor: pointer; transition: all 0.2s; padding: 14px 24px; font-size: 15px; font-weight: 500; }
        .btn-ghost:hover { opacity: 0.8; }

        .dark  .btn-sm { background: white; color: #0a0a0a; }
        .light .btn-sm { background: #0a0a0a; color: white; }
        .btn-sm { font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; padding: 9px 20px; font-size: 14px; }
        .btn-sm:hover { opacity: 0.88; }

        .dark  .btn-sm-ghost { border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.55); }
        .light .btn-sm-ghost { border: 1px solid rgba(0,0,0,0.15); color: rgba(0,0,0,0.5); }
        .btn-sm-ghost { background: transparent; border-radius: 10px; cursor: pointer; transition: all 0.2s; padding: 9px 18px; font-size: 14px; font-weight: 500; }
        .btn-sm-ghost:hover { opacity: 0.7; }

        /* ── Theme toggle ── */
        .dark  .theme-toggle { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .light .theme-toggle { border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.5); }
        .theme-toggle { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .theme-toggle:hover { opacity: 0.7; }

        /* ── Navbar ── */
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s ease; }
        .navbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; height: 68px; }
        .dark  .navbar.scrolled { background: rgba(8,8,8,0.94); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .light .navbar.scrolled { background: rgba(245,245,247,0.94); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(0,0,0,0.07); }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-icon { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#6366f1,#8b5cf6); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-links a { font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .dark  .nav-links a { color: rgba(255,255,255,0.45); }
        .light .nav-links a { color: rgba(0,0,0,0.45); }
        .dark  .nav-links a:hover { color: white; }
        .light .nav-links a:hover { color: #0a0a0a; }
        .nav-actions { display: flex; gap: 10px; align-items: center; }

        /* Mobile menu */
        .hamburger { display: none; background: transparent; border: none; cursor: pointer; padding: 4px; }
        .dark  .hamburger { color: rgba(255,255,255,0.7); }
        .light .hamburger { color: rgba(0,0,0,0.6); }
        .mobile-menu { display: none; position: fixed; top: 68px; left: 0; right: 0; z-index: 99; padding: 20px 24px; flex-direction: column; gap: 4px; }
        .dark  .mobile-menu { background: rgba(8,8,8,0.98); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .light .mobile-menu { background: rgba(245,245,247,0.98); border-bottom: 1px solid rgba(0,0,0,0.07); }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { padding: 12px 4px; font-size: 16px; font-weight: 500; text-decoration: none; border-bottom: 1px solid; transition: color 0.2s; }
        .dark  .mobile-menu a { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.05); }
        .light .mobile-menu a { color: rgba(0,0,0,0.6); border-color: rgba(0,0,0,0.05); }
        .mobile-menu a:last-child { border-bottom: none; }
        .mobile-menu .mob-actions { display: flex; gap: 10px; padding-top: 12px; flex-wrap: wrap; }

        /* ── Grid bg ── */
        .grid-bg { position: absolute; inset: 0; pointer-events: none; }
        .dark  .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px); background-size: 60px 60px; }
        .light .grid-bg { background-image: linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px); background-size: 60px 60px; }

        /* ── Stats border ── */
        .dark  .stats-row { border-top: 1px solid rgba(255,255,255,0.07); }
        .light .stats-row { border-top: 1px solid rgba(0,0,0,0.08); }
        .stats-row { display: flex; gap: 36px; padding-top: 32px; flex-wrap: wrap; }

        /* ── Bot viz ── */
        .bot-viz { display: flex; justify-content: center; align-items: center; position: relative; height: 420px; }
        .bot-ring { position: absolute; border-radius: 50%; }
        .dark  .bot-ring { border: 1px solid rgba(99,102,241,0.1); }
        .light .bot-ring { border: 1px solid rgba(99,102,241,0.08); }
        .bot-orbit { position: absolute; width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
        .dark  .bot-orbit { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .light .bot-orbit { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); }
        .bot-core { width: 112px; height: 112px; background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 24px 80px rgba(99,102,241,0.5); animation: float 3s ease-in-out infinite; position: relative; z-index: 2; }
        .bot-bubble-right { position: absolute; top: 36px; right: 16px; border-radius: 14px 14px 14px 4px; padding: 10px 14px; font-size: 13px; animation: fadeUp 0.5s ease 1s both; max-width: 190px; }
        .bot-bubble-left  { position: absolute; bottom: 52px; left: 8px; border-radius: 14px 14px 4px 14px; padding: 10px 14px; font-size: 13px; animation: fadeUp 0.5s ease 1.6s both; max-width: 190px; border: 1px solid rgba(99,102,241,0.25); }
        .dark  .bot-bubble-right { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); }
        .light .bot-bubble-right { background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border: 1px solid rgba(0,0,0,0.08); color: rgba(0,0,0,0.6); }
        .dark  .bot-bubble-left  { background: rgba(99,102,241,0.2); backdrop-filter: blur(12px); color: rgba(255,255,255,0.75); }
        .light .bot-bubble-left  { background: rgba(99,102,241,0.1); backdrop-filter: blur(12px); color: rgba(0,0,0,0.6); }

        /* ── Code block ── */
        .code-block { border-radius: 16px; padding: 22px 28px; max-width: 600px; margin: 56px auto 0; }
        .dark  .code-block { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .light .code-block { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); }
        .dark  .code-block pre { color: rgba(255,255,255,0.55); }
        .light .code-block pre { color: rgba(0,0,0,0.6); }
        .code-block pre { font-size: 13px; overflow-x: auto; line-height: 1.7; }

        /* ── Steps ── */
        .step-icon { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .dark  .step-icon-plain { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .light .step-icon-plain { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08); }
        .step-icon-accent { background: linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow: 0 12px 40px rgba(99,102,241,0.4); }
        .step-connector { position: absolute; top: 36px; left: 18%; right: 18%; height: 1px; background: linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent); pointer-events: none; }

        /* ── Pricing ── */
        .plan-card { position: relative; border-radius: 18px; padding: 26px 22px; }
        .plan-card-plain { border-radius: 18px; padding: 26px 22px; }
        .dark  .plan-card-plain { background: rgba(255,255,255,0.028); border: 1px solid rgba(255,255,255,0.07); }
        .light .plan-card-plain { background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 8px rgba(0,0,0,0.05); }
        .plan-card-highlight { background: linear-gradient(135deg,#4f46e5,#7c3aed); box-shadow: 0 20px 60px rgba(99,102,241,0.35); }
        .plan-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg,#f59e0b,#f97316); color: #000; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 100px; white-space: nowrap; letter-spacing: 0.06em; text-transform: uppercase; }
        .plan-btn { width: 100%; padding: 10px 0; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .plan-btn-plain { background: transparent; border: 1px solid rgba(99,102,241,0.3); color: #818cf8; }
        .plan-btn-plain:hover { background: rgba(99,102,241,0.1); }
        .plan-btn-accent { background: white; color: #4f46e5; border: none; }
        .trial-box { margin-top: 28px; text-align: center; border-radius: 16px; padding: 32px 24px; }
        .dark  .trial-box { background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.15); }
        .light .trial-box { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.2); }

        /* ── CTA section ── */
        .cta-card { border-radius: 24px; padding: 72px 48px; position: relative; overflow: hidden; text-align: center; }
        .dark  .cta-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); }
        .light .cta-card { background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.07); box-shadow: 0 4px 24px rgba(0,0,0,0.06); }

        /* ── Footer ── */
        .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .dark  .footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 28px 0; }
        .light .footer { border-top: 1px solid rgba(0,0,0,0.07); padding: 28px 0; }
        .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .dark  .footer-links a { color: rgba(255,255,255,0.18); }
        .light .footer-links a { color: rgba(0,0,0,0.25); }
        .dark  .footer-links a:hover { color: rgba(255,255,255,0.5); }
        .light .footer-links a:hover { color: rgba(0,0,0,0.6); }

        /* ═══════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ═══════════════════════════════════════════ */

        /* ── Tablet (≤ 1024px) ── */
        @media (max-width: 1024px) {
          .container { padding: 0 28px; }
          .navbar-inner { padding: 0 28px; }
          .grid-4  { grid-template-columns: repeat(2,1fr); }
          .grid-3  { grid-template-columns: repeat(2,1fr); }
          .grid-hero { grid-template-columns: 1fr; gap: 48px; }
          .bot-viz { height: 320px; }
          .section { padding: 80px 0; }
          .section-alt { padding: 80px 0; }
          .grid-steps { grid-template-columns: 1fr; gap: 40px; }
          .step-connector { display: none; }
          .cta-card { padding: 52px 32px; }
          .nav-links { gap: 20px; }
          .nav-links a { font-size: 13px; }
        }

        /* ── Mobile (≤ 768px) ── */
        @media (max-width: 768px) {
          .container { padding: 0 20px; }
          .navbar-inner { padding: 0 20px; }
          .section { padding: 64px 0; }
          .section-alt { padding: 64px 0; }

          /* Hide desktop nav, show hamburger */
          .nav-links  { display: none; }
          .nav-actions .btn-sm-ghost { display: none; }
          .nav-actions .btn-sm { display: none; }
          .hamburger { display: flex; align-items: center; justify-content: center; }

          /* Hero */
          .grid-hero  { grid-template-columns: 1fr; gap: 40px; }
          .bot-viz    { height: 260px; }
          .bot-bubble-right { display: none; }
          .bot-bubble-left  { display: none; }
          .bot-ring   { display: none; }
          .bot-orbit  { display: none; }
          .stats-row  { gap: 20px; }
          .btn-primary { padding: 13px 22px; font-size: 14px; }
          .btn-ghost   { padding: 13px 18px; font-size: 14px; }

          /* Grids */
          .grid-3 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          .grid-4 { grid-template-columns: 1fr; }
          .grid-steps { grid-template-columns: 1fr; }
          .step-connector { display: none; }

          /* CTA */
          .cta-card { padding: 40px 24px; }
          .sec-head { margin-bottom: 40px; }
          
          /* Footer */
          .footer-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
          .footer-links { gap: 16px; }

          /* Code block */
          .code-block { padding: 18px 20px; }
          .code-block pre { font-size: 12px; }
        }

        /* ── Small mobile (≤ 480px) ── */
        @media (max-width: 480px) {
          .container { padding: 0 16px; }
          .navbar-inner { padding: 0 16px; }
          .section { padding: 52px 0; }
          .grid-4 { grid-template-columns: 1fr; }
          .stats-row { gap: 16px; }
          .cta-card { padding: 32px 20px; }
          .card { padding: 22px 18px; }
          .card-row { padding: 20px 18px; gap: 14px; }
          .trial-box { padding: 24px 16px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon"><Bot size={17} color="white" /></div>
            <span className="h" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Fluxypy Bot</span>
          </div>

          {/* Desktop links */}
          <div className="nav-links">
            {[['Features','#features'],['Use Cases','#use-cases'],['How to Use','#how-it-works'],['Pricing','#pricing']].map(([l,h]) => (
              <a key={l} href={h}>{l}</a>
            ))}
          </div>

          <div className="nav-actions">
            <ThemeToggle dark={d} toggle={toggleTheme} />
            <Link href="/login"><button className="btn-sm-ghost">Sign In</button></Link>
            <Link href="/register"><button className="btn-sm">Start Free →</button></Link>
            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {[['Features','#features'],['Use Cases','#use-cases'],['How to Use','#how-it-works'],['Pricing','#pricing']].map(([l,h]) => (
          <a key={l} href={h} onClick={() => setMenuOpen(false)}>{l}</a>
        ))}
        <div className="mob-actions">
          <Link href="/login"><button className="btn-sm-ghost" onClick={() => setMenuOpen(false)}>Sign In</button></Link>
          <Link href="/register"><button className="btn-sm" onClick={() => setMenuOpen(false)}>Start Free →</button></Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 68, overflow: 'hidden' }}>
        <div className="grid-bg" />
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, background: d ? 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 65%)' : 'radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 65%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%', paddingTop: 80, paddingBottom: 80 }}>
          <div className="grid-hero">
            {/* Left */}
            <div>
              <div className="pill afu1"><Sparkles size={10} />AI Chatbot Platform</div>
              <h1 className="h afu2" style={{ fontSize: 'clamp(36px,5vw,66px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.035em', marginBottom: 22 }}>
                Your Business.<br />
                <ShimmerText dark={d}>Always On.</ShimmerText><br />
                Always Smart.
              </h1>
              <p className="muted afu3" style={{ fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.7, marginBottom: 36, maxWidth: 420, fontWeight: 300 }}>
                Train an AI chatbot on your docs in minutes. Embed it anywhere. Handle customer queries 24/7 - automatically.
              </p>
              <div className="afu4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
                <Link href="/register"><button className="btn-primary">Start Free — No Card Needed <ArrowRight size={16} /></button></Link>
                <a href="#features"><button className="btn-ghost">See Features</button></a>
              </div>
              <div className="stats-row">
                {[{val:500,suf:'+',label:'Businesses'},{val:98,suf:'%',label:'Accuracy'},{val:2,suf:'min',label:'Setup'}].map((s,i) => (
                  <div key={i}>
                    <div className="h" style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, letterSpacing: '-0.02em' }}><Counter end={s.val} suffix={s.suf} /></div>
                    <div className="dim" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Bot */}
            <div className="bot-viz">
              {[200,280,360].map((sz,i) => (
                <div key={i} className="bot-ring" style={{ width: sz, height: sz, animation: `pring ${2.5+i*0.6}s ease-out ${i*0.4}s infinite` }} />
              ))}
              {[MessageSquare, BookOpen, BarChart3, Code2].map((Icon, i) => {
                const a = (i*90)*Math.PI/180, r = 140;
                return (
                  <div key={i} className="bot-orbit" style={{ left: `calc(50% + ${Math.cos(a)*r}px - 20px)`, top: `calc(50% + ${Math.sin(a)*r}px - 20px)`, animation: `float ${3+i*0.4}s ease-in-out ${i*0.5}s infinite` }}>
                    <Icon size={18} color="#a5b4fc" />
                  </div>
                );
              })}
              <div className="bot-core">
                <Bot size={54} color="white" />
                <div style={{ position:'absolute', top:-5, right:-5, width:18, height:18, background:'#22c55e', borderRadius:'50%', border:`2px solid ${d?'#080808':'#f5f5f7'}` }} />
              </div>
              <div className="bot-bubble-right">How can I help? 🤖</div>
              <div className="bot-bubble-left">What are your plans?</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section bg-alt">
        <div className="container">
          <div className="sec-head">
            <div className="pill"><Zap size={10} />Features</div>
            <h2 className="h" style={{ fontSize: 'clamp(26px,4vw,50px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 14 }}>
              Deploy in Minutes, <ShimmerText dark={d}>Not Months</ShimmerText>
            </h2>
            <p className="muted" style={{ fontSize: 16, fontWeight: 300 }}>No ML expertise. Upload → Configure → Embed. Done.</p>
          </div>
          <div className="grid-3">
            {features.map((f,i) => (
              <div key={i} className="card">
                <div className="icon-box"><f.icon size={20} color="#818cf8" /></div>
                <h3 className="h" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="use-cases" className="section">
        <div className="container">
          <div className="sec-head">
            <div className="pill"><Building2 size={10} />Use Cases</div>
            <h2 className="h" style={{ fontSize: 'clamp(26px,4vw,50px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Built for <ShimmerText dark={d}>Every Industry</ShimmerText>
            </h2>
          </div>
          <div className="grid-2">
            {useCases.map((uc,i) => (
              <div key={i} className="card-row">
                <div className="icon-box icon-box-lg" style={{ marginBottom: 0 }}><uc.icon size={22} color="#818cf8" /></div>
                <div>
                  <h3 className="h" style={{ fontSize: 17, fontWeight: 700, marginBottom: 7, letterSpacing: '-0.01em' }}>{uc.title}</h3>
                  <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 300 }}>{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section bg-alt">
        <div className="container">
          <div className="sec-head">
            <div className="pill"><Settings2 size={10} />How It Works</div>
            <h2 className="h" style={{ fontSize: 'clamp(26px,4vw,50px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              3 Steps to <ShimmerText dark={d}>Go Live</ShimmerText>
            </h2>
          </div>
          <div className="grid-steps">
            <div className="step-connector" />
            {[
              { step:'01', icon:Upload, title:'Upload Your Docs',   desc:'PDFs, Word docs, plain text. We parse, chunk, and embed into a vector database — automatically.' },
              { step:'02', icon:Bot,    title:'Configure Your Bot', desc:'Set name, personality, brand voice. Test it live in the dashboard before going public.' },
              { step:'03', icon:Globe,  title:'Embed & Go Live',    desc:'One script tag in your HTML. Your AI bot is instantly live for all your website visitors.' },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center', padding:'0 12px' }}>
                <div className={`step-icon ${i===1 ? 'step-icon-accent' : 'step-icon-plain'}`}>
                  <s.icon size={28} color={i===1?'white':'#818cf8'} />
                </div>
                <div className="h" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(99,102,241,0.6)', marginBottom:10, textTransform:'uppercase' }}>Step {s.step}</div>
                <h3 className="h" style={{ fontSize:19, fontWeight:700, marginBottom:10, letterSpacing:'-0.02em' }}>{s.title}</h3>
                <p className="muted" style={{ fontSize:14, lineHeight:1.65, fontWeight:300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="code-block">
            <div style={{ display:'flex', gap:6, marginBottom:14 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c,i) => <div key={i} style={{ width:11, height:11, borderRadius:'50%', background:c }} />)}
              <span className="dim" style={{ marginLeft:8, fontSize:12 }}>index.html</span>
            </div>
            <pre><code>{`<!-- Paste before </body> -->
<script
  src="https://api.fluxypy.com/widget/chatbot.js"
  data-api-key="fpy_pub_your_key"
  defer
></script>`}</code></pre>
            <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#4ade80' }}>
              <Check size={13} /> That's it. Your bot is live! 🎉
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section">
        <div className="container">
          <div className="sec-head">
            <div className="pill"><Star size={10} />Pricing</div>
            <h2 className="h" style={{ fontSize:'clamp(26px,4vw,50px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:14 }}>
              Simple, <ShimmerText dark={d}>Transparent Pricing</ShimmerText>
            </h2>
            <p className="muted" style={{ fontSize:16, fontWeight:300 }}>Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid-4">
            {plans.map((p,i) => (
              <div key={i} style={{ position:'relative' }}>
                {p.badge && <div className="plan-badge">⭐ {p.badge}</div>}
                <div className={p.highlight ? 'plan-card plan-card-highlight' : 'plan-card plan-card-plain'} style={{ marginTop: p.badge ? 14 : 0 }}>
                  <h3 className="h" style={{ fontSize:17, fontWeight:700, marginBottom:5, color:p.highlight?'white':undefined }}>{p.name}</h3>
                  <div style={{ marginBottom:22 }}>
                    <span className="h" style={{ fontSize:30, fontWeight:800, letterSpacing:'-0.03em', color:p.highlight?'white':undefined }}>{p.price}</span>
                    <span style={{ fontSize:13, color:p.highlight?'rgba(255,255,255,0.55)':undefined }} className={p.highlight?'':'dim'}>{p.period}</span>
                  </div>
                  <ul style={{ listStyle:'none', padding:0, margin:'0 0 22px', display:'flex', flexDirection:'column', gap:9 }}>
                    {p.features.map((f,j) => (
                      <li key={j} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:p.highlight?'rgba(255,255,255,0.8)':undefined }} className={p.highlight?'':'muted'}>
                        <Check size={12} color={p.highlight?'white':'#6366f1'} style={{ flexShrink:0 }} />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <button className={`plan-btn ${p.highlight ? 'plan-btn-accent' : 'plan-btn-plain'}`}>{p.cta}</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="trial-box">
            <h3 className="h" style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>🎁 Try Pro Free for 30 Days</h3>
            <p className="muted" style={{ fontSize:14, marginBottom:18, fontWeight:300 }}>No credit card. Admin approves within 24 hrs.</p>
            <Link href="/register"><button className="btn-primary" style={{ margin:'0 auto' }}>Request Free Trial →</button></Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section bg-alt">
        <div style={{ maxWidth:720, margin:'0 auto', padding:'0 20px' }}>
          <div className="cta-card">
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, background:d?'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)':'radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />
            <div style={{ width:60, height:60, margin:'0 auto 24px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 12px 40px rgba(99,102,241,0.4)' }}>
              <Bot size={28} color="white" />
            </div>
            <h2 className="h" style={{ fontSize:'clamp(24px,4vw,44px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:14 }}>
              Ready to Automate<br /><ShimmerText dark={d}>Customer Support?</ShimmerText>
            </h2>
            <p className="muted" style={{ fontSize:'clamp(14px,2vw,17px)', marginBottom:34, fontWeight:300, lineHeight:1.6 }}>
              Handle queries, qualify leads, and delight customers — around the clock, automatically.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/register"><button className="btn-primary">Get Started Free <ArrowRight size={16} /></button></Link>
              <Link href="/login"><button className="btn-ghost">Sign In</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}><Bot size={13} color="white" /></div>
              <span className="h muted" style={{ fontWeight:700, fontSize:14 }} >Fluxypy Bot</span>
              <span className="dim" style={{ fontSize:12 }}>© 2026</span>
            </div>
            <div className="footer-links">
              {[['Features','#features'],['Pricing','#pricing'],['Login','/login'],['Register','/register']].map(([l,h]) => (
                <a key={l} href={h}>{l}</a>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span className="dim" style={{ fontSize:12 }}>Built with ❤️ in India</span>
              <ThemeToggle dark={d} toggle={toggleTheme} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}