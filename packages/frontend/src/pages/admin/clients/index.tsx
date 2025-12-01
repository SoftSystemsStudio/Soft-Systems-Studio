import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';

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
    <Layout>
      <main style={{ padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>Clients</h1>

        {loading && <div>Loading clients…</div>}
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        {!loading && !error && clients.length === 0 && (
          <div>No clients yet. Once someone completes the intake, they will appear here.</div>
        )}

        {!loading && !error && clients.length > 0 && (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #e1e4e8',
            }}
          >
            <thead>
              <tr style={{ background: '#f6f8fa' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Client</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Website</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Summary</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, idx) => (
                <tr
                  key={c.id}
                  style={{
                    background: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                    borderTop: '1px solid #e1e4e8',
                  }}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 500 }}>
                      <Link href={`/admin/clients/${c.id}`}>{c.companyName}</Link>
                    </div>
                    <div style={{ fontSize: 12, color: '#6a737d' }}>{c.id}</div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noreferrer">
                        {c.website}
                      </a>
                    ) : (
                      <span style={{ color: '#6a737d' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 14, color: '#24292e' }}>
                    {buildSummary(c)}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 14 }}>
                    {formatCreated(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </Layout>
  );
}
