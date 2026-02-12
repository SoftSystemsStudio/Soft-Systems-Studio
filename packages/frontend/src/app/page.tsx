'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Navbar, Footer, Section, Button } from '@/components/ui';
import { FadeIn, StaggerContainer } from '@/components/motion';
import { ChatWidget } from '@softsystems/ui-components';
import CallMeNowModal from '@/components/CallMeNowModal';
import env from '@/lib/env';

const InteractiveFAQ = dynamic(() => import('@/components/sentient/faq/InteractiveFAQ'), {
  ssr: false,
});

const NAV_ITEMS = [
  { label: 'Products', href: '#digital-products' },
  { label: 'Web Design', href: '#web-design' },
  { label: 'AI Services', href: '#ai-services' },
  { label: 'Portfolio', href: '#portfolio' },
];

const DIGITAL_PRODUCTS = [
  {
    name: 'AI Business in a Box',
    price: '$29',
    description: 'Complete AI agency starter pack',
    gradient: 'from-purple-600 to-pink-600',
    link: 'https://softsystemsstudioco.gumroad.com/l/ai-business-box',
    features: ['20 Email Templates', 'Service Packages', 'Client Scripts', 'SOPs'],
  },
  {
    name: 'Solopreneur OS',
    price: '$19',
    description: 'All-in-one productivity system',
    gradient: 'from-cyan-500 to-blue-600',
    link: 'https://softsystemsstudioco.gumroad.com/l/solopreneur-os',
    features: ['CRM', 'Revenue Tracking', 'Content Calendar', '90-Day Roadmap'],
  },
  {
    name: 'AI Prompt Vault',
    price: '$14.99',
    description: '200+ battle-tested prompts',
    gradient: 'from-orange-500 to-red-600',
    link: 'https://softsystemsstudioco.gumroad.com/l/ai-prompt-vault',
    features: ['Business Strategy', 'Marketing Scripts', 'Code Helpers', 'Content Tools'],
  },
  {
    name: 'SaaS Launch Kit',
    price: '$24',
    description: 'Zero to launch playbook',
    gradient: 'from-lime-500 to-green-600',
    link: 'https://softsystemsstudioco.gumroad.com/l/saas-launch-kit',
    features: ['Validation Guide', 'Landing Pages', '100-Point Checklist', 'Email Flows'],
  },
];

const WEBSITE_PACKAGES = [
  {
    name: 'Starter Landing',
    price: '$799',
    delivery: '48 hours',
    description: 'Perfect for product launches and lead capture',
    features: [
      'Single high-converting page',
      'Mobile responsive',
      'SEO optimized',
      'Contact form integration',
      '2 rounds of revisions',
    ],
    badge: 'Fast Track',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    name: 'Business Website',
    price: '$1,997',
    delivery: '1 week',
    description: 'Complete web presence for your business',
    features: [
      '5-7 pages (Home, About, Services, Contact, etc.)',
      'Custom design system',
      'CMS integration',
      'Analytics setup',
      '30-day post-launch support',
    ],
    popular: true,
    gradient: 'from-lime-400 to-emerald-500',
  },
  {
    name: 'Premium Package',
    price: '$3,497',
    delivery: '2 weeks',
    description: 'Full-featured site with advanced functionality',
    features: [
      '10+ pages with custom features',
      'E-commerce or booking system',
      'Advanced integrations (CRM, email, etc.)',
      'Performance optimization',
      '60-day support + training',
    ],
    gradient: 'from-cyan-400 to-blue-600',
  },
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
    description: '24/7 emergency plumbing services',
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
    question: 'How long does website design take?',
    answer:
      'Starter Landing: 48 hours. Business Website: 1 week. Premium Package: 2 weeks. We work fast without sacrificing quality.',
  },
  {
    question: 'Do you use AI to design websites?',
    answer:
      'Yes - we use AI tools to accelerate design and development, but every site is custom-tailored to your brand and reviewed by human designers for quality.',
  },
  {
    question: 'What if I need changes after launch?',
    answer:
      'All packages include revision rounds during development. After launch, Starter gets 2 weeks support, Business gets 30 days, Premium gets 60 days of free updates.',
  },
  {
    question: 'Can I see examples of your work?',
    answer:
      'Check out our portfolio section below. Each site showcases different styles and industries. We adapt to match your brand.',
  },
  {
    question: 'Do you offer hosting?',
    answer:
      'We deploy all sites to Vercel (free tier for most small sites). For larger sites or custom hosting needs, we can set up managed hosting for $47-97/month.',
  },
];

