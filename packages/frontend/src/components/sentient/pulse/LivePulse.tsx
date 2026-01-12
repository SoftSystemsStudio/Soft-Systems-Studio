'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}

// Mock real-time data - in production, this would come from an API
const generateMetrics = (): Metric[] => {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  return [
    {
      label: 'Lines Shipped This Week',
      value: (14203 + Math.floor(Math.random() * 500)).toLocaleString(),
      trend: 'up',
      color: '#c0ff6b',
    },
    {
      label: 'AI Tokens Consumed Today',
      value: `${(4.5 + Math.random() * 0.5).toFixed(1)}M`,
      trend: 'up',
      color: '#22d3ee',
    },
    {
      label: 'Active Client Systems',
      value: 12 + Math.floor(dayOfYear / 30),
      trend: 'up',
      color: '#a78bfa',
    },
    {
      label: 'Uptime (Last 30 Days)',
      value: '99.97',
      unit: '%',
      trend: 'neutral',
      color: '#10b981',
    },
    {
      label: 'Avg Response Time',
      value: Math.floor(120 + Math.random() * 30),
      unit: 'ms',
      trend: 'down',
      color: '#f59e0b',
    },
    {
      label: 'Coffees Consumed',
      value: 12 + Math.floor(Math.random() * 3),
      trend: 'up',
      color: '#8b5cf6',
    },
  ];
};

export default function LivePulse() {
  const [metrics, setMetrics] = useState<Metric[]>(generateMetrics());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Update metrics every 5 seconds to simulate real-time data
    const interval = setInterval(() => {
      setMetrics(generateMetrics());
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white font-mono mb-2">LIVE SYSTEM PULSE</h3>
          <p className="text-gray-400 text-sm font-mono">
            Real-time metrics from our infrastructure. Updates every 5 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-brand-lime"
          />
          <span>Last update: {lastUpdate.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-black border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors group"
          >
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
              style={{ backgroundColor: metric.color }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                  {metric.label}
                </span>
                {metric.trend && (
                  <span
                    className="text-xs font-mono"
                    style={{
                      color:
                        metric.trend === 'up'
                          ? '#10b981'
                          : metric.trend === 'down'
                            ? '#ef4444'
                            : '#6b7280',
                    }}
                  >
                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <motion.span
                  key={`${metric.label}-${metric.value}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-3xl md:text-4xl font-bold font-mono"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </motion.span>
                {metric.unit && (
                  <span className="text-lg text-gray-500 font-mono">{metric.unit}</span>
                )}
              </div>

              {/* Animated progress bar */}
              <div className="mt-4 h-1 bg-gray-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            All systems operational
          </span>
          <span className="text-gray-700">|</span>
          <span>Monitoring 47 endpoints</span>
          <span className="text-gray-700">|</span>
          <span>Next deployment: Continuous</span>
        </div>
      </div>
    </div>
  );
}
