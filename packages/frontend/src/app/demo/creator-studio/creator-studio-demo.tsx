'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── data ─── */
const projects = [
  {
    title: 'Luminary E-Commerce',
    type: 'Web',
    tags: ['Web'],
    year: '2026',
    color: 'from-pink-500 to-rose-400',
    desc: 'Complete redesign of a luxury fashion platform driving 340% conversion lift.',
    stats: { metric: '340%', label: 'Conversion Increase' },
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  },
  {
    title: 'Finova Banking App',
    type: 'Mobile',
    tags: ['Mobile'],
    year: '2026',
    color: 'from-violet-500 to-purple-400',
    desc: 'Mobile-first banking experience serving 2M+ users with biometric auth.',
    stats: { metric: '2M+', label: 'Active Users' },
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  },
  {
    title: 'Aster Brand System',
    type: 'Branding',
    tags: ['Branding'],
    year: '2025',
    color: 'from-amber-400 to-orange-500',
    desc: 'Full brand identity for a sustainable beauty startup — logo, type, packaging.',
    stats: { metric: '$4.2M', label: 'Series A Raised' },
    img: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&q=80',
  },
  {
    title: 'Horizon SaaS Dashboard',
    type: 'Web',
    tags: ['Web'],
    year: '2025',
    color: 'from-cyan-400 to-blue-500',
    desc: 'Analytics dashboard processing 50M events/day with real-time visualization.',
    stats: { metric: '50M', label: 'Events / Day' },
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    title: 'Pulse Fitness',
    type: 'Mobile',
    tags: ['Mobile'],
    year: '2025',
    color: 'from-green-400 to-emerald-500',
    desc: 'AI-powered workout tracker with social features and wearable integration.',
    stats: { metric: '4.9★', label: 'App Store' },
    img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
  },
  {
    title: 'Neon Studios Identity',
    type: 'Branding',
    tags: ['Branding'],
    year: '2024',
    color: 'from-pink-400 to-fuchsia-500',
    desc: 'Bold visual identity for an indie game studio — merch, web, social.',
    stats: { metric: '12', label: 'Deliverables' },
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
  },
];

const skills = [
  { name: 'UI/UX Design', pct: 97 },
  { name: 'React / Next.js', pct: 95 },
  { name: 'TypeScript', pct: 92 },
  { name: 'Brand Strategy', pct: 88 },
  { name: 'Motion Design', pct: 85 },
  { name: 'Figma / Design Systems', pct: 96 },
];

const timeline = [
  {
    year: '2026',
    role: 'Lead Designer & Developer',
    co: 'Freelance / Studio',
    desc: 'Running an independent practice building premium digital products for startups and agencies.',
  },
  {
    year: '2024',
    role: 'Senior Product Designer',
    co: 'Stripe',
    desc: 'Led the redesign of Stripe Dashboard used by millions of businesses worldwide.',
  },
  {
    year: '2022',
    role: 'UI/UX Designer',
    co: 'Figma',
    desc: 'Designed core collaboration features and contributed to the design system.',
  },
  {
    year: '2020',
    role: 'Junior Designer',
    co: 'Webflow',
    desc: 'Built marketing pages and helped shape the visual builder experience.',
  },
];

const clients = ['Google', 'Stripe', 'Figma', 'Vercel', 'Linear', 'Notion', 'Shopify', 'Framer'];

const testimonials = [
  {
    text: 'Jordan transformed our entire digital presence. The results speak for themselves — 340% conversion lift in the first quarter.',
    name: 'Sarah Chen',
    role: 'CEO, Luminary',
    avatar: 'SC',
  },
  {
    text: "One of the most talented designers I've ever worked with. They understand both the craft and the business outcomes.",
    name: 'Marcus Rivera',
    role: 'VP Product, Finova',
    avatar: 'MR',
  },
  {
    text: 'The brand system Jordan created became the foundation for our $4.2M raise. Investors constantly complimented our presentation.',
    name: 'Ayla Osman',
    role: 'Founder, Aster Beauty',
    avatar: 'AO',
  },
];

const articles = [
  { title: 'Design Systems That Actually Scale', date: 'Feb 2026', read: '8 min', tag: 'Design' },
  { title: 'The Art of Micro-Interactions', date: 'Jan 2026', read: '5 min', tag: 'Motion' },
  { title: 'Why I Left Big Tech for Freelance', date: 'Dec 2025', read: '12 min', tag: 'Career' },
];

