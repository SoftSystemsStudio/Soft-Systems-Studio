import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Navbar, Footer, Section, PricingCard, Button, HoloCard } from '../components/ui';
import { FadeIn, StaggerContainer } from '../components/motion';
import { ChatWidget } from '@softsystems/ui-components';
import env from '../lib/env';

// Note: FluidHero replaced with SystemStatus for Technical Brutalist redesign

// Dynamically import HolographicModel (client-side only)
const HolographicModel = dynamic(() => import('../components/sentient/hologram/HolographicModel'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="aspect-video bg-zinc-900 border border-zinc-700 rounded flex items-center justify-center p-8">
          <svg viewBox="0 0 800 450" className="w-full h-full opacity-30">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(63,63,70)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="450" fill="url(#grid)" />

            {/* Building wireframe outline */}
            <g stroke="rgb(113,113,122)" strokeWidth="1" fill="none">
              {/* Foundation */}
              <rect x="300" y="350" width="200" height="80" />
              {/* Floor 1 */}
              <rect x="280" y="290" width="240" height="60" />
              {/* Floor 2 */}
              <rect x="260" y="230" width="280" height="60" />
              {/* Floor 3 */}
              <rect x="240" y="170" width="320" height="60" />
              {/* Top floor */}
              <rect x="220" y="110" width="360" height="60" />
              {/* Connecting lines */}
              <line x1="300" y1="350" x2="220" y2="170" />
              <line x1="500" y1="350" x2="580" y2="170" />
            </g>

            {/* Pulsing dot indicator */}
            <circle cx="400" cy="200" r="3" fill="#c0ff6b" opacity="0.6">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>
    </div>
  ),
});

// Dynamically import LivePulse (client-side only for real-time updates)
const LivePulse = dynamic(() => import('../components/sentient/pulse/LivePulse'), {
  ssr: false,
  loading: () => (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-30">
          <div className="bg-zinc-900 h-32 border border-zinc-800 rounded" />
          <div className="bg-zinc-900 h-32 border border-zinc-800 rounded" />
          <div className="bg-zinc-900 h-32 border border-zinc-800 rounded" />
        </div>
      </div>
    </div>
  ),
});