export default function Home() {
  const [showCallModal, setShowCallModal] = useState(false);

  return (
    <>
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lime-900/20 via-transparent to-transparent pointer-events-none" />

      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="#web-design" />

      <div className="antialiased min-h-screen bg-black text-gray-100 selection:bg-lime-400 selection:text-black overflow-x-hidden">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>

      <main id="main-content" className="relative z-10">
        {/* Hero Section - Bold & Edgy */}
        <Section className="pt-32 pb-24">
          <FadeIn>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                {/* Animated badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-sm font-medium mb-8 animate-pulse">
                  <span className="w-2 h-2 bg-lime-400 rounded-full animate-ping" />
                  Digital Products · AI Automation · Web Design
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                  Build Smarter.
                  <br />
                  <span className="bg-gradient-to-r from-lime-400 via-cyan-400 to-pink-500 text-transparent bg-clip-text animate-gradient">
                    Launch Faster.
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-10 max-w-3xl mx-auto font-light">
                  Ready-to-use templates, AI-powered websites, and intelligent automation for
                  entrepreneurs who refuse to waste time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#digital-products"
                    className="group relative inline-block px-8 py-4 bg-lime-400 text-black font-bold text-lg rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/50"
                  >
                    <span className="relative z-10">Browse Products</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-300 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                  <a
                    href="#web-design"
                    className="inline-block px-8 py-4 border-2 border-lime-400/50 text-lime-400 font-bold text-lg rounded-lg hover:bg-lime-400/10 transition-all duration-300"
                  >
                    Get a Website →
                  </a>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  No fluff. No $997 courses. Just tools that work.
                </p>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                  <div className="text-3xl font-bold text-lime-400 mb-2">48hr</div>
                  <div className="text-sm text-gray-400">Website Delivery</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                  <div className="text-3xl font-bold text-pink-400 mb-2">$19-29</div>
                  <div className="text-sm text-gray-400">Digital Products</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">30-Day</div>
                  <div className="text-sm text-gray-400">Money Back</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </Section>

        {/* Digital Products Section */}
        <Section id="digital-products" className="py-24 relative">
          {/* Background accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-900/5 to-transparent pointer-events-none" />

          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Digital Products
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Templates and systems you can use immediately. No courses. No fluff.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {DIGITAL_PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-lime-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime-400/20"
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-white text-lg group-hover:text-lime-400 transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-2xl font-black text-lime-400">{product.price}</span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{product.description}</p>

                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="text-gray-400 text-xs flex items-center gap-2">
                        <span className="w-1 h-1 bg-lime-400 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-lime-400 text-sm font-medium group-hover:underline">
                      View Product
                    </span>
                    <span className="text-lime-400">→</span>
                  </div>
                </div>
              </a>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-12">
            <a
              href="https://softsystemsstudioco.gumroad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              View All Products
            </a>
          </FadeIn>
        </Section>

        {/* Website Design Section - New & Prominent */}
        <Section id="web-design" className="py-24 relative">
          {/* Dramatic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 via-transparent to-pink-900/10 pointer-events-none" />

          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-medium mb-6">
                ✨ New Service
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                AI-Powered Website Design
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Modern, fast, conversion-optimized websites built in days, not months. Starting at
                $799.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-10">
            {WEBSITE_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative p-8 rounded-2xl border ${
                  pkg.popular ? 'border-lime-400/50 scale-105' : 'border-white/10'
                } bg-white/5 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  pkg.popular ? 'hover:shadow-lime-400/30' : 'hover:shadow-white/20'
                }`}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient} opacity-5 rounded-2xl`}
                />

                {pkg.badge && (
                  <div className="absolute -top-3 left-8 px-4 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">
                    {pkg.badge}
                  </div>
                )}

                {pkg.popular && (
                  <div className="absolute -top-3 left-8 px-4 py-1 bg-lime-400 text-black text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black text-lime-400">{pkg.price}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Delivered in {pkg.delivery}</p>
                  <p className="text-gray-300 mb-6">{pkg.description}</p>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-3">
                        <span className="text-lime-400 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/intake"
                    className={`block text-center px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                      pkg.popular
                        ? 'bg-lime-400 text-black hover:bg-lime-300 hover:scale-105'
                        : 'border-2 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            ))}
          </StaggerContainer>

          {/* Process */}
          <FadeIn>
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-white mb-8">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-lime-400/10 border-2 border-lime-400 flex items-center justify-center text-lime-400 font-black text-xl mb-4 mx-auto">
                    1
                  </div>
                  <h4 className="font-bold text-white mb-2">Quick Intake</h4>
                  <p className="text-gray-400 text-sm">
                    Tell us about your business, brand, and goals in a 10-minute form
                  </p>
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-pink-400/10 border-2 border-pink-400 flex items-center justify-center text-pink-400 font-black text-xl mb-4 mx-auto">
                    2
                  </div>
                  <h4 className="font-bold text-white mb-2">We Build</h4>
                  <p className="text-gray-400 text-sm">
                    AI-assisted design + human review. We handle everything from design to
                    deployment
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

        {/* Portfolio Section */}
        <Section id="portfolio" className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none" />

          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Example Projects
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Different styles for different needs. We adapt to match your brand.
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
                    <div className={`h-32 rounded bg-gradient-to-br ${site.gradient} opacity-40`} />
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
              Click any example to explore a live demo. Your site will be custom-designed for your brand.
            </p>
            <a
              href="/intake"
              className="inline-block px-8 py-4 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-all duration-300 hover:scale-105"
            >
              Start Your Project
            </a>
          </FadeIn>
        </Section>

        {/* AI Services (Condensed) */}
        <Section id="ai-services" className="py-24 relative">
          <FadeIn>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                AI Automation Services
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Custom AI receptionists and automation for service businesses
              </p>
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">AI Receptionist</h3>
                <p className="text-gray-300 mb-6">
                  24/7 phone answering, appointment booking, and lead capture for local businesses.
                  Never miss a $400 job again.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-6">
                  <span>✓ Natural voice (not robotic)</span>
                  <span>✓ Bilingual (EN/ES)</span>
                  <span>✓ Calendar integration</span>
                  <span>✓ 24/7 availability</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowCallModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-lime-400 to-cyan-400 text-black font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-lime-400/30"
                  >
                    📞 Try Live Demo
                  </button>
                  <a
                    href="/intake"
                    className="inline-block px-8 py-4 border-2 border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Get Free Quote
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Setup: $997 • Monthly: $197 + usage (~$30-80/mo)
              </p>
            </div>
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
                Browse digital products or start your website project today
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
                  Get a Website
                </a>
              </div>
            </div>
          </FadeIn>
        </Section>
      </main>

      <Footer />

      <ChatWidget
        apiUrl={(env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/v1/public/chat'}
        title="Chat With Us"
        greeting="Hi! Ask me about our digital products, website design, or AI automation services!"
        primaryColor="#a3e635"
        position="bottom-right"
      />

      <CallMeNowModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />

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
