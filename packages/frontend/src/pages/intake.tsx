import React, { useState } from 'react';

export default function IntakePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update(field: string, value: any) {
    setForm((f: any) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('submit_failed');
      setMessage("Thanks — we'll generate your AI Automation Blueprint.");
      setForm({});
      setStep(1);
    } catch (e) {
      setMessage('Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Intake Form</h1>
      <div style={{ marginBottom: 12 }}>Step {step} of 3</div>

      {step === 1 && (
        <section>
          <label>
            Company name
            <br />
            <input
              value={form.companyName || ''}
              onChange={(e) => update('companyName', e.target.value)}
            />
          </label>
          <br />
          <label>
            Website
            <br />
            <input value={form.website || ''} onChange={(e) => update('website', e.target.value)} />
          </label>
          <br />
          <button onClick={() => setStep(2)}>Next</button>
        </section>
      )}

      {step === 2 && (
        <section>
          <label>
            Primary contact name
            <br />
            <input
              value={form.contactName || ''}
              onChange={(e) => update('contactName', e.target.value)}
            />
          </label>
          <br />
          <label>
            Contact email
            <br />
            <input
              value={form.contactEmail || ''}
              onChange={(e) => update('contactEmail', e.target.value)}
            />
          </label>
          <br />
          <button onClick={() => setStep(1)}>Back</button>{' '}
          <button onClick={() => setStep(3)}>Next</button>
        </section>
      )}

      {step === 3 && (
        <section>
          <label>
            Short description of needs
            <br />
            <textarea value={form.needs || ''} onChange={(e) => update('needs', e.target.value)} />
          </label>
          <br />
          <button onClick={() => setStep(2)}>Back</button>{' '}
          <button onClick={submit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </section>
      )}

      {message && <div style={{ marginTop: 16 }}>{message}</div>}
    </main>
  );
}
