'use client';

import { motion } from 'framer-motion';
import { HoloCard } from '@/components/ui';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  metrics?: {
    label: string;
    value: string;
    icon: string;
  }[];
}

interface MetricTestimonialsProps {
  testimonials: Testimonial[];
}

export default function MetricTestimonials({ testimonials }: MetricTestimonialsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: index * 0.1 }}
        >
          <HoloCard className="p-6 h-full flex flex-col" glowColor="cyan">
            {/* Quote */}
            <div className="flex-1 mb-6">
              <div className="text-cyan-400 text-4xl mb-3 leading-none">"</div>
              <p className="text-gray-300 leading-relaxed italic">{testimonial.quote}</p>
              <div className="text-cyan-400 text-4xl text-right leading-none -mb-6">"</div>
            </div>

            {/* Metrics */}
            {testimonial.metrics && testimonial.metrics.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-800">
                <div className="grid grid-cols-2 gap-3">
                  {testimonial.metrics.map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + idx * 0.1 }}
                      className="bg-black/50 rounded p-3 border border-cyan-400/20"
                    >
                      <div className="text-2xl mb-1">{metric.icon}</div>
                      <div className="text-cyan-400 font-bold text-lg font-mono">
                        {metric.value}
                      </div>
                      <div className="text-xs text-gray-500">{metric.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Author */}
            <div>
              <div className="flex items-start gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-lime-400 flex items-center justify-center text-black font-bold text-xl shrink-0"
                >
                  {testimonial.author.charAt(0)}
                </motion.div>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                  <div className="text-xs text-cyan-400 font-mono">{testimonial.company}</div>
                </div>
              </div>
            </div>
          </HoloCard>
        </motion.div>
      ))}
    </div>
  );
}
