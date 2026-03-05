'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Subsystem {
  id?: string;
  type: string;
  priority?: string;
  notes?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

interface Profile {
  companyName?: string;
  website?: string;
  industry?: string;
  size?: string;
}

interface Contact {
  name?: string;
  email?: string;
  phone?: string;
}

interface ClientConfig {
  profile?: Profile;
  contact?: Contact;
  subsystems?: Subsystem[];
  [key: string]: unknown;
}

/** API response types */
interface BriefApiResponse {
  draft?: string;
  saved?: {
    updatedAt?: string;
    createdAt?: string;
  };
}

interface ProposalApiResponse {
  draft?: string;
  saved?: {
    updatedAt?: string;
    createdAt?: string;
  };
}

interface ConfigApiResponse {
  config?: ClientConfig;
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];

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
      .then((res) => res.json() as Promise<ConfigApiResponse>)
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
      const data = (await res.json()) as BriefApiResponse;
      const content = data?.draft ?? JSON.stringify(data, null, 2);
      setSolutionBrief(String(content));
      const ts = data?.saved?.updatedAt ?? data?.saved?.createdAt ?? null;
      setLastSaved(ts);
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
      const data = (await res.json()) as ProposalApiResponse;
      const content = data?.draft ?? JSON.stringify(data, null, 2);
      if (Number(phase) === 1) {
        setPhase1Proposal(String(content));
        setActiveDraftTab('phase1');
      }
      const ts = data?.saved?.updatedAt ?? data?.saved?.createdAt ?? null;
      setLastSaved(ts);
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
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f5', marginBottom: 8 }}>
          Client Details
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, fontFamily: 'monospace' }}>{id}</p>
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section>
            <h2>Client overview</h2>

            {!config && <div>Loading…</div>}

            {config && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                    border: '1px solid #2a2a2a',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <h3 style={{ margin: 0, color: '#A3E635', fontSize: 18, fontWeight: 600 }}>Profile</h3>
                  <div style={{ marginTop: 16, color: '#9ca3af', display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Company</div>
                      <div style={{ fontWeight: 600, color: '#f5f5f5' }}>{config.profile?.companyName ?? '—'}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Website</div>
                      <div>
                        {config.profile?.website ? (
                          <a href={String(config.profile.website)} target="_blank" rel="noreferrer" style={{ color: '#A3E635', textDecoration: 'none' }}>
                            {config.profile.website}
                          </a>
                        ) : (
                          <span style={{ color: '#6b7280' }}>—</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Industry</div>
                      <div style={{ color: '#f5f5f5' }}>{config.profile?.industry ?? '-'}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#6b7280', minWidth: 120 }}>Size</div>
                      <div style={{ color: '#f5f5f5' }}>{config.profile?.size ?? '-'}</div>
                    </div>

                    {config.contact && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a2a' }}>
                        <div style={{ color: '#6b7280', marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary contact</div>
                        <div style={{ display: 'grid', gap: 6 }}>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ minWidth: 120, color: '#6b7280' }}>Name</div>
                            <div style={{ color: '#f5f5f5' }}>{config.contact.name ?? '-'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ minWidth: 120, color: '#6b7280' }}>Email</div>
                            <div style={{ color: '#A3E635' }}>{config.contact.email ?? '-'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ minWidth: 120, color: '#6b7280' }}>Phone</div>
                            <div style={{ color: '#f5f5f5' }}>{config.contact.phone ?? '-'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <details style={{ background: 'rgba(163, 230, 53, 0.05)', padding: 16, borderRadius: 12, border: '1px solid #2a2a2a' }}>
                  <summary style={{ cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>Raw config (debug)</summary>
                  <div
                    style={{
                      marginTop: 12,
                      border: '1px solid #2a2a2a',
                      borderRadius: 8,
                      padding: 12,
                      background: '#0a0a0a',
                      maxHeight: 320,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontSize: 13,
                      lineHeight: 1.4,
                      fontFamily: 'monospace',
                      color: '#A3E635',
                    }}
                  >
                    {JSON.stringify(config, null, 2)}
                  </div>
                </details>
              </div>
            )}
          </section>

          {/* Systems section */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f5', marginBottom: 16 }}>Systems</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {(Array.isArray(config?.subsystems) ? config.subsystems : []).map((s: Subsystem) => (
                <div
                  key={s.id ?? s.type}
                  style={{
                    background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                    border: '1px solid #2a2a2a',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: '#A3E635', fontSize: 16 }}>{s.type}</strong>
                      <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>{s.description}</div>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{s.id}</div>
                  </div>

                  {s.settings && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a2a' }}>
                      {Object.entries(s.settings).map(([k, v]) => (
                        <div
                          key={k}
                          style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            marginTop: 8,
                          }}
                        >
                          <div style={{ color: '#6b7280', minWidth: 140, fontSize: 13 }}>{k}</div>
                          <div style={{ fontFamily: 'monospace', color: '#f5f5f5', fontSize: 13 }}>
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
              background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#A3E635' }}>Drafts</h2>
            </div>

            <div role="tablist" aria-label="Draft types" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                id="draft-tab-brief"
                role="tab"
                aria-selected={activeDraftTab === 'brief'}
                aria-controls="draft-panel"
                onClick={() => setActiveDraftTab('brief')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: activeDraftTab === 'brief' ? '1px solid #A3E635' : '1px solid #2a2a2a',
                  background: activeDraftTab === 'brief' ? 'rgba(163, 230, 53, 0.1)' : 'transparent',
                  color: activeDraftTab === 'brief' ? '#A3E635' : '#9ca3af',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Solution Brief
              </button>
              <button
                id="draft-tab-phase1"
                role="tab"
                aria-selected={activeDraftTab === 'phase1'}
                aria-controls="draft-panel"
                onClick={() => setActiveDraftTab('phase1')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: activeDraftTab === 'phase1' ? '1px solid #A3E635' : '1px solid #2a2a2a',
                  background: activeDraftTab === 'phase1' ? 'rgba(163, 230, 53, 0.1)' : 'transparent',
                  color: activeDraftTab === 'phase1' ? '#A3E635' : '#9ca3af',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Phase 1
              </button>
            </div>

            <div
              role="tabpanel"
              id="draft-panel"
              aria-labelledby={
                activeDraftTab === 'brief' ? 'draft-tab-brief' : 'draft-tab-phase1'
              }
              style={{
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                padding: 16,
                background: '#0a0a0a',
                maxHeight: 400,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#9ca3af',
                marginBottom: 12,
              }}
            >
              {activeDraftTab === 'brief'
                ? (solutionBrief ?? 'No solution brief yet. Generate one to see it here.')
                : (phase1Proposal ?? 'No phase 1 proposal yet. Generate one to see it here.')}
            </div>

            {lastSaved && (
              <div style={{ marginBottom: 12, color: '#6b7280', fontSize: 12 }}>
                Last saved: {lastSaved}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                onClick={() => void genBrief(false)} 
                disabled={loading} 
                style={{ 
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #A3E635',
                  background: loading ? '#2a2a2a' : 'rgba(163, 230, 53, 0.1)',
                  color: loading ? '#6b7280' : '#A3E635',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? '⏳ Working...' : '📄 Generate Solution Brief'}
              </button>
              <button
                onClick={() => void genProposal(1, false)}
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #A3E635',
                  background: loading ? '#2a2a2a' : 'rgba(163, 230, 53, 0.1)',
                  color: loading ? '#6b7280' : '#A3E635',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? '⏳ Working...' : '📋 Generate Phase 1 Proposal'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
