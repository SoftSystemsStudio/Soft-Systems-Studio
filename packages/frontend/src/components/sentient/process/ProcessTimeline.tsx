'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Step {
  step: string;
  title: string;
  desc: string;
}

interface ProcessTimelineProps {
  steps: Step[];
}

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* Connection Line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 hidden md:block" />

      <div className="space-y-12">
        {steps.map((step, index) => {
          const isLeft = index % 2 === 0;
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex items-center ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex-row`}
            >
              {/* Content Card */}
              <div className={`flex-1 ${isLeft ? 'md:pr-12' : 'md:pl-12'} pl-16 md:pl-0`}>
                <motion.div
                  animate={{
                    scale: isHovered ? 1.02 : 1,
                    borderColor: isHovered ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)',
                  }}
                  transition={{ duration: 0.2 }}
                  className="bg-black border-2 rounded-lg p-6 relative"
                >
                  {/* Arrow pointing to timeline */}
                  <div
                    className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-px bg-cyan-400/50 ${
                      isLeft ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'
                    }`}
                  />

                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{
                        backgroundColor: isHovered ? '#22d3ee' : '#000',
                        color: isHovered ? '#000' : '#22d3ee',
                      }}
                      className="px-3 py-1 rounded border-2 border-cyan-400 font-mono text-sm font-bold shrink-0"
                    >
                      {step.step}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Animated particles on hover */}
                  {isHovered && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-lime-400"
                      />
                    </>
                  )}
                </motion.div>
              </div>

              {/* Timeline Node */}
              <div className="absolute left-8 md:left-1/2 top-1/2 -translate-y-1/2 md:-translate-x-1/2 z-10">
                <motion.div
                  animate={{
                    scale: isHovered ? 1.3 : 1,
                    backgroundColor: isHovered ? '#22d3ee' : '#000',
                  }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 rounded-full border-2 border-cyan-400"
                >
                  {isHovered && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-full h-full rounded-full bg-cyan-400"
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: steps.length * 0.1 }}
        className="flex justify-center mt-12"
      >
        <div className="relative">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full blur-xl opacity-20"
          />
          <div className="relative bg-black border-2 border-cyan-400 rounded-full px-8 py-4 flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span className="text-white font-bold font-mono">LAUNCH</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
