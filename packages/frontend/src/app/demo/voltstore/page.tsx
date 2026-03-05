'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ─── data ─── */
const products = [
  { id: 1, name: 'Volt MX Keyboard', price: 149, oldPrice: 179, badge: 'Bestseller', rating: 4.9, reviews: 2341, category: 'keyboards', img: '⌨️', desc: 'Mechanical RGB keyboard with hot-swappable switches, PBT keycaps, and per-key lighting. Built for competitive gaming.', specs: ['Hot-swap mechanical switches', 'PBT double-shot keycaps', 'Per-key RGB lighting', 'USB-C detachable cable', 'N-key rollover'] },
  { id: 2, name: 'Precision Mouse Pro', price: 79, oldPrice: 0, badge: '', rating: 4.7, reviews: 1872, category: 'mice', img: '🖱️', desc: 'Ultra-lightweight 58g gaming mouse with 25K DPI sensor, PTFE feet, and flexible paracord cable.', specs: ['25,600 DPI optical sensor', '58g ultra-lightweight', 'PTFE glide feet', '6 programmable buttons', '80hr battery life'] },
  { id: 3, name: 'Elite Headset X7', price: 199, oldPrice: 249, badge: 'New', rating: 4.8, reviews: 967, category: 'audio', img: '🎧', desc: '7.1 surround sound wireless headset with 50mm drivers, memory foam pads, and 40hr battery life.', specs: ['50mm neodymium drivers', '7.1 virtual surround', 'Memory foam ear cushions', '40hr battery life', 'Detachable boom mic'] },
  { id: 4, name: 'RGB Mousepad XL', price: 39, oldPrice: 49, badge: '', rating: 4.6, reviews: 3120, category: 'accessories', img: '🖥️', desc: 'Extended RGB mousepad with micro-textured surface, non-slip rubber base, and 16.8M color edge lighting.', specs: ['900x400mm extended size', 'Micro-textured cloth surface', '16.8M color RGB edge', 'Non-slip rubber base', 'USB passthrough'] },
  { id: 5, name: 'Streaming Webcam 4K', price: 129, oldPrice: 0, badge: '', rating: 4.5, reviews: 784, category: 'streaming', img: '📷', desc: '4K 60fps webcam with auto-focus, HDR, and AI-powered noise cancellation for professional streams.', specs: ['4K @ 60fps capture', 'Auto-focus with face tracking', 'HDR & low-light correction', 'AI noise cancellation', 'Privacy shutter'] },
  { id: 6, name: 'Gaming Monitor 27"', price: 349, oldPrice: 449, badge: 'Sale', rating: 4.9, reviews: 1543, category: 'monitors', img: '🖥️', desc: '27" 1440p 240Hz IPS gaming monitor with 1ms response time, G-Sync compatible, and HDR600.', specs: ['2560x1440 IPS panel', '240Hz refresh rate', '1ms GtG response', 'G-Sync & FreeSync', 'HDR600 certified'] },
  { id: 7, name: 'Volt Controller V2', price: 69, oldPrice: 89, badge: 'Hot', rating: 4.7, reviews: 2056, category: 'accessories', img: '🎮', desc: 'Wireless controller with Hall-effect triggers, mechanical bumpers, and remappable back buttons.', specs: ['Hall-effect analog sticks', 'Mechanical bumpers', '4 remappable back buttons', 'Bluetooth 5.3 + 2.4GHz', '30hr battery life'] },
  { id: 8, name: 'Stream Deck Mini', price: 99, oldPrice: 0, badge: 'New', rating: 4.4, reviews: 623, category: 'streaming', img: '🔲', desc: '6-key customizable LCD stream deck for OBS, Twitch, and productivity macros.', specs: ['6 customizable LCD keys', 'Drag-and-drop setup', 'Multi-action support', 'OBS & Twitch integration', 'Plugin ecosystem'] },
];

const categories = [
  { name: 'Keyboards', slug: 'keyboards', icon: '⌨️', count: 24 },
  { name: 'Mice', slug: 'mice', icon: '🖱️', count: 18 },
  { name: 'Audio', slug: 'audio', icon: '🎧', count: 31 },
  { name: 'Monitors', slug: 'monitors', icon: '🖥️', count: 12 },
  { name: 'Streaming', slug: 'streaming', icon: '📷', count: 15 },
  { name: 'Accessories', slug: 'accessories', icon: '🎮', count: 42 },
];

