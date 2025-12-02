import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';

type ClientConfig = Record<string, any>;

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Load the normalized config from the API. The API returns { config: {...} }.
    fetch(`/api/clients/${id}/config`)
      .then((res) => res.json())
      .then((data) => {
        // store only the inner config object
        setConfig(data?.config ?? null);
      })
      .catch((err) => {
        console.error('Failed to load client config', err);
        setConfig(null);
      });
  }, [id]);

  async function genBrief() {
    if (!id) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch(`/api/clients/${id}/solution-brief`, { method: 'POST' });
      const data = await res.json();
      setOutput(data.draft ?? JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(e);
      setOutput('Error generating brief');
    } finally {
      setLoading(false);
    }
  }

  async function genProposal(phase = 1) {
    if (!id) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch(`/api/clients/${id}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase }),
      });
      const data = await res.json();
      setOutput(data.draft ?? JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(e);
      setOutput('Error generating proposal');
    } finally {
      setLoading(false);
    }
  }

  const renderValue = (v: unknown) => {
    if (v == null) return '-';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  return (
    <Layout>
      <main style={{ padding: 24 }}>
        <h1>Client {id}</h1>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <section style={{ flex: 1 }}>
            <h2>Client overview</h2>

            {!config && <div>Loading…</div>}

            {config && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
                  }}
                >
                  <h3 style={{ margin: 0 }}>Profile</h3>
                  <div style={{ marginTop: 8, color: '#374151', display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Company</div>
                      <div style={{ fontWeight: 600 }}>{config.profile?.companyName ?? '—'}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Website</div>
                      <div>
                        {config.profile?.website ? (
                          <a href={String(config.profile.website)} target="_blank" rel="noreferrer">
                            {config.profile.website}
                          </a>
                        ) : (
                          <span style={{ color: '#6b7280' }}>—</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Industry</div>
                      <div>{config.profile?.industry ?? '-'}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Size</div>
                      <div>{config.profile?.size ?? '-'}</div>
                    </div>

                    {config.contact && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ color: '#6b7280', marginBottom: 6 }}>Primary contact</div>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ minWidth: 120, color: '#6b7280' }}>Name</div>
                            <div>{config.contact.name ?? '-'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ minWidth: 120, color: '#6b7280' }}>Email</div>
                            <div>{config.contact.email ?? '-'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ minWidth: 120, color: '#6b7280' }}>Phone</div>
                            <div>{config.contact.phone ?? '-'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3>Systems</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {(Array.isArray(config.subsystems) ? config.subsystems : []).map((s: any) => (
                      <div
                        key={s.id ?? s.type}
                        style={{
                          background: '#fff',
                          borderRadius: 8,
                          padding: 12,
                          boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{s.type}</strong>
                            <div style={{ color: '#6b7280', fontSize: 13 }}>{s.description}</div>
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 13 }}>{s.id}</div>
                        </div>

                        {s.settings && (
                          <div style={{ marginTop: 8 }}>
                            {Object.entries(s.settings).map(([k, v]) => (
                              <div
                                key={k}
                                style={{
                                  display: 'flex',
                                  gap: 8,
                                  alignItems: 'center',
                                  marginTop: 6,
                                }}
                              >
                                <div style={{ color: '#6b7280', minWidth: 140 }}>{k}</div>
                                <div style={{ fontFamily: 'monospace', color: '#111' }}>
                                  {renderValue(v)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <details style={{ background: '#f6f8fa', padding: 12, borderRadius: 8 }}>
                  <summary style={{ cursor: 'pointer' }}>Raw config (debug)</summary>
                  <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </section>

          <aside style={{ width: 420 }}>
            <h2>Actions</h2>
            <button
              onClick={genBrief}
              disabled={loading}
              style={{ display: 'block', marginBottom: 8 }}
            >
              {loading ? 'Working...' : 'Generate Solution Brief'}
            </button>
            <button
              onClick={() => genProposal(1)}
              disabled={loading}
              style={{ display: 'block', marginBottom: 8 }}
            >
              Generate Proposal (Phase 1)
            </button>
            <button
              onClick={() => genProposal(2)}
              disabled={loading}
              style={{ display: 'block', marginBottom: 8 }}
            >
              Generate Proposal (Phase 2)
            </button>
            <div style={{ marginTop: 12 }}>
              <h3>Output</h3>
              <pre style={{ background: '#fff', padding: 12 }}>{output ?? 'No output yet.'}</pre>
            </div>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
