import Link from 'next/link';
import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header style={{ padding: '12px 24px', borderBottom: '1px solid #333', marginBottom: 20 }}>
      <nav
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: 600 }}>
            Home
          </Link>
          <Link href="/intake">Intake</Link>
          <SignedIn>
            <Link href="/admin/clients">Clients</Link>
          </SignedIn>
        </div>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                style={{
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
