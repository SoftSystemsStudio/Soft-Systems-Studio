import React, { useState } from 'react';
import Layout from '../components/Layout';

type FormShape = {
  companyName?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  needs?: string;
};

export default function IntakePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormShape>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validateStep(currentStep: number) {
    const nextErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.companyName || String(form.companyName).trim() === '') nextErrors.companyName = 'Company name is required';
      if (form.website) {
        try {
          // Basic URL validation
          // eslint-disable-next-line no-new
          new URL(String(form.website));
        } catch {
          nextErrors.website = 'Website must be a valid URL (include https://)';
        }
      }
    }
    if (currentStep === 2) {
      if (!form.contactName || String(form.contactName).trim() === '') nextErrors.contactName = 'Contact name is required';
      if (!form.contactEmail || String(form.contactEmail).trim() === '') nextErrors.contactEmail = 'Contact email is required';
      else {
        const email = String(form.contactEmail);
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!ok) nextErrors.contactEmail = 'Enter a valid email address';
      }
    }
    if (currentStep === 3) {
      if (!form.needs || String(form.needs).trim().length < 10) nextErrors.needs = 'Please provide a short description (10+ characters)';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit() {
    if (!validateStep(3)) {
      setMessage('Please fix errors before submitting');
      return;
    }

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
    <Layout>
      <main style={{ padding: 24 }}>
        <h1>Intake Form</h1>
        <div style={{ marginBottom: 12 }}>Step {step} of 3</div>

        {step === 1 && (
          <section>
            <label>
              Company name
              <br />
              <input value={form.companyName || ''} onChange={(e) => update('companyName', e.target.value)} />
            </label>
            {errors.companyName && <div style={{ color: 'red' }}>{errors.companyName}</div>}
            <br />
            <label>
              Website
              <br />
              <input value={form.website || ''} onChange={(e) => update('website', e.target.value)} />
            </label>
            {errors.website && <div style={{ color: 'red' }}>{errors.website}</div>}
            <br />
            <button
              onClick={() => {
                if (validateStep(1)) setStep(2);
                else setMessage('Please fix errors on this step');
              }}
            >
              Next
            </button>
          </section>
        )}

        {step === 2 && (
          <section>
            <label>
              Primary contact name
              <br />
              <input value={form.contactName || ''} onChange={(e) => update('contactName', e.target.value)} />
            </label>
            {errors.contactName && <div style={{ color: 'red' }}>{errors.contactName}</div>}
            <br />
            <label>
              Contact email
              <br />
              <input value={form.contactEmail || ''} onChange={(e) => update('contactEmail', e.target.value)} />
            </label>
            {errors.contactEmail && <div style={{ color: 'red' }}>{errors.contactEmail}</div>}
            <br />
            <button
              onClick={() => {
                setMessage(null);
                setStep(1);
              }}
            >
              Back
            </button>{' '}
            <button
              onClick={() => {
                if (validateStep(2)) setStep(3);
                else setMessage('Please fix errors on this step');
              }}
            >
              Next
            </button>
          </section>
        )}

        {step === 3 && (
          <section>
            <label>
              Short description of needs
              <br />
              <textarea value={form.needs || ''} onChange={(e) => update('needs', e.target.value)} />
            </label>
            {errors.needs && <div style={{ color: 'red' }}>{errors.needs}</div>}
            <br />
            <button
              onClick={() => {
                setMessage(null);
                setStep(2);
              }}
            >
              Back
            </button>{' '}
            <button onClick={submit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </section>
        )}

        {message && <div style={{ marginTop: 16 }}>{message}</div>}
      </main>
    </Layout>
  );
}
