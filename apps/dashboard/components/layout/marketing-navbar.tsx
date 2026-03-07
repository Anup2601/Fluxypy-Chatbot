'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Sun, Moon, Menu, X } from 'lucide-react';

interface MarketingNavbarProps {
  dark: boolean;
  toggleTheme: () => void;
}

export default function MarketingNavbar({ dark, toggleTheme }: MarketingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    ['Features', '/#features'],
    ['Use Cases', '/#use-cases'],
    ['How to Use', '/#how-it-works'],
    ['Pricing', '/#pricing'],
  ];

  return (
    <>
      <style>{`
        .mnav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s ease; }
        .mnav-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; height: 68px; }
        .mnav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .mnav-logo-icon { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#6366f1,#8b5cf6); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(99,102,241,0.4); flex-shrink: 0; }
        .mnav-links { display: flex; align-items: center; gap: 28px; }
        .mnav-links a { font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; font-family: 'DM Sans', sans-serif; }
        .mnav-actions { display: flex; gap: 10px; align-items: center; }
        .mnav-toggle { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: none; }
        .mnav-btn { border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; padding: 9px 20px; font-size: 14px; font-weight: 700; }
        .mnav-btn-ghost { border-radius: 10px; cursor: pointer; transition: all 0.2s; padding: 9px 18px; font-size: 14px; font-weight: 500; background: transparent; }
        .mnav-hamburger { display: none; background: transparent; border: none; cursor: pointer; padding: 4px; align-items: center; justify-content: center; }
        .mnav-mobile { display: none; position: fixed; top: 68px; left: 0; right: 0; z-index: 99; padding: 16px 24px 20px; flex-direction: column; gap: 0; }
        .mnav-mobile.open { display: flex; }
        .mnav-mobile a { padding: 13px 4px; font-size: 16px; font-weight: 500; text-decoration: none; border-bottom: 1px solid; transition: color 0.2s; font-family: 'DM Sans', sans-serif; }
        .mnav-mob-actions { display: flex; gap: 10px; padding-top: 16px; flex-wrap: wrap; }

        /* Dark */
        .dark .mnav.scrolled { background: rgba(8,8,8,0.95); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .dark .mnav-links a { color: rgba(255,255,255,0.45); }
        .dark .mnav-links a:hover { color: white; }
        .dark .mnav-toggle { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
        .dark .mnav-btn { background: white; color: #0a0a0a; }
        .dark .mnav-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .dark .mnav-btn-ghost { border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.55); }
        .dark .mnav-btn-ghost:hover { opacity: 0.75; }
        .dark .mnav-hamburger { color: rgba(255,255,255,0.7); }
        .dark .mnav-mobile { background: rgba(8,8,8,0.98); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .dark .mnav-mobile a { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.05); }

        /* Light */
        .light .mnav.scrolled { background: rgba(245,245,247,0.95); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(0,0,0,0.07); }
        .light .mnav-links a { color: rgba(0,0,0,0.45); }
        .light .mnav-links a:hover { color: #0a0a0a; }
        .light .mnav-toggle { background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); color: rgba(0,0,0,0.5); }
        .light .mnav-btn { background: #0a0a0a; color: white; }
        .light .mnav-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .light .mnav-btn-ghost { border: 1px solid rgba(0,0,0,0.15); color: rgba(0,0,0,0.5); }
        .light .mnav-btn-ghost:hover { opacity: 0.75; }
        .light .mnav-hamburger { color: rgba(0,0,0,0.6); }
        .light .mnav-mobile { background: rgba(245,245,247,0.98); border-bottom: 1px solid rgba(0,0,0,0.07); }
        .light .mnav-mobile a { color: rgba(0,0,0,0.6); border-color: rgba(0,0,0,0.05); }
        .light .mnav-logo span { color: #0a0a0a; }
        .dark  .mnav-logo span { color: #ffffff; }

        @media (max-width: 768px) {
          .mnav-inner { padding: 0 20px; }
          .mnav-links { display: none; }
          .mnav-actions .mnav-btn-ghost { display: none; }
          .mnav-actions .mnav-btn { display: none; }
          .mnav-hamburger { display: flex; }
          .mnav-mobile a:last-child { border-bottom: none; }
        }
        @media (max-width: 480px) {
          .mnav-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className={`mnav${scrolled ? ' scrolled' : ''}`}>
        <div className="mnav-inner">
          <Link href="/" className="mnav-logo">
            <div className="mnav-logo-icon"><Bot size={17} color="white" /></div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
              Fluxypy Bot
            </span>
          </Link>

          <div className="mnav-links">
            {navLinks.map(([label, href]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </div>

          <div className="mnav-actions">
            <button className="mnav-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link href="/login"><button className="mnav-btn-ghost">Sign In</button></Link>
            <Link href="/register"><button className="mnav-btn">Start Free →</button></Link>
            <button className="mnav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mnav-mobile${menuOpen ? ' open' : ''}`}>
        {navLinks.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
        ))}
        <div className="mnav-mob-actions">
          <Link href="/login"><button className="mnav-btn-ghost" onClick={() => setMenuOpen(false)}>Sign In</button></Link>
          <Link href="/register"><button className="mnav-btn" onClick={() => setMenuOpen(false)}>Start Free →</button></Link>
        </div>
      </div>
    </>
  );
}