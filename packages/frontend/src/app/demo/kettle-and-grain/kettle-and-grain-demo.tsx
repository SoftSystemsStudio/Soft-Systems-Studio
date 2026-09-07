'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const body = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

/* ─── tiny intersection-observer reveal, matches the pattern used on the other demo pages ─── */
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
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── data ─── */
const menu = [
  {
    group: 'Espresso',
    items: [
      { name: 'Espresso', price: '$3.25' },
      { name: 'Cortado', price: '$4.25' },
      { name: 'Cappuccino', price: '$4.75' },
      { name: 'Oat Milk Latte', price: '$5.25' },
    ],
  },
  {
    group: 'Drip & Pour-Over',
    items: [
      { name: 'House Drip', price: '$3.00' },
      { name: 'Pour-Over, single origin', price: '$5.50' },
      { name: 'Cold Brew', price: '$4.50' },
    ],
  },
  {
    group: 'From the Case',
    items: [
      { name: 'Butter Croissant', price: '$3.75' },
      { name: 'Seasonal Scone', price: '$4.00' },
      { name: 'Cardamom Bun', price: '$4.25' },
    ],
  },
];

const hours = [
  ['Monday', '6:30 AM – 4:00 PM'],
  ['Tuesday', '6:30 AM – 4:00 PM'],
  ['Wednesday', '6:30 AM – 4:00 PM'],
  ['Thursday', '6:30 AM – 4:00 PM'],
  ['Friday', '6:30 AM – 6:00 PM'],
  ['Saturday', '7:30 AM – 6:00 PM'],
  ['Sunday', 'Closed'],
];

