'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Outfit, Karla } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const display = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = Karla({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' });

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
    // Backstop: a static render (a crawler, a link-preview bot, or a
    // screenshot taken right after load, e.g. one Austin sends a
    // prospect) never scrolls the page, so IntersectionObserver correctly
    // never fires for anything below the fold — without this, those
    // sections show as permanently blank space instead of their real
    // content. Same fix as the lead-tool generator's section library
    // (lib/site/sections/base.ts) uses for the identical failure mode.
    const backstop = setTimeout(() => setVisible(true), 600);
    return () => {
      io.disconnect();
      clearTimeout(backstop);
    };
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
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const work = [
  {
    src: '/images/demo/green-bench/hardscape-paths.jpg',
    alt: 'Paver walkway through a landscaped yard',
    caption: 'Paver walkway & bed edging',
    span: 'md:col-span-2',
  },
  {
    src: '/images/demo/green-bench/brick-house-lawn.jpg',
    alt: 'Manicured front lawn of a brick house',
    caption: 'Full lawn renovation',
    span: '',
  },
  {
    src: '/images/demo/green-bench/gazebo-garden.jpg',
    alt: 'Wooden gazebo surrounded by garden beds',
    caption: 'Gazebo & garden bed build-out',
    span: '',
  },
  {
    src: '/images/demo/green-bench/patio-garden.jpg',
    alt: 'Patio bordered by potted plants',
    caption: 'Patio & planting refresh',
    span: 'md:col-span-2',
  },
];

const seasons = [
  {
    n: '01',
    title: 'Spring Cleanup',
    desc: 'Beds cleared, mulch refreshed, and the lawn woken back up after winter.',
  },
  {
    n: '02',
    title: 'Growing Season',
    desc: 'Weekly mowing, edging, and trimming from April through September.',
  },
  {
    n: '03',
    title: 'Fall Cleanup',
    desc: 'Leaf removal, bed prep, and aeration before the ground goes cold.',
  },
  {
    n: '04',
    title: 'Winterizing',
    desc: 'Irrigation blown out, beds put to rest, and holiday lighting if you want it.',
  },
];

const services = [
  { name: 'Lawn Mowing & Maintenance', span: 'md:col-span-2' },
  { name: 'Landscape Design & Installation', span: '' },
  { name: 'Hardscaping & Patios', span: '' },
  { name: 'Irrigation', span: '' },
  { name: 'Mulching & Bed Maintenance', span: '' },
  { name: 'Seasonal Cleanup', span: 'md:col-span-2' },
];

