import React, { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Intake.module.css';

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
  dailyInquiries: '10',
  mainPainPoints: '',
  notes: '',
};

const steps = ['Company', 'Contact', 'Goals', 'Support & Pain'] as const;

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
        nextErrors.systems = 'Select at least one system you’re interested in';
      }
    }

    if (currentStep === 4) {
      if (form.dailyInquiries && Number.isNaN(Number(form.dailyInquiries))) {
        nextErrors.dailyInquiries = 'Enter a number (approximate is fine)';
      }
      if (!form.mainPainPoints.trim()) {
        nextErrors.mainPainPoints = 'Describe what’s painful today';
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

      if (!res.ok) throw new Error('submit_failed');

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

  const dailyInquiriesNumber = Number(form.dailyInquiries || '0');

  return (
    <Layout>
      <main className={styles.page}>
        {/* Hero framing */}
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>Soft Systems Studio • Intake</div>
            <h1 className={styles.heroTitle}>Your AI Automation Blueprint starts here.</h1>
            <p className={styles.heroSubtitle}>
              Answer a few focused questions and we’ll design a tailored AI playbook to reduce
              support volume, automate workflows, and unlock capacity in your business.
            </p>
            <p className={styles.heroFootnote}>
              Expect a concrete solution brief and phase-one proposal — not generic recommendations.
            </p>
          </div>
          <aside className={styles.heroAside}>
            <div className={styles.heroCard}>
              <h3>What you’ll get</h3>
              <ul>
                <li>AI Solution Brief aligned to your goals</li>
                <li>Phase 1 implementation proposal</li>
                <li>System architecture and suggested stack</li>
              </ul>
              <div className={styles.heroCardMeta}>
                Typical outcome: 30–70% reduction in repetitive work for support and ops teams.
              </div>
            </div>
          </aside>
        </header>

        {/* Stepper */}
        <section className={styles.stepperSection}>
          <div className={styles.stepper}>
            {steps.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === step;
              const isComplete = stepNumber < step;
              return (
                <div key={label} className={styles.stepperItem}>
                  <div
                    className={[
                      styles.stepCircle,
                      isActive ? styles.stepCircleActive : '',
                      isComplete ? styles.stepCircleComplete : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {stepNumber}
                  </div>
                  <div className={styles.stepLabel}>{label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form card */}
        <section className={styles.formCard}>
          {/* STEP 1 – COMPANY */}
          {step === 1 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Company profile</h2>
              <p className={styles.sectionSubtitle}>
                Help us understand who you are and the context we’re designing for.
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Company name
                  <input
                    className={styles.input}
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    placeholder="Soft Systems Studio LLC"
                  />
                </label>
                {errors.companyName && <div className={styles.errorText}>{errors.companyName}</div>}
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldCol}>
                  <label className={styles.fieldLabel}>
                    Website
                    <input
                      className={styles.input}
                      value={form.website}
                      onChange={(e) => update('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </label>
                  {errors.website && <div className={styles.errorText}>{errors.website}</div>}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldCol}>
                  <label className={styles.fieldLabel}>
                    Industry
                    <input
                      className={styles.input}
                      value={form.industry}
                      onChange={(e) => update('industry', e.target.value)}
                      placeholder="e.g. SaaS, agency, ecommerce"
                    />
                  </label>
                </div>
                <div className={styles.fieldCol}>
                  <label className={styles.fieldLabel}>
                    Company size
                    <input
                      className={styles.input}
                      value={form.size}
                      onChange={(e) => update('size', e.target.value)}
                      placeholder="e.g. 1–10, 11–50"
                    />
                  </label>
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => {
                    if (validateStep(1)) setStep(2);
                    else setMessage('Please fix errors on this step.');
                  }}
                >
                  Continue to contact
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 – CONTACT */}
          {step === 2 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Primary contact</h2>
              <p className={styles.sectionSubtitle}>
                The person we’ll send the blueprint and proposal to.
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Name
                  <input
                    className={styles.input}
                    value={form.contactName}
                    onChange={(e) => update('contactName', e.target.value)}
                    placeholder="Your name"
                  />
                </label>
                {errors.contactName && <div className={styles.errorText}>{errors.contactName}</div>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Email
                  <input
                    className={styles.input}
                    value={form.contactEmail}
                    onChange={(e) => update('contactEmail', e.target.value)}
                    placeholder="you@company.com"
                  />
                </label>
                {errors.contactEmail && (
                  <div className={styles.errorText}>{errors.contactEmail}</div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Phone (optional)
                  <input
                    className={styles.input}
                    value={form.contactPhone}
                    onChange={(e) => update('contactPhone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </label>
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setMessage(null);
                    setStep(1);
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => {
                    if (validateStep(2)) setStep(3);
                    else setMessage('Please fix errors on this step.');
                  }}
                >
                  Continue to goals
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 – GOALS */}
          {step === 3 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>What are you trying to achieve?</h2>
              <p className={styles.sectionSubtitle}>
                These choices shape how we design your systems and phases.
              </p>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <span className={styles.fieldLabel}>Primary objectives</span>
                  <span className={styles.fieldHint}>Select all that apply.</span>
                </div>
                <div className={styles.chipRow}>
                  {[
                    { key: 'reduce_support_volume', label: 'Reduce support volume' },
                    { key: 'increase_leads', label: 'Increase qualified leads' },
                    { key: 'automate_workflows', label: 'Automate internal workflows' },
                    { key: 'increase_content_output', label: 'Increase content output' },
                    { key: 'improve_reporting', label: 'Improve reporting & insight' },
                  ].map((obj) => {
                    const active = form.primaryObjectives.includes(obj.key as Objective);
                    return (
                      <button
                        key={obj.key}
                        type="button"
                        onClick={() => toggleObjective(obj.key as Objective)}
                        className={[styles.chip, active ? styles.chipActive : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {obj.label}
                      </button>
                    );
                  })}
                </div>
                {errors.primaryObjectives && (
                  <div className={styles.errorText}>{errors.primaryObjectives}</div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <span className={styles.fieldLabel}>Systems you’re interested in</span>
                  <span className={styles.fieldHint}>
                    This helps us prioritize the first build.
                  </span>
                </div>
                <div className={styles.chipRow}>
                  {[
                    { key: 'ai_support', label: 'AI Support System' },
                    { key: 'ai_content', label: 'AI Content System' },
                    { key: 'ai_data_bi', label: 'AI Data & BI' },
                    { key: 'ai_workflow', label: 'AI Workflow Automation' },
                    { key: 'ai_voice', label: 'AI Voice Reception' },
                  ].map((sys) => {
                    const active = form.systems.includes(sys.key as SystemInterest);
                    return (
                      <button
                        key={sys.key}
                        type="button"
                        onClick={() => toggleSystemInterest(sys.key as SystemInterest)}
                        className={[styles.chip, active ? styles.chipActive : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {sys.label}
                      </button>
                    );
                  })}
                </div>
                {errors.systems && <div className={styles.errorText}>{errors.systems}</div>}
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setMessage(null);
                    setStep(2);
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => {
                    if (validateStep(3)) setStep(4);
                    else setMessage('Please fix errors on this step.');
                  }}
                >
                  Continue to support & pain
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 – SUPPORT & PAIN */}
          {step === 4 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Support volume & pain points</h2>
              <p className={styles.sectionSubtitle}>
                This is where the blueprint gets sharp. Be candid — the more real this is, the more
                useful your plan will be.
              </p>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <span className={styles.fieldLabel}>Support channels you care about</span>
                  <span className={styles.fieldHint}>Select all that apply.</span>
                </div>
                <div className={styles.chipRow}>
                  {[
                    { key: 'email', label: 'Email' },
                    { key: 'web_chat', label: 'Web chat' },
                    { key: 'social_dm', label: 'Social DMs' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'sms', label: 'SMS' },
                  ].map((ch) => {
                    const active = form.supportChannels.includes(ch.key as SupportChannel);
                    return (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() => toggleSupportChannel(ch.key as SupportChannel)}
                        className={[styles.chip, active ? styles.chipActive : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <span className={styles.fieldLabel}>
                    Approx. daily inquiries (across channels)
                  </span>
                  <span className={styles.fieldHint}>A rough range is enough.</span>
                </div>
                <div className={styles.sliderRow}>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    value={dailyInquiriesNumber}
                    onChange={(e) => update('dailyInquiries', e.target.value)}
                    className={styles.slider}
                  />
                  <div className={styles.sliderValue}>~{dailyInquiriesNumber || 0} per day</div>
                </div>
                {errors.dailyInquiries && (
                  <div className={styles.errorText}>{errors.dailyInquiries}</div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  What’s painful right now?
                  <textarea
                    className={styles.textarea}
                    value={form.mainPainPoints}
                    onChange={(e) => update('mainPainPoints', e.target.value)}
                    rows={4}
                    placeholder="Describe where things break down, what you’re constantly chasing, or the work that feels like it should already be automated."
                  />
                </label>
                {errors.mainPainPoints && (
                  <div className={styles.errorText}>{errors.mainPainPoints}</div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Anything else we should know? (optional)
                  <textarea
                    className={styles.textarea}
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    rows={3}
                    placeholder="Context, constraints, existing tools, teams, or timelines."
                  />
                </label>
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setMessage(null);
                    setStep(3);
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={submit}
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : 'Submit for blueprint'}
                </button>
              </div>
            </div>
          )}
        </section>

        {message && <div className={styles.messageArea}>{message}</div>}
      </main>
    </Layout>
  );
}