const reviews = [
  { name: 'Alex R.', avatar: '🧑‍💻', rating: 5, text: 'The MX Keyboard completely changed my gaming experience. The switches feel incredible and the RGB is insane.', product: 'Volt MX Keyboard', verified: true },
  { name: 'Sarah K.', avatar: '👩‍🎮', rating: 5, text: 'Best headset I\'ve ever owned. 40 hours of battery life is no joke — I charge it once a week.', product: 'Elite Headset X7', verified: true },
  { name: 'Marcus T.', avatar: '🧑‍🔬', rating: 5, text: 'This monitor at 240Hz is buttery smooth. Coming from 144Hz, the difference is night and day.', product: 'Gaming Monitor 27"', verified: true },
  { name: 'Jess L.', avatar: '👩‍💻', rating: 4, text: 'Precision Mouse is so light it feels like nothing in my hand. My aim has genuinely improved.', product: 'Precision Mouse Pro', verified: true },
];

/* ─── helpers ─── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: string }) {
  const sz = size === 'lg' ? 'text-lg' : 'text-xs';
  return (
    <span className={`${sz} flex gap-0.5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-600'}>★</span>
      ))}
    </span>
  );
}

/* ─── main ─── */
export default function VoltStoreDemo() {
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<typeof products[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [heroIdx, setHeroIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const heroProducts = products.filter(p => p.badge === 'New' || p.badge === 'Bestseller' || p.badge === 'Sale');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    timerRef.current = setInterval(() => setHeroIdx(i => (i + 1) % heroProducts.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [heroProducts.length]);

  const addToCart = (id: number) => {
    setCart(c => {
      const existing = c.find(x => x.id === id);
      if (existing) return c.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { id, qty: 1 }];
    });
    setCartOpen(true);
    setTimeout(() => setCartOpen(false), 2000);
  };

  const removeFromCart = (id: number) => setCart(c => c.filter(x => x.id !== id));
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const cartTotal = cart.reduce((s, x) => {
    const p = products.find(p => p.id === x.id);
    return s + (p ? p.price * x.qty : 0);
  }, 0);

  const filtered = products
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const currentHero = heroProducts[heroIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-lime-400/30 selection:text-white">

      {/* ── Limited-Time Offer Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 text-black">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-center gap-3 text-sm font-bold relative z-10">
          <span className="animate-pulse">⚡</span>
          <span>FLASH SALE — Up to 40% OFF Select Items</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline font-mono bg-black/10 px-2 py-0.5 rounded text-xs">VOLT40</span>
          <span className="hidden sm:inline">— Ends in 04:22:17</span>
          <span className="animate-pulse">⚡</span>
        </div>
      </div>

      {/* ── Demo Badge ── */}
      <div className="fixed top-20 right-4 z-50 px-3 py-1.5 bg-pink-500/90 backdrop-blur text-white text-xs font-bold rounded-full shadow-lg shadow-pink-500/20 animate-pulse">
        DEMO SITE
      </div>

      {/* ── Back Button ── */}
      <Link
        href="/#portfolio"
        className="fixed top-20 left-4 z-50 px-3 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-xs font-medium rounded-full hover:bg-white/15 hover:border-lime-400/30 transition-all duration-300"
      >
        ← Back to Portfolio
      </Link>

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-black font-black text-sm">V</div>
              <span className="text-xl font-black tracking-tight">VOLT<span className="text-lime-400">STORE</span></span>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-sm">
              {['Products', 'Categories', 'Deals', 'Reviews'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="px-4 py-2 rounded-lg hover:bg-white/5 hover:text-lime-400 transition-all duration-200 font-medium">{item}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 hover:border-lime-400/30 transition-all w-48">
                <span className="text-xs">🔍</span>
                <span>Search products...</span>
              </button>
              <button className="relative p-2.5 rounded-lg hover:bg-white/5 transition group" onClick={() => setCartOpen(!cartOpen)}>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-lime-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-lime-400 text-black text-[10px] font-black rounded-full flex items-center justify-center animate-[bounceIn_0.3s_ease]">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Cart Dropdown ── */}
        {cartOpen && (
          <div className="absolute right-4 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden" onMouseLeave={() => setCartOpen(false)}>
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Shopping Cart ({cartCount})</span>
                <button onClick={() => setCartOpen(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
              </div>
            </div>
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Your cart is empty</div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto">
                  {cart.map(item => {
                    const p = products.find(x => x.id === item.id)!;
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-white/5 transition">
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-xl">{p.img}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="text-xs text-slate-400">Qty: {item.qty} × ${p.price}</div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 text-xs p-1">✕</button>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-bold text-lime-400">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-lime-400/20 transition-all active:scale-[0.98]">
                    Checkout — ${cartTotal.toFixed(2)}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Animated Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(163,230,53,0.1),transparent)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400/10 border border-lime-400/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                <span className="text-lime-400 text-xs font-bold tracking-wider uppercase">{currentHero?.badge || 'Featured'}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-[0.95] tracking-tight">
                <span className="block">Premium</span>
                <span className="block bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">Gaming Gear</span>
                <span className="block text-slate-400 text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">Engineered to Win</span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
                Pro-grade peripherals used by top esports teams. Precision-engineered for competitive gaming with zero compromises.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#products" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold text-base rounded-xl hover:shadow-xl hover:shadow-lime-400/25 transition-all duration-300 active:scale-[0.97]">
                  Shop Collection
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                </a>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-base rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
                  Watch Film
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6">
                {[
                  { icon: '🚀', label: 'Free 2-Day Shipping' },
                  { icon: '↩️', label: '30-Day Free Returns' },
                  { icon: '🛡️', label: '2-Year Warranty' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="text-base">{b.icon}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero product showcase */}
            <div className={`relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lime-400/20 via-green-500/10 to-transparent blur-2xl" />
                <div className="relative h-full rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(163,230,53,0.08),transparent_70%)]" />
                  {heroProducts.map((p, i) => (
                    <div key={p.id} className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${i === heroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <span className="text-8xl mb-6">{p.img}</span>
                      <div className="text-center">
                        <div className="text-xl font-bold mb-1">{p.name}</div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl font-black text-lime-400">${p.price}</span>
                          {p.oldPrice > 0 && <span className="text-sm text-slate-500 line-through">${p.oldPrice}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Carousel dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {heroProducts.map((_, i) => (
                      <button key={i} onClick={() => setHeroIdx(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === heroIdx ? 'bg-lime-400 w-6' : 'bg-white/20 hover:bg-white/40'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -bottom-4 -left-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400 text-lg">⚡</div>
                  <div>
                    <div className="text-xs text-slate-400">Active Users</div>
                    <div className="font-bold text-sm">2,847 online</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 text-lg">★</div>
                  <div>
                    <div className="text-xs text-slate-400">Avg Rating</div>
                    <div className="font-bold text-sm">4.8 / 5.0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Bar ── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '4.8★', label: 'Average Rating' },
              { value: '200+', label: 'Pro Players Use Us' },
              { value: '99.9%', label: 'Uptime Guarantee' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black text-lime-400">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <section id="categories" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-lime-400 text-xs font-bold tracking-widest uppercase">Browse</span>
              <h2 className="text-3xl lg:text-4xl font-black mt-1">Shop by Category</h2>
            </div>
            <a href="#products" className="hidden sm:flex items-center gap-1 text-sm text-slate-400 hover:text-lime-400 transition">
              View All <span>→</span>
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => { setActiveCategory(cat.slug); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-lime-400/30 hover:bg-lime-400/[0.05] transition-all duration-300"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="font-bold text-sm group-hover:text-lime-400 transition">{cat.name}</span>
                <span className="text-[10px] text-slate-500">{cat.count} items</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section id="products" className="py-16 lg:py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-lime-400 text-xs font-bold tracking-widest uppercase">Collection</span>
              <h2 className="text-3xl lg:text-4xl font-black mt-1">Featured Products</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                <button onClick={() => setActiveCategory('all')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeCategory === 'all' ? 'bg-lime-400 text-black' : 'text-slate-400 hover:text-white'}`}>All</button>
                {categories.slice(0, 4).map(c => (
                  <button key={c.slug} onClick={() => setActiveCategory(c.slug)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition hidden md:block ${activeCategory === c.slug ? 'bg-lime-400 text-black' : 'text-slate-400 hover:text-white'}`}>{c.name}</button>
                ))}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-lime-400/50 appearance-none cursor-pointer">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map(product => (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden hover:border-lime-400/30 hover:shadow-xl hover:shadow-lime-400/5 transition-all duration-500 hover:-translate-y-1"
              >
                {product.badge && (
                  <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                    product.badge === 'Sale' ? 'bg-red-500 text-white' :
                    product.badge === 'New' ? 'bg-blue-500 text-white' :
                    product.badge === 'Hot' ? 'bg-orange-500 text-white' :
                    'bg-lime-400 text-black'
                  }`}>
                    {product.badge}
                  </div>
                )}

                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-br from-white/[0.05] to-transparent overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                    {product.img}
                  </div>
                  {/* Quick actions overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => setQuickView(product)} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-lime-400 transition transform translate-y-4 group-hover:translate-y-0 duration-300">
                      Quick View
                    </button>
                    <button onClick={() => addToCart(product.id)} className="p-2 bg-lime-400 text-black rounded-lg hover:bg-lime-300 transition transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Stars rating={product.rating} />
                    <span className="text-[10px] text-slate-500">({product.reviews.toLocaleString()})</span>
                  </div>
                  <h3 className="font-bold text-sm mb-3 group-hover:text-lime-400 transition leading-tight">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-lime-400">${product.price}</span>
                      {product.oldPrice > 0 && <span className="text-xs text-slate-500 line-through">${product.oldPrice}</span>}
                    </div>
                    <button onClick={() => addToCart(product.id)} className="p-2 rounded-lg bg-white/5 hover:bg-lime-400 hover:text-black text-slate-400 transition-all duration-200">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <span className="text-4xl block mb-4">🔍</span>
              <p>No products found in this category.</p>
              <button onClick={() => setActiveCategory('all')} className="mt-3 text-lime-400 text-sm hover:underline">View all products</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Quick View Modal ── */}
      {quickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setQuickView(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setQuickView(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition">✕</button>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-square bg-gradient-to-br from-white/[0.05] to-transparent flex items-center justify-center text-8xl">
                {quickView.img}
              </div>
              <div className="p-6 flex flex-col">
                {quickView.badge && (
                  <span className="self-start px-2.5 py-1 bg-lime-400/10 text-lime-400 text-[10px] font-bold rounded-lg uppercase mb-3">{quickView.badge}</span>
                )}
                <h3 className="text-2xl font-black mb-2">{quickView.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={quickView.rating} size="lg" />
                  <span className="text-sm text-slate-400">{quickView.rating} ({quickView.reviews.toLocaleString()} reviews)</span>
                </div>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{quickView.desc}</p>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Features</div>
                  <ul className="space-y-1.5">
                    {quickView.specs.map(s => (
                      <li key={s} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-lime-400 text-[10px]">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black text-lime-400">${quickView.price}</span>
                    {quickView.oldPrice > 0 && (
                      <>
                        <span className="text-lg text-slate-500 line-through">${quickView.oldPrice}</span>
                        <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">SAVE ${quickView.oldPrice - quickView.price}</span>
                      </>
                    )}
                  </div>
                  <button onClick={() => { addToCart(quickView.id); setQuickView(null); }} className="w-full py-3 bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-lime-400/25 transition-all active:scale-[0.98]">
                    Add to Cart — ${quickView.price}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Deals Banner ── */}
      <section id="deals" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-lime-400/10 via-green-500/10 to-emerald-500/10 border border-lime-400/20 p-8 lg:p-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-3 py-1 bg-lime-400 text-black text-xs font-black rounded-lg mb-4">LIMITED TIME</span>
                <h2 className="text-3xl lg:text-5xl font-black mb-4">
                  Bundle & Save<br /><span className="text-lime-400">Up to 40% OFF</span>
                </h2>
                <p className="text-slate-400 mb-6 max-w-md">Get the complete gaming setup — keyboard, mouse, headset, and mousepad — at an unbeatable price.</p>
                <div className="flex items-center gap-4">
                  <a href="#products" className="px-6 py-3 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition">Shop Bundles</a>
                  <div className="text-sm">
                    <div className="text-slate-500">Use code</div>
                    <div className="font-mono font-bold text-lime-400">VOLT40</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-center">
                {[
                  { val: '04', label: 'Hours' },
                  { val: '22', label: 'Min' },
                  { val: '17', label: 'Sec' },
                ].map(t => (
                  <div key={t.label} className="w-20 p-3 bg-black/30 rounded-2xl border border-white/5">
                    <div className="text-3xl font-black font-mono text-lime-400">{t.val}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <section id="reviews" className="py-16 lg:py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-lime-400 text-xs font-bold tracking-widest uppercase">Testimonials</span>
            <h2 className="text-3xl lg:text-4xl font-black mt-1 mb-3">What Gamers Say</h2>
            <div className="flex items-center justify-center gap-2">
              <Stars rating={4.8} size="lg" />
              <span className="text-sm text-slate-400">4.8 out of 5 based on 10,000+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-lime-400/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">{r.avatar}</div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      {r.name}
                      {r.verified && <span className="text-[9px] px-1.5 py-0.5 bg-lime-400/10 text-lime-400 rounded font-bold">VERIFIED</span>}
                    </div>
                    <div className="text-[10px] text-slate-500">{r.product}</div>
                  </div>
                </div>
                <Stars rating={r.rating} />
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Features ── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🚚', title: 'Free 2-Day Shipping', desc: 'On all orders over $50', color: 'lime' },
              { icon: '🔒', title: 'Secure Checkout', desc: '256-bit SSL encryption', color: 'blue' },
              { icon: '↩️', title: '30-Day Free Returns', desc: 'No questions asked', color: 'purple' },
              { icon: '🛡️', title: '2-Year Warranty', desc: 'Full coverage included', color: 'orange' },
            ].map(f => (
              <div key={f.title} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-lime-400/20 text-center transition-all duration-300 hover:-translate-y-1">
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{f.icon}</span>
                <div className="font-bold text-sm mb-1">{f.title}</div>
                <div className="text-xs text-slate-500">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 p-8 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(163,230,53,0.05),transparent_70%)]" />
            <div className="relative max-w-2xl mx-auto text-center">
              <span className="inline-block text-4xl mb-4">💎</span>
              <h2 className="text-3xl lg:text-4xl font-black mb-3">Join the VoltStore VIP</h2>
              <p className="text-slate-400 mb-6">Get exclusive early access, member-only deals, and pro gaming tips.</p>

              <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
                {['10% Welcome Discount', 'Early Access Drops', 'Pro Gaming Tips', 'Exclusive Giveaways'].map(b => (
                  <div key={b} className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-lime-400 text-xs">✓</span> {b}
                  </div>
                ))}
              </div>

              {subscribed ? (
                <div className="py-4 px-6 bg-lime-400/10 border border-lime-400/30 rounded-2xl text-lime-400 font-bold">
                  ✓ You&apos;re in! Check your inbox for your 10% discount code.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-lime-400/50 transition"
                  />
                  <button onClick={() => setSubscribed(true)} className="px-6 py-3.5 bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-lime-400/20 transition-all whitespace-nowrap active:scale-[0.97]">
                    Get 10% Off
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-600 mt-4">Join 15,000+ gamers. Unsubscribe anytime. We respect your inbox.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-black font-black text-sm">V</div>
                <span className="text-lg font-black">VOLT<span className="text-lime-400">STORE</span></span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">Premium gaming peripherals engineered for performance. Trusted by 50,000+ gamers worldwide.</p>
              <div className="flex gap-3">
                {['𝕏', 'in', 'yt', 'dc'].map(s => (
                  <div key={s} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs text-slate-400 hover:bg-lime-400/10 hover:text-lime-400 cursor-pointer transition">{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: 'Shop', links: ['All Products', 'Keyboards', 'Mice', 'Audio', 'Monitors', 'Accessories'] },
              { title: 'Support', links: ['Help Center', 'Shipping Info', 'Returns', 'Warranty', 'Contact Us'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Affiliates', 'Blog'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-sm text-slate-500 hover:text-lime-400 transition">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 py-6 border-y border-white/5">
            {['visa', 'mastercard', 'amex', 'paypal', 'apple pay', 'google pay'].map(p => (
              <div key={p} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] text-slate-400 uppercase tracking-wider font-bold">{p}</div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <p className="text-xs text-slate-600">© 2026 VoltStore. All rights reserved. This is a demo website.</p>
            <Link
              href="/#web-design"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-full hover:bg-lime-400/10 hover:border-lime-400/30 hover:text-lime-400 transition-all"
            >
              Want a site like this? <span className="font-bold">Get a Quote →</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* ── Global Shimmer Animation ── */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
