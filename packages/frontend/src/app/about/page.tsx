import type { Metadata } from 'next';
import { Navbar, Footer, Section } from '@/components/ui';
import { FadeIn, StaggerContainer } from '@/components/motion';

export const metadata: Metadata = {
  title: 'About Us | Soft Systems Studio',
  description:
    'Digital products, AI automation, and websites for entrepreneurs who refuse to waste time. Built by Austin Hodges.',
};

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/#digital-products' },
  { label: 'Web Design', href: '/#web-design' },
  { label: 'Contact', href: '/intake' },
];

const VALUES = [
  {
    title: 'Ship Fast, Iterate Faster',
    description:
      'No 6-month development cycles. We build in days, launch immediately, and improve based on real feedback.',
    emoji: '⚡',
  },
  {
    title: 'No Fluff, No Filler',
    description:
      "Every template, every tool, every line of code serves a purpose. We cut everything that doesn't help you make money or save time.",
    emoji: '🎯',
  },
  {
    title: 'AI-Assisted, Human-Approved',
    description:
      'We use AI to work faster, but every product is reviewed, tested, and refined by humans who actually use this stuff.',
    emoji: '🤖',
  },
  {
    title: 'Transparent by Default',
    description:
      'Clear pricing. No hidden fees. No $997 courses. 30-day money-back guarantee on everything. Simple.',
    emoji: '💎',
  },
];

const TIMELINE = [
  {
    year: '2019',
    title: 'Started Building',
    description: 'Began helping local businesses with automation and web design',
  },
  {
    year: '2023',
    title: 'AI Pivot',
    description: 'Integrated AI tools to 10x speed and quality of work',
  },
  {
    year: '2026',
    title: 'Digital Products Launch',
    description: 'Released templates and systems to help entrepreneurs move faster',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-lime-900/20 via-transparent to-transparent pointer-events-none" />

      <Navbar items={NAV_ITEMS} ctaLabel="Get a Quote" ctaHref="/intake" />

      <div className="antialiased min-h-screen bg-black text-gray-100 selection:bg-lime-400 selection:text-black overflow-x-hidden">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-lime-400 focus:text-black focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>

      <main id="main-content" className="relative z-10">
        {/* Hero */}
        <Section className="pt-32 pb-16">
          <FadeIn>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-medium mb-8">
                👋 About Soft Systems Studio
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                Built for Entrepreneurs
                <br />
                <span className="bg-gradient-to-r from-lime-400 via-cyan-400 to-pink-500 text-transparent bg-clip-text">
                  Who Move Fast
                </span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Digital products, AI automation, and websites for people who are tired of wasting
                time on courses, templates that don't work, and agencies that take months to
                deliver.
              </p>
            </div>
          </FadeIn>
        </Section>

        {/* Story */}
        <Section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-900/5 to-transparent pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-8">The Story</h2>
              <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
                <p>
                  I started Soft Systems Studio in 2019 because I was tired of watching entrepreneurs
                  waste months (and thousands of dollars) on things that should take days.
                </p>
                <p>
                  I'd spent years building automation for Fortune 500 companies. The tools were
                  powerful, but they were locked behind $50k+ enterprise contracts. Small businesses
                  and solopreneurs couldn't access them.
                </p>
                <p>
                  Then AI happened. Suddenly, I could build in a weekend what used to take a team of
                  developers 6 months. I could create templates and systems that actually worked,
                  not generic Notion docs with placeholder text.
                </p>
                <p className="text-white font-bold">
                  So I did. And now I'm packaging everything I've learned into products, websites,
                  and automation you can use immediately.
                </p>
                <p className="text-lime-400 font-medium">
                  No courses. No coaching. Just tools that work.
                </p>
              </div>
            </FadeIn>
          </div>
        </Section>

        {/* Timeline */}
        <Section className="py-24 relative">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">
              Timeline
            </h2>
          </FadeIn>

          <div className="max-w-4xl mx-auto">
            <StaggerContainer className="space-y-8">
              {TIMELINE.map((item, idx) => (
                <div
                  key={item.year}
                  className="relative pl-8 border-l-2 border-lime-400/30 hover:border-lime-400 transition-colors"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-lime-400 rounded-full" />
                  <div className="text-lime-400 font-bold text-sm mb-1">{item.year}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>

        {/* Values */}
        <Section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-900/5 to-transparent pointer-events-none" />

          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
              What We Believe
            </h2>
            <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
              The principles that guide everything we build
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto relative z-10">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-lime-400/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4">{value.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </StaggerContainer>
        </Section>

        {/* Team */}
        <Section className="py-24 relative">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
              The Team
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
              Small team, big output. No bureaucracy, no meetings, just shipping.
            </p>
          </FadeIn>

          <div className="max-w-2xl mx-auto">
            <FadeIn>
              <div className="p-10 text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime-400 to-cyan-400 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-black text-black">AH</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Austin Hodges</h3>
                <p className="text-lime-400 font-medium mb-4">Founder & Builder</p>
                <p className="text-gray-300 leading-relaxed max-w-lg mx-auto mb-6">
                  Former enterprise automation consultant turned indie builder. I use AI to build
                  10x faster, ship daily, and help entrepreneurs stop wasting time on things that
                  should be simple.
                </p>
                <div className="flex justify-center gap-4 text-sm text-gray-400">
                  <span>🛠️ Building in public</span>
                  <span>⚡ Shipping fast</span>
                  <span>🎯 Zero fluff</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn className="text-center mt-12">
            <p className="text-gray-500 text-sm mb-4">Want to work together?</p>
            <a
              href="/intake"
              className="inline-block px-8 py-4 border-2 border-lime-400/50 text-lime-400 font-bold rounded-lg hover:bg-lime-400/10 transition-all duration-300"
            >
              Start a Project
            </a>
          </FadeIn>
        </Section>

        {/* What We Offer */}
        <Section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 via-transparent to-pink-900/10 pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">
                What We Do
              </h2>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-white mb-3">Digital Products</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Templates, launch kits, and systems for entrepreneurs
                </p>
                <a
                  href="/#digital-products"
                  className="text-lime-400 text-sm font-medium hover:underline"
                >
                  Browse Products →
                </a>
              </div>

              <div className="p-6 rounded-2xl border border-lime-400/30 bg-gradient-to-br from-lime-400/5 to-transparent backdrop-blur text-center scale-105">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-white mb-3">Website Design</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Modern sites built in 48hr-2 weeks, starting at $799
                </p>
                <a
                  href="/#web-design"
                  className="text-lime-400 text-sm font-medium hover:underline"
                >
                  See Packages →
                </a>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-3">AI Automation</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Custom AI solutions for service businesses
                </p>
                <a
                  href="/#ai-services"
                  className="text-lime-400 text-sm font-medium hover:underline"
                >
                  Learn More →
                </a>
              </div>
            </StaggerContainer>
          </div>
        </Section>

        {/* CTA */}
        <Section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-lime-900/20 pointer-events-none" />

          <FadeIn>
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to Move Fast?
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Browse products, start a website project, or get AI automation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://softsystemsstudioco.gumroad.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-10 py-5 bg-lime-400 text-black font-bold text-lg rounded-lg hover:bg-lime-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/50"
                >
                  Shop Products
                </a>
                <a
                  href="/intake"
                  className="inline-block px-10 py-5 border-2 border-white/20 text-white font-bold text-lg rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Start a Project
                </a>
              </div>
            </div>
          </FadeIn>
        </Section>
      </main>

      <Footer />
      </div>
    </>
  );
}
