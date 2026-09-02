'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar, Footer, Section } from '@/components/ui';
import { FadeIn, StaggerContainer } from '@/components/motion';
import { ChatWidget } from '@softsystems/ui-components';
import VoiceDemo from '@/components/VoiceDemo';
import {
  OrganizationSchema,
  LocalBusinessSchema,
  FAQSchema,
  WebSiteSchema,
} from '@/components/StructuredData';
import { BUILD_FEE, RETAINER_RANGE, SERVICE_AREA_LABEL } from '@/lib/business';
import env from '@/lib/env';

const InteractiveFAQ = dynamic(() => import('@/components/sentient/faq/InteractiveFAQ'), {
  ssr: false,
});

const NAV_ITEMS = [
  { label: 'Website Build', href: '#website' },
  { label: 'AI Receptionist', href: '#ai-receptionist' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'About', href: '/about' },
];

const WEBSITE_FEATURES = [
  'Custom design built around your business and brand',
  'Mobile-responsive, fast-loading',
  'Contact / intake form wired straight to your email',
  'Basic on-page SEO',
  'Launched and ready to go live',
];

const PORTFOLIO_SITES = [
  {
    name: 'NeuralFit',
    type: 'SaaS Platform',
    description: 'AI-powered fitness tracking app',
    gradient: 'from-purple-600 via-fuchsia-600 to-cyan-500',
    tech: ['Next.js', 'Python', 'PostgreSQL'],
    url: '/demo/neuralfit',
  },
  {
    name: 'Apex Plumbing',
    type: 'Service Business',
    description: 'Emergency plumbing services',
    gradient: 'from-orange-600 to-red-700',
    tech: ['React', 'Tailwind', 'Vercel'],
    url: '/demo/apex-plumbing',
  },
  {
    name: 'VoltStore',
    type: 'E-commerce',
    description: 'Premium gaming peripherals store',
    gradient: 'from-lime-500 via-green-600 to-emerald-700',
    tech: ['Next.js', 'Stripe', 'Shopify'],
    url: '/demo/voltstore',
  },
  {
    name: 'Creator Studio',
    type: 'Personal Brand',
    description: 'Portfolio for developers and creators',
    gradient: 'from-pink-500 via-rose-600 to-orange-600',
    tech: ['Next.js', 'MDX', 'Framer'],
    url: '/demo/creator-studio',
  },
];

const FAQS = [
  {
    question: 'How long does a website build take?',
    answer:
      "It depends on scope, so I'll give you a specific date during your intake call — before you commit to anything, not after.",
  },
  {
    question: 'Do you use AI to build websites?',
    answer:
      "Yes — I use AI tools to move faster, but every site is personally designed and reviewed by me before it ships. It's just me; there's no team of designers behind the scenes.",
  },
  {
    question: 'What if I need changes after launch?',
    answer: `A monthly retainer (${RETAINER_RANGE}) covers hosting, updates, and ongoing support after launch. Without a retainer, changes are quoted individually.`,
  },
  {
    question: 'Can I see examples of your work?',
    answer:
      "Check out the demo portfolio below. Soft Systems Studio is a new studio — I don't have real client sites to show yet, so these are demos I built myself to show what's possible, clearly labeled as demos.",
  },
  {
    question: 'Do you offer hosting?',
    answer: `Hosting is included with a retainer (${RETAINER_RANGE}). Without one, you're welcome to host the site wherever you like.`,
  },
  {
    question: 'How much does the AI receptionist cost?',
    answer:
      "It's quoted alongside a website build or retainer, not sold on its own — ask when you request a quote. You can try the browser demo free, right now, no commitment.",
  },
  {
    question: 'Where are you located, and who do you work with?',
    answer: `Based near Phenix City, Alabama. I work with local service businesses in ${SERVICE_AREA_LABEL} — and remotely with businesses outside that area.`,
  },
];

