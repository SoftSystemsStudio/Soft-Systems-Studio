/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-misused-promises -- Form handlers are async and API responses need runtime validation */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type ServiceInterest = 'website' | 'ai_receptionist' | 'complete_package';

type FormState = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  serviceInterest: ServiceInterest | '';
  monthlyCallVolume: string;
  biggestChallenge: string;
  howDidYouHear: string;
};

const initialForm: FormState = {
  name: '',
  businessName: '',
  email: '',
  phone: '',
  businessType: '',
  serviceInterest: '',
  monthlyCallVolume: '',
  biggestChallenge: '',
  howDidYouHear: '',
};

const BUSINESS_TYPES = [
  'Plumbing',
  'HVAC',
  'Electrical',
  'Roofing',
  'Landscaping',
  'Dental Practice',
  'Medical/Med Spa',
  'Legal Services',
  'Real Estate',
  'Other',
];

const CALL_VOLUMES = [
  'Less than 50 calls/month',
  '50-100 calls/month',
  '100-200 calls/month',
  '200+ calls/month',
  'Not sure',
];

const SERVICES = [
  {
    key: 'website' as ServiceInterest,
    name: 'Website Only',
    price: '$2,500',
    description: 'Professional 5-page website',
  },
  {
    key: 'ai_receptionist' as ServiceInterest,
    name: 'AI Receptionist',
    price: '$997 + $197/mo',
    description: 'Never miss a call again',
  },
  {
    key: 'complete_package' as ServiceInterest,
    name: 'Complete Package',
    price: '$2,997 + $197/mo',
    description: 'Website + AI (Save $500)',
  },
];

export default function IntakeForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoCallLoading, setDemoCallLoading] = useState(false);
  const [demoCallStatus, setDemoCallStatus] = useState<'idle' | 'calling' | 'success' | 'error'>(
    'idle',
  );

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function validate(): string | null {
    if (!form.name.trim()) return 'Please enter your name';
    if (!form.businessName.trim()) return 'Please enter your business name';
    if (!form.email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email';
    if (!form.phone.trim()) return 'Please enter your phone number';
    if (!form.serviceInterest) return 'Please select which service you are interested in';
    return null;
  }

  async function handleDemoCall() {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number to receive a demo call');
      return;
    }

    setDemoCallLoading(true);
    setDemoCallStatus('calling');
    setError(null);

    try {
      const res = await fetch('/api/demo-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          businessName: form.businessName,
          businessType: form.businessType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to initiate demo call');
      }

      setDemoCallStatus('success');
    } catch (err) {
      setDemoCallStatus('error');
      setError(
        err instanceof Error ? err.message : 'Failed to initiate demo call. Please try again.',
      );
    } finally {
      setDemoCallLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-gray-400 mb-6">
            We&apos;ve received your request. You&apos;ll hear from us within 24 hours to schedule a
            quick call and discuss your project.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            Soft Systems Studio
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get Your Free Quote</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tell us about your business and we&apos;ll get back to you within 24 hours with a custom
            quote.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Info */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Smith Plumbing LLC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="john@smithplumbing.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Demo Call CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Want to hear our AI in action?
                  </h3>
                  <p className="text-sm text-gray-400">
                    Enter your name and phone above, then click to receive a live demo call from our
                    AI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDemoCall}
                  disabled={demoCallLoading || demoCallStatus === 'success'}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all whitespace-nowrap ${
                    demoCallStatus === 'success'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {demoCallLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Calling...
                    </span>
                  ) : demoCallStatus === 'success' ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Call incoming!
                    </span>
                  ) : (
                    'Call Me Now'
                  )}
                </button>
              </div>
              {demoCallStatus === 'success' && (
                <p className="mt-3 text-sm text-green-400">
                  Our AI will call you within 30 seconds. Make sure your phone is nearby!
                </p>
              )}
            </div>
          </section>

          {/* Business Info */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">About Your Business</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What type of business do you run?
                </label>
                <select
                  value={form.businessType}
                  onChange={(e) => update('businessType', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                >
                  <option value="" className="bg-[#1a1a1a] text-gray-400">
                    Select your industry...
                  </option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#1a1a1a] text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How many phone calls do you get per month?
                </label>
                <select
                  value={form.monthlyCallVolume}
                  onChange={(e) => update('monthlyCallVolume', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                >
                  <option value="" className="bg-[#1a1a1a] text-gray-400">
                    Select call volume...
                  </option>
                  {CALL_VOLUMES.map((volume) => (
                    <option key={volume} value={volume} className="bg-[#1a1a1a] text-white">
                      {volume}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Service Selection */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">What are you interested in? *</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {SERVICES.map((service) => {
                const isSelected = form.serviceInterest === service.key;
                return (
                  <button
                    key={service.key}
                    type="button"
                    onClick={() => update('serviceInterest', service.key)}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold mb-1">{service.name}</div>
                    <div className="text-purple-400 font-bold mb-2">{service.price}</div>
                    <div className="text-sm text-gray-400">{service.description}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Additional Info */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Tell Us More</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What&apos;s your biggest challenge right now?
                </label>
                <textarea
                  value={form.biggestChallenge}
                  onChange={(e) => update('biggestChallenge', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="e.g., Missing calls when I'm on job sites, no professional website, spending too much time on the phone..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How did you hear about us?
                </label>
                <input
                  type="text"
                  value={form.howDidYouHear}
                  onChange={(e) => update('howDidYouHear', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Google, referral, social media..."
                />
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Get My Free Quote'}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              We&apos;ll respond within 24 hours. No spam, ever.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
