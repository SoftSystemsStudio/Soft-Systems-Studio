'use client';

import dynamic from 'next/dynamic';
import { Navbar, Footer, Section, PricingCard, Button } from '@/components/ui';
import { FadeIn, StaggerContainer } from '@/components/motion';
import { ChatWidget } from '@softsystems/ui-components';
import env from '@/lib/env';

const InteractiveFAQ = dynamic(() => import('@/components/sentient/faq/InteractiveFAQ'), {
  ssr: false,
});

const ProcessTimeline = dynamic(() => import('@/components/sentient/process/ProcessTimeline'), {
  ssr: false,
});

const ROICalculator = dynamic(() => import('@/components/sentient/pricing/ROICalculator'), {
  ssr: false,
});

const NAV_ITEMS = [
  { label: 'How It Works', href: '#how-we-work' },
  { label: 'Results', href: '#results' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '/about' },
];

const STEPS = [
  {
    step: '01',
    title: 'Tell Us About Your Business',
    desc: 'Quick 5-minute call. We learn what you do, your biggest challenges, and how many calls you miss.',
  },
  {
    step: '02',
    title: 'Get Your Custom Quote',
    desc: 'Within 24 hours, receive a clear proposal with pricing, timeline, and exactly what you get.',
  },
  {
    step: '03',
    title: 'Go Live in 2 Weeks',
    desc: 'We handle everything. You approve the final result, and your AI starts answering calls.',
  },
];

const PRICING_PLANS = [
  {
    name: 'Website Package',
    price: '$2,500',
    description: 'Professional web presence for local businesses',
    features: [
      '5-page custom website',
      'Mobile responsive design',
      'SEO optimized',
      'Contact form & lead capture',
      '30-day post-launch support',
    ],
    ctaText: 'Get Started',
  },
  {
    name: 'AI Receptionist',
    price: 'Setup: $997',
    priceMonthly: '+ $197/mo',
    description: 'Never miss a call again',
    features: [
      '24/7 AI phone answering',
      'Natural voice (not robotic)',
      'Bilingual (English/Spanish)',
      'Calendar integration',
      'Monthly optimization included',
    ],
    highlighted: true,
    badge: 'Most Popular',
    ctaText: 'Get Started',
    valueNote: 'Less than $7/day — cheaper than a part-time hire',
  },
  {
    name: 'Complete Package',
    price: 'Setup: $2,997',
    priceMonthly: '+ $197/mo',
    description: 'Website + AI bundle (Save $500)',
    features: [
      '7-page website included',
      'AI receptionist integrated',
      'Website chat included',
      '2 integrations (calendar, CRM)',
      '60-day support included',
    ],
    ctaText: 'Get the Bundle',
    valueNote: 'Best value for full digital presence',
  },
];

const WHY_CHOOSE_US = [
  {
    title: 'Answer Every Call, 24/7',
    description:
      'Never miss a lead again. Your AI receptionist works nights, weekends, and holidays.',
  },
  {
    title: 'Book Jobs While You Work',
    description:
      'AI schedules appointments directly into your calendar. Get text summaries instantly.',
  },
  {
    title: 'Sound Professional, Always',
    description:
      'Natural human voice (not robotic). Bilingual English/Spanish. Your brand, your personality.',
  },
  {
    title: 'No Lock-In, No Surprises',
    description: 'Cancel anytime. Transparent pricing. 30-day money-back guarantee.',
  },
];

