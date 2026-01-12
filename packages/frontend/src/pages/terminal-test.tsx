import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with WebGL
const FluidHero = dynamic(() => import('@/components/sentient/hero/FluidHero'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-primary-accent font-mono text-xl animate-pulse">
        Loading Sentient Terminal...
      </div>
    </div>
  ),
});

export default function TerminalTestPage() {
  return (
    <div className="min-h-screen bg-black">
      <FluidHero />
    </div>
  );
}
