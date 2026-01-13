import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamic imports for performance - all sections load without SSR
const FluidHero = dynamic(() => import('@/components/sentient/hero/FluidHero'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-primary-accent font-mono text-xl animate-pulse">
        Initializing Sentient Terminal...
      </div>
    </div>
  ),
});

const HolographicModel = dynamic(() => import('@/components/sentient/hologram/HolographicModel'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-primary-accent font-mono text-xl animate-pulse">
        Loading Holographic Model...
      </div>
    </div>
  ),
});

const PulseDashboard = dynamic(() => import('@/components/sentient/pulse/PulseDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-primary-accent font-mono text-xl animate-pulse">
        Connecting to live metrics...
      </div>
    </div>
  ),
});

const ModuleBuilder = dynamic(() => import('@/components/sentient/builder/ModuleBuilder'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-primary-accent font-mono text-xl animate-pulse">
        Loading Module Builder...
      </div>
    </div>
  ),
});

export default function SentientTerminal() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Mark as loaded after mount
    setIsLoaded(true);

    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Quick navigation helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Skip to content link for accessibility */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-primary-accent focus:text-black focus:px-4 focus:py-2 focus:rounded focus:font-mono focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Quick Navigation - Fixed bottom right */}
      {isLoaded && (
        <nav
          aria-label="Quick navigation"
          className="fixed bottom-8 right-8 z-50 bg-black/80 border-2 border-primary-accent rounded-lg p-4 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-2 text-xs font-mono">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-gray-400 hover:text-primary-accent focus:text-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-offset-2 focus:ring-offset-black transition-colors text-left px-2 py-1 rounded"
              aria-label="Navigate to terminal section"
            >
              → TERMINAL
            </button>
            <button
              onClick={() => scrollToSection('hologram')}
              className="text-gray-400 hover:text-primary-accent focus:text-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-offset-2 focus:ring-offset-black transition-colors text-left px-2 py-1 rounded"
              aria-label="Navigate to architecture section"
            >
              → ARCHITECTURE
            </button>
            <button
              onClick={() => scrollToSection('pulse')}
              className="text-gray-400 hover:text-primary-accent focus:text-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-offset-2 focus:ring-offset-black transition-colors text-left px-2 py-1 rounded"
              aria-label="Navigate to pulse dashboard section"
            >
              → THE PULSE
            </button>
            <button
              onClick={() => scrollToSection('architect')}
              className="text-gray-400 hover:text-primary-accent focus:text-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-offset-2 focus:ring-offset-black transition-colors text-left px-2 py-1 rounded"
              aria-label="Navigate to module builder section"
            >
              → THE ARCHITECT
            </button>
          </div>
        </nav>
      )}

      {/* Section 1: Fluid Hero - Full screen conversational terminal */}
      <section id="hero" aria-label="Interactive terminal" className="relative h-screen">
        <FluidHero />
      </section>

      {/* Section 2: Holographic Model - 2x viewport for scroll effect */}
      <section
        id="hologram-wrapper"
        aria-label="System architecture visualization"
        className="relative h-[200vh]"
      >
        <div className="sticky top-0 h-screen">
          <HolographicModel />
        </div>
      </section>

      {/* Section 3: The Pulse Dashboard - Live metrics */}
      <section id="pulse-wrapper" aria-label="Live system metrics" className="relative">
        <PulseDashboard />
      </section>

      {/* Section 4: The Architect - Module Builder */}
      <section id="architect-wrapper" aria-label="Solution module builder" className="relative">
        <ModuleBuilder />
      </section>

      {/* Minimal Footer */}
      <footer className="relative bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company */}
            <div>
              <h3 className="text-primary-accent font-mono font-bold mb-4">
                SENTIENT TERMINAL
              </h3>
              <p className="text-gray-500 font-mono text-xs">
                Radical transparency.
                <br />
                Unforgettable experiences.
                <br />
                Building in public.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-400 font-mono font-bold text-sm mb-4">NAVIGATE</h3>
              <div className="flex flex-col gap-2 text-xs font-mono">
                <button
                  onClick={() => scrollToSection('hero')}
                  className="text-gray-500 hover:text-primary-accent transition-colors text-left"
                >
                  → Terminal
                </button>
                <button
                  onClick={() => scrollToSection('hologram')}
                  className="text-gray-500 hover:text-primary-accent transition-colors text-left"
                >
                  → System Architecture
                </button>
                <button
                  onClick={() => scrollToSection('pulse')}
                  className="text-gray-500 hover:text-primary-accent transition-colors text-left"
                >
                  → The Pulse
                </button>
                <button
                  onClick={() => scrollToSection('architect')}
                  className="text-gray-500 hover:text-primary-accent transition-colors text-left"
                >
                  → The Architect
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-gray-400 font-mono font-bold text-sm mb-4">CONTACT</h3>
              <div className="flex flex-col gap-2 text-xs font-mono text-gray-500">
                <a
                  href="mailto:hello@softsystems.studio"
                  className="hover:text-primary-accent transition-colors"
                >
                  hello@softsystems.studio
                </a>
                <div>Soft Systems Studio LLC</div>
                <div>Building the future, one line at a time.</div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-xs font-mono text-gray-600">
              © {new Date().getFullYear()} Soft Systems Studio LLC. All rights reserved.
            </p>
            <p className="text-xs font-mono text-gray-700 mt-2">
              Powered by AI • Built with ❤️ • Deployed with confidence
            </p>
          </div>
        </div>
      </footer>

      {/* Global CRT Scanline Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.1) 0px,
            transparent 2px,
            transparent 4px
          )`,
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
