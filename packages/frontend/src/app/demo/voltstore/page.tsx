'use client';

import Link from 'next/link';

export default function VoltStoreDemo() {
  const products = [
    { name: 'Volt MX Keyboard', price: '$149', badge: 'Bestseller' },
    { name: 'Precision Mouse Pro', price: '$79', badge: '' },
    { name: 'Elite Headset', price: '$199', badge: 'New' },
    { name: 'RGB Mousepad XL', price: '$39', badge: '' },
    { name: 'Streaming Webcam 4K', price: '$129', badge: '' },
    { name: 'Gaming Monitor 27"', price: '$349', badge: 'Sale' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
        DEMO SITE
      </div>

      {/* Back Button */}
      <Link
        href="/#portfolio"
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-white/20 transition"
      >
        ← Back to Portfolio
      </Link>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-slate-900/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black">
              VOLT<span className="text-lime-400">STORE</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#products" className="hover:text-lime-400 transition">
                Products
              </a>
              <a href="#new" className="hover:text-lime-400 transition">
                New Arrivals
              </a>
              <a href="#sale" className="hover:text-lime-400 transition">
                Sale
              </a>
              <button className="p-2 hover:bg-white/10 rounded-lg transition">
                <span className="text-xl">🛒</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-lime-400/20 border border-lime-400/30 text-lime-400 text-xs font-bold rounded-full mb-6">
                NEW RELEASE
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                Premium Gaming Peripherals
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Engineered for performance. Built to last. Designed for gamers who demand the best.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-lime-400 text-black font-bold text-lg rounded-lg hover:bg-lime-300 transition">
                  Shop Now
                </button>
                <button className="px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-lg hover:bg-white/10 transition">
                  View Collection
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lime-400">✓</span>
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lime-400">✓</span>
                  <span>30-Day Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lime-400">✓</span>
                  <span>2-Year Warranty</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-lime-400 to-green-700 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.name}
                className="group relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-lime-400/50 transition-all duration-300"
              >
                {product.badge && (
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-lime-400 text-black text-xs font-bold rounded-full">
                    {product.badge}
                  </div>
                )}
                {/* Product Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 group-hover:from-lime-900/30 group-hover:to-green-900/30 transition-all duration-300"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-lime-400 transition">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-black text-lime-400">{product.price}</div>
                    <button className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-lime-400 hover:text-black transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-lime-400 text-4xl mb-3">🚚</div>
              <div className="font-bold mb-2">Free Shipping</div>
              <div className="text-sm text-slate-400">On orders over $100</div>
            </div>
            <div>
              <div className="text-lime-400 text-4xl mb-3">🔒</div>
              <div className="font-bold mb-2">Secure Checkout</div>
              <div className="text-sm text-slate-400">SSL encrypted payments</div>
            </div>
            <div>
              <div className="text-lime-400 text-4xl mb-3">↩️</div>
              <div className="font-bold mb-2">Easy Returns</div>
              <div className="text-sm text-slate-400">30-day money back</div>
            </div>
            <div>
              <div className="text-lime-400 text-4xl mb-3">🛡️</div>
              <div className="font-bold mb-2">2-Year Warranty</div>
              <div className="text-sm text-slate-400">On all products</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-b from-transparent to-lime-950/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">Join the VoltStore Community</h2>
          <p className="text-xl text-slate-300 mb-8">
            Get exclusive deals, product drops, and gaming tips delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-lime-400"
            />
            <button className="px-8 py-4 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            Join 15,000+ gamers. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm mb-4">
            This is a demo website created by Soft Systems Studio
          </p>
          <Link
            href="/#web-design"
            className="inline-block px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition"
          >
            Want a site like this? Get a quote →
          </Link>
        </div>
      </footer>
    </div>
  );
}
