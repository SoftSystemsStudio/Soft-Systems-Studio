import React from 'react';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header />
      <div style={{ padding: '0 24px' }}>{children}</div>
    </div>
  );
}
