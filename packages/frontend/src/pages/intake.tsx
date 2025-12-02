import React, { useState } from 'react';
import Layout from '../components/Layout';

type Objective =
  | 'reduce_support_volume'
  | 'increase_leads'
  | 'automate_workflows'
  | 'increase_content_output'
  | 'improve_reporting';

type SystemInterest = 'ai_support' | 'ai_content' | 'ai_data_bi' | 'ai_workflow' | 'ai_voice';

type SupportChannel = 'email' | 'web_chat' | 'social_dm' | 'phone' | 'sms';

type FormState = {
  companyName: string;
  website: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  primaryObjectives: Objective[];
  systems: SystemInterest[];
  supportChannels: SupportChannel[];
  dailyInquiries: string;
  mainPainPoints: string;
  notes: string;
};

type FormField = keyof FormState;

const initialForm: FormState = {
  companyName: '',
  website: '',
  industry: '',
  size: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  primaryObjectives: [],
  systems: [],
  supportChannels: [],
  dailyInquiries: '',
  mainPainPoints: '',
  notes: '',
};

export default function IntakePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends FormField>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  }

  const toggleObjective = (objective: Objective) => {
    setForm((prev) => ({
      ...prev,
      primaryObjectives: prev.primaryObjectives.includes(objective)
        ? prev.primaryObjectives.filter((o) => o !== objective)
        : [...prev.primaryObjectives, objective],
    }));
  };

  const toggleSystemInterest = (system: SystemInterest) => {
    setForm((prev) => ({
      ...prev,
      systems: prev.systems.includes(system)
        ? prev.systems.filter((s) => s !== system)
        : [...prev.systems, system],
    }));
  };

  const toggleSupportChannel = (channel: SupportChannel) => {
    setForm((prev) => ({
      ...prev,
      supportChannels: prev.supportChannels.includes(channel)
        ? prev.supportChannels.filter((c) => c !== channel)
        : [...prev.supportChannels, channel],
    }));
  };

  function validateStep(currentStep: number) {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.companyName.trim()) {
        nextErrors.companyName = 'Company name is required';
      }
      if (form.website) {
        try {
          // basic URL validation
          // eslint-disable-next-line no-new
          new URL(form.website);
        } catch {
          nextErrors.website = 'Website must be a valid URL (include https://)';
        }
      }
    }

    if (currentStep === 2) {
      if (!form.contactName.trim()) {
        nextErrors.contactName = 'Contact name is required';
      }
      if (!form.contactEmail.trim()) {
        nextErrors.contactEmail = 'Contact email is required';
      } else {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail);
        if (!emailOk) {
          nextErrors.contactEmail = 'Enter a valid email address';
        }
      }
    }

    if (currentStep === 3) {
      if (!form.primaryObjectives.length) {
        nextErrors.primaryObjectives = 'Select at least one primary objective';
      }
      if (!form.systems.length) {
        nextErrors.systems = 'Select at least one system you care about';
      }
    }

    if (currentStep === 4) {
      if (form.dailyInquiries && Number.isNaN(Number(form.dailyInquiries))) {
        nextErrors.dailyInquiries = 'Enter a number (approximate is fine)';
      }
      if (!form.mainPainPoints.trim()) {
        nextErrors.mainPainPoints = 'Describe your main pain points';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit() {
    if (!validateStep(4)) {
      setMessage('Please fix errors before submitting.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('submit_failed');
      }

      setMessage(
        'Thanks — we’ll turn this into your AI Automation Blueprint and follow up with next steps.',
      );
      setForm(initialForm);
      setStep(1);
    } catch {
      setMessage('Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <main style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
        <h1>AI Automation Intake</h1>
        <p style={{ color: '#656565', marginBottom: 8 }}>
          A short intake so we can generate a tailored automation blueprint for your business.
        </p>
        <div style={{ fontSize: 13, color: '#656565', marginBottom: 24 }}>Step {step} of 4</div>

        {/* Step 1 – Company profile */}
        {step === 1 && (
          <section style={{ marginBottom: 24 }}>
            <h2>Company profile</h2>
            <div style={{ marginTop: 12 }}>
              <label>
                Company name
                <br />
                <input
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
              {errors.companyName && (
                <div style={{ color: 'red', fontSize: 13 }}>{errors.companyName}</div>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <label>
                Website
                <br />
                <input
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  placeholder="https://example.com"
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
              {errors.website && <div style={{ color: 'red', fontSize: 13 }}>{errors.website}</div>}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <label>
                  Industry
                  <br />
                  <input
                    value={form.industry}
                    onChange={(e) => update('industry', e.target.value)}
                    style={{ width: '100%', padding: 8 }}
                  />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label>
                  Company size
                  <br />
                  <input
                    value={form.size}
                    onChange={(e) => update('size', e.target.value)}
                    placeholder="e.g. 1-10, 11-50"
                    style={{ width: '100%', padding: 8 }}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                onClick={() => {
                  if (validateStep(1)) setStep(2);
                  else setMessage('Please fix errors on this step.');
                }}
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* Step 2 – Primary contact */}
        {step === 2 && (
          <section style={{ marginBottom: 24 }}>
            <h2>Primary contact</h2>
            <div style={{ marginTop: 12 }}>
              <label>
                Name
                <br />
                <input
                  value={form.contactName}
                  onChange={(e) => update('contactName', e.target.value)}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
              {errors.contactName && (
                <div style={{ color: 'red', fontSize: 13 }}>{errors.contactName}</div>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <label>
                Email
                <br />
                <input
                  value={form.contactEmail}
                  onChange={(e) => update('contactEmail', e.target.value)}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
              {errors.contactEmail && (
                <div style={{ color: 'red', fontSize: 13 }}>{errors.contactEmail}</div>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <label>
                Phone (optional)
                <br />
                <input
                  value={form.contactPhone}
                  onChange={(e) => update('contactPhone', e.target.value)}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setStep(1);
                }}
                style={{ marginRight: 8 }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep(2)) setStep(3);
                  else setMessage('Please fix errors on this step.');
                }}
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* Step 3 – Objectives and systems */}
        {step === 3 && (
          <section style={{ marginBottom: 24 }}>
            <h2>What are you trying to achieve?</h2>
            <p style={{ fontSize: 14, color: '#656565' }}>
              Pick the outcomes and systems that matter most. This drives how we design your
              automation blueprint.
            </p>

            <div style={{ marginTop: 16 }}>
              <h3>Primary objectives</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {[
                  { key: 'reduce_support_volume', label: 'Reduce support volume' },
                  { key: 'increase_leads', label: 'Increase qualified leads' },
                  { key: 'automate_workflows', label: 'Automate workflows' },
                  { key: 'increase_content_output', label: 'Increase content output' },
                  { key: 'improve_reporting', label: 'Improve reporting & insight' },
                ].map((obj) => (
                  <button
                    key={obj.key}
                    type="button"
                    onClick={() => toggleObjective(obj.key as Objective)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid #d5d5d5',
                      backgroundColor: form.primaryObjectives.includes(obj.key as Objective)
                        ? '#c0ff6b'
                        : '#ffffff',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>
              {errors.primaryObjectives && (
                <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                  {errors.primaryObjectives}
                </div>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <h3>Systems you’re interested in</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {[
                  { key: 'ai_support', label: 'AI Support System' },
                  { key: 'ai_content', label: 'AI Content System' },
                  { key: 'ai_data_bi', label: 'AI Data & BI' },
                  { key: 'ai_workflow', label: 'AI Workflow Automation' },
                  { key: 'ai_voice', label: 'AI Voice Reception' },
                ].map((sys) => (
                  <button
                    key={sys.key}
                    type="button"
                    onClick={() => toggleSystemInterest(sys.key as SystemInterest)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid #d5d5d5',
                      backgroundColor: form.systems.includes(sys.key as SystemInterest)
                        ? '#c0ff6b'
                        : '#ffffff',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {sys.label}
                  </button>
                ))}
              </div>
              {errors.systems && (
                <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>{errors.systems}</div>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setStep(2);
                }}
                style={{ marginRight: 8 }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep(3)) setStep(4);
                  else setMessage('Please fix errors on this step.');
                }}
              >
                Next
              </button>
            </div>
          </section>
        )}

        {/* Step 4 – Volume and pain points */}
        {step === 4 && (
          <section style={{ marginBottom: 24 }}>
            <h2>Volume and pain points</h2>

            <div style={{ marginTop: 12 }}>
              <h3>Support channels you care about</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {[
                  { key: 'email', label: 'Email' },
                  { key: 'web_chat', label: 'Web chat' },
                  { key: 'social_dm', label: 'Social DMs' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'sms', label: 'SMS' },
                ].map((ch) => (
                  <button
                    key={ch.key}
                    type="button"
                    onClick={() => toggleSupportChannel(ch.key as SupportChannel)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid #d5d5d5',
                      backgroundColor: form.supportChannels.includes(ch.key as SupportChannel)
                        ? '#c0ff6b'
                        : '#ffffff',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label>
                Approx. daily inquiries (across channels)
                <br />
                <input
                  value={form.dailyInquiries}
                  onChange={(e) => update('dailyInquiries', e.target.value)}
                  placeholder="e.g. 10"
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
              {errors.dailyInquiries && (
                <div style={{ color: 'red', fontSize: 13 }}>{errors.dailyInquiries}</div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <label>
                What’s painful today?
                <br />
                <textarea
                  value={form.mainPainPoints}
                  onChange={(e) => update('mainPainPoints', e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
              {errors.mainPainPoints && (
                <div style={{ color: 'red', fontSize: 13 }}>{errors.mainPainPoints}</div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <label>
                Anything else we should know? (optional)
                <br />
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: 8 }}
                />
              </label>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setStep(3);
                }}
                style={{ marginRight: 8 }}
              >
                Back
              </button>
              <button type="button" onClick={submit} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </section>
        )}

        {message && <div style={{ marginTop: 16 }}>{message}</div>}
      </main>
    </Layout>
  );
}
