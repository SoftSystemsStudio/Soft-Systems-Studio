'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/clients', label: 'Clients', icon: '👥' },
  { href: '/admin/sites', label: 'Sites', icon: '🌐' },
  { href: '/admin/revenue', label: 'Revenue', icon: '💰' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
        borderRight: '1px solid #2a2a2a',
        padding: '24px 0',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo/Brand */}
      <div style={{ padding: '0 20px', marginBottom: 32 }}>
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: '#A3E635',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div>
            <div style={{ color: '#f5f5f5', fontSize: 14, fontWeight: 600 }}>Soft Systems</div>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Admin Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  background: active ? 'rgba(163, 230, 53, 0.1)' : 'transparent',
                  border: active ? '1px solid rgba(163, 230, 53, 0.3)' : '1px solid transparent',
                  color: active ? '#A3E635' : '#9ca3af',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(163, 230, 53, 0.05)';
                    e.currentTarget.style.color = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: '0 20px', borderTop: '1px solid #2a2a2a', paddingTop: 16 }}>
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 6,
            textDecoration: 'none',
            color: '#6b7280',
            fontSize: 13,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(163, 230, 53, 0.05)';
            e.currentTarget.style.color = '#A3E635';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <span>←</span>
          <span>Back to Site</span>
        </a>
      </div>
    </aside>
  );
}
