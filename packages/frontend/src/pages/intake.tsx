import React, { useState } from 'react';
import Layout from '../components/Layout';

type Objective =
  | 'reduce_support_volume'
  | 'increase_leads'
  | 'increase_content_output'
  | 'improve_reporting'
  | 'automate_workflows'
  | 'reduce_missed_calls';

type SystemInterest = 'support' | 'content' | 'data_bi' | 'workflow' | 'voice';

type SupportChannel = 'email' | 'web_chat' | 'phone' | 'whatsapp' | 'sms' | 'social_dm';

type FormState = {
  // Step 1 – Company & Objectives
  companyName: string;
  website: string;
  industry: string;
  size: string;
  primaryObjectives: Objective[];
  systems: SystemInterest[];

  // Step 2 – Tech stack
  websitePlatform: string;
  crm: string;
  helpdesk: string;
  telephony: string;
  calendar: string;

  // Step 3 – Support & operations snapshot
  dailyInquiries: string;
  supportChannels: SupportChannel[];
  mainPainPoints: string;

  // Step 4 – Contact & notes
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

const INITIAL_FORM: FormState = {
  companyName: '',
  website: '',
  industry: '',
  size: '',
  primaryObjectives: [],
  systems: ['support', 'workflow'], // default Phase 1 focus

  websitePlatform: '',
  crm: '',
  helpdesk: '',
  telephony: '',
  calendar: '',

  dailyInquiries: '',
  supportChannels: [],
  mainPainPoints: '',

  contactName: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
};

export default function IntakePage() {
  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  }

  const toggleObjective = (value: Objective) => {
    setForm((prev) => {
      const exists = prev.primaryObjectives.includes(value);
      return {
        ...prev,
        primaryObjectives: exists
          ? prev.primaryObjectives.filter((v) => v !== value)
          : [...prev.primaryObjectives, value],
      };
    });
  };

  const toggleSystemInterest = (value: SystemInterest) => {
    setForm((prev) => {
      const exists = prev.systems.includes(value);
      return {
        ...prev,
        systems: exists ? prev.systems.filter((v) => v !== value) : [...prev.systems, value],
      };
    });
  };

  const toggleSupportChannel = (value: SupportChannel) => {
    setForm((prev) => {
      const exists = prev.supportChannels.includes(value);
      return {
        ...prev,
        supportChannels: exists
          ? prev.supportChannels.filter((v) => v !== value)
          : [...prev.supportChannels, value],
      };
    });
  };

  function validateStep(currentStep: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.companyName.trim()) {
        nextErrors.companyName = 'Company name is required.';
      }
      if (form.website) {
        try {
          // Basic URL validation
          // eslint-disable-next-line no-new
          new URL(form.website.trim());
        } catch {
          nextErrors.website = 'Website must be a valid URL (include https://).';
        }
      }
      if (form.primaryObjectives.length === 0) {
        nextErrors.primaryObjectives = 'Select at least one primary objective.';
      }
    }

    if (currentStep === 2) {
      // Optional: enforce some stack fields here if you want
    }

    if (currentStep === 3) {
      if (form.dailyInquiries && Number.isNaN(Number(form.dailyInquiries))) {
        nextErrors.dailyInquiries = 'Enter a numeric estimate.';
      }
      if (!form.mainPainPoints.trim()) {
        nextErrors.mainPainPoints = 'Provide a short description of your current challenges.';
      }
    }

    if (currentStep === 4) {
      if (!form.contactName.trim()) {
        nextErrors.contactName = 'Primary contact name is required.';
      }
      if (!form.contactEmail.trim()) {
        nextErrors.contactEmail = 'Contact email is required.';
      } else {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail);
        if (!emailOk) {
          nextErrors.contactEmail = 'Enter a valid email address.';
        }
      }
      if (form.notes.trim().length < 10) {
        nextErrors.notes =
          'Please share at least a short description of what you want to achieve (10+ characters).';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit() {
    if (!validateStep(4)) {
      setMessage('Please fix the errors on this step before submitting.');
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

      setMessage("Thanks — we'll generate your AI Automation Blueprint.");
      setForm(INITIAL_FORM);
      setStep(1);
    } catch {
      setMessage('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const progressPercent = (step / totalSteps) * 100;

  return (
    <Layout>
      <main
        style={{
          padding: 32,
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>AI Automation Assessment</h1>
          <p style={{ color: '#555', maxWidth: 720 }}>
            Share a brief overview of your organisation and priorities — this helps us design a
            practical Phase 1 focused on Support and Workflow automation, and identify high-impact
            opportunities across Content, Data &amp; BI, and Voice.
          </p>
        </header>

        <div
          style={{
            marginBottom: 24,
            height: 8,
            background: '#eee',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #6366f1 100%)',
              transition: 'width 0.2s ease-out',
            }}
          />
        </div>

        <section
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>
              Step {step} of {totalSteps}
            </h2>
            <span style={{ color: '#64748b' }}>
              {step === 1 && 'Company Information & Goals'}
              {step === 2 && 'Technology & Integrations'}
              {step === 3 && 'Support Operations Snapshot'}
              {step === 4 && 'Primary Contact & Final Notes'}
            </span>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  Company / Organization name *
                </label>
                <input
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                  }}
                />
                {errors.companyName && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.companyName}</div>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>Website (public URL)</label>
                  <input
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                    }}
                  />
                  {errors.website && (
                    <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.website}</div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>Industry / sector</label>
                  <input
                    value={form.industry}
                    onChange={(e) => update('industry', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>Approx. team size</label>
                  <select
                    value={form.size}
                    onChange={(e) => update('size', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <option value="">Select…</option>
                    <option value="1-10">1–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51-200">51–200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  Primary objectives * (choose the top outcomes you want to achieve)
                </label>
                <select
                  multiple
                  value={form.primaryObjectives}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions).map((o) => o.value as Objective);
                    update('primaryObjectives', opts as FormState['primaryObjectives']);
                  }}
                  size={6}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                    backgroundColor: '#fff',
                    minHeight: 160,
                  }}
                >
                  <option value="reduce_support_volume">Reduce support volume/cost</option>
                  <option value="increase_leads">Increase inbound leads &amp; calls</option>
                  <option value="increase_content_output">Increase content output</option>
                  <option value="improve_reporting">Improve reporting/insights</option>
                  <option value="automate_workflows">Automate manual workflows</option>
                  <option value="reduce_missed_calls">Reduce missed calls</option>
                </select>
                {errors.primaryObjectives && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.primaryObjectives}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  Systems of interest (Phase 1 typically focuses on Support + Workflow)
                </label>
                <select
                  multiple
                  value={form.systems}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions).map((o) => o.value as SystemInterest);
                    update('systems', opts as FormState['systems']);
                  }}
                  size={5}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                    backgroundColor: '#fff',
                    minHeight: 120,
                  }}
                >
                  <option value="support">AI Support System</option>
                  <option value="content">AI Content System</option>
                  <option value="data_bi">AI Data &amp; BI System</option>
                  <option value="workflow">AI Workflow System</option>
                  <option value="voice">AI Voice Reception System</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  Website / storefront platform
                </label>
                <select
                  value={form.websitePlatform}
                  onChange={(e) => update('websitePlatform', e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <option value="">Select…</option>
                  <option value="shopify">Shopify</option>
                  <option value="wordpress">WordPress</option>
                  <option value="webflow">Webflow</option>
                  <option value="custom">Custom</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>CRM</label>
                  <select
                    value={form.crm}
                    onChange={(e) => update('crm', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <option value="">None / Not sure</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="gohighlevel">GoHighLevel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>Helpdesk</label>
                  <select
                    value={form.helpdesk}
                    onChange={(e) => update('helpdesk', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <option value="">None / Email only</option>
                    <option value="zendesk">Zendesk</option>
                    <option value="intercom">Intercom</option>
                    <option value="freshdesk">Freshdesk</option>
                    <option value="helpscout">Help Scout</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>Telephony</label>
                  <select
                    value={form.telephony}
                    onChange={(e) => update('telephony', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <option value="">Just a phone number</option>
                    <option value="twilio">Twilio</option>
                    <option value="ringcentral">RingCentral</option>
                    <option value="aircall">Aircall</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>Booking / Calendar</label>
                  <select
                    value={form.calendar}
                    onChange={(e) => update('calendar', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <option value="">None / Not sure</option>
                    <option value="google_calendar">Google Calendar</option>
                    <option value="outlook">Outlook</option>
                    <option value="calendly">Calendly</option>
                    <option value="acuity">Acuity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  Typical inquiries per day (approx.)
                </label>
                <input
                  value={form.dailyInquiries}
                  onChange={(e) => update('dailyInquiries', e.target.value)}
                  placeholder="e.g., 10"
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                  }}
                />
                {errors.dailyInquiries && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.dailyInquiries}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  Current customer support channels (where customers contact you today)
                </label>
                <select
                  multiple
                  value={form.supportChannels}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions).map((o) => o.value as SupportChannel);
                    update('supportChannels', opts as FormState['supportChannels']);
                  }}
                  size={6}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                    backgroundColor: '#fff',
                    minHeight: 160,
                  }}
                >
                  <option value="email">Email</option>
                  <option value="web_chat">Website chat</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="social_dm">Social DMs</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  What are the main challenges you currently face? *
                </label>
                <textarea
                  value={form.mainPainPoints}
                  onChange={(e) => update('mainPainPoints', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                    resize: 'vertical',
                  }}
                />
                {errors.mainPainPoints && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.mainPainPoints}</div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr',
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>
                    Primary contact (name) *
                  </label>
                  <input
                    value={form.contactName}
                    onChange={(e) => update('contactName', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                    }}
                  />
                  {errors.contactName && (
                    <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.contactName}</div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>Contact email *</label>
                  <input
                    value={form.contactEmail}
                    onChange={(e) => update('contactEmail', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                    }}
                  />
                  {errors.contactEmail && (
                    <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.contactEmail}</div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500 }}>
                    Contact phone (optional)
                  </label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => update('contactPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5f5',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500 }}>
                  Additional context or goals (brief) *
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                    resize: 'vertical',
                  }}
                />
                {errors.notes && (
                  <div style={{ color: '#b91c1c', marginTop: 4 }}>{errors.notes}</div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              disabled={step === 1}
              onClick={() => {
                setMessage(null);
                setStep((prev) => Math.max(1, prev - 1));
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: '1px solid #cbd5f5',
                backgroundColor: '#f9fafb',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Back
            </button>

            {step < totalSteps && (
              <button
                type="button"
                onClick={() => {
                  if (validateStep(step)) {
                    setMessage(null);
                    setStep((prev) => prev + 1);
                  } else {
                    setMessage('Please fix the errors on this step.');
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #6366f1 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Next
              </button>
            )}

            {step === totalSteps && (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)',
                  color: '#fff',
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Submitting…' : 'Submit intake'}
              </button>
            )}
          </div>
        </section>

        {message && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
            }}
          >
            {message}
          </div>
        )}
      </main>
    </Layout>
  );
}
