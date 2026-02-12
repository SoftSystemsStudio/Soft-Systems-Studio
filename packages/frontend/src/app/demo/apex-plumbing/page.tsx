'use client';

import Link from 'next/link';

export default function ApexPlumbingDemo() {
  return (
    <div className="min-h-screen bg-black text-white">
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
      <nav className="pt-20 pb-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="text-2xl font-black text-orange-500">APEX PLUMBING</div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#services" className="hover:text-orange-500 transition">
              Services
            </a>
            <a href="#about" className="hover:text-orange-500 transition">
              About
            </a>
            <a href="#contact" className="hover:text-orange-500 transition">
              Contact
            </a>
            <a
              href="tel:512-555-2739"
              className="px-6 py-2 bg-orange-500 text-black font-bold rounded-lg hover:bg-orange-400 transition"
            >
              Call Now: (512) 555-2739
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-black to-orange-950/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-500 text-sm font-bold rounded-full mb-6">
                24/7 EMERGENCY SERVICE
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                Fast, Reliable Plumbing in Austin
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Licensed, insured, and ready to help. Same-day service available. Serving Austin
                and surrounding areas since 2015.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:512-555-2739"
                  className="px-8 py-4 bg-orange-500 text-black font-bold text-lg rounded-lg hover:bg-orange-400 transition text-center"
                >
                  Call Now: (512) 555-2739
                </a>
                <button className="px-8 py-4 border-2 border-orange-500 text-orange-500 font-bold text-lg rounded-lg hover:bg-orange-500/10 transition">
                  Book Online
                </button>
              </div>
              <div className="mt-8 flex items-center gap-8 text-sm text-gray-400">
                <div>
                  <div className="text-orange-500 font-bold text-2xl">500+</div>
                  <div>Jobs Completed</div>
                </div>
                <div>
                  <div className="text-orange-500 font-bold text-2xl">4.9★</div>
                  <div>Average Rating</div>
                </div>
                <div>
                  <div className="text-orange-500 font-bold text-2xl">24/7</div>
                  <div>Availability</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-orange-500 to-red-700 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-orange-950/10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-4">Our Services</h2>
          <p className="text-center text-gray-400 mb-12">
            Professional plumbing solutions for residential and commercial clients
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Emergency Repairs',
                desc: 'Burst pipes, leaks, clogs - we handle it all, 24/7',
                icon: '🚨',
              },
              {
                title: 'Water Heater Service',
                desc: 'Installation, repair, and maintenance of all brands',
                icon: '🔥',
              },
              {
                title: 'Drain Cleaning',
                desc: 'Fast, effective clearing of stubborn clogs',
                icon: '🌊',
              },
              {
                title: 'Leak Detection',
                desc: 'Advanced technology to find hidden leaks',
                icon: '🔍',
              },
              {
                title: 'Pipe Installation',
                desc: 'New construction and repiping services',
                icon: '🔧',
              },
              {
                title: 'Fixture Replacement',
                desc: 'Sinks, toilets, faucets, and more',
                icon: '🚰',
              },
            ].map((service) => (
              <div
                key={service.title}
                className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-orange-500/50 transition"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <div className="text-orange-500 text-4xl mb-3">✓</div>
              <div className="font-bold mb-1">Licensed & Insured</div>
              <div className="text-sm text-gray-400">Fully certified technicians</div>
            </div>
            <div className="p-6">
              <div className="text-orange-500 text-4xl mb-3">💰</div>
              <div className="font-bold mb-1">Upfront Pricing</div>
              <div className="text-sm text-gray-400">No hidden fees or surprises</div>
            </div>
            <div className="p-6">
              <div className="text-orange-500 text-4xl mb-3">⏰</div>
              <div className="font-bold mb-1">Same-Day Service</div>
              <div className="text-sm text-gray-400">Most jobs completed in one visit</div>
            </div>
            <div className="p-6">
              <div className="text-orange-500 text-4xl mb-3">🛡️</div>
              <div className="font-bold mb-1">100% Guarantee</div>
              <div className="text-sm text-gray-400">We stand behind our work</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-transparent to-orange-950/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">Need a Plumber Right Now?</h2>
          <p className="text-xl text-gray-300 mb-8">
            We're available 24/7 for emergency service. Call now for same-day appointments.
          </p>
          <a
            href="tel:512-555-2739"
            className="inline-block px-10 py-5 bg-orange-500 text-black font-bold text-lg rounded-lg hover:bg-orange-400 transition"
          >
            Call (512) 555-2739
          </a>
          <p className="text-sm text-gray-400 mt-4">
            Serving Austin, Round Rock, Cedar Park, and surrounding areas
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm mb-4">
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