export default function KettleAndGrainDemo() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-[#132018] text-[#EDE8DC] antialiased`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* ───────── DEMO BADGE ───────── */}
      <div className="fixed top-20 md:top-4 right-4 z-[60] px-4 py-2 bg-[#C99A44] text-[#132018] text-xs font-bold rounded-full shadow-lg tracking-wider uppercase">
        Demo Site
      </div>
      <Link
        href="/#portfolio"
        className="fixed top-20 md:top-4 left-4 z-[60] px-4 py-2 bg-black/30 backdrop-blur-md text-[#EDE8DC] text-sm font-medium rounded-lg hover:bg-black/50 transition-all duration-300"
      >
        ← Back to Portfolio
      </Link>

      {/* ───────── NAV ───────── */}
      <nav className="sticky top-0 z-50 bg-[#132018]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <span
            className="text-xl tracking-wide"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            Kettle &amp; Grain
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#C7D0C2]">
            <a href="#menu" className="hover:text-[#EDE8DC] transition-colors">
              Menu
            </a>
            <a href="#atmosphere" className="hover:text-[#EDE8DC] transition-colors">
              The Space
            </a>
            <a href="#visit" className="hover:text-[#EDE8DC] transition-colors">
              Hours &amp; Visit
            </a>
          </div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-sm text-[#EDE8DC] border border-white/20 rounded-full px-4 py-1.5"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-[#C7D0C2]">
            <a href="#menu" onClick={() => setMenuOpen(false)}>
              Menu
            </a>
            <a href="#atmosphere" onClick={() => setMenuOpen(false)}>
              The Space
            </a>
            <a href="#visit" onClick={() => setMenuOpen(false)}>
              Hours &amp; Visit
            </a>
          </div>
        )}
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[100dvh] flex items-end pt-24 pb-16 md:pb-24">
        <div className="absolute inset-0">
          <Image
            src="/images/demo/kettle-and-grain/hero-interior.jpg"
            alt="Warm, sunlit interior of a small coffee shop with mismatched wooden seating"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D160F] via-[#0D160F]/40 to-[#0D160F]/10" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 w-full">
          {/* Same fix as Green Bench's hero eyebrow (2026-09-06): a solid-ish
              backing makes this line's contrast provably safe regardless of
              the photo behind it, rather than depending on the thin scrim
              alone. This particular photo doesn't trigger the failure, but
              the underlying risk (text color with no guaranteed-dark
              backing over a live photo) is the same one that did on
              Green Bench's. */}
          <p className="inline-block bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm tracking-[0.15em] uppercase text-[#C99A44] mb-4">
            Downtown Phenix City, Alabama
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-6 max-w-2xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Coffee,
            <br />
            unhurried.
          </h1>
          <p className="text-lg text-[#C7D0C2] max-w-md mb-8 leading-relaxed">
            A small room on Broad Street with good light, mismatched chairs, and coffee worth
            sitting still for.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#menu"
              className="px-6 py-3 bg-[#C99A44] text-[#132018] font-semibold rounded-full hover:bg-[#DBAE5B] transition-colors"
            >
              See the menu
            </a>
            <a
              href="#visit"
              className="px-6 py-3 border border-white/25 text-[#EDE8DC] rounded-full hover:border-white/50 transition-colors"
            >
              Get directions
            </a>
          </div>
        </div>
      </section>

      {/* ───────── ASYMMETRIC STAT STRIP ───────── */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-12 md:gap-20">
          <Reveal>
            <h2
              className="text-3xl md:text-4xl leading-snug"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              We roast in small batches, pull one shot at a time, and don&apos;t rush either.
            </h2>
            <p className="mt-6 text-[#C7D0C2] leading-relaxed max-w-md">
              No drive-through, no loyalty app, no rewards tier. Just a counter, a grinder, and
              regulars who&apos;ve stopped checking the time when they walk in.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8">
            {[
              ['6', 'days open a week'],
              ['1', 'roaster we buy from, on purpose'],
              ['14', 'drinks on the board'],
            ].map(([num, label]) => (
              <Reveal key={label}>
                <div
                  className="text-5xl text-[#C99A44]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                >
                  {num}
                </div>
                <div className="text-sm text-[#9AA596] mt-1">{label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── ATMOSPHERE ───────── */}
      <section id="atmosphere" className="border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Reveal className="relative min-h-[420px] md:min-h-[560px]">
            <Image
              src="/images/demo/kettle-and-grain/latte-pour.jpg"
              alt="Barista pouring milk to finish a latte"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="flex items-center bg-[#0D160F]">
            <div className="px-6 md:px-16 py-16 md:py-0">
              <p className="text-sm tracking-[0.15em] uppercase text-[#C99A44] mb-4">The Space</p>
              <h2
                className="text-3xl md:text-4xl mb-6 leading-snug"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Light through the front windows, a shelf of beans for sale, and nowhere you have to
                be.
              </h2>
              <p className="text-[#C7D0C2] leading-relaxed max-w-md">
                Fourteen seats, most of them taken by people who brought a book or a laptop and
                stayed longer than they meant to. We keep the music low and the Wi-Fi on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── MENU ───────── */}
      <section id="menu" className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-16 max-w-lg">
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              What&apos;s on the board.
            </h2>
            <p className="text-[#C7D0C2]">
              Espresso, drip, and a small case of pastries baked before sunrise. Ask what&apos;s
              brewing as a pour-over — it changes with what came in that week.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-14">
            {menu.map((section) => (
              <Reveal key={section.group}>
                <h3 className="text-sm tracking-[0.1em] uppercase text-[#C99A44] mb-5">
                  {section.group}
                </h3>
                <ul className="space-y-4">
                  {section.items.map((item) => (
                    <li key={item.name} className="flex items-baseline justify-between gap-4">
                      <span className="text-[#EDE8DC]">{item.name}</span>
                      <span className="text-sm text-[#9AA596] whitespace-nowrap">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── GALLERY ───────── */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24">
          <Reveal className="mb-12">
            <h2
              className="text-3xl md:text-4xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Around the shop.
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Reveal className="col-span-2 relative aspect-[16/10] rounded-xl overflow-hidden">
              <Image
                src="/images/demo/kettle-and-grain/barista.jpg"
                alt="Barista steaming milk at the espresso machine"
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal className="relative aspect-[16/10] rounded-xl overflow-hidden" delay={0.1}>
              <Image
                src="/images/demo/kettle-and-grain/pastry-case.jpg"
                alt="Pastry case with croissants and scones"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal className="relative aspect-[16/10] rounded-xl overflow-hidden" delay={0.05}>
              <Image
                src="/images/demo/kettle-and-grain/espresso-detail.jpg"
                alt="Close-up detail of an espresso setup"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── HOURS & VISIT ───────── */}
      <section id="visit" className="border-t border-white/10 bg-[#0D160F]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
          <Reveal>
            <h2
              className="text-3xl md:text-4xl mb-8"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Hours
            </h2>
            <dl className="space-y-3">
              {hours.map(([day, time]) => (
                <div key={day} className="flex items-baseline justify-between text-sm">
                  <dt className="text-[#C7D0C2]">{day}</dt>
                  <dd className={time === 'Closed' ? 'text-[#7C8578]' : 'text-[#EDE8DC]'}>
                    {time}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="text-3xl md:text-4xl mb-8"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Find us
            </h2>
            <p className="text-[#C7D0C2] leading-relaxed mb-6">
              1410 Broad Street
              <br />
              Phenix City, AL 36867
            </p>
            <p className="text-[#C7D0C2] leading-relaxed mb-6">
              Street parking out front, and a small lot around back off 15th Avenue.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-block px-6 py-3 border border-white/25 text-[#EDE8DC] rounded-full hover:border-white/50 transition-colors text-sm"
            >
              Get directions
            </a>
          </Reveal>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <span
              className="text-lg"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              Kettle &amp; Grain Coffee Co.
            </span>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 text-[#EDE8DC] text-sm font-medium rounded-lg hover:bg-[#C99A44]/10 hover:text-[#C99A44] border border-white/10 hover:border-[#C99A44]/30 transition-all duration-300"
            >
              Want a site like this? Get a quote →
            </Link>
          </div>
          <p className="text-xs text-[#7C8578] leading-relaxed">
            Kettle &amp; Grain Coffee Co. is a fictional business. This page is a demo built by Soft
            Systems Studio to show what a coffee shop website could look like — it is not a real
            coffee shop, and nothing on this page can be ordered.
          </p>
          <p className="text-[11px] text-[#5F6759] mt-3">
            Photos via Pexels: Jayce Q, Anna Tarazevich, James Collington, Pavel Danilyuk, and
            Lum3n.
          </p>
        </div>
      </footer>
    </div>
  );
}
