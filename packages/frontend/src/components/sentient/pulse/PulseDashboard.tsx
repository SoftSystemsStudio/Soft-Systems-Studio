'use client';

import { motion } from 'framer-motion';
import { useMetrics } from '@/hooks/useMetrics';
import MetricCard from './MetricCard';

export default function PulseDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { metrics, isConnected, error } = useMetrics();

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8" id="pulse">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-mono text-red-500 mb-2">CONNECTION ERROR</h2>
          <p className="text-gray-400 font-mono text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" id="pulse">
        <div className="text-primary-accent font-mono text-xl animate-pulse">
          Connecting to live metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black py-16 px-4" id="pulse">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(#c0ff6b 1px, transparent 1px),
            linear-gradient(90deg, #c0ff6b 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-primary-accent"
            />
            <h2 className="text-4xl md:text-5xl font-bold text-primary-accent font-mono">
              THE PULSE
            </h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="w-3 h-3 rounded-full bg-primary-accent"
            />
          </div>
          <p className="text-gray-400 font-mono text-sm mb-2">LIVE SYSTEM METRICS</p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
            <span>•</span>
            <span>
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */}
              LAST UPDATE: {metrics.lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* eslint-disable @typescript-eslint/no-unsafe-member-access */}
          <MetricCard {...metrics.linesOfCode} />
          <MetricCard {...metrics.aiTokens} />
          <MetricCard {...metrics.activeProjects} />
          <MetricCard {...metrics.queueDepth} />
          <MetricCard {...metrics.successRate} />
          {/* eslint-enable @typescript-eslint/no-unsafe-member-access */}

          {/* Custom card - System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="relative bg-black/80 border-2 border-primary-accent rounded-lg p-6 backdrop-blur-sm overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, #c0ff6b 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 100%, #22d3ee 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 0%, #c0ff6b 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0 opacity-10"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💚</span>
                <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">
                  System Status
                </h3>
              </div>

              <div className="space-y-3">
                <StatusBar label="API" value={100} color="#22d3ee" />
                <StatusBar label="Database" value={98} color="#c0ff6b" />
                <StatusBar label="Queue" value={95} color="#a78bfa" />
                <StatusBar label="AI Services" value={99} color="#fb923c" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Radical Transparency Message */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-block bg-primary-accent/10 border border-primary-accent/30 rounded-lg px-6 py-4">
            <p className="text-primary-accent font-mono text-sm">
              🔓 <strong>RADICAL TRANSPARENCY</strong> - All metrics update every 5 seconds
            </p>
            <p className="text-gray-500 font-mono text-xs mt-2">
              Building in public. No smoke, no mirrors.
            </p>
          </div>
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

interface StatusBarProps {
  label: string;
  value: number;
  color: string;
}

function StatusBar({ label, value, color }: StatusBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
