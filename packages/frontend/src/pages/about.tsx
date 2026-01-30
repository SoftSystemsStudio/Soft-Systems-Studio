import React from 'react';
import Head from 'next/head';
import { Navbar, Footer, Section, HoloCard } from '../components/ui';
import { FadeIn, StaggerContainer } from '../components/motion';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

const TEAM_MEMBERS = [
  {
    name: 'Your Name',
    role: 'Founder & Lead Developer',
    bio: 'Building AI solutions for local service businesses since 2019. Previously worked with Fortune 500 companies on automation projects.',
    initials: 'YN',
  },
];

const VALUES = [
  {
    title: 'Results Over Features',
    description: 'We measure success by jobs booked and calls answered, not by features shipped.',
    icon: '📈',
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden fees, no surprises. You know exactly what you pay and what you get.',
    icon: '💰',
  },
  {
    title: 'Built for Small Business',
    description:
      "We understand local service businesses because we've worked with hundreds of them.",
    icon: '🏪',
  },
  {
    title: 'Human Support',
    description: 'AI handles your calls, but real humans handle your questions and concerns.',
    icon: '🤝',
  },
];

const STATS = [
  { value: '50+', label: 'Businesses Served' },
  { value: '10,000+', label: 'Calls Answered by AI' },
  { value: '95%', label: 'Client Satisfaction' },
  { value: '2019', label: 'Founded' },
];

export default function About() {
  return (
    <div className="antialiased min-h-screen bg-[#050505] text-gray-200 selection:bg-lime-400 selection:text-black">
      <Head>
        <title>About Us | Soft Systems Studio - AI for Local Businesses</title>
        <meta
          name="description"
          content="Learn about Soft Systems Studio - the team building AI receptionists and websites for plumbers, dentists, contractors, and local service businesses."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://softsystemsstudiollc.com/about" />
      </Head>

      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-lime-400 focus:text-black focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="/intake" />

      <main id="main-content">
        {/* Hero Section */}
        <Section className="pt-24 pb-16">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                We Help Local Businesses
                <span className="block text-lime-400">Never Miss a Call Again</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Founded in 2019, Soft Systems Studio builds AI receptionists and websites
                specifically for plumbers, dentists, contractors, and local service businesses.
                We&apos;re not a massive agency — we&apos;re a focused team that understands your
                challenges.
              </p>
            </div>
          </FadeIn>
        </Section>

        {/* Stats */}
        <Section className="py-12 border-y border-white/10">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <FadeIn key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-lime-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </FadeIn>
            ))}
          </StaggerContainer>
        </Section>

        {/* Our Story */}
        <Section className="py-24">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Soft Systems Studio started when we noticed a pattern: local service businesses —
                  plumbers, dentists, HVAC contractors — were losing thousands of dollars every
                  month simply because they couldn&apos;t answer the phone while on job sites.
                </p>
                <p>
                  We&apos;d seen enterprise companies use AI for customer service, but the solutions
                  were either too expensive or too complicated for small businesses. So we built
                  something different: AI receptionists that actually work for real businesses, at
                  prices real businesses can afford.
                </p>
                <p>
                  Today, our AI systems answer thousands of calls for businesses across the country.
                  We&apos;ve helped contractors book jobs while they&apos;re on ladders, dentists
                  schedule appointments while they&apos;re with patients, and plumbers capture leads
                  while they&apos;re under sinks.
                </p>
                <p className="text-white font-medium">
                  Our mission is simple: help local service businesses grow by making sure they
                  never miss another customer.
                </p>
              </div>
            </FadeIn>
          </div>
        </Section>

        {/* Values */}
        <Section className="py-24 section-elevated">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 text-center">What We Believe</h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {VALUES.map((value) => (
              <HoloCard key={value.title} className="p-6" glowColor="lime">
                <div className="flex items-start gap-4">
                  <span className="text-3xl" aria-hidden="true">
                    {value.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </HoloCard>
            ))}
          </StaggerContainer>
        </Section>

        {/* Team */}
        <Section className="py-24">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Meet the Team</h2>
            <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
              A small, focused team dedicated to helping local businesses grow.
            </p>
          </FadeIn>
          <StaggerContainer className="flex justify-center">
            {TEAM_MEMBERS.map((member) => (
              <HoloCard key={member.name} className="p-8 text-center max-w-sm" glowColor="lime">
                <div className="w-20 h-20 rounded-full bg-lime-400/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-lime-400">{member.initials}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-lime-400 text-sm mb-4">{member.role}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{member.bio}</p>
              </HoloCard>
            ))}
          </StaggerContainer>
          <FadeIn className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Want to work with us?{' '}
              <a
                href="mailto:hello@softsystemsstudiollc.com"
                className="text-lime-400 hover:underline"
              >
                Get in touch
              </a>
            </p>
          </FadeIn>
        </Section>

        {/* CTA */}
        <Section className="py-24 section-elevated">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Stop Missing Calls?</h2>
            <p className="text-gray-300 mb-8">
              Get a free quote and see how much you could save with an AI receptionist.
            </p>
            <a
              href="/intake"
              className="inline-block px-10 py-5 bg-lime-400 text-black font-bold text-lg rounded-xl hover:bg-lime-300 transition-all duration-300 hover:scale-105 shadow-lg shadow-lime-400/20"
            >
              Get Your Free Quote →
            </a>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
