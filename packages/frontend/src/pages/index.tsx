import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Navbar, Footer, Section, PricingCard, Button, HoloCard, GlowText } from '../components/ui';
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
          {['[ VOICE_AGENT ]', '[ CRM_SYNC ]', '[ CHAT_BOT ]', '[ PAYMENTS ]', '[ ANALYTICS ]', '[ EMAIL_AUTO ]'].map((label, i) => (
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
      'Our new website looks amazing and the AI receptionist saves us 10+ hours every week. Already booked 6 new clients through automated scheduling.',
    author: 'Sarah M.',
    role: 'Small Business Owner',
    company: 'Home Services Co.',
    metrics: [
      { label: 'Time Saved', value: '10+ hrs', icon: '⏰' },
      { label: 'New Clients', value: '+6', icon: '📈' },
    ],
  },
  {
    quote:
      'Professional team that really listens. They delivered exactly what we needed on time and under budget. The AI chat support is incredible.',
    author: 'James K.',
    role: 'Marketing Director',
    company: 'TechStart Inc.',
    metrics: [
      { label: 'On Budget', value: '100%', icon: '💰' },
      { label: 'On Time', value: '✓', icon: '⚡' },
    ],
  },
  {
    quote:
      'Best investment we made this year. Their automation cut our support tickets in half and increased customer satisfaction scores by 28%.',
    author: 'Michelle R.',
    role: 'Operations Manager',
    company: 'E-Commerce Plus',
    metrics: [
      { label: 'Tickets Cut', value: '50%', icon: '📉' },
      { label: 'CSAT Score', value: '+28%', icon: '😊' },
    ],
  },
];

const PRICING_PLANS = [
  {
    name: 'Website Package',
    scope: 'SMALL SYSTEM',
    complexity: 'NODE: FOUNDATION',
    description: 'Professional web presence',
    features: [
      'Custom design & development',
      'Mobile responsive',
      'SEO optimized',
      'Content management system',
    ],
    ctaText: 'REQUEST SCOPE ANALYSIS',
  },
  {
    name: 'AI Automation',
    scope: 'INTELLIGENT INFRASTRUCTURE',
    complexity: 'CORE: INTEGRATION',
    description: 'Intelligent business automation',
    features: [
      'AI voice reception or chat support',
      'Custom workflow automation',
      'System integrations',
      'Training & ongoing support',
    ],
    highlighted: true,
    badge: '[ HIGH_THROUGHPUT ]',
    ctaText: 'INITIALIZE CONSULTATION',
  },
  {
    name: 'Complete Solution',
    scope: 'ENTERPRISE ARCHITECTURE',
    complexity: 'NEXUS: ORCHESTRATION',
    description: 'Website + AI automation',
    features: [
      'Everything combined',
      'Integrated experience',
      'Priority development',
      'Dedicated partnership',
    ],
    ctaText: 'REQUEST ARCHITECTURE REVIEW',
  },
];

const STATS = [
  { label: 'Projects Delivered', value: '50+' },
  { label: 'Client Satisfaction', value: '95%' },
  { label: 'Response Time', value: '24hr' },
  { label: 'Years Experience', value: '5+' },
];

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

const TECH_STACK = [
  { name: 'Next.js', category: 'Frontend' },
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'OpenAI', category: 'AI' },
  { name: 'Anthropic Claude', category: 'AI' },
  { name: 'Vercel', category: 'Hosting' },
  { name: 'Stripe', category: 'Payments' },
];

const FAQS = [
  {
    question: 'How long does a typical project take?',
    answer:
      'Website projects typically take 3-6 weeks, while AI automation projects range from 4-8 weeks depending on complexity. We provide a detailed timeline in your custom proposal.',
  },
  {
    question: 'Do you work with small businesses or just enterprises?',
    answer:
      'We work with businesses of all sizes! Our packages are designed to be accessible to small businesses while still meeting enterprise needs. If you have a genuine need for technology, we can help.',
  },
  {
    question: 'What if I need changes after launch?',
    answer:
      'All projects include a 30-day warranty period for bug fixes. Beyond that, we offer ongoing maintenance packages or can handle changes on an hourly basis. Many clients choose our partnership plan for continuous improvements.',
  },
  {
    question: 'How do AI automations integrate with my existing systems?',
    answer:
      'We build custom integrations with your existing tools (CRM, calendar, email, etc.) using APIs and webhooks. During discovery, we audit your tech stack and design a seamless integration plan.',
  },
  {
    question: "What's included in ongoing support?",
    answer:
      'Our support includes bug fixes, security updates, performance monitoring, and priority response times. Partnership plans also include monthly strategy calls and new feature development.',
  },
  {
    question: 'Can you help us decide between a website and AI automation?',
    answer:
      "Absolutely! Many clients aren't sure what they need most. Book a free discovery call and we'll assess your business, identify opportunities, and recommend the best starting point.",
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
    metric: '40% increase',
    description: 'in qualified leads captured',
    client: 'Home Services Company',
  },
  {
    metric: '15 hrs/week',
    description: 'saved on customer support',
    client: 'E-commerce Store',
  },
  {
    metric: '3x faster',
    description: 'response time to inquiries',
    client: 'Professional Services',
  },
];

export default function Home() {
  return (
    <div className="antialiased min-h-screen bg-[#0A0A0A] text-white">
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
            <div className="space-y-2 font-mono text-sm">
              <div><span className="text-purple-400">&gt;</span> LOADING CORE: <span className="text-white">NEXT.JS</span>...........<span className="text-green-400">[OK]</span></div>
              <div><span className="text-purple-400">&gt;</span> LOADING UI: <span className="text-white">TAILWIND</span>............<span className="text-green-400">[OK]</span></div>
              <div><span className="text-purple-400">&gt;</span> LOADING DB: <span className="text-white">POSTGRESQL</span>..........<span className="text-green-400">[OK]</span></div>
              <div><span className="text-purple-400">&gt;</span> LOADING AI: <span className="text-white">OPENAI-4o</span>...........<span className="text-green-400">[OK]</span></div>
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
                scope={plan.scope}
                complexity={plan.complexity}
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
            <Button as="link" href="/intake" variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
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