export default function Home() {
  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <LocalBusinessSchema />
      <WebSiteSchema />
      <FAQSchema faqs={FAQS} />

      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lime-900/20 via-transparent to-transparent pointer-events-none" />

      <Navbar items={NAV_ITEMS} ctaLabel="Get a Quote" ctaHref="/intake" />

      <div className="antialiased min-h-screen bg-black text-gray-100 selection:bg-lime-400 selection:text-black overflow-x-hidden">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>

        <main id="main-content" className="relative z-10">
          {/* Hero Section */}
          <Section className="pt-32 pb-24">
            <FadeIn>
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  {/* Animated badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-sm font-medium mb-8 animate-pulse">
                    <span className="w-2 h-2 bg-lime-400 rounded-full animate-ping" />
                    Website Builds · AI Receptionist Demo · Phenix City, AL &amp; Columbus, GA
                  </div>

                  <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                    Websites &amp; AI Receptionists
                    <br />
                    <span className="bg-gradient-to-r from-lime-400 via-cyan-400 to-pink-500 text-transparent bg-clip-text animate-gradient">
                      For Local Businesses.
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-10 max-w-3xl mx-auto font-light">
                    A flat {BUILD_FEE} website build and a live, browser-based AI receptionist demo,
                    built by one person for service businesses in {SERVICE_AREA_LABEL}.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/intake"
                      className="group relative inline-block px-8 py-4 bg-lime-400 text-black font-bold text-lg rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/50"
                    >
                      <span className="relative z-10">Get a Quote</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-300 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                    <a
                      href="#ai-receptionist"
                      className="inline-block px-8 py-4 border-2 border-lime-400/50 text-lime-400 font-bold text-lg rounded-lg hover:bg-lime-400/10 transition-all duration-300"
                    >
                      Try the AI Receptionist →
                    </a>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
                  <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                    <div className="text-3xl font-bold text-lime-400 mb-2">{BUILD_FEE}</div>
                    <div className="text-sm text-gray-400">Flat Website Build</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                    <div className="text-3xl font-bold text-pink-400 mb-2">$150+</div>
                    <div className="text-sm text-gray-400">Monthly Retainers</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">Free</div>
                    <div className="text-sm text-gray-400">AI Receptionist Demo</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </Section>

          {/* Website Build Section */}
          <Section id="website" className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 via-transparent to-pink-900/10 pointer-events-none" />

            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  One Website Build. One Price.
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {BUILD_FEE} flat. No tiers, no upsells disguised as &quot;packages.&quot;
                  Everything a local service business needs to launch a professional site.
                </p>
              </div>
            </FadeIn>

            <FadeIn className="max-w-2xl mx-auto relative z-10">
              <div className="relative p-8 md:p-10 rounded-2xl border border-lime-400/40 bg-white/5 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-cyan-400/10 opacity-50 rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-black text-lime-400">{BUILD_FEE}</span>
                    <span className="text-gray-400">one-time</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {WEBSITE_FEATURES.map((feature) => (
                      <li key={feature} className="text-gray-300 flex items-start gap-3">
                        <span className="text-lime-400 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/intake"
                    className="block text-center px-6 py-3 rounded-lg font-bold bg-lime-400 text-black hover:bg-lime-300 hover:scale-105 transition-all duration-300"
                  >
                    Get Started
                  </a>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Want ongoing updates after launch?{' '}
                    <a href="#retainer" className="text-lime-400 hover:underline">
                      Retainers start at $150/month.
                    </a>
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Process */}
            <FadeIn>
              <div className="max-w-4xl mx-auto text-center mt-20">
                <h3 className="text-2xl font-bold text-white mb-8">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-lime-400/10 border-2 border-lime-400 flex items-center justify-center text-lime-400 font-black text-xl mb-4 mx-auto">
                      1
                    </div>
                    <h4 className="font-bold text-white mb-2">Quick Intake</h4>
                    <p className="text-gray-400 text-sm">
                      Tell me about your business, brand, and goals in a short form
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-pink-400/10 border-2 border-pink-400 flex items-center justify-center text-pink-400 font-black text-xl mb-4 mx-auto">
                      2
                    </div>
                    <h4 className="font-bold text-white mb-2">I Build It</h4>
                    <p className="text-gray-400 text-sm">
                      I design and build the site myself, using AI to move fast
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-cyan-400/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-black text-xl mb-4 mx-auto">
                      3
                    </div>
                    <h4 className="font-bold text-white mb-2">You Launch</h4>
                    <p className="text-gray-400 text-sm">
                      Approve the final result, go live, and start getting customers
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </Section>

          {/* Retainer Section */}
          <Section id="retainer" className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none" />
            <FadeIn>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Keep It Running</h2>
                <p className="text-xl text-gray-300 mb-10">
                  An optional monthly retainer covers hosting, updates, and ongoing support after
                  launch.
                </p>
                <div className="inline-block p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur mb-8">
                  <div className="text-4xl md:text-5xl font-black text-cyan-400 mb-2">
                    {RETAINER_RANGE}
                  </div>
                  <p className="text-gray-400 text-sm">Priced to scope — $150/month to start</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-10">
                  {[
                    'Hosting & uptime monitoring',
                    'Content and text updates',
                    'Small design tweaks',
                    'Priority email support',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-cyan-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="/intake"
                  className="inline-block px-8 py-4 border-2 border-cyan-400/50 text-cyan-400 font-bold rounded-lg hover:bg-cyan-400/10 transition-all duration-300"
                >
                  Ask About a Retainer
                </a>
              </div>
            </FadeIn>
          </Section>

          {/* AI Receptionist Section */}
          <Section id="ai-receptionist" className="py-24 relative">
            <FadeIn>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Try the AI Receptionist
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  A live, browser-based voice demo — talk to it right now, no signup, no phone call.
                </p>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">AI Receptionist Demo</h3>
                  <p className="text-gray-300 mb-6">
                    This is a working demo of what an AI phone receptionist could sound like for
                    your business — it&apos;s not wired up to a real phone line yet, so what you
                    hear today is exactly what it is: a demo, not a live service.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-6">
                    <span>✓ Real voice, real AI — not a script</span>
                    <span>✓ Try it in your browser right now</span>
                    <span>✓ Ends automatically after 3 minutes</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <VoiceDemo />
                    <a
                      href="/intake"
                      className="inline-block px-8 py-4 border-2 border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                      Get Free Quote
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Pricing is quoted alongside a website build or retainer — ask when you request a
                  quote.
                </p>
              </div>
            </FadeIn>
          </Section>

          {/* Portfolio Section */}
          <Section id="portfolio" className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none" />

            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  See What I Can Build
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Soft Systems Studio is a new studio — I don&apos;t have real client sites to show
                  yet, so these four demos are what I&apos;ve built to show what&apos;s possible.
                  Clearly labeled, not real businesses.{' '}
                  <Link href="/about" className="text-lime-400 hover:underline">
                    Read my story →
                  </Link>
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {PORTFOLIO_SITES.map((site) => (
                <Link
                  key={site.name}
                  href={site.url}
                  className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/20 block"
                >
                  {/* Animated gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${site.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  {/* Demo badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 rounded-full bg-lime-500/20 border border-lime-500/30 text-lime-400 text-xs font-medium">
                      View Demo →
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="mb-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-medium mb-4">
                        {site.type}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-lime-400 transition">
                        {site.name}
                      </h3>
                      <p className="text-gray-300 mb-4">{site.description}</p>
                    </div>

                    {/* Mock browser window */}
                    <div className="bg-black/50 rounded-lg p-4 border border-white/20 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div
                        className={`h-32 rounded bg-gradient-to-br ${site.gradient} opacity-40`}
                      />
                    </div>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2">
                      {site.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </StaggerContainer>

            <FadeIn className="text-center mt-12">
              <p className="text-gray-400 mb-6">
                Click any example to explore a live demo. Your site will be custom-designed for your
                brand.
              </p>
              <a
                href="/intake"
                className="inline-block px-8 py-4 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-all duration-300 hover:scale-105"
              >
                Start Your Project
              </a>
            </FadeIn>
          </Section>

          {/* FAQ */}
          <Section id="faq" className="py-24 relative">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">
                Questions?
              </h2>
            </FadeIn>
            <div className="max-w-3xl mx-auto">
              <InteractiveFAQ faqs={FAQS} />
            </div>
          </Section>

          {/* Final CTA */}
          <Section className="py-28 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-900/20 via-transparent to-pink-900/20 pointer-events-none" />
            <FadeIn>
              <div className="max-w-3xl mx-auto text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Ready to Build Something Great?
                </h2>
                <p className="text-xl text-gray-300 mb-10">
                  Get a quote for a website build, or try the AI receptionist demo first
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/intake"
                    className="inline-block px-10 py-5 bg-lime-400 text-black font-bold text-lg rounded-lg hover:bg-lime-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/50"
                  >
                    Get a Quote
                  </a>
                  <a
                    href="#ai-receptionist"
                    className="inline-block px-10 py-5 border-2 border-white/20 text-white font-bold text-lg rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Try the Demo
                  </a>
                </div>
              </div>
            </FadeIn>
          </Section>
        </main>

        <Footer />

        <ChatWidget
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- false positive: ESLint cannot resolve @/ path alias
          apiUrl={(env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/v1/public/chat'}
          title="Chat With Us"
          greeting="Hi! Ask me about website builds, retainers, or the AI receptionist demo!"
          primaryColor="#a3e635"
          position="bottom-right"
        />

        <style jsx global>{`
          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>
      </div>
    </>
  );
}