const FAQS = [
  {
    question: 'How does the AI receptionist work?',
    answer:
      'When someone calls your business, the AI answers professionally, understands what they need, books appointments directly into your calendar, and texts you a summary. It works 24/7, handles multiple calls at once, and speaks English and Spanish.',
  },
  {
    question: 'Will customers know they are talking to AI?',
    answer:
      'We use ElevenLabs for natural, human-sounding voices - not robotic. Most callers assume they are talking to a real receptionist. You can customize the voice, personality, and greeting to match your brand.',
  },
  {
    question: 'What if the AI cannot answer a question?',
    answer:
      'You set the rules. The AI can transfer to your cell phone, take a message, or schedule a callback. It never guesses or gives wrong information - it gracefully handles situations it was not trained for.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Website: 2-3 weeks. AI Receptionist: 1-2 weeks. Complete package: 3-4 weeks. We handle everything - you just answer a few questions about your business and approve the final result.',
  },
  {
    question: 'What are the monthly costs?',
    answer:
      'AI Receptionist: $197/month platform fee + ~$30-80/month in phone usage (Twilio/ElevenLabs pass-through, varies by call volume). Website hosting is free if you host yourself, or $47-97/month for our managed hosting.',
  },
  {
    question: 'Why is there a setup fee?',
    answer:
      'Unlike template-based services, we custom-build your AI with your services, pricing, and personality. The $997 setup covers voice training, business knowledge, integrations, and testing. It takes 10-15 hours of work - agencies charge $5,000+ for this.',
  },
];

const TRUST_BADGES = [
  { label: '30-Day Guarantee', icon: '✓' },
  { label: 'No Lock-In Contracts', icon: '∞' },
  { label: 'Transparent Pricing', icon: '$' },
  { label: 'Expert Support', icon: '★' },
];

const CLIENT_RESULTS = [
  {
    metric: '100%',
    description: 'of calls answered, even after hours',
    client: 'Plumbing Company',
  },
  {
    metric: '$2,000/mo',
    description: 'saved vs. hiring a receptionist',
    client: 'Dental Practice',
  },
  {
    metric: '8 new jobs',
    description: 'booked in the first month',
    client: 'HVAC Contractor',
  },
];

