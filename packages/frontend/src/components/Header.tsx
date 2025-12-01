import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header style={{ padding: '12px 24px', borderBottom: '1px solid #eee', marginBottom: 20 }}>
      <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/">Home</Link>
        <Link href="/intake">Intake</Link>
        <Link href="/admin/clients">Clients</Link>
      </nav>
    </header>
  );
}
