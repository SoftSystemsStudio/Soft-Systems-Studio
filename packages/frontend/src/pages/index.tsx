import React from 'react';
import Head from 'next/head';
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
import { ProjectEstimator } from '../components/estimator';
import env from '../lib/env';

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
  { label: 'Services', href: '#services' },
  { label: 'How We Work', href: '#how-we-work' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const SERVICES = [
  {
    title: 'AI Voice Reception',
    description:
      'Intelligent phone systems that capture leads, book meetings, and route calls seamlessly.',
    category: 'AI Automation',
  },
  {
    title: 'AI Support & Chat Systems',
    description:
      'Automated support across web chat, email, and SMS with smart handoffs to your team.',
    category: 'AI Automation',
  },
  {
    title: 'Workflow Automation',
    description:
      'Streamline repetitive tasks with custom AI workflows that save time and reduce errors.',
    category: 'AI Automation',
  },
  {
    title: 'Modern Website Design',
    description:
      'Beautiful, responsive websites built with the latest technologies to showcase your brand.',
    category: 'Web Design',
  },
  {
    title: 'E-Commerce Solutions',
    description:
      'Full-featured online stores with seamless checkout, inventory management, and analytics.',
    category: 'Web Design',
  },
  {
    title: 'Custom Web Applications',
    description: 'Tailored web apps that solve your unique business challenges and scale with you.',
    category: 'Web Design',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Discovery Call',
    desc: 'We learn about your business, goals, and challenges',
  },
  {
    step: '02',
    title: 'Custom Proposal',
    desc: 'Receive a tailored plan with timeline and transparent pricing',
  },
  {
    step: '03',
    title: 'Build & Launch',
    desc: 'We build your solution and support you every step of the way',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Our new website looks amazing and the AI receptionist saves us hours every week',
    author: 'Sarah M.',
    role: 'Small Business Owner',
  },
  {
    quote: 'Professional team that really listens. They delivered exactly what we needed',
    author: 'James K.',
    role: 'Marketing Director',
  },
  {
    quote: 'Best investment we made this year. Their automation cut our support tickets in half',
    author: 'Michelle R.',
    role: 'Operations Manager',
  },
];

const PRICING_PLANS = [
  {
    name: 'Website Package',
    price: 'Starting at $3,500',
    description: 'Professional web presence',
    features: [
      'Custom design & development',
      'Mobile responsive',
      'SEO optimized',
      'Content management system',
    ],
    ctaText: 'Learn more',
  },
  {
    name: 'AI Automation',
    price: 'Starting at $5,000',
    description: 'Intelligent business automation',
    features: [
      'AI voice reception or chat support',
      'Custom workflow automation',
      'System integrations',
      'Training & ongoing support',
    ],
    highlighted: true,
    badge: 'Popular',
    ctaText: 'Get started',
  },
  {
    name: 'Complete Solution',
    price: 'Custom Quote',
    description: 'Website + AI automation',
    features: [
      'Everything combined',
      'Integrated experience',
      'Priority development',
      'Dedicated partnership',
    ],
    ctaText: "Let's talk",
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
    title: 'Full-Stack Expertise',
    description:
      'From AI systems to beautiful frontends, we handle every layer of your technology.',
  },
  {
    title: 'Modern Tech Stack',
    description: 'Built with Next.js, TypeScript, and latest AI models for performance and scale.',
  },
  {
    title: 'Transparent Process',
    description: 'Clear timelines, honest pricing, and regular updates throughout the project.',
  },
  {
    title: 'Ongoing Partnership',
    description: "We don't disappear after launch. Continuous support and improvements included.",
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

export default function Home() {
  return (
    <div className="antialiased min-h-screen bg-black text-brand-light">
      <Head>
        <title>Soft Systems Studio - AI Automation & Web Design</title>
        <meta
          name="description"
          content="Your technology partner for AI automation and modern web design. We build intelligent systems and beautiful websites that help your business grow."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://softsystemsstudiollc.com/" />
        <meta property="og:title" content="Soft Systems Studio - AI Automation & Web Design" />
        <meta
          property="og:description"
          content="Your technology partner for AI automation and modern web design. We build intelligent systems and beautiful websites that help your business grow."
        />
        <meta property="og:url" content="https://softsystemsstudiollc.com/" />
        <meta property="og:type" content="website" />
      </Head>
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
              {/* Tech Partner Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-brand-lime/30 bg-brand-lime/5">
                <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse-slow" />
                <span className="text-xs font-mono uppercase tracking-widest text-brand-lime">
                  Your Technology Partner
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                Smart Technology.
                <br className="hidden sm:block" />
                <GlowText as="span" color="lime">
                  Real Results.
                </GlowText>
              </h1>

              <p className="text-lg md:text-xl leading-relaxed text-brand-light/80 max-w-2xl mx-auto mb-10">
                We build AI automations and modern websites that help businesses work smarter and
                grow faster. Your vision, our expertise.
              </p>

              {/* Scanning line effect */}
              <ScanLine color="lime" className="max-w-md mx-auto mb-10" />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button as="link" href="/intake" variant="primary" size="lg">
                  Get Started
                </Button>
                <Button
                  as="link"
                  href="/demo"
                  variant="outline"
                  size="lg"
                  className="border-brand-lime/50 text-brand-lime hover:bg-brand-lime/10"
                >
                  See Our Work
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[2]" />
        </section>

        {/* Stats Bar */}
        <Section className="py-16 border-y border-brand-lime/10">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <FadeIn key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-brand-lime mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-brand-gray uppercase tracking-wide">{stat.label}</div>
              </FadeIn>
            ))}
          </StaggerContainer>
        </Section>

        {/* Services Section */}
        <Section id="services" className="py-28">
          <FadeIn>
            <GlowText
              as="h2"
              color="lime"
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            >
              What We Build
            </GlowText>
            <p className="text-brand-gray max-w-2xl mb-12 leading-relaxed">
              Two core service areas designed to transform your business: AI automations that save
              time and websites that convert visitors.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <HoloCard
                key={service.title}
                className="p-6"
                glowColor={service.category === 'AI Automation' ? 'lime' : 'cyan'}
                showScanLine
              >
                <div className="inline-block px-3 py-1 mb-3 text-xs font-mono uppercase tracking-widest rounded-full border border-brand-lime/30 bg-brand-lime/5 text-brand-lime">
                  {service.category}
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-brand-lime transition-colors">
                  {service.title}
                </h3>
                <p className="text-brand-gray text-sm leading-relaxed">{service.description}</p>
              </HoloCard>
            ))}
          </StaggerContainer>
        </Section>

        {/* Why Choose Us Section */}
        <Section className="py-24 bg-gradient-to-b from-black to-brand-dark">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-light text-center">
              Why Choose Us
            </h2>
            <p className="text-brand-gray mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              What makes Soft Systems Studio different
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((item) => (
              <HoloCard key={item.title} className="p-6" glowColor="lime">
                <h3 className="font-semibold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-brand-gray text-sm leading-relaxed">{item.description}</p>
              </HoloCard>
            ))}
          </StaggerContainer>
        </Section>

        {/* Technology Stack Section */}
        <Section className="py-24">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-light text-center">
              Built with Best-in-Class Tools
            </h2>
            <p className="text-brand-gray mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              We use modern, proven technologies to build fast, secure, and scalable solutions
            </p>
          </FadeIn>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="px-6 py-3 rounded-lg border border-brand-lime/20 bg-brand-lime/5 hover:border-brand-lime/40 hover:bg-brand-lime/10 transition-all duration-300"
              >
                <span className="text-brand-light font-medium">{tech.name}</span>
                <span className="text-brand-gray text-xs ml-2">· {tech.category}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* AI Project Estimator Section */}
        <Section id="estimator" gradient="dark" className="py-28">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-slow" />
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  AI-Powered Estimator
                </span>
              </div>
              <GlowText
                as="h2"
                color="cyan"
                className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              >
                Get Your Custom Estimate
              </GlowText>
              <p className="text-brand-gray max-w-2xl mx-auto leading-relaxed">
                Answer a few quick questions and receive an instant, personalized project estimate
                powered by AI
              </p>
            </div>
          </FadeIn>

          <ProjectEstimator />
        </Section>

        {/* How We Work Section */}
        <Section id="how-we-work" gradient="subtle" className="py-24">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-brand-light">
              How We Work
            </h2>
            <p className="text-brand-gray mb-12 max-w-2xl leading-relaxed">
              A simple, transparent process from first conversation to successful launch.
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
              What Our Clients Say
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
              Transparent Pricing
            </h2>
            <p className="text-brand-gray mb-12 max-w-2xl leading-relaxed">
              Clear packages tailored to your needs. No hidden fees, no surprises.
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

        {/* FAQ Section */}
        <Section id="faq" className="py-24">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-light text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-brand-gray mb-12 max-w-2xl leading-relaxed text-center mx-auto">
              Everything you need to know about working with us
            </p>
          </FadeIn>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, index) => (
              <HoloCard key={index} className="p-6" glowColor="cyan">
                <h3 className="font-semibold text-white mb-3 text-lg">{faq.question}</h3>
                <p className="text-brand-gray leading-relaxed">{faq.answer}</p>
              </HoloCard>
            ))}
          </div>

          <FadeIn className="text-center mt-12">
            <p className="text-brand-gray mb-4">Still have questions?</p>
            <Button as="link" href="/intake" variant="outline" size="lg">
              Schedule a Free Discovery Call
            </Button>
          </FadeIn>
        </Section>

        {/* Final CTA Section */}
        <Section className="py-28 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-radial from-brand-lime/5 via-transparent to-transparent pointer-events-none" />

          <FadeIn className="text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-brand-gray mb-8 leading-relaxed max-w-xl mx-auto">
              Let&apos;s talk about your goals and build something amazing together.
            </p>

            <ScanLine color="lime" className="max-w-xs mx-auto mb-8" />

            <Button
              as="link"
              href="/intake"
              variant="primary"
              size="lg"
              className="animate-glow-pulse"
            >
              Get Started Today
            </Button>
          </FadeIn>
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