export default function Home() {
  return (
    <div className="antialiased min-h-screen bg-[#050505] text-gray-200 selection:bg-lime-400 selection:text-black">
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="/intake" />

      <main id="main-content">
        {/* Hero Section */}
        <Section className="pt-24 pb-16">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Never Miss Another
                <span className="block text-lime-400">$400 Job Again</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                AI receptionists that answer every call, book appointments, and send you text
                summaries — so you can stay on the job site.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/intake"
                  className="inline-block px-10 py-5 bg-lime-400 text-black font-bold text-lg rounded-xl hover:bg-lime-300 transition-all duration-300 hover:scale-105 shadow-lg shadow-lime-400/20"
                >
                  Get Your Free Quote
                </a>
                <a
                  href="#how-we-work"
                  className="inline-block px-10 py-5 border border-white/20 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  See How It Works
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Built for plumbers, dentists, contractors, and local service businesses
              </p>
            </div>
          </FadeIn>
        </Section>

        {/* Trust Badges */}
        <Section className="py-12 border-y border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <span className="text-2xl text-lime-400" aria-hidden="true">
                  {badge.icon}
                </span>
                <span className="text-sm font-medium text-gray-200">{badge.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Why Choose Us */}
        <Section id="why-us" className="py-24">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              Why Local Businesses Choose Us
            </h2>
            <p className="text-gray-300 mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              Built specifically for plumbers, dentists, contractors, and service businesses who are
              tired of missing calls.
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-lime-400/30 transition-colors"
              >
                <h3 className="font-semibold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </StaggerContainer>
        </Section>

        {/* Quick Lead Capture */}
        <Section className="py-20 bg-gradient-to-b from-transparent via-lime-500/5 to-transparent">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              See How Much You Could Save
            </h2>
            <p className="text-gray-300 mb-8">Get a free, personalized quote in under 2 minutes</p>
            <form
              action="/intake"
              method="GET"
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <select
                name="service"
                required
                aria-label="What type of business do you have?"
                className="flex-1 px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                defaultValue=""
              >
                <option value="" disabled className="text-gray-900">
                  What type of business?
                </option>
                <option value="plumbing" className="text-gray-900">
                  Plumbing
                </option>
                <option value="dental" className="text-gray-900">
                  Dental Practice
                </option>
                <option value="hvac" className="text-gray-900">
                  HVAC
                </option>
                <option value="landscaping" className="text-gray-900">
                  Landscaping
                </option>
                <option value="electrical" className="text-gray-900">
                  Electrical
                </option>
                <option value="other" className="text-gray-900">
                  Other Service Business
                </option>
              </select>
              <button
                type="submit"
                className="px-8 py-4 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition-all duration-300 whitespace-nowrap"
              >
                Get My Quote
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required · Takes 2 minutes · 30-day guarantee
            </p>
          </div>
        </Section>

        {/* How We Work */}
        <Section id="how-we-work" className="py-24 section-elevated">
          <FadeIn>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              How We Work
            </h2>
            <p className="text-gray-400 mb-16 max-w-2xl leading-relaxed text-center mx-auto">
              A simple, transparent process from first conversation to successful launch.
            </p>
          </FadeIn>
          <ProcessTimeline steps={STEPS} />
        </Section>

        {/* Results Section - replaces fake testimonials */}
        <Section id="results" className="py-24">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              Real Results for Real Businesses
            </h2>
            <p className="text-gray-300 mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              What happens when you stop missing calls
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {CLIENT_RESULTS.map((result, index) => (
              <div
                key={index}
                className="p-8 text-center rounded-xl border border-white/10 bg-white/5"
              >
                <div className="text-4xl md:text-5xl font-bold text-lime-400 mb-3">
                  {result.metric}
                </div>
                <div className="text-white font-medium mb-2">{result.description}</div>
                <div className="text-sm text-gray-400 italic">{result.client}</div>
              </div>
            ))}
          </StaggerContainer>
        </Section>

        {/* Pricing */}
        <Section id="pricing" className="py-24 section-elevated">
          <FadeIn>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              Transparent Pricing
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              Clear packages tailored to your needs. No hidden fees, no surprises.
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                priceMonthly={plan.priceMonthly}
                scope=""
                complexity=""
                description={plan.description}
                features={plan.features}
                ctaText={plan.ctaText}
                ctaHref="/intake"
                highlighted={plan.highlighted}
                badge={plan.badge}
              />
            ))}
          </StaggerContainer>
          <FadeIn className="mt-12 text-center">
            <div className="inline-block p-6 max-w-2xl rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-start gap-4">
                <span className="text-3xl" aria-hidden="true">
                  🛡️
                </span>
                <div className="text-left">
                  <h3 className="text-white font-semibold mb-2">30-Day Money-Back Guarantee</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Not satisfied? Full refund within 30 days. No questions asked. Keep all the
                    appointments your AI booked during the trial.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn className="mt-16">
            <ROICalculator />
          </FadeIn>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="py-24">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              Everything you need to know about working with us
            </p>
          </FadeIn>
          <InteractiveFAQ faqs={FAQS} />
          <FadeIn className="text-center mt-12">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <Button
              as="link"
              href="/intake"
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Schedule a Free Discovery Call
            </Button>
          </FadeIn>
        </Section>

        {/* Final CTA */}
        <Section className="py-28 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Stop Missing Calls?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Get a free quote in under 2 minutes. See exactly what your AI receptionist will cost.
            </p>
            <a
              href="/intake"
              className="inline-block px-10 py-5 bg-lime-400 text-black font-bold text-lg rounded-xl hover:bg-lime-300 transition-all duration-300 hover:scale-105 shadow-lg shadow-lime-400/20"
            >
              Get Your Free Quote
            </a>
            <p className="text-sm text-gray-500 mt-4">
              30-day money-back guarantee · No credit card required
            </p>
          </div>
        </Section>
      </main>

      <Footer />

      <ChatWidget
        apiUrl={(env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/v1/public/chat'}
        title="Chat With Us"
        greeting="Hi! I'm here to help. Ask me about our AI automation services, website design, pricing, or anything else!"
        primaryColor="#a3e635"
        position="bottom-right"
      />

      {/* JSON-LD - Organization only (no fabricated reviews) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Soft Systems Studio LLC',
            url: 'https://softsystemsstudiollc.com',
            description:
              'AI receptionists and websites for plumbers, dentists, contractors, and local service businesses.',
            foundingDate: '2019',
            address: { '@type': 'PostalAddress', addressCountry: 'US' },
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              availableLanguage: ['English', 'Spanish'],
            },
          }),
        }}
      />
    </div>
  );
}
