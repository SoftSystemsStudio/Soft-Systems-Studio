'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMANDS = [
  { cmd: 'git clone https://success.soft-systems.studio', desc: 'Clone your success story' },
  { cmd: 'npm install @softsystems/growth', desc: 'Install exponential growth' },
  { cmd: 'yarn add unlimited-potential', desc: 'Add unlimited potential' },
  { cmd: './deploy.sh --target=production', desc: 'Deploy to production' },
];

export default function TerminalCTA() {
  const [currentCmdIndex, setCurrentCmdIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);

  const currentCommand = COMMANDS[currentCmdIndex];

  // Typing animation
  useEffect(() => {
    if (!isTyping) return;

    const fullText = currentCommand.cmd;
    if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      const timeout = setTimeout(() => {
        setDisplayedText('');
        setIsTyping(true);
        setCurrentCmdIndex((prev) => (prev + 1) % COMMANDS.length);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isTyping, currentCommand]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(34, 211, 238, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900 border-2 border-cyan-400 rounded-lg overflow-hidden shadow-2xl"
        >
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-mono ml-4">
              softsystems@terminal: ~/ready-to-launch
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 font-mono text-sm">
            {/* Static welcome message */}
            <div className="mb-4 text-gray-400">
              <p>Welcome to Soft Systems Studio Terminal v2.0</p>
              <p className="text-cyan-400">Type a command to get started...</p>
            </div>

            {/* Animated command line */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-lime-400 mr-2">$</span>
                <span className="text-white">{displayedText}</span>
                <span
                  className={`inline-block w-2 h-4 bg-lime-400 ml-1 ${
                    cursorVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              <AnimatePresence mode="wait">
                {!isTyping && displayedText.length === currentCommand.cmd.length && (
                  <motion.div
                    key={currentCmdIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-500 text-xs ml-2"
                  >
                    # {currentCommand.desc}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Output */}
            <div className="border-t border-gray-700 pt-4 space-y-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-green-400"
              >
                ✓ System Status: <span className="text-white">READY</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-green-400"
              >
                ✓ Development Team: <span className="text-white">ONLINE</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-green-400"
              >
                ✓ Next Available Slot:{' '}
                <span className="text-white">
                  {new Date(Date.now() + 86400000 * 3).toLocaleDateString()}
                </span>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-6"
            >
              <a
                href="/intake"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition-colors group"
              >
                <span>→ ./start-project.sh</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="group-hover:translate-x-1 transition-transform"
                >
                  ▶
                </motion.span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5 }}
          className="text-center mt-6 text-gray-500 font-mono text-sm"
        >
          No sudo required. Just pure innovation.
        </motion.p>
      </div>
    </div>
  );
}
