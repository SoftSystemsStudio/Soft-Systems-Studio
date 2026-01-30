import React, { useState } from 'react';
import Head from 'next/head';
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

export default function IntakePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <Head>
          <title>Thank You - Soft Systems Studio</title>
        </Head>
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
      <Head>
        <title>Get a Free Quote - Soft Systems Studio</title>
        <meta
          name="description"
          content="Get a free quote for your website or AI receptionist. We help local service businesses never miss a call again."
        />
      </Head>

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
