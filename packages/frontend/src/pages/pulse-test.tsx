import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const PulseDashboard = dynamic(() => import('@/components/sentient/pulse/PulseDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-primary-accent font-mono text-xl animate-pulse">
        Loading Pulse Dashboard...
      </div>
    </div>
  ),
});

export default function PulseTestPage() {
  return (
    <div className="bg-black">
      {/* Header */}
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-accent font-mono mb-4">
            PULSE DASHBOARD TEST
          </h1>
          <p className="text-gray-400 font-mono">Real-time metrics updating every 5 seconds</p>
          <p className="text-gray-500 font-mono text-sm mt-2">Scroll down to view ↓</p>
        </div>
      </div>

      {/* Pulse Dashboard */}
      <PulseDashboard />

      {/* Footer */}
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-accent font-mono mb-4">END OF METRICS</h2>
          <p className="text-gray-400 font-mono">Scroll up to review</p>
        </div>
      </div>
    </div>
  );
}
