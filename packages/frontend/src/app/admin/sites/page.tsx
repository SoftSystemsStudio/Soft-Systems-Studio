'use client';

import React from 'react';

export default function SitesPage() {
  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f5', marginBottom: 8 }}>
          Sites
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>
          Monitor all deployed websites and their performance.
        </p>
      </div>

      <div
        style={{
          padding: 64,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
          border: '1px solid #2a2a2a',
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>🌐</div>
        <h2 style={{ color: '#f5f5f5', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
          Site Monitoring Coming Soon
        </h2>
        <p style={{ color: '#9ca3af', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
          Track uptime, performance metrics, and deployment status for all your client websites in one place.
        </p>
      </div>
    </main>
  );
}