export default function GreenBenchDemo() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-[#F4F5F0] text-[#1C211B] antialiased`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* ───────── DEMO BADGE ───────── */}
      <div className="fixed top-20 md:top-4 right-4 z-[60] px-4 py-2 bg-[#B5502E] text-white text-xs font-bold rounded-full shadow-lg tracking-wider uppercase">
        Demo Site
      </div>
      <Link
        href="/#portfolio"
        className="fixed top-20 md:top-4 left-4 z-[60] px-4 py-2 bg-white/70 backdrop-blur-md text-[#1C211B] text-sm font-medium rounded-lg hover:bg-white transition-all duration-300 shadow-sm"
      >
        ← Back to Portfolio
      </Link>

      {/* ───────── NAV ───────── */}
      <nav className="sticky top-0 z-40 bg-[#F4F5F0]/90 backdrop-blur-md border-b border-black/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <span className="text-xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Green Bench
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#4B5245]">
            <a href="#work" className="hover:text-[#1C211B] transition-colors">
              Recent Work
            </a>
            <a href="#services" className="hover:text-[#1C211B] transition-colors">
              Services
            </a>
            <a href="#seasons" className="hover:text-[#1C211B] transition-colors">
              Seasons
            </a>
            <a href="#contact" className="hover:text-[#1C211B] transition-colors">
              Contact
            </a>
          </div>
          <a
            href="#contact"
            className="hidden md:inline-block px-5 py-2.5 bg-[#B5502E] text-white text-sm font-semibold rounded-full hover:bg-[#9C4326] transition-colors"
          >
            Request a quote
          </a>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden text-sm text-[#1C211B] border border-black/15 rounded-full px-4 py-1.5"
            aria-expanded={mobileMenu}
            aria-label="Toggle navigation"
          >
            {mobileMenu ? 'Close' : 'Menu'}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-black/10 px-6 py-4 flex flex-col gap-4 text-sm text-[#4B5245]">
            <a href="#work" onClick={() => setMobileMenu(false)}>
              Recent Work
            </a>
            <a href="#services" onClick={() => setMobileMenu(false)}>
              Services
            </a>
            <a href="#seasons" onClick={() => setMobileMenu(false)}>
              Seasons
            </a>
            <a href="#contact" onClick={() => setMobileMenu(false)}>
              Contact
            </a>
          </div>
        )}
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[100dvh] flex items-end pt-24 pb-16 md:pb-24">
        <div className="absolute inset-0">
          <Image
            src="/images/demo/green-bench/hero-yard.jpg"
            alt="Well-maintained suburban front yard with mature trees"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131711] via-[#131711]/35 to-[#131711]/5" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 w-full text-white">
          <p className="text-sm tracking-[0.15em] uppercase text-[#E8B08F] mb-4 font-semibold">
            Serving Phenix City & Smiths Station, AL, and Columbus, GA
          </p>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl leading-[1.05] mb-6 max-w-2xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            Yards worth walking home to.
          </h1>
          <p className="text-lg text-[#DDE2D8] max-w-md mb-8 leading-relaxed">
            Weekly mowing, seasonal cleanups, and landscape work built around how your yard actually
            gets used.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#work"
              className="px-6 py-3 bg-white text-[#1C211B] font-semibold rounded-full hover:bg-[#EDEEE8] transition-colors"
            >
              See recent work
            </a>
            <a
              href="#contact"
              className="px-6 py-3 border border-white/50 text-white rounded-full hover:border-white transition-colors"
            >
              Request a quote
            </a>
          </div>
        </div>
      </section>

      {/* ───────── RECENT WORK ───────── */}
      <section id="work" className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14 max-w-lg">
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              Recent work.
            </h2>
            <p className="text-[#4B5245]">
              A sample of the design and build-out work we take on alongside weekly maintenance,
              shown here by project type rather than by client.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {work.map((w) => (
              <Reveal key={w.caption} className={`${w.span} group`}>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <Image
                    src={w.src}
                    alt={w.alt}
                    fill
                    sizes={
                      w.span ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
                    }
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-sm text-[#4B5245]">{w.caption}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SEASONS TIMELINE ───────── */}
      <section id="seasons" className="border-t border-black/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-16 max-w-lg">
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              A year in the yard.
            </h2>
            <p className="text-[#4B5245]">
              Lawn care here follows the calendar. Here&apos;s roughly how a year with us goes.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {seasons.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <div
                  className="text-5xl text-[#D8C2AE] mb-4"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                >
                  {s.n}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-[#4B5245] leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SERVICES ───────── */}
      <section id="services" className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14 max-w-lg">
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              What we take care of.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {services.map((s) => (
              <Reveal key={s.name} className={s.span}>
                <div className="h-full flex items-center px-8 py-7 rounded-xl border border-black/10 bg-white hover:border-[#B5502E]/40 transition-colors">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── ACTION / QUOTE ───────── */}
      <section className="border-t border-black/10 bg-[#1C211B] text-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <blockquote
              className="text-2xl leading-snug mb-6"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              &ldquo;They show up on the same day every week and the yard has looked better every
              month since.&rdquo;
            </blockquote>
            <p className="text-sm text-[#A7B09D]">Priya N., Smiths Station</p>
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <Image
              src="/images/demo/green-bench/mowing.jpg"
              alt="Lawn care crew member mowing a lawn"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* ───────── CONTACT ───────── */}
      <section id="contact" className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
          <Reveal>
            <h2
              className="text-3xl md:text-4xl mb-6"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              Get a quote
            </h2>
            <p className="text-[#4B5245] leading-relaxed mb-6 max-w-md">
              Most quotes are based on a couple of photos and your address. Call, text, or email and
              we&apos;ll get back to you within a day.
            </p>
            <div className="space-y-2 text-[#1C211B]">
              <p>
                <a href="tel:+13345550172" className="hover:text-[#B5502E] transition-colors">
                  (334) 555-0172
                </a>
              </p>
              <p>
                <a
                  href="mailto:hello@greenbenchlawn.example"
                  className="hover:text-[#B5502E] transition-colors"
                >
                  hello@greenbenchlawn.example
                </a>
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="text-3xl md:text-4xl mb-6"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              Where we work
            </h2>
            <ul className="space-y-2 text-[#4B5245]">
              <li>Phenix City, AL</li>
              <li>Smiths Station, AL</li>
              <li>Columbus, GA</li>
            </ul>
            <p className="text-sm text-[#7A8271] mt-6">
              Weekly and bi-weekly mowing routes run Tuesday through Friday, seasonal weather
              permitting.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <span
              className="text-lg"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
            >
              Green Bench Lawn &amp; Landscape
            </span>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/5 text-[#1C211B] text-sm font-medium rounded-lg hover:bg-[#B5502E]/10 hover:text-[#B5502E] border border-black/10 hover:border-[#B5502E]/30 transition-all duration-300"
            >
              Want a site like this? Get a quote →
            </Link>
          </div>
          <p className="text-xs text-[#7A8271] leading-relaxed">
            Green Bench Lawn &amp; Landscape is a fictional business. This page is a demo built by
            Soft Systems Studio to show what a lawn care and landscaping website could look like —
            it is not a real company, and the contact details above do not reach a real business.
          </p>
          <p className="text-[11px] text-[#9AA091] mt-3">
            Photos via Pexels: Get Lost Mike, Max Vakhtbovych, Curtis Adams, Matheus Bertelli, and
            Magic K.
          </p>
        </div>
      </footer>
    </div>
  );
}
