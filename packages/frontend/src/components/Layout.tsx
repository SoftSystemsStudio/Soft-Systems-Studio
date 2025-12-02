// packages/frontend/src/components/Layout.tsx
import React from 'react';
import Header from './Header';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #111111 0, #000000 60%)',
        color: '#f5f5f5',
      }}
    >
      <Header />
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 16px 64px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
