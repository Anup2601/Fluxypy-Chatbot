'use client';

import Link from 'next/link';
import { Bot, Sun, Moon } from 'lucide-react';

interface MarketingFooterProps {
  dark: boolean;
  toggleTheme: () => void;
}

export default function MarketingFooter({ dark, toggleTheme }: MarketingFooterProps) {
  return (
    <footer style={{
      borderTop: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.07)',
      padding: '28px 0',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={13} color="white" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
              Fluxypy Bot
            </span>
            <span style={{ color: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)', fontSize: 12 }}>© 2026</span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[['Features', '/#features'], ['Pricing', '/#pricing'], ['Login', '/login'], ['Register', '/register']].map(([label, href]) => (
              <a key={label} href={href} style={{
                fontSize: 13,
                color: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontFamily: "'DM Sans',sans-serif",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)')}>
                {label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)' }}>
              Built with ❤️ in India 🇮🇳
            </span>
            <button
              onClick={toggleTheme}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer > div > div { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
        @media (max-width: 480px) {
          footer > div { padding: 0 16px; }
        }
      `}</style>
    </footer>
  );
}