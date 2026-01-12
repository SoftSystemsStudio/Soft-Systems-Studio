import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
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

export default function HologramTestPage() {
  return (
    <div className="bg-black">
      {/* Add spacer to enable scrolling */}
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-accent font-mono mb-4">
            HOLOGRAPHIC MODEL TEST
          </h1>
          <p className="text-gray-400 font-mono">Scroll down to explore ↓</p>
        </div>
      </div>

      {/* Holographic Model Section */}
      <HolographicModel />

      {/* Add spacer after to enable full scroll range */}
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-accent font-mono mb-4">
            END OF EXPLORATION
          </h2>
          <p className="text-gray-400 font-mono">Scroll up to review</p>
        </div>
      </div>
    </div>
  );
}
