'use client';

import Link from 'next/link';

export default function NeuralFitDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-900 to-cyan-900 text-white">
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
      <nav className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="text-2xl font-black">NeuralFit</div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="hover:text-cyan-400 transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-cyan-400 transition">
              Pricing
            </a>
            <a href="#about" className="hover:text-cyan-400 transition">
              About
            </a>
            <button className="px-6 py-2 bg-cyan-400 text-purple-900 font-bold rounded-lg hover:bg-cyan-300 transition">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Your AI Personal Trainer
            </h1>
            <p className="text-xl text-purple-200 mb-8 leading-relaxed">
              Get personalized workout plans powered by machine learning. Track progress, optimize
              performance, and achieve your fitness goals faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-cyan-400 text-purple-900 font-bold text-lg rounded-lg hover:bg-cyan-300 transition">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-lg hover:bg-white/10 transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Mock Dashboard */}
          <div className="mt-16 p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-purple-800/50">
                <div className="text-cyan-400 text-3xl font-black mb-2">1,247</div>
                <div className="text-purple-200 text-sm">Total Workouts</div>
              </div>
              <div className="p-6 rounded-xl bg-purple-800/50">
                <div className="text-cyan-400 text-3xl font-black mb-2">87%</div>
                <div className="text-purple-200 text-sm">Goal Achievement</div>
              </div>
              <div className="p-6 rounded-xl bg-purple-800/50">
                <div className="text-cyan-400 text-3xl font-black mb-2">42</div>
                <div className="text-purple-200 text-sm">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-black/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16">Powered by AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Planning</h3>
              <p className="text-purple-200">
                AI analyzes your performance and creates custom workout plans that adapt to your
                progress.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Analytics</h3>
              <p className="text-purple-200">
                Track every rep, set, and metric. Visualize your progress with beautiful charts.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Meal Planning</h3>
              <p className="text-purple-200">
                AI-generated meal plans tailored to your goals, preferences, and dietary
                restrictions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">Ready to Transform Your Fitness?</h2>
          <p className="text-xl text-purple-200 mb-8">
            Join 50,000+ users who achieved their goals with NeuralFit
          </p>
          <button className="px-10 py-5 bg-cyan-400 text-purple-900 font-bold text-lg rounded-lg hover:bg-cyan-300 transition">
            Start Your Free Trial
          </button>
          <p className="text-sm text-purple-300 mt-4">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-purple-300 text-sm mb-4">
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
