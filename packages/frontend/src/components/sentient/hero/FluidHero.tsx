'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic import with no SSR for WebGL component
const FluidCanvas = dynamic(() => import('./FluidCanvas'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-primary-accent font-mono">Initializing Sentient Terminal...</div>
    </div>
  ),
});

interface Message {
  type: 'user' | 'system';
  text: string;
  timestamp: number;
}

export default function FluidHero() {
  const [input, setInput] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'system',
      text: 'SENTIENT TERMINAL INITIALIZED',
      timestamp: Date.now(),
    },
    {
      type: 'system',
      text: 'Type your vision...',
      timestamp: Date.now() + 500,
    },
  ]);
  const [canvasReady, setCanvasReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on load
  useEffect(() => {
    if (canvasReady && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canvasReady]);

  // Update display text when input changes
  useEffect(() => {
    if (!input) {
      setDisplayText('');
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText(input);
    }, 100);

    return () => clearTimeout(timer);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        text: input,
        timestamp: Date.now(),
      },
    ]);

    // Parse input for navigation commands
    const lowerInput = input.toLowerCase();
    let systemResponse = '';

    if (
      lowerInput.includes('pricing') ||
      lowerInput.includes('price') ||
      lowerInput.includes('cost')
    ) {
      systemResponse = 'LOADING PRICING MATRIX...';
      setTimeout(() => {
        window.location.href = '#builder';
      }, 1000);
    } else if (
      lowerInput.includes('portfolio') ||
      lowerInput.includes('work') ||
      lowerInput.includes('projects')
    ) {
      systemResponse = 'ACCESSING PROJECT ARCHIVE...';
      setTimeout(() => {
        window.location.href = '#hologram';
      }, 1000);
    } else if (
      lowerInput.includes('contact') ||
      lowerInput.includes('talk') ||
      lowerInput.includes('call')
    ) {
      systemResponse = 'CONNECTING TO COMMUNICATIONS...';
      setTimeout(() => {
        window.location.href = '/intake';
      }, 1000);
    } else if (lowerInput.includes('ai') || lowerInput.includes('automation')) {
      systemResponse = 'AI SYSTEMS ONLINE. SHOWING CAPABILITIES...';
      setTimeout(() => {
        window.location.href = '#hologram';
      }, 1000);
    } else if (lowerInput.includes('website') || lowerInput.includes('web design')) {
      systemResponse = 'WEB DESIGN PROTOCOLS LOADED...';
      setTimeout(() => {
        window.location.href = '#hologram';
      }, 1000);
    } else if (
      lowerInput.includes('status') ||
      lowerInput.includes('metrics') ||
      lowerInput.includes('stats')
    ) {
      systemResponse = 'ACCESSING LIVE METRICS...';
      setTimeout(() => {
        window.location.href = '#pulse';
      }, 1000);
    } else {
      systemResponse = 'PROCESSING INPUT... TRY: "show pricing", "ai automation", or "contact"';
    }

    // Add system response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          text: systemResponse,
          timestamp: Date.now(),
        },
      ]);
    }, 500);

    // Clear input
    setInput('');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* WebGL Fluid Background */}
      <FluidCanvas targetText={displayText} onReady={() => setCanvasReady(true)} />

      {/* Terminal Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 pointer-events-none">
        {/* Logo/Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-primary-accent font-mono tracking-wider">
            SENTIENT TERMINAL
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-2 font-mono">
            SOFT SYSTEMS STUDIO :: AI AUTOMATION OS
          </p>
        </motion.div>

        {/* Message History */}
        <div className="w-full max-w-2xl mb-8 max-h-64 overflow-y-auto pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={`${msg.timestamp}-${i}`}
                initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
              >
                <span
                  className={`inline-block px-4 py-2 rounded font-mono text-sm ${
                    msg.type === 'user'
                      ? 'bg-primary-accent/20 text-primary-accent border border-primary-accent/30'
                      : 'bg-gray-900/80 text-gray-300 border border-gray-700'
                  }`}
                >
                  {msg.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Field */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-full max-w-2xl pointer-events-auto"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your vision... (e.g., 'I need AI automation')"
              className="w-full px-6 py-4 bg-black/80 border-2 border-primary-accent/30 text-white font-mono text-lg placeholder-gray-500 focus:outline-none focus:border-primary-accent transition-colors"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Blinking Cursor */}
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary-accent"
            />
          </div>

          {/* Command Hints */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-gray-500">
            <span className="px-2 py-1 border border-gray-700 rounded">TRY: "show pricing"</span>
            <span className="px-2 py-1 border border-gray-700 rounded">"ai automation"</span>
            <span className="px-2 py-1 border border-gray-700 rounded">"contact us"</span>
            <span className="px-2 py-1 border border-gray-700 rounded">"live metrics"</span>
          </div>
        </motion.form>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-gray-500 font-mono text-xs"
          >
            <span>SCROLL TO EXPLORE</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* CRT Scanline Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            transparent 2px,
            transparent 4px
          )`,
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
