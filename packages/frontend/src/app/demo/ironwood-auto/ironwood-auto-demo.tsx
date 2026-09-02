'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Anton, JetBrains_Mono, Work_Sans } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
});
const body = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

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
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const PHONE = '(334) 555-0148';
const PHONE_HREF = 'tel:+13345550148';

const services = [
  {
    name: 'Brakes & Suspension',
    desc: 'Pads, rotors, struts, and the noises you should not ignore.',
    span: 'md:col-span-2',
  },
  { name: 'Oil & Fluid Service', desc: 'In and out in under an hour, most days.', span: '' },
  {
    name: 'Diagnostics & Check Engine',
    desc: 'We read the code and explain it in plain terms before touching anything.',
    span: '',
  },
  {
    name: 'Tires & Alignment',
    desc: 'New tires, rotations, and alignments that actually hold.',
    span: 'md:col-span-2',
  },
  { name: 'AC & Heating', desc: 'Fixed before the next heat wave, not during it.', span: '' },
  { name: 'Batteries & Electrical', desc: 'Tested for free, replaced same day.', span: '' },
];

const reviews = [
  {
    name: 'Marcus T.',
    text: 'Had my truck back the same afternoon and they showed me the old part so I knew it wasn’t a made-up charge.',
  },
  {
    name: 'Denise H.',
    text: 'Called at 8am about a dead battery, was back on the road by 9:30. Straight answers, no upsell.',
  },
  {
    name: 'Robert P.',
    text: 'Been taking both our cars here for two years. They tell you what can wait and what can’t.',
  },
];

const hours = [
  ['Monday – Friday', '7:00 AM – 6:00 PM'],
  ['Saturday', '8:00 AM – 2:00 PM'],
  ['Sunday', 'Closed'],
];

