'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─── tiny intersection-observer hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── data ─── */
const services = [
  {
    title: 'Emergency Repairs',
    desc: 'Burst pipes, leaks, and overflows handled fast — day or night.',
    icon: '🚨',
  },
  {
    title: 'Water Heater Service',
    desc: 'Tankless & traditional installs, repairs, and maintenance.',
    icon: '🔥',
  },
  { title: 'Drain Cleaning', desc: 'Hydro-jetting & snaking for stubborn blockages.', icon: '🌊' },
  { title: 'Leak Detection', desc: 'Non-invasive technology pinpoints hidden leaks.', icon: '🔍' },
  {
    title: 'Pipe Installation',
    desc: 'New construction, repiping, and gas line work.',
    icon: '🔧',
  },
  {
    title: 'Fixture Replacement',
    desc: 'Sinks, toilets, faucets — expert install guaranteed.',
    icon: '🚰',
  },
];

const reviews = [
  {
    name: 'Sarah M.',
    rating: 5,
    text: "They came out within an hour on a Sunday and fixed our burst pipe. Incredible service — I'll never call anyone else.",
    date: 'Dec 2025',
  },
  {
    name: 'James R.',
    rating: 5,
    text: 'Upfront pricing, fast work, and the technician even cleaned up after. This is how every service company should operate.',
    date: 'Jan 2026',
  },
  {
    name: 'Maria L.',
    rating: 5,
    text: "We had a slab leak that two other companies couldn't find. Apex located and fixed it in one day. Worth every penny.",
    date: 'Nov 2025',
  },
  {
    name: 'David K.',
    rating: 5,
    text: 'Replaced our 20-year-old water heater with a tankless unit. Professional, on-time, and the price was exactly what they quoted.',
    date: 'Feb 2026',
  },
];

const serviceAreas = [
  'Austin',
  'Round Rock',
  'Cedar Park',
  'Pflugerville',
  'Georgetown',
  'Lakeway',
  'Bee Cave',
  'Leander',
  'Dripping Springs',
  'Kyle',
  'Buda',
  'Manor',
];

