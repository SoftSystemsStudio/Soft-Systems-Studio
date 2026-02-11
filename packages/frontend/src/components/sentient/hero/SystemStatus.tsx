'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CallMeNowModal from '../../CallMeNowModal';

export default function SystemStatus() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Subtle lime glow - matches logo */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 0, 0.5) 0%, transparent 70%)',
          filter: 'blur(80px)',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Urgency Badge - Moved to hero for visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-lime-500/30 bg-lime-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-sm font-medium text-lime-400">
            Only accepting 3 new clients this month
          </span>
        </motion.div>

        {/* Pain Point Lead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg text-gray-400 mb-4"
        >
          Tired of losing calls while you&apos;re on the job?
        </motion.p>

        {/* Main Headline - Outcome Focused */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          Never Miss Another
          <span className="block text-lime-400">$400 Job Again</span>
        </motion.h1>

        {/* Value Proposition - Clear Benefit */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          AI answers your calls 24/7, books appointments, and texts you summaries.
          <span className="block mt-2 text-gray-400">
            Built for plumbers, dentists, contractors, and local service businesses.
          </span>
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/intake"
              className="px-10 py-5 bg-lime-400 text-black font-bold text-lg rounded-xl hover:bg-lime-300 transition-all duration-300 hover:scale-105 shadow-lg shadow-lime-400/20"
            >
              Get Your Free Quote →
            </a>
            <button
              onClick={() => setShowCallModal(true)}
              className="px-10 py-5 bg-transparent border-2 border-lime-400 text-lime-400 font-bold text-lg rounded-xl hover:bg-lime-400/10 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Me Now
            </button>
          </div>
          <span className="text-sm text-gray-500">
            30-day money-back guarantee • Setup in 2 weeks
          </span>
        </motion.div>

        {/* Call Me Now Modal */}
        <CallMeNowModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />

        {/* Social Proof - Specific Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 p-6 rounded-xl border border-white/10 bg-white/5 max-w-xl mx-auto"
        >
          <p className="text-gray-300 italic mb-3">
            &ldquo;Booked 8 new jobs in my first month. The AI answers calls while I&apos;m on job
            sites.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Mike T.</p>
                <p className="text-gray-500 text-xs">MT Plumbing Services</p>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-left">
              <p className="text-lime-400 font-bold">+8 jobs/mo</p>
              <p className="text-gray-500 text-xs">100% calls answered</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs font-mono">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-gray-500 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
