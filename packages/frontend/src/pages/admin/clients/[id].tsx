import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/clients/${id}/config`)
      .then((r) => r.json())
      .then((d) => setConfig(d.config))
      .catch(() => setConfig(null));
  }, [id]);

  async function genBrief() {
    if (!id) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch(`/clients/${id}/solution-brief`, { method: 'POST' });
      const data = await res.json();
      setOutput(data.draft ?? JSON.stringify(data));
    } catch (e) {
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
      const res = await fetch(`/clients/${id}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase }),
      });
      const data = await res.json();
      setOutput(data.draft ?? JSON.stringify(data));
    } catch (e) {
      setOutput('Error generating proposal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <main style={{ padding: 24 }}>
        <h1>Client {id}</h1>
        <div style={{ display: 'flex', gap: 24 }}>
          <section style={{ flex: 1 }}>
            <h2>Config</h2>
            <pre style={{ background: '#f6f8fa', padding: 12 }}>{config ? JSON.stringify(config, null, 2) : 'Loading...'}</pre>
          </section>
          <aside style={{ width: 420 }}>
            <h2>Actions</h2>
            <button onClick={genBrief} disabled={loading} style={{ display: 'block', marginBottom: 8 }}>
              {loading ? 'Working...' : 'Generate Solution Brief'}
            </button>
            <button onClick={() => genProposal(1)} disabled={loading} style={{ display: 'block', marginBottom: 8 }}>
              Generate Proposal (Phase 1)
            </button>
            <button onClick={() => genProposal(2)} disabled={loading} style={{ display: 'block', marginBottom: 8 }}>
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
