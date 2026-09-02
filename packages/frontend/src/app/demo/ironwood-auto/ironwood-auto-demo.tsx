'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const display = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
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
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
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
  },
  { name: 'Oil & Fluid Service', desc: 'In and out in under an hour, most days.' },
  {
    name: 'Diagnostics & Check Engine',
    desc: 'We read the code and explain it in plain terms before touching anything.',
  },
  {
    name: 'Tires & Alignment',
    desc: 'New tires, rotations, and alignments that actually hold.',
  },
  { name: 'AC & Heating', desc: 'Fixed before the next heat wave, not during it.' },
  { name: 'Batteries & Electrical', desc: 'Tested for free, replaced the same day.' },
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
  ['Monday to Friday', '7:00 AM to 6:00 PM'],
  ['Saturday', '8:00 AM to 2:00 PM'],
  ['Sunday', 'Closed'],
];

export default function IronwoodAutoDemo() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div
      className={`${display.variable} ${mono.variable} min-h-screen bg-[#F7F6F2] text-[#16181B] antialiased`}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {/* ───────── DEMO BADGE ───────── */}
      <div className="fixed top-20 right-4 z-[60] px-4 py-2 bg-[#16181B] text-[#F7F6F2] text-xs font-semibold rounded-full shadow-lg tracking-wide uppercase">
        Demo Site
      </div>
      <Link
        href="/#portfolio"
        className="fixed top-20 left-4 z-[60] px-4 py-2 bg-white/80 backdrop-blur-md text-[#16181B] text-sm font-medium rounded-full border border-[#DEDAD1] hover:border-[#24425C]/40 transition-colors duration-300"
      >
        ← Back to Portfolio
      </Link>

      {/* ───────── NAV ───────── */}
      <nav className="sticky top-0 z-40 bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#DEDAD1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <span className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight">IRONWOOD</span>
            <span
              className="text-[10px] uppercase tracking-[0.18em] text-[#6B6F72] hidden sm:inline"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Auto &amp; Tire
            </span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#565B60]">
            <a href="#services" className="hover:text-[#16181B] transition-colors">
              Services
            </a>
            <a href="#why-us" className="hover:text-[#16181B] transition-colors">
              Why Us
            </a>
            <a href="#reviews" className="hover:text-[#16181B] transition-colors">
              Reviews
            </a>
            <a href="#visit" className="hover:text-[#16181B] transition-colors">
              Hours
            </a>
          </div>
          <a
            href={PHONE_HREF}
            className="hidden md:inline-block px-5 py-2.5 bg-[#24425C] text-white text-sm font-semibold rounded-full hover:bg-[#16283A] transition-colors"
          >
            Call {PHONE}
          </a>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden text-sm text-[#16181B] border border-[#DEDAD1] rounded-full px-4 py-1.5"
            aria-expanded={mobileMenu}
            aria-label="Toggle navigation"
          >
            {mobileMenu ? 'Close' : 'Menu'}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-[#DEDAD1] px-6 py-4 flex flex-col gap-4 text-sm text-[#565B60]">
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
      <section className="relative min-h-[100dvh] flex items-center pt-20 lg:pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-20 items-center">
          <div>
            <p
              className="text-xs uppercase tracking-[0.14em] text-[#6B6F72] mb-6"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Family-owned in Phenix City since 2009
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight font-extrabold mb-7">
              Honest work,
              <br />
              plainly explained.
            </h1>
            <p className="text-lg text-[#565B60] max-w-md mb-9 leading-relaxed">
              We show you the worn part, quote it straight, and finish most repairs the same day you
              bring it in.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={PHONE_HREF}
                className="px-7 py-4 bg-[#24425C] text-white font-semibold rounded-full hover:bg-[#16283A] transition-colors"
              >
                Call {PHONE}
              </a>
              <a
                href="#services"
                className="px-7 py-4 border border-[#16181B]/20 text-[#16181B] font-semibold rounded-full hover:border-[#16181B]/45 transition-colors"
              >
                See our services
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl overflow-hidden bg-[#EFEDE6]">
              <Image
                src="/images/demo/ironwood-auto/hero-shop.jpg"
                alt="Clean, well-lit auto repair bay with a car raised on a lift"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block absolute -bottom-8 -left-8 w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-[#F7F6F2] shadow-xl">
              <Image
                src="/images/demo/ironwood-auto/hands-detail.jpg"
                alt="Mechanic's hands at work under the hood"
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── STATS STRIP ───────── */}
      <section className="border-t border-[#DEDAD1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <div
            className="flex flex-wrap gap-y-6 divide-x divide-[#DEDAD1]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {[
              ['2009', 'open in Phenix City'],
              ['1', 'shop, same location'],
              ['Same day', 'most repairs, most weekdays'],
            ].map(([num, label], i) => (
              <div key={label} className={i > 0 ? 'pl-12' : 'pr-12'}>
                <div className="text-2xl font-semibold text-[#24425C]">{num}</div>
                <div className="text-[#6B6F72] text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SERVICES ───────── */}
      <section id="services" className="border-t border-[#DEDAD1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">What we fix</h2>
            <p className="text-[#565B60]">
              If it&apos;s making a noise it shouldn&apos;t, or a light came on that you don&apos;t
              recognize, start here.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
            {services.map((s, i) => (
              <Reveal
                key={s.name}
                delay={i * 0.03}
                className="py-7 border-t border-[#DEDAD1] md:[&:nth-child(-n+2)]:border-t-0"
              >
                <h3 className="text-xl font-semibold mb-2">{s.name}</h3>
                <p className="text-[#6B6F72] text-sm leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── WHY US / TRUST ───────── */}
      <section id="why-us" className="border-t border-[#DEDAD1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <Reveal className="relative aspect-[4/3] rounded-2xl overflow-hidden order-2 md:order-1">
            <Image
              src="/images/demo/ironwood-auto/engine-detail.jpg"
              alt="Mechanic working on an engine on a stand in a bright, clean shop"
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </Reveal>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">
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
                  <div className="text-3xl font-semibold text-[#16181B]">{num}</div>
                  <div className="text-[#6B6F72] text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── DETAIL BAND ───────── */}
      <section className="border-t border-[#DEDAD1]">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-24">
          <Reveal>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#EFEDE6]">
              <Image
                src="/images/demo/ironwood-auto/consultation.jpg"
                alt="A mechanic talking through a repair with a customer"
                fill
                sizes="(min-width: 768px) 60vw, 90vw"
                className="object-cover"
              />
            </div>
            <p className="text-center text-[#6B6F72] text-sm mt-5">
              Every repair gets explained before we start, not after.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────── REVIEWS ───────── */}
      <section id="reviews" className="border-t border-[#DEDAD1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              From the waiting room.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:divide-x md:divide-[#DEDAD1]">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.05} className={i > 0 ? 'md:pl-10' : ''}>
                <p className="text-[#16181B] leading-relaxed mb-5">&ldquo;{r.text}&rdquo;</p>
                <p className="text-sm text-[#6B6F72] font-semibold">{r.name}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── HOURS & VISIT ───────── */}
      <section id="visit" className="border-t border-[#DEDAD1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Hours</h2>
            <dl className="space-y-3">
              {hours.map(([day, time]) => (
                <div key={day} className="flex items-baseline justify-between text-sm">
                  <dt className="text-[#565B60]">{day}</dt>
                  <dd className={time === 'Closed' ? 'text-[#9A9DA0]' : 'text-[#16181B]'}>
                    {time}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Find us</h2>
            <p className="text-[#565B60] leading-relaxed mb-6">
              2210 Summerville Road
              <br />
              Phenix City, AL 36867
            </p>
            <p className="text-[#565B60] leading-relaxed mb-6">
              Also serving Smiths Station, AL and Columbus, GA. Free local towing with any repair
              over $200.
            </p>
            <a
              href={PHONE_HREF}
              className="inline-block px-7 py-4 bg-[#24425C] text-white font-semibold rounded-full hover:bg-[#16283A] transition-colors"
            >
              Call {PHONE}
            </a>
          </Reveal>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="border-t border-[#DEDAD1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <span className="text-lg font-extrabold tracking-tight">IRONWOOD AUTO &amp; TIRE</span>
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#6B6F72] uppercase tracking-wide">
              <span>ASE-Certified Technicians</span>
              <span>Licensed &amp; Insured</span>
            </div>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#16181B] text-sm font-medium rounded-full hover:text-[#24425C] border border-[#DEDAD1] hover:border-[#24425C]/40 transition-all duration-300"
            >
              Want a site like this? Get a quote →
            </Link>
          </div>
          <p className="text-xs text-[#6B6F72] leading-relaxed">
            Ironwood Auto &amp; Tire is a fictional business. This page is a demo built by Soft
            Systems Studio to show what an auto repair website could look like. It is not a real
            repair shop, and the phone number above does not ring a real business.
          </p>
          <p className="text-[11px] text-[#9A9DA0] mt-3">
            Photos via Pexels: Renee Razumov, Artem Podrez, Sergey Meshkov, and Gustavo Fring.
          </p>
        </div>
      </footer>

      {/* ───────── MOBILE STICKY CALL BAR ───────── */}
      <a
        href={PHONE_HREF}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#24425C] text-white text-center font-semibold py-4"
      >
        Call Now: {PHONE}
      </a>
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
