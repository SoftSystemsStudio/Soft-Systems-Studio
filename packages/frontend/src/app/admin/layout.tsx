'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #111111 0, #000000 60%)',
        color: '#f5f5f5',
      }}
    >
      {/* Navigation Bar */}
      <nav style={{ borderBottom: '1px solid #374151', padding: '16px 0' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            gap: 24,
            padding: '0 16px',
          }}
        >
          <Link
            href="/admin/clients"
            style={{
              color: pathname.includes('clients') ? '#84CC16' : '#9CA3AF',
              fontWeight: pathname.includes('clients') ? 600 : 400,
              textDecoration: 'none',
            }}
          >
            Clients
          </Link>
          <Link
            href="/admin/monitor"
            style={{
              color: pathname.includes('monitor') ? '#84CC16' : '#9CA3AF',
              fontWeight: pathname.includes('monitor') ? 600 : 400,
              textDecoration: 'none',
            }}
          >
            Monitor
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 64px' }}>{children}</div>
    </div>
  );
}