/* ─── component ─── */
export default function ApexPlumbingDemo() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
      {/* ───────── DEMO BADGE ───────── */}
      <div className="fixed top-4 right-4 z-[60] px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full shadow-lg tracking-wider uppercase">
        Demo Site
      </div>
      <Link
        href="/#portfolio"
        className="fixed top-4 left-4 z-[60] px-4 py-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all duration-300"
      >
        ← Back to Portfolio
      </Link>

      {/* ───────── EMERGENCY TOP BAR ───────── */}
      <div className="bg-orange-500 text-black text-center text-sm font-bold py-2.5 tracking-wide relative overflow-hidden">
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 bg-black rounded-full animate-pulse" />
          EMERGENCY? We&apos;re available 24/7 — Call{' '}
          <a href="tel:512-555-2739" className="underline underline-offset-2 hover:no-underline">
            (512) 555-2739
          </a>{' '}
          now
        </span>
      </div>

      {/* ───────── NAV ───────── */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-xl shadow-2xl shadow-orange-500/5 border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow duration-300">
              A
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">APEX PLUMBING</div>
              <div className="text-[10px] text-orange-500/80 font-semibold tracking-[0.2em] uppercase -mt-0.5">
                Austin, Texas
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {['Services', 'Reviews', 'Areas', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                {item}
              </a>
            ))}
            <a
              href="tel:512-555-2739"
              className="ml-4 px-6 py-2.5 bg-orange-500 text-black font-bold text-sm rounded-lg hover:bg-orange-400 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              📞 (512) 555-2739
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <div className="space-y-1.5">
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenu ? 'rotate-45 translate-y-2' : ''}`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenu ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenu ? '-rotate-45 -translate-y-2' : ''}`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            mobileMenu ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6 space-y-2">
            {['Services', 'Reviews', 'Areas', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-white/5 transition"
                onClick={() => setMobileMenu(false)}
              >
                {item}
              </a>
            ))}
            <a
              href="tel:512-555-2739"
              className="block px-4 py-3 bg-orange-500 text-black font-bold text-sm rounded-lg text-center mt-2"
            >
              📞 Call (512) 555-2739
            </a>
          </div>
        </div>
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-orange-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/[0.02] rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-orange-400 text-sm font-semibold tracking-wide">
                  AVAILABLE NOW — 24/7 EMERGENCY SERVICE
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-8">
                Austin&apos;s Most
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Trusted Plumber
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
                Licensed &amp; insured with 500+ five-star reviews. Same-day service, upfront
                pricing, and a 100% satisfaction guarantee — every time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href="tel:512-555-2739"
                  className="group relative px-8 py-4 bg-orange-500 text-black font-bold text-lg rounded-xl hover:bg-orange-400 transition-all duration-300 text-center shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1"
                >
                  <span className="relative z-10">📞 Call (512) 555-2739</span>
                </a>
                <button className="px-8 py-4 border-2 border-white/20 text-white font-bold text-lg rounded-xl hover:border-orange-500 hover:text-orange-500 transition-all duration-300 hover:-translate-y-1">
                  Book Online →
                </button>
              </div>

              {/* Social proof strip */}
              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-white/10">
                {[
                  { value: '500+', label: 'Jobs Done' },
                  { value: '4.9★', label: 'Google Rating' },
                  { value: '< 60min', label: 'Avg Response' },
                  { value: '10yr', label: 'Experience' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-orange-500 font-black text-2xl">{stat.value}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Hero visual */}
            <Reveal delay={0.2}>
              <div className="relative hidden lg:block">
                <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent border border-white/5 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(249,115,22,0.15),transparent_60%)]" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                  {/* Decorative plumbing icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[120px] opacity-20">🔧</div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute bottom-8 left-8 right-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
                        ⭐
                      </div>
                      <div>
                        <div className="font-bold text-lg">Rated #1 in Austin</div>
                        <div className="text-sm text-gray-400">Based on 500+ verified reviews</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating trust badge */}
                <div className="absolute -top-4 -right-4 bg-black border border-orange-500/30 rounded-2xl p-4 shadow-xl shadow-black/50">
                  <div className="text-3xl mb-1">🛡️</div>
                  <div className="text-xs font-bold text-orange-500">LICENSED</div>
                  <div className="text-[10px] text-gray-500">&amp; INSURED</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── TRUST BADGES ───────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🛡️', title: 'Licensed & Insured', desc: 'TX License #M-41205' },
              { icon: '💰', title: 'Upfront Pricing', desc: 'No surprise fees, ever' },
              { icon: '⚡', title: 'Same-Day Service', desc: 'Fast dispatch guaranteed' },
              { icon: '✅', title: '100% Satisfaction', desc: 'Or your money back' },
            ].map((badge, i) => (
              <Reveal key={badge.title} delay={i * 0.1}>
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {badge.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{badge.title}</div>
                    <div className="text-xs text-gray-500">{badge.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SERVICES ───────── */}
      <section id="services" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <div className="text-orange-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">
                What We Do
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Professional Plumbing Services
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                From emergency repairs to full installations — we handle every plumbing need with
                precision and care.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.08}>
                <div className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all duration-500 cursor-default">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{service.desc}</p>
                  <div className="flex items-center text-orange-500 text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Learn more →
                  </div>
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── BEFORE / AFTER ───────── */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-transparent via-orange-950/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <div className="text-orange-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">
                Our Work
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">Before &amp; After</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                See the transformations we deliver for Austin homeowners every day.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: 'Kitchen Repiping',
                before: 'from-red-900/40 to-red-950/60',
                after: 'from-emerald-600/30 to-emerald-900/50',
              },
              {
                label: 'Water Heater Install',
                before: 'from-amber-900/40 to-stone-900/60',
                after: 'from-sky-500/30 to-sky-900/50',
              },
              {
                label: 'Drain Restoration',
                before: 'from-stone-700/40 to-stone-900/60',
                after: 'from-orange-500/30 to-amber-700/50',
              },
            ].map((project, i) => (
              <Reveal key={project.label} delay={i * 0.15}>
                <div className="group cursor-default">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div
                      className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${project.before} border border-white/5 flex items-center justify-center`}
                    >
                      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                        Before
                      </span>
                    </div>
                    <div
                      className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${project.after} border border-white/5 flex items-center justify-center`}
                    >
                      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                        After
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg group-hover:text-orange-500 transition-colors duration-300">
                    {project.label}
                  </h4>
                  <p className="text-sm text-gray-500">Completed in Austin, TX</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── REVIEWS ───────── */}
      <section id="reviews" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <div className="text-orange-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">
                Testimonials
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">What Our Customers Say</h2>
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="flex text-orange-500 text-2xl tracking-wider">★★★★★</div>
                <span className="text-gray-400 text-sm">4.9 / 5.0 from 500+ reviews</span>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, i) => (
              <Reveal key={review.name} delay={i * 0.1}>
                <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-all duration-500 group">
                  <div className="flex text-orange-500 text-lg mb-4">
                    {'★'.repeat(review.rating)}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6 italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-bold text-black text-sm">
                        {review.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{review.name}</div>
                        <div className="text-xs text-gray-500">Verified Customer</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">{review.date}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <div className="text-center mt-12">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-sm font-medium hover:border-orange-500/30 hover:text-orange-500 transition-all duration-300"
              >
                Read all 500+ reviews on Google →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── SERVICE AREA ───────── */}
      <section
        id="areas"
        className="py-24 md:py-32 bg-gradient-to-b from-transparent via-orange-950/5 to-transparent"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <div className="text-orange-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">
                  Service Areas
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6">Serving Greater Austin</h2>
                <p className="text-gray-400 mb-10 leading-relaxed">
                  From downtown Austin to the surrounding suburbs, our trucks are always nearby and
                  ready to roll. Most service calls answered within 60 minutes.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {serviceAreas.map((area) => (
                    <div
                      key={area}
                      className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-center hover:border-orange-500/30 hover:text-orange-500 transition-all duration-300 cursor-default"
                    >
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Map visual */}
            <Reveal delay={0.2}>
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-orange-950/20 via-black to-orange-950/10 border border-white/5 overflow-hidden">
                {/* Decorative "map" elements */}
                <div className="absolute inset-0">
                  {/* Grid lines */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  {/* Center pin */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-orange-500/20 animate-ping absolute -inset-2" />
                      <div className="w-12 h-12 rounded-full bg-orange-500/30 flex items-center justify-center relative">
                        <div className="w-5 h-5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                      </div>
                    </div>
                  </div>
                  {/* Radius rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-orange-500/10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-orange-500/5" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-orange-500/[0.03]" />
                  {/* Scattered dots */}
                  {[
                    { t: '30%', l: '35%' },
                    { t: '25%', l: '55%' },
                    { t: '40%', l: '65%' },
                    { t: '55%', l: '30%' },
                    { t: '65%', l: '50%' },
                    { t: '60%', l: '70%' },
                    { t: '35%', l: '45%' },
                    { t: '70%', l: '40%' },
                    { t: '45%', l: '55%' },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-orange-500/30"
                      style={{ top: pos.t, left: pos.l }}
                    />
                  ))}
                </div>
                <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3">
                  <div className="text-orange-500 font-bold text-lg">30-mile radius</div>
                  <div className="text-xs text-gray-500">from downtown Austin</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── ABOUT / WHY US ───────── */}
      <section id="about" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <div className="text-orange-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">
                Why Apex
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">The Apex Difference</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'We Show Up Fast',
                desc: 'Average response time under 60 minutes. Emergency? We prioritize you.',
              },
              {
                num: '02',
                title: 'We Price It Fair',
                desc: 'You approve the price before we start. No hidden fees, no surprise charges.',
              },
              {
                num: '03',
                title: 'We Guarantee It',
                desc: "Not happy? We'll make it right — free of charge. Period.",
              },
            ].map((item, i) => (
              <Reveal key={item.num} delay={i * 0.15}>
                <div className="relative p-10 rounded-2xl border border-white/5 bg-white/[0.01] group hover:border-orange-500/20 transition-all duration-500">
                  <div className="text-6xl font-black text-white/[0.03] absolute top-6 right-8 group-hover:text-orange-500/10 transition-colors duration-500">
                    {item.num}
                  </div>
                  <div className="relative">
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,0,0,0.3),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(0,0,0,0.2),transparent_70%)]" />

        <Reveal>
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full mb-8 text-sm font-bold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              DISPATCHING NOW
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">
              Need a Plumber
              <br />
              Right Now?
            </h2>
            <p className="text-xl text-black/70 mb-10 max-w-lg mx-auto">
              Don&apos;t wait for water damage to get worse. Call now and we&apos;ll have a licensed
              technician at your door fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:512-555-2739"
                className="px-10 py-5 bg-black text-orange-500 font-bold text-lg rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-2xl shadow-black/30 hover:-translate-y-1"
              >
                📞 Call (512) 555-2739
              </a>
              <button className="px-10 py-5 border-2 border-black/30 text-black font-bold text-lg rounded-xl hover:bg-black/10 transition-all duration-300 hover:-translate-y-1">
                Schedule Online
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-black text-black text-lg">
                  A
                </div>
                <div className="text-xl font-black">APEX PLUMBING</div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Austin&apos;s trusted plumbing professionals. Licensed, insured, and committed to
                excellence since 2015.
              </p>
              <div className="flex gap-3">
                {['𝕏', 'f', 'in'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-sm text-gray-400 hover:border-orange-500/30 hover:text-orange-500 transition-all duration-300"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">
                Services
              </h4>
              <div className="space-y-3">
                {services.slice(0, 4).map((s) => (
                  <a
                    key={s.title}
                    href="#services"
                    className="block text-sm text-gray-500 hover:text-orange-500 transition-colors duration-300"
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">
                Company
              </h4>
              <div className="space-y-3">
                {['About Us', 'Reviews', 'Service Areas', 'Careers', 'Blog'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-sm text-gray-500 hover:text-orange-500 transition-colors duration-300"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">
                Contact
              </h4>
              <div className="space-y-3 text-sm text-gray-500">
                <a
                  href="tel:512-555-2739"
                  className="block hover:text-orange-500 transition-colors duration-300"
                >
                  📞 (512) 555-2739
                </a>
                <a href="#" className="block hover:text-orange-500 transition-colors duration-300">
                  ✉️ info@apexplumbing.com
                </a>
                <p>📍 Austin, TX 78701</p>
                <div className="pt-2">
                  <div className="text-xs text-gray-600 mb-1">Hours:</div>
                  <p>Mon-Fri: 7am – 8pm</p>
                  <p>Sat-Sun: 8am – 6pm</p>
                  <p className="text-orange-500 font-semibold">24/7 Emergency Line</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="border-t border-white/5 pt-10 mb-10">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                'BBB A+ Rated',
                'TX Licensed #M-41205',
                'Fully Insured',
                'EPA Certified',
                'HomeAdvisor Top Rated',
              ].map((cert) => (
                <div
                  key={cert}
                  className="px-4 py-2 rounded-lg border border-white/5 text-xs text-gray-500 font-medium hover:border-orange-500/20 transition-colors duration-300"
                >
                  {cert}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">
              © 2026 Apex Plumbing. All rights reserved. This is a demo site.
            </p>
            <Link
              href="/#web-design"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white text-sm font-medium rounded-lg hover:bg-orange-500/10 hover:text-orange-500 border border-white/5 hover:border-orange-500/20 transition-all duration-300"
            >
              ✨ Want a site like this? Get a quote →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
