import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      {/* Dark gradient background spanning entire page */}
      <main className="antialiased min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
        {/* Ambient radial glow behind hero */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[120%] h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
        </div>

        {/* Header / Nav */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-950/70 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="font-bold text-xl tracking-tight text-white">Soft Systems Studio</div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition">
                Features
              </a>
              <a href="#use-cases" className="text-sm text-gray-400 hover:text-white transition">
                Use cases
              </a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">
                Pricing
              </a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition">
                FAQ
              </a>
              {/* Glowing CTA button */}
              <Link
                href="/intake"
                className="ml-2 inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold py-2 px-5 rounded-full shadow-lg shadow-purple-500/40 hover:shadow-purple-400/60 transition-shadow"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section className="relative min-h-[90vh] flex items-center justify-center">
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block mb-4 text-xs uppercase tracking-widest text-indigo-400 font-medium">
              AI Automation Agency
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
              Automate Smarter.<br className="hidden sm:block" /> Grow Faster.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-gray-300 max-w-2xl mx-auto mb-10">
              Design, deploy, and run AI systems for support, content, data, workflows, and voice.
              One intake, a clear systems blueprint, and a phased rollout.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary glowing button */}
              <Link
                href="/intake"
                className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-purple-500/50 hover:shadow-purple-400 transition-shadow"
              >
                Start the intake
              </Link>
              {/* Secondary ghost button */}
              <a
                href="#features"
                className="inline-block py-3 px-8 rounded-full border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition"
              >
                Explore features
              </a>
            </div>
          </div>
        </section>

        {/* FEATURE HIGHLIGHTS */}
        <section id="features" className="relative py-28">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Core systems we deploy
            </h2>
            <p className="text-gray-400 max-w-2xl mb-12 leading-relaxed">
              Agency on the front, configurable platform on the back.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'AI Support Systems',
                  desc: 'Web chat, email, SMS and social triage with context-preserving handoffs.',
                },
                {
                  title: 'AI Content Systems',
                  desc: 'A content engine that produces on-brand drafts for campaigns and posts.',
                },
                {
                  title: 'AI Data & BI',
                  desc: 'Query billing, CRM and ad data in plain language for fast insights.',
                },
                {
                  title: 'AI Workflow Systems',
                  desc: 'Automate qualification, reminders, and hand-offs with transparent flows.',
                },
                {
                  title: 'AI Voice Reception',
                  desc: 'Capture and qualify calls, book meetings, or route to humans.',
                },
                {
                  title: 'Integrations',
                  desc: 'Connect Stripe, HubSpot, Slack, Calendly, Notion and more.',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="group bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 p-6 rounded-2xl shadow-xl shadow-black/30 transition"
                >
                  <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES / HOW IT WORKS */}
        <section id="use-cases" className="py-24 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed">
              Intake → Blueprint → Deploy → Iterate. We prioritize high-leverage systems and ship
              fast.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Intake & discovery' },
                { step: '02', title: 'Systems blueprint & roadmap' },
                { step: '03', title: 'Deploy, tune, and scale' },
              ].map((s) => (
                <div
                  key={s.step}
                  className="relative p-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 shadow-lg shadow-black/20"
                >
                  <span className="block text-5xl font-bold text-indigo-500/30 mb-2">{s.step}</span>
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">Trusted by teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { quote: '"We cut support load by 40%"', author: 'Customer A' },
                { quote: '"Content output tripled in a month"', author: 'Customer B' },
                { quote: '"Reporting became actionable"', author: 'Customer C' },
              ].map((t) => (
                <div
                  key={t.author}
                  className="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/30 shadow-lg shadow-black/20"
                >
                  <p className="text-lg text-gray-200 mb-4">{t.quote}</p>
                  <span className="text-sm text-gray-500">— {t.author}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Pricing</h2>
            <p className="text-gray-400 mb-12 max-w-2xl leading-relaxed">
              Simple plans to get started. Scale when you have real usage.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter */}
              <div className="flex flex-col p-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 shadow-lg shadow-black/20">
                <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
                <p className="text-gray-400 text-sm mb-6">Blueprint only</p>
                <div className="mt-auto">
                  <span className="block text-3xl font-bold text-white mb-4">$2,500</span>
                  <a
                    href="/intake"
                    className="block text-center py-3 rounded-full border border-gray-600 text-gray-300 hover:border-gray-400 transition"
                  >
                    Get started
                  </a>
                </div>
              </div>
              {/* Recommended */}
              <div className="relative flex flex-col p-8 rounded-2xl border-2 border-purple-500 bg-gray-800/60 shadow-xl shadow-purple-500/20">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </span>
                <h3 className="text-xl font-semibold text-white mb-2">Implementation Sprint</h3>
                <p className="text-gray-400 text-sm mb-6">Full build &amp; handoff</p>
                <div className="mt-auto">
                  <span className="block text-3xl font-bold text-white mb-4">$10,000</span>
                  <Link
                    href="/intake"
                    className="block text-center py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/40 hover:shadow-purple-400 transition-shadow"
                  >
                    Start sprint
                  </Link>
                </div>
              </div>
              {/* Retainer */}
              <div className="flex flex-col p-8 rounded-2xl border border-gray-700/50 bg-gray-800/40 shadow-lg shadow-black/20">
                <h3 className="text-xl font-semibold text-white mb-2">Ongoing Partner</h3>
                <p className="text-gray-400 text-sm mb-6">Retainer &amp; optimization</p>
                <div className="mt-auto">
                  <span className="block text-3xl font-bold text-white mb-4">Custom</span>
                  <a
                    href="/intake"
                    className="block text-center py-3 rounded-full border border-gray-600 text-gray-300 hover:border-gray-400 transition"
                  >
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to level up your workflow?
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Share a bit about your team and goals — we&apos;ll return a concrete blueprint.
            </p>
            <Link
              href="/intake"
              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-10 rounded-full shadow-lg shadow-purple-500/50 hover:shadow-purple-400 transition-shadow"
            >
              Start the intake
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-10 bg-gray-950">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Soft Systems Studio
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </main>
    </Layout>
  );
}
