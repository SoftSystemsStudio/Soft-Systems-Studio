'use client';

import Link from 'next/link';

export default function NeuralFitDemo() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-2xl animate-pulse">
        DEMO SITE
      </div>

      {/* Back Button */}
      <Link
        href="/#portfolio"
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
      >
        ← Back to Portfolio
      </Link>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
              <span className="text-xl font-black">N</span>
            </div>
            <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              NeuralFit
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-cyan-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-cyan-400 transition">
              Pricing
            </a>
            <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/50">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-8 animate-bounce">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                Trusted by 50,000+ Athletes
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
                Your AI
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 text-transparent bg-clip-text">
                  Personal
                </span>
                <br />
                Trainer
              </h1>

              <p className="text-xl text-purple-200 mb-10 leading-relaxed max-w-lg">
                Get personalized workout plans powered by machine learning. Track progress in
                real-time, optimize your performance, and achieve your fitness goals{' '}
                <span className="text-cyan-400 font-bold">3x faster</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-cyan-500/30">
                  <span className="flex items-center gap-2">
                    Start Free Trial
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
                <button className="px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/10 backdrop-blur transition-all duration-300 flex items-center justify-center gap-2">
                  <span>▶</span>
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-gray-400">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-gray-400">Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Animated Dashboard Mockup */}
            <div className="relative">
              {/* Floating elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-3xl blur-3xl opacity-50 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl blur-3xl opacity-50 animate-pulse" />

              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600" />
                    <div>
                      <div className="font-bold">Welcome back!</div>
                      <div className="text-sm text-purple-300">Ready to train?</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-sm">
                    42 Day Streak 🔥
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="text-3xl font-black text-cyan-400 mb-1">1,247</div>
                    <div className="text-xs text-purple-300">Total Workouts</div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="text-3xl font-black text-cyan-400 mb-1">87%</div>
                    <div className="text-xs text-purple-300">Goal Achievement</div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="text-3xl font-black text-cyan-400 mb-1">156</div>
                    <div className="text-xs text-purple-300">Active Minutes</div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="h-32 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10 flex items-end gap-2 p-4">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-lg bg-gradient-to-t from-cyan-500 to-purple-600"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 border-y border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">50K+</div>
              <div className="text-sm text-purple-300">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">2M+</div>
              <div className="text-sm text-purple-300">Workouts Completed</div>
            </div>
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">4.9★</div>
              <div className="text-sm text-purple-300">App Store Rating</div>
            </div>
            <div>
              <div className="text-4xl font-black text-cyan-400 mb-2">93%</div>
              <div className="text-sm text-purple-300">Goal Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-6">
              Powered by AI
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Everything You Need
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
                To Succeed
              </span>
            </h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Our AI analyzes your performance, adapts to your progress, and creates personalized
              plans that evolve with you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧠',
                title: 'AI-Powered Planning',
                desc: 'Machine learning algorithms analyze your performance data and create custom workout plans that adapt in real-time to your progress and recovery.',
              },
              {
                icon: '📊',
                title: 'Real-Time Analytics',
                desc: 'Track every rep, set, and metric. Beautiful visualizations show your progress over time with predictive insights for future performance.',
              },
              {
                icon: '🍽️',
                title: 'Smart Nutrition',
                desc: 'AI-generated meal plans tailored to your goals, preferences, and dietary restrictions. Automatically syncs with your workout plan.',
              },
              {
                icon: '💪',
                title: 'Form Analysis',
                desc: 'Use your phone camera for real-time form checking. AI detects mistakes and provides instant feedback to prevent injuries.',
              },
              {
                icon: '🎯',
                title: 'Goal Tracking',
                desc: 'Set specific goals and watch as AI breaks them down into achievable milestones. Get predictive timelines for reaching your targets.',
              },
              {
                icon: '👥',
                title: 'Social Challenges',
                desc: 'Join global fitness challenges, compete with friends, and stay motivated with community leaderboards and achievements.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition">
                  {feature.title}
                </h3>
                <p className="text-purple-200 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-32 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">How It Works</h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Set Your Goals',
                desc: 'Tell us about your fitness level, goals, and preferences. Our AI builds your personalized profile.',
              },
              {
                step: '02',
                title: 'Start Training',
                desc: 'Follow your custom workout plan. Track your reps, sets, and progress with our intuitive interface.',
              },
              {
                step: '03',
                title: 'Watch Results',
                desc: 'AI continuously optimizes your plan based on your progress. See results 3x faster than traditional methods.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-black text-cyan-500/20 mb-6">{item.step}</div>
                <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                <p className="text-lg text-purple-200 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 text-6xl text-cyan-500/30">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">Simple Pricing</h2>
            <p className="text-xl text-purple-200">Choose the plan that works for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: [
                  'Basic workout tracking',
                  '3 workouts per week',
                  'Community access',
                  'Mobile app',
                ],
              },
              {
                name: 'Pro',
                price: '$14.99',
                period: 'per month',
                popular: true,
                features: [
                  'Everything in Free',
                  'Unlimited workouts',
                  'AI-powered planning',
                  'Nutrition tracking',
                  'Form analysis',
                  'Priority support',
                ],
              },
              {
                name: 'Elite',
                price: '$29.99',
                period: 'per month',
                features: [
                  'Everything in Pro',
                  '1-on-1 coaching calls',
                  'Custom meal planning',
                  'Advanced analytics',
                  'Early access to features',
                ],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border-2 border-cyan-500 scale-105'
                    : 'bg-white/5 border border-white/10'
                } backdrop-blur transition-all duration-300 hover:scale-105`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-2xl font-bold mb-2">{plan.name}</div>
                <div className="mb-6">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-purple-300">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">✓</span>
                      <span className="text-purple-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:scale-105'
                      : 'border-2 border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.price === '$0' ? 'Get Started' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              Your Fitness?
            </span>
          </h2>
          <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
            Join 50,000+ users who achieved their goals with NeuralFit. Start your free trial today
            - no credit card required.
          </p>
          <button className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl rounded-xl hover:scale-105 transition-all duration-300 shadow-2xl shadow-cyan-500/30">
            Start Your Free Trial
          </button>
          <p className="text-sm text-purple-300 mt-6">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text mb-4">
              NeuralFit
            </div>
            <p className="text-purple-300 text-sm mb-6">
              This is a demo website created by Soft Systems Studio
            </p>
            <Link
              href="/#web-design"
              className="inline-block px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Want a site like this? Get a quote →
            </Link>
          </div>
          <div className="text-center text-sm text-purple-400 pt-8 border-t border-white/10">
            <p>© 2026 NeuralFit. Demo site for showcase purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
