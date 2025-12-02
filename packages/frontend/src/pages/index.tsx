import React from 'react';
import {
  Hero,
  Navbar,
  Footer,
  Section,
  FeatureCard,
  TestimonialCard,
  PricingCard,
  Button,
} from '../components/ui';
import { FadeIn, StaggerContainer } from '../components/motion';

const NAV_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'Use cases', href: '#use-cases' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  {
    title: 'AI Support Systems',
    description: 'Web chat, email, SMS and social triage with context-preserving handoffs.',
  },
  {
    title: 'AI Content Systems',
    description: 'A content engine that produces on-brand drafts for campaigns and posts.',
  },
  {
    title: 'AI Data & BI',
    description: 'Query billing, CRM and ad data in plain language for fast insights.',
  },
  {
    title: 'AI Workflow Systems',
    description: 'Automate qualification, reminders, and hand-offs with transparent flows.',
  },
  {
    title: 'AI Voice Reception',
    description: 'Capture and qualify calls, book meetings, or route to humans.',
  },
  {
    title: 'Integrations',
    description: 'Connect Stripe, HubSpot, Slack, Calendly, Notion and more.',
  },
];

const STEPS = [
  { step: '01', title: 'Intake & discovery' },
  { step: '02', title: 'Systems blueprint & roadmap' },
  { step: '03', title: 'Deploy, tune, and scale' },
];

const TESTIMONIALS = [
  { quote: 'We cut support load by 40%', author: 'Customer A', role: 'CEO' },
  { quote: 'Content output tripled in a month', author: 'Customer B', role: 'Marketing Lead' },
  { quote: 'Reporting became actionable', author: 'Customer C', role: 'Operations Manager' },
];

const PRICING_PLANS = [
  {
    name: 'Starter',
    price: '$2,500',
    description: 'Blueprint only',
    features: ['Systems audit', 'Architecture diagram', 'Implementation roadmap'],
    ctaText: 'Get started',
  },
  {
    name: 'Implementation Sprint',
    price: '$10,000',
    description: 'Full build & handoff',
    features: [
      'Everything in Starter',
      '4-week implementation',
      'Custom integrations',
      'Training & documentation',
    ],
    highlighted: true,
    badge: 'Recommended',
    ctaText: 'Start sprint',
  },
  {
    name: 'Ongoing Partner',
    price: 'Custom',
    description: 'Retainer & optimization',
    features: [
      'Continuous improvement',
      'Priority support',
      'Monthly strategy calls',
      'New system builds',
    ],
    ctaText: 'Contact us',
  },
];

export default function Home() {
  return (
    <div className="antialiased min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-[#d5d5d5]">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Navbar */}
      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="/intake" />

      <main id="main-content">
        {/* Hero Section */}
        <Hero
          badge="AI Automation Agency"
          title={
            <>
              Automate Smarter.
              <br className="hidden sm:block" />
              Grow Faster.
            </>
          }
          subtitle="Design, deploy, and run AI systems for support, content, data, workflows, and voice. One intake, a clear systems blueprint, and a phased rollout."
          primaryCta={{ label: 'Start the intake', href: '/intake' }}
          secondaryCta={{ label: 'Explore features', href: '#features' }}
        />

        {/* Features Section */}
        <Section id="features" className="py-28">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#d5d5d5]">
              Core systems we deploy
            </h2>
            <p className="text-[#656565] max-w-2xl mb-12 leading-relaxed">
              Agency on the front, configurable platform on the back.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </StaggerContainer>
        </Section>

        {/* How It Works Section */}
        <Section id="use-cases" gradient="subtle" className="py-24">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-[#d5d5d5]">
              How it works
            </h2>
            <p className="text-[#656565] mb-12 max-w-2xl leading-relaxed">
              Intake → Blueprint → Deploy → Iterate. We prioritize high-leverage systems and ship
              fast.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="relative p-8 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] shadow-lg shadow-black/20"
              >
                <span className="block text-5xl font-bold text-[#c0ff6b]/30 mb-2">{s.step}</span>
                <h3 className="text-lg font-semibold text-[#d5d5d5]">{s.title}</h3>
              </div>
            ))}
          </StaggerContainer>
        </Section>

        {/* Testimonials Section */}
        <Section id="testimonials" className="py-24">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-[#d5d5d5]">
              Trusted by teams
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard
                key={testimonial.author}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
              />
            ))}
          </StaggerContainer>
        </Section>

        {/* Pricing Section */}
        <Section id="pricing" gradient="dark" className="py-24">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-[#d5d5d5]">
              Pricing
            </h2>
            <p className="text-[#656565] mb-12 max-w-2xl leading-relaxed">
              Simple plans to get started. Scale when you have real usage.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                ctaText={plan.ctaText}
                ctaHref="/intake"
                highlighted={plan.highlighted}
                badge={plan.badge}
              />
            ))}
          </StaggerContainer>
        </Section>

        {/* Final CTA Section */}
        <Section className="py-28">
          <FadeIn className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#d5d5d5] mb-4">
              Ready to level up your workflow?
            </h2>
            <p className="text-[#656565] mb-8 leading-relaxed max-w-xl mx-auto">
              Share a bit about your team and goals — we&apos;ll return a concrete blueprint.
            </p>
            <Button as="link" href="/intake" variant="primary" size="lg">
              Start the intake
            </Button>
          </FadeIn>
        </Section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
