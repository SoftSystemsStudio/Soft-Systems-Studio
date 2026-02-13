'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type ClientListItem = {
  id: string;
  companyName: string;
  website?: string | null;
  industry?: string | null;
  createdAt?: string; // ISO string from API
};

function formatCreated(createdAt?: string) {
  if (!createdAt) return '-';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
}

function buildSummary(client: ClientListItem): string {
  const parts: string[] = [];

  if (client.industry) {
    parts.push(client.industry);
  }

  if (client.createdAt) {
    const d = new Date(client.createdAt);
    if (!Number.isNaN(d.getTime())) {
      const now = new Date();
      const ageMs = now.getTime() - d.getTime();
      const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
      if (days <= 7) {
        parts.push('New');
      } else if (days <= 90) {
        parts.push('Active');
      } else {
        parts.push('Legacy');
      }
    }
  }

  return parts.length > 0 ? parts.join(' · ') : 'No summary yet';
}

export default function ClientsListPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('/api/clients')
      .then((res) => {
        if (!res.ok) throw new Error('failed_to_load_clients');
        return res.json();
      })
      .then((data: ClientListItem[]) => {
        setClients(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load clients.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f5', marginBottom: 8 }}>
          Clients
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>
          Manage all your clients and their projects.
        </p>
      </div>

      {loading && <div style={{ color: '#9ca3af' }}>Loading clients…</div>}
      {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}

      {!loading && !error && clients.length === 0 && (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <div style={{ color: '#9ca3af', fontSize: 16 }}>
            No clients yet. Once someone completes the intake, they will appear here.
          </div>
        </div>
      )}

      {!loading && !error && clients.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ background: 'rgba(163, 230, 53, 0.05)', borderBottom: '1px solid #2a2a2a' }}>
                <th style={{ textAlign: 'left', padding: '16px 20px', color: '#A3E635', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', color: '#A3E635', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', color: '#A3E635', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', color: '#A3E635', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, idx) => (
                <tr
                  key={c.id}
                  style={{
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderTop: idx === 0 ? 'none' : '1px solid #2a2a2a',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(163, 230, 53, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)';
                  }}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <Link 
                      href={`/admin/clients/${c.id}`}
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: '#f5f5f5', marginBottom: 4 }}>
                        {c.companyName}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{c.id}</div>
                    </Link>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {c.website ? (
                      <a 
                        href={c.website} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          color: '#A3E635',
                          textDecoration: 'none',
                          fontSize: 14,
                        }}
                      >
                        {c.website}
                      </a>
                    ) : (
                      <span style={{ color: '#6b7280' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#9ca3af' }}>
                    {buildSummary(c)}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#9ca3af' }}>{formatCreated(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
