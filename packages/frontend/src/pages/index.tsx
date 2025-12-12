import React from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import {
  Navbar,
  Footer,
  Section,
  TestimonialCard,
  PricingCard,
  Button,
  HoloCard,
  ScanLine,
  GlowText,
} from '../components/ui';
import { FadeIn, StaggerContainer } from '../components/motion';
import { ChatWidget } from '@softsystems/ui-components';

// Dynamic import types
interface SceneProps {
  cameraPosition: [number, number, number];
  children: React.ReactNode;
}

interface NeuralSphereProps {
  color: string;
  secondaryColor: string;
  particleCount: number;
}

// Dynamically import Three.js components (client-side only)
const Scene = dynamic<SceneProps>(
  () =>
    import('../components/three/Scene').then(
      (mod: { default: ComponentType<SceneProps> }) => mod.default,
    ),
  { ssr: false },
);
const NeuralSphere = dynamic<NeuralSphereProps>(
  () =>
    import('../components/three/NeuralSphere').then(
      (mod: { default: ComponentType<NeuralSphereProps> }) => mod.default,
    ),
  { ssr: false },
);

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
  { step: '01', title: 'Intake & discovery', desc: 'Share your goals and current systems' },
  { step: '02', title: 'Systems blueprint', desc: 'Receive a detailed architecture plan' },
  { step: '03', title: 'Deploy & scale', desc: 'Launch, tune, and grow with AI' },
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
    <div className="antialiased min-h-screen bg-black text-brand-light">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Navbar */}
      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="/intake" />

      <main id="main-content">
        {/* Hero Section with 3D Neural Sphere */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* 3D Background Canvas */}
          <div className="absolute inset-0 z-0">
            <Scene cameraPosition={[0, 0, 7]}>
              <NeuralSphere color="#c0ff6b" secondaryColor="#22d3ee" particleCount={600} />
            </Scene>
          </div>

          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black pointer-events-none z-[1]" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <FadeIn>
              {/* AI Status Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-brand-lime/30 bg-brand-lime/5">
                <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse-slow" />
                <span className="text-xs font-mono uppercase tracking-widest text-brand-lime">
                  AI Systems Online
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                Automate Smarter.
                <br className="hidden sm:block" />
                <GlowText as="span" color="lime">
                  Grow Faster.
                </GlowText>
              </h1>

              <p className="text-lg md:text-xl leading-relaxed text-brand-light/80 max-w-2xl mx-auto mb-10">
                Design, deploy, and run AI systems for support, content, data, workflows, and voice.
                One intake, a clear systems blueprint, and a phased rollout.
              </p>

              {/* Scanning line effect */}
              <ScanLine color="lime" className="max-w-md mx-auto mb-10" />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button as="link" href="/intake" variant="primary" size="lg">
                  Start the intake
                </Button>
                <Button as="link" href="#features" variant="outline" size="lg">
                  Explore features
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[2]" />
        </section>

        {/* Features Section */}
        <Section id="features" className="py-28">
          <FadeIn>
            <GlowText
              as="h2"
              color="lime"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            >
              Core Systems We Deploy
            </GlowText>
            <p className="text-brand-gray max-w-2xl mb-12 leading-relaxed">
              Agency on the front, configurable platform on the back.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <HoloCard key={feature.title} className="p-6" glowColor="lime" showScanLine>
                <h3 className="font-semibold text-white mb-2 group-hover:text-brand-lime transition-colors">
                  {feature.title}
                </h3>
                <p className="text-brand-gray text-sm leading-relaxed">{feature.description}</p>
              </HoloCard>
            ))}
          </StaggerContainer>
        </Section>

        {/* How It Works Section */}
        <Section id="use-cases" gradient="subtle" className="py-24">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-brand-light">
              How it works
            </h2>
            <p className="text-brand-gray mb-12 max-w-2xl leading-relaxed font-mono text-sm">
              INTAKE → BLUEPRINT → DEPLOY → ITERATE
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <HoloCard key={s.step} className="p-8" glowColor="cyan">
                <span className="block text-6xl font-bold text-brand-lime/20 mb-2 font-mono">
                  {s.step}
                </span>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-brand-gray text-sm">{s.desc}</p>
              </HoloCard>
            ))}
          </StaggerContainer>
        </Section>

        {/* Testimonials Section */}
        <Section id="testimonials" className="py-24">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-brand-light">
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-brand-light">
              Pricing
            </h2>
            <p className="text-brand-gray mb-12 max-w-2xl leading-relaxed">
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
        <Section className="py-28 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-radial from-brand-lime/5 via-transparent to-transparent pointer-events-none" />

          <FadeIn className="text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to level up your workflow?
            </h2>
            <p className="text-brand-gray mb-8 leading-relaxed max-w-xl mx-auto">
              Share a bit about your team and goals — we&apos;ll return a concrete blueprint.
            </p>

            <ScanLine color="lime" className="max-w-xs mx-auto mb-8" />

            <Button
              as="link"
              href="/intake"
              variant="primary"
              size="lg"
              className="animate-glow-pulse"
            >
              Start the intake
            </Button>
          </FadeIn>
        </Section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ChatWidget
        apiUrl={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/v1/public/chat'}
        title="Ask about Soft Systems Studio"
        greeting="Hi! I'm an AI assistant. Ask me anything about our platform, features, pricing, or how to get started!"
        primaryColor="#a3e635"
        position="bottom-right"
      />
    </div>
  );
}
