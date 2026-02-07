import type { Metadata } from 'next';
import { Navbar, Footer, Section } from '@/components/ui';
import { FadeIn, StaggerContainer } from '@/components/motion';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Soft Systems Studio - the team building AI receptionists and websites for plumbers, dentists, contractors, and local service businesses.',
};

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

// TODO: Replace with real team member info
const TEAM_MEMBERS = [
  {
    name: 'Austin Hodges',
    role: 'Founder & Lead Developer',
    bio: 'Building AI solutions for local service businesses. Previously worked with Fortune 500 companies on automation projects.',
    initials: 'AH',
  },
];

const VALUES = [
  {
    title: 'Results Over Features',
    description: 'We measure success by jobs booked and calls answered, not by features shipped.',
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden fees, no surprises. You know exactly what you pay and what you get.',
  },
  {
    title: 'Built for Small Business',
    description:
      "We understand local service businesses because we've worked with them firsthand.",
  },
  {
    title: 'Human Support',
    description: 'AI handles your calls, but real humans handle your questions and concerns.',
  },
];

export default function AboutPage() {
  return (
    <div className="antialiased min-h-screen bg-[#050505] text-gray-200 selection:bg-lime-400 selection:text-black">
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-lime-400 focus:text-black focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="/intake" />
      <main id="main-content">
        <Section className="pt-24 pb-16">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                We Help Local Businesses
                <span className="block text-lime-400">Never Miss a Call Again</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Soft Systems Studio builds AI receptionists and websites specifically for plumbers,
                dentists, contractors, and local service businesses. We&apos;re not a massive agency
                — we&apos;re a focused team that understands your challenges.
              </p>
            </div>
          </FadeIn>
        </Section>

        <Section className="py-24">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Soft Systems Studio started when we noticed a pattern: local service businesses —
                  plumbers, dentists, HVAC contractors — were losing thousands of dollars every month
                  simply because they couldn&apos;t answer the phone while on job sites.
                </p>
                <p>
                  We&apos;d seen enterprise companies use AI for customer service, but the solutions
                  were either too expensive or too complicated for small businesses. So we built
                  something different: AI receptionists that actually work for real businesses, at
                  prices real businesses can afford.
                </p>
                <p className="text-white font-medium">
                  Our mission is simple: help local service businesses grow by making sure they never
                  miss another customer.
                </p>
              </div>
            </FadeIn>
          </div>
        </Section>

        <Section className="py-24 section-elevated">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 text-center">What We Believe</h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl border border-white/10 bg-white/5"
              >
                <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </StaggerContainer>
        </Section>

        <Section className="py-24">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Meet the Team</h2>
            <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
              A small, focused team dedicated to helping local businesses grow.
            </p>
          </FadeIn>
          <StaggerContainer className="flex justify-center">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="p-8 text-center max-w-sm rounded-xl border border-white/10 bg-white/5"
              >
                <div className="w-20 h-20 rounded-full bg-lime-400/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-lime-400">{member.initials}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-lime-400 text-sm mb-4">{member.role}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{member.bio}</p>
              </div>
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
              Get Your Free Quote
            </a>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
