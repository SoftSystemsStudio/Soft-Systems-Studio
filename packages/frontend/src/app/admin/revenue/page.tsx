'use client';

import React from 'react';

export default function RevenuePage() {
  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f5', marginBottom: 8 }}>
          Revenue
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>
          Track earnings, invoices, and financial metrics.
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
        <div style={{ fontSize: 64, marginBottom: 16 }}>💰</div>
        <h2 style={{ color: '#f5f5f5', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
          Revenue Tracking Coming Soon
        </h2>
        <p style={{ color: '#9ca3af', fontSize: 16, maxWidth: 500, margin: '0 auto', marginBottom: 24 }}>
          View total earnings, monthly revenue, client payments, and financial analytics all in one dashboard.
        </p>
        
        {/* Preview stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600, margin: '32px auto 0' }}>
          <div style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: 16 }}>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Total Revenue</div>
            <div style={{ color: '#A3E635', fontSize: 24, fontWeight: 700 }}>$0</div>
          </div>
          <div style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: 16 }}>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>This Month</div>
            <div style={{ color: '#A3E635', fontSize: 24, fontWeight: 700 }}>$0</div>
          </div>
          <div style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: 16 }}>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Avg Deal</div>
            <div style={{ color: '#A3E635', fontSize: 24, fontWeight: 700 }}>$0</div>
          </div>
        </div>
      </div>
    </main>
  );
}