/* ─── hooks ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimatedBar({ pct, delay }: { pct: number; delay: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-1000 ease-out"
        style={{ width: visible ? `${pct}%` : '0%', transitionDelay: `${delay}ms` }}
      />
    </div>
  );
}

/* ─── page ─── */
export default function CreatorStudioDemo() {
  const [filter, setFilter] = useState<string>('All');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    setHeroLoaded(true);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter));

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setFormData({ name: '', email: '', message: '' });
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-950 overflow-x-hidden">
      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full shadow-lg shadow-pink-500/25 tracking-widest uppercase">
        Demo Site
      </div>
      <Link
        href="/#portfolio"
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/80 backdrop-blur-md text-gray-900 text-sm font-medium rounded-full border border-gray-200 hover:bg-pink-50 hover:border-pink-300 transition-all shadow-sm"
      >
        ← Back
      </Link>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-black tracking-tight">
            Jordan<span className="text-pink-500">.</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            {['Work', 'About', 'Experience', 'Blog', 'Contact'].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="hover:text-pink-500 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="hidden md:block px-5 py-2 bg-gray-950 text-white text-sm font-semibold rounded-full hover:bg-pink-500 transition-colors"
          >
            Let&apos;s Talk
          </a>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-pink-100/60 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-rose-50 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 border border-pink-200 rounded-full text-sm font-semibold text-pink-600 mb-8">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" /> Available for
                projects
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
                I design
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
                  experiences
                </span>
                <br />
                that convert<span className="text-pink-500">.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-lg mb-10 leading-relaxed">
                Full-stack designer & developer crafting premium digital products for ambitious
                brands. Based in Austin, TX.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#work"
                  className="group px-8 py-4 bg-gray-950 text-white font-bold rounded-full hover:bg-pink-500 transition-all duration-300 flex items-center gap-2"
                >
                  View Work{' '}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="#contact"
                  className="px-8 py-4 border-2 border-gray-200 text-gray-900 font-bold rounded-full hover:border-pink-400 hover:text-pink-500 transition-all"
                >
                  Get in Touch
                </a>
              </div>
              <div className="mt-14 flex items-center gap-8 text-sm text-gray-400">
                <div>
                  <span className="block text-3xl font-black text-gray-950">50+</span>Projects
                  Delivered
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <span className="block text-3xl font-black text-gray-950">6+</span>Years
                  Experience
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <span className="block text-3xl font-black text-gray-950">30+</span>Happy Clients
                </div>
              </div>
            </div>
            <div
              className={`relative transition-all duration-1000 delay-300 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-pink-500/10 border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                  alt="Jordan Mills"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center text-white text-xs font-bold">
                    ⭐
                  </div>
                  <div>
                    <div className="text-sm font-bold">Top Rated</div>
                    <div className="text-xs text-gray-400">On 3 platforms</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float-delayed">
                <div className="text-2xl font-black text-pink-500">98%</div>
                <div className="text-xs text-gray-400">Client satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CLIENT LOGOS ══════ */}
      <section className="py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 tracking-widest uppercase mb-10">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {clients.map((c) => (
              <span
                key={c}
                className="text-xl md:text-2xl font-black text-gray-200 hover:text-pink-400 transition-colors duration-300 cursor-default select-none"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WORK / PROJECTS ══════ */}
      <section id="work" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-sm font-semibold text-pink-500 tracking-widest uppercase mb-3">
                Portfolio
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">Selected Work</h2>
            </div>
            <div className="flex gap-2">
              {['All', 'Web', 'Mobile', 'Branding'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-500 hover:bg-pink-50 hover:text-pink-500'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((p, i) => {
              const big = i === 0 && filter === 'All';
              return (
                <div
                  key={p.title}
                  className={`group relative rounded-3xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 cursor-pointer ${big ? 'md:col-span-2' : ''}`}
                >
                  <div
                    className={`relative ${big ? 'aspect-[2.2/1]' : 'aspect-[4/3]'} overflow-hidden`}
                  >
                    <img
                      src={p.img}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-white/80 text-sm max-w-md">{p.desc}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-3xl font-black text-white">{p.stats.metric}</span>
                        <span className="text-sm text-white/60">{p.stats.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between bg-white">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">
                          {p.type}
                        </span>
                        <span className="text-xs text-gray-300">{p.year}</span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-pink-500 transition-colors">
                        {p.title}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all text-sm">
                      →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ ABOUT + SKILLS (Bento) ══════ */}
      <section id="about" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-semibold text-pink-500 tracking-widest uppercase mb-3">
            About
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-14">
            The Person Behind
            <br />
            the Pixels<span className="text-pink-500">.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo */}
            <div className="md:row-span-2 rounded-3xl overflow-hidden border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"
                alt="Jordan"
                className="w-full h-full object-cover min-h-[400px]"
              />
            </div>
            {/* Bio */}
            <div className="md:col-span-2 rounded-3xl bg-white border border-gray-200 p-8 md:p-10 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Full-Stack Designer & Developer</h3>
              <p className="text-gray-500 leading-relaxed mb-4">
                I bridge the gap between stunning design and rock-solid engineering. With 6+ years
                of experience at companies like Stripe, Figma, and Webflow, I bring a unique
                perspective to every project.
              </p>
              <p className="text-gray-500 leading-relaxed">
                My work has generated over $20M in revenue for clients, served millions of users,
                and won multiple design awards. I believe great design isn&apos;t just beautiful —
                it&apos;s measurable.
              </p>
            </div>
            {/* Skills */}
            <div className="md:col-span-2 rounded-3xl bg-white border border-gray-200 p-8 md:p-10">
              <h3 className="text-xl font-bold mb-6">Core Skills</h3>
              <div className="space-y-5">
                {skills.map((s, i) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-gray-400">{s.pct}%</span>
                    </div>
                    <AnimatedBar pct={s.pct} delay={i * 100} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ EXPERIENCE TIMELINE ══════ */}
      <section id="experience" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-semibold text-pink-500 tracking-widest uppercase mb-3">
            Experience
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-14">
            Where I&apos;ve Been<span className="text-pink-500">.</span>
          </h2>
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-200 md:left-1/2" />
            {timeline.map((t, i) => (
              <TimelineItem key={t.year} item={t} idx={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="py-24 md:py-32 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <p className="text-sm font-semibold text-pink-400 tracking-widest uppercase mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-16">
            Kind Words<span className="text-pink-500">.</span>
          </h2>
          <div className="relative min-h-[220px]">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${i === testimonialIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
              >
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 max-w-2xl">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-pink-500 w-6' : 'bg-gray-600 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ BLOG ══════ */}
      <section id="blog" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-sm font-semibold text-pink-500 tracking-widest uppercase mb-3">
                Blog
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Latest Articles</h2>
            </div>
            <a
              href="#"
              className="hidden md:block text-sm font-semibold text-pink-500 hover:underline"
            >
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((a, i) => (
              <div
                key={a.title}
                className="group rounded-3xl border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div
                  className={`aspect-[16/9] bg-gradient-to-br ${i === 0 ? 'from-pink-100 to-rose-100' : i === 1 ? 'from-violet-100 to-purple-100' : 'from-amber-100 to-orange-100'}`}
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-pink-50 text-pink-500 text-xs font-bold rounded-full">
                      {a.tag}
                    </span>
                    <span className="text-xs text-gray-400">
                      {a.date} · {a.read}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-pink-500 transition-colors">
                    {a.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CONTACT ══════ */}
      <section id="contact" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-sm font-semibold text-pink-500 tracking-widest uppercase mb-3">
                Contact
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                Let&apos;s Build
                <br />
                Something Great<span className="text-pink-500">.</span>
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Have a project in mind? I&apos;d love to hear about it. Fill out the form or reach
                out directly.
              </p>
              <div className="space-y-4 text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                    ✉
                  </span>{' '}
                  hello@jordanmills.com
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                    📍
                  </span>{' '}
                  Austin, TX
                </div>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-sm"
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData((d) => ({ ...d, message: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gray-950 text-white font-bold rounded-xl hover:bg-pink-500 transition-colors duration-300"
                >
                  Send Message →
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="py-16 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="text-2xl font-black">
              Jordan<span className="text-pink-500">.</span>
            </div>
            <div className="flex items-center gap-4">
              {[
                { name: 'Twitter', icon: '𝕏' },
                { name: 'GitHub', icon: 'GH' },
                { name: 'LinkedIn', icon: 'in' },
                { name: 'Dribbble', icon: 'Dr' },
                { name: 'YouTube', icon: '▶' },
              ].map((s) => (
                <a
                  key={s.name}
                  href="#"
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-sm text-gray-400 hover:border-pink-500 hover:text-pink-400 hover:bg-pink-500/10 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 Jordan Mills. All rights reserved.</p>
            <p className="text-sm text-gray-600">
              Demo website by{' '}
              <Link href="/#web-design" className="text-pink-400 hover:text-pink-300 font-semibold">
                Soft Systems Studio
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Float animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}

/* ─── Timeline Item ─── */
function TimelineItem({ item: t, idx }: { item: (typeof timeline)[0]; idx: number }) {
  const { ref, visible } = useInView(0.3);
  const isEven = idx % 2 === 0;
  return (
    <div
      ref={ref}
      className={`relative flex items-start mb-12 md:mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${idx * 150}ms` }}
    >
      {/* Dot */}
      <div className="absolute left-[13px] md:left-1/2 md:-translate-x-1/2 w-3.5 h-3.5 rounded-full bg-pink-500 border-4 border-white shadow z-10" />
      {/* Card */}
      <div
        className={`ml-12 md:ml-0 md:w-[45%] ${isEven ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-pink-200 hover:shadow-lg transition-all">
          <span className="text-xs font-bold text-pink-500">{t.year}</span>
          <h3 className="text-lg font-bold mt-1">{t.role}</h3>
          <p className="text-sm text-gray-400 font-semibold">{t.co}</p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{t.desc}</p>
        </div>
      </div>
    </div>
  );
}