// Dynamically import TheArchitect (drag-drop builder)
const TheArchitect = dynamic(() => import('../components/sentient/builder/TheArchitect'), {
  ssr: false,
  loading: () => (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4 text-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            '[ VOICE_AGENT ]',
            '[ CRM_SYNC ]',
            '[ CHAT_BOT ]',
            '[ PAYMENTS ]',
            '[ ANALYTICS ]',
            '[ EMAIL_AUTO ]',
          ].map((label, i) => (
            <div
              key={i}
              className="bg-zinc-900 h-40 border border-zinc-700 rounded p-4 flex flex-col items-center justify-center opacity-20"
            >
              <div className="w-12 h-12 border-2 border-zinc-600 rounded mb-2 flex items-center justify-center">
                <span className="text-zinc-600 font-mono text-xs">{label}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

// Dynamically import new sentient components
const InteractiveFAQ = dynamic(() => import('../components/sentient/faq/InteractiveFAQ'), {
  ssr: false,
});

const ProcessTimeline = dynamic(() => import('../components/sentient/process/ProcessTimeline'), {
  ssr: false,
});

const TerminalCTA = dynamic(() => import('../components/sentient/cta/TerminalCTA'), {
  ssr: false,
});

const MetricTestimonials = dynamic(
  () => import('../components/sentient/testimonials/MetricTestimonials'),
  { ssr: false },
);

const SystemStatus = dynamic(() => import('../components/sentient/hero/SystemStatus'), {
  ssr: false,
});

const NAV_ITEMS = [
  { label: 'Capabilities', href: '#hologram' },
  { label: 'Live Metrics', href: '#pulse' },
  { label: 'Architect', href: '#builder' },
  { label: 'FAQ', href: '#faq' },
  { label: 'SYSTEM PREVIEW', href: '/demo/system-v1' },
];

const STEPS = [
  {
    step: '01',
    title: '[ 01 ] DATA INGESTION',
    desc: 'We learn about your business, goals, and challenges',
  },
  {
    step: '02',
    title: '[ 02 ] ARCHITECTURAL MAPPING',
    desc: 'Receive a tailored plan with timeline and transparent pricing',
  },
  {
    step: '03',
    title: '[ 03 ] SYSTEM DEPLOYMENT',
    desc: 'We build your solution and support you every step of the way',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I used to miss calls while on job sites. Now the AI answers every call, books appointments, and sends me a text summary. Booked 8 new jobs last month alone.',
    author: 'Mike T.',
    role: 'Owner',
    company: 'MT Plumbing Services',
    metrics: [
      { label: 'Calls Answered', value: '100%', icon: '📞' },
      { label: 'New Jobs', value: '+8/mo', icon: '📈' },
    ],
  },
  {
    quote:
      'Patients can now book appointments 24/7. Our front desk staff focuses on patient care instead of answering phones all day. Game changer.',
    author: 'Dr. Lisa Chen',
    role: 'Practice Owner',
    company: 'Bright Smile Dental',
    metrics: [
      { label: 'Online Bookings', value: '+65%', icon: '📅' },
      { label: 'Staff Hours Saved', value: '15/wk', icon: '⏰' },
    ],
  },
  {
    quote:
      'Finally have a professional website that ranks on Google. The AI receptionist handles calls in English and Spanish - huge for our community.',
    author: 'Carlos R.',
    role: 'Owner',
    company: 'Rodriguez Landscaping',
    metrics: [
      { label: 'Google Ranking', value: 'Top 3', icon: '🔍' },
      { label: 'Lead Increase', value: '+40%', icon: '📊' },
    ],
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
    price: '$997 + $197/mo',
    description: 'Never miss a call again',
    features: [
      '24/7 AI phone answering',
      'Custom voice (not robotic)',
      'Bilingual (English/Spanish)',
      'Calendar integration',
      'Monthly optimization included',
    ],
    highlighted: true,
    badge: 'Most Popular',
    ctaText: 'Book a Demo',
  },
  {
    name: 'Complete Package',
    price: '$2,997 + $197/mo',
    description: 'Website + AI bundle (Save $500)',
    features: [
      '7-page website included',
      'AI receptionist integrated',
      'Website chat included',
      '2 integrations (calendar, CRM)',
      '60-day support included',
    ],
    ctaText: 'Get the Bundle',
  },
];

// Stats are now integrated into the hero component

const WHY_CHOOSE_US = [
  {
    title: 'We Engineer Adaptive Systems',
    description:
      'Not just websites. Digital nervous systems that learn, adapt, and scale with your business.',
  },
  {
    title: 'Built in Public, Deployed in Private',
    description: 'Every line of code is battle-tested. We use the same stack we build for clients.',
  },
  {
    title: 'Live Neural Link',
    description: 'Real-time dashboard access. Watch your systems pulse. No black boxes.',
  },
  {
    title: 'Zero Lock-In',
    description: "Your code. Your data. Your infrastructure. We don't hold systems hostage.",
  },
];

// Tech stack is now displayed in terminal-deps format

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
    <div className="antialiased min-h-screen bg-[#050505] text-gray-200 selection:bg-purple-500 selection:text-white">
      <Head>
        <title>
          AI Automation & Web Design Services | Soft Systems Studio - Expert Development
        </title>
        <meta
          name="description"
          content="Expert AI automation & web design services. AI voice reception, chat support, workflow automation, and modern websites. 30-day guarantee. Starting at $3,500. Book your free consultation today."
        />
        <meta
          name="keywords"
          content="AI automation, web design, AI voice reception, AI chat support, workflow automation, custom web development, Next.js, TypeScript, AI integration, business automation"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Soft Systems Studio LLC" />
        <link rel="canonical" href="https://softsystemsstudiollc.com/" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="AI Automation & Web Design Services | Soft Systems Studio"
        />
        <meta
          property="og:description"
          content="Expert AI automation & web design services. AI voice reception, chat support, and modern websites that drive results. 30-day guarantee."
        />
        <meta property="og:url" content="https://softsystemsstudiollc.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://softsystemsstudiollc.com/og-image.jpg" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Soft Systems Studio" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="AI Automation & Web Design Services | Soft Systems Studio"
        />
        <meta
          name="twitter:description"
          content="Expert AI automation & web design services. 30-day guarantee. Book your free consultation."
        />
        <meta name="twitter:image" content="https://softsystemsstudiollc.com/og-image.jpg" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Soft Systems Studio LLC',
              url: 'https://softsystemsstudiollc.com',
              logo: 'https://softsystemsstudiollc.com/logo.png',
              description:
                'Expert AI automation and web design services helping businesses grow with intelligent systems and modern websites.',
              foundingDate: '2019',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'US',
              },
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: 'English',
              },
            }),
          }}
        />

        {/* Structured Data - Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Soft Systems Studio',
              image: 'https://softsystemsstudiollc.com/logo.png',
              description:
                'Professional AI automation and web design services including AI voice reception, chat support, workflow automation, and custom web development.',
              priceRange: '$3,500 - $20,000',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '50',
              },
              offers: [
                {
                  '@type': 'Offer',
                  name: 'Website Package',
                  description: 'Professional web presence with custom design and development',
                  price: '3500',
                  priceCurrency: 'USD',
                },
                {
                  '@type': 'Offer',
                  name: 'AI Automation',
                  description: 'Intelligent business automation with AI systems',
                  price: '5000',
                  priceCurrency: 'USD',
                },
              ],
            }),
          }}
        />

        {/* Structured Data - Reviews */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: TESTIMONIALS.map((testimonial, index) => ({
                '@type': 'Review',
                position: index + 1,
                author: {
                  '@type': 'Person',
                  name: testimonial.author,
                },
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
                reviewBody: testimonial.quote,
              })),
            }),
          }}
        />
      </Head>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* System Preview Banner */}
      <a
        href="/demo/system-v1"
        className="block w-full bg-purple-500/10 text-white text-center py-3 font-mono text-sm border-b border-white/5 hover:bg-purple-500/20 transition-colors"
      >
        <span className="text-purple-400">◆</span> SYSTEM V1.0 PREVIEW → Interactive Architecture •
        Live Metrics • Module Builder
      </a>

      {/* Navbar */}
      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="/intake" />

      <main id="main-content">
        {/* Hero Section - System Status */}
        <Section className="pt-8 pb-0">
          <SystemStatus />
        </Section>

        {/* Stats Bar - Removed, now integrated into hero */}

        {/* Trust Badges */}
        <Section className="py-12 border-y border-white/5">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <span className="text-2xl text-purple-400">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-300">{badge.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* System Architecture - Holographic Model */}
        <HolographicModel />

        {/* The Pulse - Live Metrics Dashboard */}
        <Section id="pulse" className="py-24">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white text-center">
              We Don&apos;t Build Websites.
              <br />
              <span className="text-gradient-purple">We Construct Digital Nervous Systems.</span>
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              Every system we engineer is adaptive, observable, and yours to control. Watch us work
              in real-time.
            </p>
          </FadeIn>

          {/* Live Dashboard */}
          <div className="mb-16">
            <LivePulse />
          </div>

          {/* Why Choose Us Cards */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {WHY_CHOOSE_US.map((item) => (
              <HoloCard key={item.title} className="p-6" glowColor="purple">
                <h3 className="font-semibold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </HoloCard>
            ))}
          </StaggerContainer>
        </Section>

        {/* Technology Stack Section */}
        <Section className="py-24 section-elevated">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              Built with Best-in-Class Tools
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              We use modern, proven technologies to build fast, secure, and scalable solutions
            </p>
          </FadeIn>

          <div className="terminal-deps max-w-4xl mx-auto">
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-green-400">&gt;</span> LOADING CORE:{' '}
                <span className="text-green-300">NEXT.JS</span>...........
                <span className="text-green-400">[OK]</span>
              </div>
              <div>
                <span className="text-green-400">&gt;</span> LOADING UI:{' '}
                <span className="text-green-300">TAILWIND</span>............
                <span className="text-green-400">[OK]</span>
              </div>
              <div>
                <span className="text-green-400">&gt;</span> LOADING DB:{' '}
                <span className="text-green-300">POSTGRESQL</span>..........
                <span className="text-green-400">[OK]</span>
              </div>
              <div>
                <span className="text-green-400">&gt;</span> LOADING AI:{' '}
                <span className="text-green-300">OPENAI-4o</span>...........
                <span className="text-green-400">[OK]</span>
              </div>
            </div>
          </div>
        </Section>

        {/* The Architect - Project Builder Section */}
        <Section id="builder" className="py-28">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass-card">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                  The Architect
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                Build Your <span className="text-gradient-purple">Stack</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Drag modules. Watch the price ticker. Get instant quotes. No sales calls required.
              </p>
            </div>
          </FadeIn>

          {/* The Architect - Drag & Drop Builder */}
          <TheArchitect />
        </Section>

        {/* How We Work Section - Process Timeline */}
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

        {/* Testimonials Section - Enhanced with Metrics */}
        <Section id="testimonials" className="py-24">
          <FadeIn>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              Proof, Not Promises
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl leading-relaxed text-center mx-auto">
              Real clients. Real systems. Real metrics.
            </p>
          </FadeIn>

          <MetricTestimonials testimonials={TESTIMONIALS} />
        </Section>

        {/* Client Results Section */}
        <Section className="py-20">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white text-center">
              Real Results for Real Businesses
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              System performance metrics — Client data within 90-day observation period.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {CLIENT_RESULTS.map((result, index) => (
              <HoloCard key={index} className="p-8 text-center" glowColor="purple" showScanLine>
                <div className="text-4xl md:text-5xl font-bold text-gradient-purple mb-3">
                  {result.metric}
                </div>
                <div className="text-white font-medium mb-2">{result.description}</div>
                <div className="text-sm text-gray-400 italic">{result.client}</div>
              </HoloCard>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm text-purple-400 font-medium">
                Limited to 3 new clients per month
              </span>
            </div>
          </FadeIn>
        </Section>

        {/* Pricing Section */}
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
            <HoloCard className="inline-block p-6 max-w-2xl" glowColor="blue">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🛡️</span>
                <div className="text-left">
                  <h3 className="text-white font-semibold mb-2">30-Day Money-Back Guarantee</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    If you&apos;re not completely satisfied with our work within the first 30 days,
                    we&apos;ll refund your investment. No questions asked.
                  </p>
                </div>
              </div>
            </HoloCard>
          </FadeIn>
        </Section>

        {/* FAQ Section */}
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

        {/* Final CTA Section - Terminal Style */}
        <Section className="py-28 relative overflow-hidden">
          <TerminalCTA />
        </Section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ChatWidget
        apiUrl={(env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/v1/public/chat'}
        title="Chat With Us"
        greeting="Hi! I'm here to help. Ask me about our AI automation services, website design, pricing, or anything else!"
        primaryColor="#a3e635"
        position="bottom-right"
      />
    </div>
  );
}
