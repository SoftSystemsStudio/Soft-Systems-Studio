import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';

type ClientConfig = Record<string, any>;

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [solutionBrief, setSolutionBrief] = useState<string | null>(null);
  const [phase1Proposal, setPhase1Proposal] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeDraftTab, setActiveDraftTab] = useState<'brief' | 'phase1'>('brief');

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

  async function genBrief(force = false) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}/solution-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(force ? { force: true } : {}),
      });
      const data = await res.json();
      const content = data?.draft ?? JSON.stringify(data, null, 2);
      setSolutionBrief(String(content));
      const ts = data?.saved?.updatedAt ?? data?.saved?.createdAt ?? null;
      setLastSaved(ts ?? null);
      setActiveDraftTab('brief');
    } catch (e) {
      console.error(e);
      setSolutionBrief('Error generating brief');
    } finally {
      setLoading(false);
    }
  }

  async function genProposal(phase = 1, force = false) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ phase }, force ? { force: true } : {})),
      });
      const data = await res.json();
      const content = data?.draft ?? JSON.stringify(data, null, 2);
      if (Number(phase) === 1) {
        setPhase1Proposal(String(content));
        setActiveDraftTab('phase1');
      }
      const ts = data?.saved?.updatedAt ?? data?.saved?.createdAt ?? null;
      setLastSaved(ts ?? null);
    } catch (e) {
      console.error(e);
      if (Number(phase) === 1) setPhase1Proposal('Error generating proposal');
    } finally {
      setLoading(false);
    }
  }

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map((v) => renderValue(v)).join(', ');
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  return (
    <Layout>
      <main style={{ padding: 24 }}>
        <h1>Client {id}</h1>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section>
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
                            <a
                              href={String(config.profile.website)}
                              target="_blank"
                              rel="noreferrer"
                            >
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

                  <details style={{ background: '#f6f8fa', padding: 12, borderRadius: 8 }}>
                    <summary style={{ cursor: 'pointer' }}>Raw config (debug)</summary>
                    <div
                      style={{
                        marginTop: 8,
                        border: '1px solid #e1e4e8',
                        borderRadius: 8,
                        padding: 12,
                        background: '#ffffff',
                        maxHeight: 320,
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontSize: 13,
                        lineHeight: 1.4,
                        fontFamily: 'monospace',
                      }}
                    >
                      {JSON.stringify(config, null, 2)}
                    </div>
                  </details>
                </div>
              )}
            </section>

            {/* Systems section remains as-is but placed in left column */}
            <section>
              <h3>Systems</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {(Array.isArray(config?.subsystems) ? config!.subsystems : []).map((s: any) => (
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
            </section>
          </div>

          {/* Right column: Drafts panel */}
          <aside style={{ width: 420 }}>
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: 12,
                boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2 style={{ margin: 0, fontSize: 16 }}>Drafts</h2>
                <div role="tablist" aria-label="Draft types" style={{ display: 'flex', gap: 8 }}>
                  <button
                    id="draft-tab-brief"
                    role="tab"
                    aria-selected={activeDraftTab === 'brief'}
                    aria-controls="draft-panel"
                    onClick={() => setActiveDraftTab('brief')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border:
                        activeDraftTab === 'brief' ? '1px solid #4f46e5' : '1px solid #e5e7eb',
                      background: activeDraftTab === 'brief' ? '#eef2ff' : '#fff',
                    }}
                  >
                    Solution brief
                  </button>
                  <button
                    id="draft-tab-phase1"
                    role="tab"
                    aria-selected={activeDraftTab === 'phase1'}
                    aria-controls="draft-panel"
                    onClick={() => setActiveDraftTab('phase1')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border:
                        activeDraftTab === 'phase1' ? '1px solid #4f46e5' : '1px solid #e5e7eb',
                      background: activeDraftTab === 'phase1' ? '#eef2ff' : '#fff',
                    }}
                  >
                    Phase 1 proposal
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div
                  role="tabpanel"
                  id="draft-panel"
                  aria-labelledby={
                    activeDraftTab === 'brief' ? 'draft-tab-brief' : 'draft-tab-phase1'
                  }
                  style={{
                    border: '1px solid #e1e4e8',
                    borderRadius: 8,
                    padding: 12,
                    background: '#ffffff',
                    maxHeight: 360,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  {activeDraftTab === 'brief'
                    ? (solutionBrief ?? 'No solution brief yet. Generate one to see it here.')
                    : (phase1Proposal ?? 'No phase 1 proposal yet. Generate one to see it here.')}
                </div>

                {lastSaved && (
                  <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
                    Last saved: {lastSaved}
                  </div>
                )}

                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button onClick={() => genBrief(false)} disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Working...' : 'Generate Solution Brief'}
                  </button>
                  <button
                    onClick={() => genProposal(1, false)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Working...' : 'Generate Phase 1 Proposal'}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
