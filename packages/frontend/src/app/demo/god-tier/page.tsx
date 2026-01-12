'use client';

/**
 * God Tier Demo Page
 *
 * Showcases all the "living organism" components:
 * - Fluid WebGL background
 * - Magnetic UI elements
 * - Node-based configurator
 * - ROI Calculator
 * - AI Concierge with voice
 * - Real-time metrics
 */

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { MagneticWrapper, DynamicTypography, Button } from '@/components/ui';

// Lazy load heavy components with error boundaries
const LazyFluidBackground = dynamic(
  () => import('@/components/three/FluidBackground').catch(() => () => null),
  { ssr: false }
);

const LazyNodeEditor = dynamic(
  () => import('@/components/sentient/builder/NodeEditor').catch(() => () => <div>Node Editor unavailable</div>),
  { ssr: false }
);

const LazyROICalculator = dynamic(
  () => import('@/components/estimator/ROICalculator').catch(() => () => <div>Calculator unavailable</div>),
  { ssr: false }
);

const LazyAIConcierge = dynamic(
  () => import('@/components/sentient/concierge/AIConcierge').catch(() => () => <div>Concierge unavailable</div>),
  { ssr: false }
);

const LazyRealTimePulse = dynamic(
  () => import('@/components/sentient/pulse/RealTimePulse').catch(() => () => <div>Metrics unavailable</div>),
  { ssr: false }
);

export default function GodTierDemo() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showConcierge, setShowConcierge] = useState(false);

  const sections = [
    { id: 'fluid', label: 'Fluid Background', icon: '🌊' },
    { id: 'magnetic', label: 'Magnetic Elements', icon: '🧲' },
    { id: 'node-editor', label: 'Node Editor', icon: '🔗' },
    { id: 'roi', label: 'ROI Calculator', icon: '💰' },
    { id: 'pulse', label: 'Live Metrics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Fluid Background */}
      <Suspense fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black" />}>
        <LazyFluidBackground quality="high" enablePostProcessing={true} />
      </Suspense>

        {/* Content Layer */}
        <div className="relative z-10">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 p-6 backdrop-blur-sm bg-black/30">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <DynamicTypography
                text="SOFT SYSTEMS"
                fontSize={24}
                minWeight={400}
                maxWeight={700}
                color="#c0ff6b"
                reactToMouse
              />

              <MagneticWrapper strength={0.4}>
                <Button variant="primary" onClick={() => setShowConcierge(true)}>
                  🤖 Talk to AI
                </Button>
              </MagneticWrapper>
            </div>
          </header>

          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <DynamicTypography
                  text="GOD TIER"
                  fontSize={120}
                  minWeight={300}
                  maxWeight={900}
                  color="#ffffff"
                  reactToMouse
                  reactToScroll
                  className="mb-4"
                />

                <DynamicTypography
                  text="WEBSITE DEMO"
                  fontSize={48}
                  minWeight={400}
                  maxWeight={600}
                  color="#c0ff6b"
                  reactToMouse
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-lg mt-8 max-w-xl mx-auto"
              >
                Every element is alive. Move your cursor. Scroll. Speak. This is software art.
              </motion.p>

              {/* Section Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-4 mt-12"
              >
                {sections.map((section, i) => (
                  <MagneticWrapper key={section.id} strength={0.3}>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      onClick={() =>
                        setActiveSection(activeSection === section.id ? null : section.id)
                      }
                      className={`px-6 py-3 rounded-full font-mono text-sm transition-all ${
                        activeSection === section.id
                          ? 'bg-brand-lime text-black'
                          : 'bg-gray-900/80 text-white border border-gray-700 hover:border-brand-lime'
                      }`}
                    >
                      {section.icon} {section.label}
                    </motion.button>
                  </MagneticWrapper>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Magnetic Demo Section */}
          <AnimatePresence>
            {activeSection === 'magnetic' && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="py-20 px-6"
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-8 text-center font-mono">
                    MAGNETIC ELEMENTS
                  </h2>
                  <p className="text-gray-400 text-center mb-12">
                    Hover near these elements. They're attracted to your cursor.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {['Primary', 'Secondary', 'Ghost', 'Outline'].map((variant, i) => (
                      <MagneticWrapper key={variant} strength={0.4 + i * 0.1}>
                        <Button
                          variant={
                            variant.toLowerCase() as 'primary' | 'secondary' | 'ghost' | 'outline'
                          }
                          size="lg"
                          className="w-full"
                        >
                          {variant}
                        </Button>
                      </MagneticWrapper>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-6 mt-12">
                    {['🎙️ Voice AI', '💬 Chatbot', '⚡ Automation'].map((label) => (
                      <MagneticWrapper key={label} strength={0.3}>
                        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 text-center hover:border-brand-lime transition-colors">
                          <span className="text-4xl block mb-4">{label.split(' ')[0]}</span>
                          <span className="font-mono">{label.split(' ')[1]}</span>
                        </div>
                      </MagneticWrapper>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Node Editor Section */}
          <AnimatePresence>
            {activeSection === 'node-editor' && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 px-6"
              >
                <div className="max-w-7xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4 text-center font-mono">THE ARCHITECT</h2>
                  <p className="text-gray-400 text-center mb-12">
                    Design your automation workflow. Connect nodes. See prices update in real-time.
                    Your workflow JSON is sent when you submit.
                  </p>

                  <Suspense fallback={<div className="h-[600px] flex items-center justify-center"><span className="text-brand-lime animate-pulse">Loading Node Editor...</span></div>}>
                    <LazyNodeEditor />
                  </Suspense>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ROI Calculator Section */}
          <AnimatePresence>
            {activeSection === 'roi' && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 px-6"
              >
              <Suspense fallback={<div className="h-[500px] flex items-center justify-center"><span className="text-brand-lime animate-pulse">Loading Calculator...</span></div>}>
                <LazyROICalculator setupCost={8000} monthlyCost={200} efficiencyMultiplier={10} />
              </Suspense>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Live Metrics Section */}
          <AnimatePresence>
            {activeSection === 'pulse' && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 px-6"
              >
              <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><span className="text-brand-lime animate-pulse">Loading Metrics...</span></div>}>
                <LazyRealTimePulse
                  metricsEndpoint="/api/v1/metrics/live"
                  showCommits
                  githubRepo="SoftSystemsStudio/Soft-Systems-Studio"
                />
              </Suspense>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="py-12 px-6 border-t border-gray-800">
            <div className="max-w-7xl mx-auto">
              <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
                <LazyRealTimePulse compact />
              </Suspense>
            </div>
          </footer>
        </div>

        {/* AI Concierge Modal */}
        <AnimatePresence>
          {showConcierge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            >
              <Suspense fallback={<div className="flex items-center justify-center h-full"><span className="text-brand-lime animate-pulse">Loading AI...</span></div>}>
                <LazyAIConcierge
                  fullScreen
                  enableVoice
                  onClose={() => setShowConcierge(false)}
                  greeting="Hello! I noticed you're exploring our God Tier demo. What would you like to know about our capabilities?"
                  context={{
                    pagesVisited: ['demo', 'god-tier'],
                    timeOnSite: 120,
                    lastSection: activeSection || 'hero',
                  }}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
