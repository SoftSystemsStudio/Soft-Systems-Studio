'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SystemStatus() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="hero-glow animate-pulse-glow" />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '20%',
          right: '10%',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '10%',
          left: '15%',
        }}
      />

      {/* Abstract Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full glass-card"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-mono text-gray-400">SYSTEM ONLINE</span>
        </motion.div>

        {/* Main Headline - Massive & Bold */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-[0.95]"
        >
          We Build <span className="text-gradient-purple">Intelligent</span>
          <br />
          Digital Systems
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI-powered automation, modern websites, and custom software that transforms how your
          business operates.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/intake"
            className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            Start Your Project
          </a>
          <a
            href="#pulse"
            className="px-8 py-4 glass-card text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            See Our Work
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">50+</span>
            <span className="text-sm">
              Projects
              <br />
              Delivered
            </span>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">95%</span>
            <span className="text-sm">
              Client
              <br />
              Satisfaction
            </span>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">24hr</span>
            <span className="text-sm">
              Response
              <br />
              Time
            </span>
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
