'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

interface InteractiveFAQProps {
  faqs: FAQ[];
}

export default function InteractiveFAQ({ faqs }: InteractiveFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full px-4 py-3 bg-black border-2 border-cyan-400/30 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors rounded-lg"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400/50 font-mono text-sm">
            🔍
          </span>
        </div>
        {searchTerm && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-400 font-mono mt-2"
          >
            Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
          </motion.p>
        )}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-2 rounded-lg overflow-hidden transition-all ${
                isOpen
                  ? 'border-cyan-400 bg-cyan-400/5'
                  : 'border-gray-800 bg-black hover:border-cyan-400/50'
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left group"
              >
                <div className="flex items-start gap-4 flex-1">
                  <span
                    className={`text-xs font-mono mt-1 transition-colors ${
                      isOpen ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className={`font-semibold text-lg transition-colors ${
                      isOpen ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                    }`}
                  >
                    {faq.question}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-2xl transition-colors ${
                    isOpen ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'
                  }`}
                >
                  ▼
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pl-16">
                      <div className="w-12 h-px bg-cyan-400/30 mb-4" />
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filteredFaqs.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="text-4xl mb-4">🤔</div>
          <p className="text-gray-400 font-mono">No matching questions found</p>
        </motion.div>
      )}
    </div>
  );
}