export default function IronwoodAutoDemo() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div
      className={`${display.variable} ${mono.variable} ${body.variable} min-h-screen bg-[#0B0C0E] text-[#F2F3F1] antialiased`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* ───────── DEMO BADGE ───────── */}
      <div className="fixed top-52 md:top-4 right-4 z-[60] px-4 py-2 bg-[#F2551E] text-black text-xs font-bold rounded-full shadow-lg tracking-wider uppercase">
        Demo Site
      </div>
      <Link
        href="/#portfolio"
        className="fixed top-52 md:top-4 left-4 z-[60] px-4 py-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all duration-300"
      >
        ← Back to Portfolio
      </Link>

      {/* ───────── URGENCY BAR ───────── */}
      <div className="bg-[#F2551E] text-black text-center text-sm font-bold py-2.5 px-14 tracking-wide">
        <span className="inline-flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-block w-2 h-2 bg-black rounded-full animate-pulse" />
          Same-day appointments most weekdays. Call{' '}
          <a href={PHONE_HREF} className="underline underline-offset-2 hover:no-underline">
            {PHONE}
          </a>
        </span>
      </div>

      {/* ───────── NAV ───────── */}
      <nav className="sticky top-0 z-40 bg-[#0B0C0E]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <span className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            IRONWOOD
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#B7BABD] uppercase tracking-wide">
            <a href="#services" className="hover:text-white transition-colors">
              Services
            </a>
            <a href="#why-us" className="hover:text-white transition-colors">
              Why Us
            </a>
            <a href="#reviews" className="hover:text-white transition-colors">
              Reviews
            </a>
            <a href="#visit" className="hover:text-white transition-colors">
              Hours
            </a>
          </div>
          <a
            href={PHONE_HREF}
            className="hidden md:inline-block px-5 py-2.5 bg-[#F2551E] text-black text-sm font-bold rounded uppercase tracking-wide hover:bg-[#FF6B33] transition-colors"
          >
            Call Now
          </a>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden text-sm text-white border border-white/20 rounded px-4 py-1.5 uppercase"
            aria-expanded={mobileMenu}
            aria-label="Toggle navigation"
          >
            {mobileMenu ? 'Close' : 'Menu'}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-[#B7BABD] uppercase tracking-wide">
            <a href="#services" onClick={() => setMobileMenu(false)}>
              Services
            </a>
            <a href="#why-us" onClick={() => setMobileMenu(false)}>
              Why Us
            </a>
            <a href="#reviews" onClick={() => setMobileMenu(false)}>
              Reviews
            </a>
            <a href="#visit" onClick={() => setMobileMenu(false)}>
              Hours
            </a>
          </div>
        )}
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 pb-24">
        <div className="absolute inset-0">
          <Image
            src="/images/demo/ironwood-auto/hero-lift.jpg"
            alt="Car raised on a lift inside an auto repair shop"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C0E] via-[#0B0C0E]/75 to-[#0B0C0E]/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 w-full">
          <p className="text-sm tracking-[0.2em] uppercase text-[#F2551E] font-semibold mb-5">
            Phenix City, Alabama — Locally Owned
          </p>
          <h1
            className="text-6xl sm:text-7xl md:text-8xl leading-[0.92] mb-8 max-w-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your car,
            <br />
            back on the road.
          </h1>
          <p className="text-lg text-[#C7C9CB] max-w-md mb-10 leading-relaxed">
            Straight answers, upfront pricing, and most repairs done the same day you bring it in.
          </p>
          <div className="flex flex-wrap gap-4 mb-14">
            <a
              href={PHONE_HREF}
              className="px-8 py-4 bg-[#F2551E] text-black font-bold rounded uppercase tracking-wide hover:bg-[#FF6B33] transition-colors"
            >
              Call {PHONE}
            </a>
            <a
              href="#services"
              className="px-8 py-4 border border-white/25 text-white font-bold rounded uppercase tracking-wide hover:border-white/50 transition-colors"
            >
              See services
            </a>
          </div>
          <div
            className="flex flex-wrap gap-x-10 gap-y-4 text-sm"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {[
              ['~20 min', 'average diagnostic wait'],
              ['6', 'service bays'],
              ['1', 'location, since we started'],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl text-[#F2551E] font-bold">{num}</div>
                <div className="text-[#9A9DA0] uppercase tracking-wide text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SERVICES BENTO ───────── */}
      <section id="services" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14 max-w-lg">
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              What We Fix
            </h2>
            <p className="text-[#B7BABD]">
              If it&apos;s making a noise it shouldn&apos;t, or a light came on that you don&apos;t
              recognize, start here.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {services.map((s) => (
              <Reveal key={s.name} className={s.span}>
                <div className="h-full p-8 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#F2551E]/40 hover:bg-white/[0.05] transition-colors">
                  <h3 className="text-xl font-bold mb-2">{s.name}</h3>
                  <p className="text-[#9A9DA0] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── WHY US / TRUST ───────── */}
      <section id="why-us" className="border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Reveal className="relative min-h-[420px] md:min-h-[560px]">
            <Image
              src="/images/demo/ironwood-auto/shop-wide.jpg"
              alt="Clean, organized auto repair shop with vehicles on lifts"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="flex items-center bg-[#131418]">
            <div className="px-6 md:px-16 py-16 md:py-0">
              <p className="text-sm tracking-[0.2em] uppercase text-[#F2551E] font-semibold mb-5">
                Why Drivers Come Back
              </p>
              <h2
                className="text-3xl md:text-4xl mb-8"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                No guesswork, no surprise invoices.
              </h2>
              <div
                className="grid grid-cols-2 gap-8 max-w-md"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {[
                  ['18 yrs', 'combined tech experience'],
                  ['12 mo', 'warranty on parts & labor'],
                  ['0', 'hidden diagnostic fees'],
                  ['4.7', 'average shop rating'],
                ].map(([num, label]) => (
                  <div key={label}>
                    <div className="text-3xl font-bold text-white">{num}</div>
                    <div className="text-[#9A9DA0] text-xs uppercase tracking-wide mt-1">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── REVIEWS ───────── */}
      <section id="reviews" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14">
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
              From the waiting room.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <Reveal
                key={r.name}
                className="p-8 rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <p className="text-[#D5D7D9] leading-relaxed mb-6">&ldquo;{r.text}&rdquo;</p>
                <p className="text-sm text-[#9A9DA0] font-semibold">{r.name}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TIRE DETAIL BAND ───────── */}
      <section className="border-t border-white/10 relative h-[280px] md:h-[360px]">
        <Image
          src="/images/demo/ironwood-auto/tire-service.jpg"
          alt="Mechanic checking a tire during service"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="max-w-6xl mx-auto px-6 md:px-10 w-full">
            <p
              className="text-2xl md:text-3xl text-white max-w-xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tires rotated, balanced, and checked at every visit. No extra charge.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── HOURS & VISIT ───────── */}
      <section id="visit" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
          <Reveal>
            <h2 className="text-3xl md:text-4xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>
              Hours
            </h2>
            <dl className="space-y-3">
              {hours.map(([day, time]) => (
                <div key={day} className="flex items-baseline justify-between text-sm">
                  <dt className="text-[#B7BABD]">{day}</dt>
                  <dd className={time === 'Closed' ? 'text-[#5D5F62]' : 'text-white'}>{time}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>
              Find us
            </h2>
            <p className="text-[#B7BABD] leading-relaxed mb-6">
              2210 Summerville Road
              <br />
              Phenix City, AL 36867
            </p>
            <p className="text-[#B7BABD] leading-relaxed mb-6">
              Also serving Smiths Station, AL and Columbus, GA. Free local towing with any repair
              over $200.
            </p>
            <a
              href={PHONE_HREF}
              className="inline-block px-8 py-4 bg-[#F2551E] text-black font-bold rounded uppercase tracking-wide hover:bg-[#FF6B33] transition-colors"
            >
              Call {PHONE}
            </a>
          </Reveal>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <span className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              IRONWOOD AUTO &amp; TIRE
            </span>
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#7A7D80] uppercase tracking-wide">
              <span>ASE-Certified Technicians</span>
              <span>Licensed &amp; Insured</span>
            </div>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white text-sm font-medium rounded hover:bg-[#F2551E]/10 hover:text-[#F2551E] border border-white/10 hover:border-[#F2551E]/30 transition-all duration-300"
            >
              Want a site like this? Get a quote →
            </Link>
          </div>
          <p className="text-xs text-[#6E7174] leading-relaxed">
            Ironwood Auto &amp; Tire is a fictional business. This page is a demo built by Soft
            Systems Studio to show what an auto repair website could look like — it is not a real
            repair shop, and the phone number above does not ring a real business.
          </p>
          <p className="text-[11px] text-[#54575A] mt-3">
            Photos via Pexels: Artem Podrez, Sergey Meshkov, Jae Park, and Gustavo Fring.
          </p>
        </div>
      </footer>

      {/* ───────── MOBILE STICKY CALL BAR ───────── */}
      <a
        href={PHONE_HREF}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F2551E] text-black text-center font-bold py-4 uppercase tracking-wide"
      >
        Call Now — {PHONE}
      </a>
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
