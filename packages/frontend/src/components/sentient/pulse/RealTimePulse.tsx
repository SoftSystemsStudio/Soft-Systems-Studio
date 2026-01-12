'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

/**
 * RealTimePulse - Live metrics dashboard connected to actual backend
 *
 * Features:
 * - WebSocket connection for real-time updates
 * - Fallback to polling if WebSocket unavailable
 * - Animated number transitions
 * - Trend indicators
 * - GitHub commit integration
 */

interface Metric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  color: string;
  icon?: string;
}

interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface RealTimePulseProps {
  /** API endpoint for metrics */
  metricsEndpoint?: string;
  /** WebSocket endpoint */
  wsEndpoint?: string;
  /** GitHub repo for commit display */
  githubRepo?: string;
  /** Polling interval in ms (fallback) */
  pollInterval?: number;
  /** Whether to show GitHub commits */
  showCommits?: boolean;
  /** Compact mode for footer/sidebar */
  compact?: boolean;
}

// Animated number component
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <>{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString()}</>
  );
}

export default function RealTimePulse({
  metricsEndpoint = '/api/v1/metrics/live',
  wsEndpoint,
  githubRepo,
  pollInterval = 5000,
  showCommits = true,
  compact = false,
}: RealTimePulseProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch metrics via REST
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(metricsEndpoint);
      if (!response.ok) throw new Error('Failed to fetch metrics');

      const data = await response.json();
      setMetrics(data.metrics || transformMetrics(data));
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Metrics fetch error:', err);
      // Use mock data as fallback
      setMetrics(getMockMetrics());
      setError('Using demo data');
    }
  }, [metricsEndpoint]);

  // Fetch GitHub commits
  const fetchCommits = useCallback(async () => {
    if (!githubRepo || !showCommits) return;

    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/commits?per_page=5`);
      if (!response.ok) throw new Error('Failed to fetch commits');

      const data = await response.json();
      setCommits(
        data.map(
          (commit: {
            sha: string;
            commit: { message: string; author: { name: string; date: string } };
            html_url: string;
          }) => ({
            sha: commit.sha.slice(0, 7),
            message: commit.commit.message.split('\n')[0].slice(0, 60),
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            url: commit.html_url,
          }),
        ),
      );
    } catch (err) {
      console.error('GitHub fetch error:', err);
    }
  }, [githubRepo, showCommits]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!wsEndpoint) {
      // Fall back to polling
      fetchMetrics();
      fetchCommits();

      const poll = () => {
        fetchMetrics();
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      };
      pollTimeoutRef.current = setTimeout(poll, pollInterval);

      return () => {
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current);
        }
      };
    }

    // WebSocket connection
    const socket = io(wsEndpoint, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socket.emit('subscribe', 'metrics');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('metrics', (data: { metrics: Metric[] }) => {
      setMetrics(data.metrics);
      setLastUpdate(new Date());
    });

    socket.on('error', (err: Error) => {
      console.error('Socket error:', err);
      setError('Connection error');
    });

    socketRef.current = socket;

    // Initial fetch
    fetchMetrics();
    fetchCommits();

    return () => {
      socket.disconnect();
    };
  }, [wsEndpoint, pollInterval, fetchMetrics, fetchCommits]);

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-lime' : 'bg-yellow-500'}`}
          />
          <span className="text-gray-400">{isConnected ? 'Live' : error || 'Connecting...'}</span>
        </div>

        {metrics.slice(0, 3).map((metric) => (
          <div key={metric.id} className="flex items-center gap-1">
            <span className="text-gray-500">{metric.label}:</span>
            <span style={{ color: metric.color }}>
              {typeof metric.value === 'number' ? (
                <AnimatedNumber value={metric.value} />
              ) : (
                metric.value
              )}
              {metric.unit}
            </span>
          </div>
        ))}

        {lastUpdate && (
          <span className="text-gray-600">
            Updated {lastUpdate.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            LIVE SYSTEM PULSE
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-brand-lime' : 'bg-yellow-500'}`}
            />
          </h3>
          <p className="text-gray-400 text-sm font-mono mt-1">
            Real-time metrics from our production infrastructure
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono text-gray-500">
            {isConnected ? '🔌 WebSocket Connected' : error || '📡 Polling...'}
          </div>
          {lastUpdate && (
            <div className="text-xs font-mono text-gray-600">
              Last update: {lastUpdate.toLocaleTimeString('en-US', { hour12: false })}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <AnimatePresence mode="popLayout">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900/80 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-sm text-gray-400 font-mono">{metric.label}</div>
                {metric.icon && <span className="text-lg">{metric.icon}</span>}
              </div>

              <div className="flex items-end gap-2">
                <motion.div
                  key={`${metric.id}-${metric.value}`}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold font-mono"
                  style={{ color: metric.color }}
                >
                  {typeof metric.value === 'number' ? (
                    <AnimatedNumber value={metric.value} decimals={metric.unit === '%' ? 2 : 0} />
                  ) : (
                    metric.value
                  )}
                  {metric.unit && <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>}
                </motion.div>

                {metric.trend && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-1 text-sm font-mono ${
                      metric.trend === 'up'
                        ? 'text-green-400'
                        : metric.trend === 'down'
                          ? 'text-red-400'
                          : 'text-gray-500'
                    }`}
                  >
                    {metric.trend === 'up' && '↑'}
                    {metric.trend === 'down' && '↓'}
                    {metric.change !== undefined && (
                      <span>
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}%
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* GitHub Commits */}
      {showCommits && commits.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-white font-mono mb-4 flex items-center gap-2">
            <span>📝</span> LATEST COMMITS
          </h4>
          <div className="space-y-2">
            {commits.map((commit, i) => (
              <motion.a
                key={commit.sha}
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors group"
              >
                <code className="text-brand-lime font-mono text-sm">{commit.sha}</code>
                <span className="text-white flex-1 truncate group-hover:text-brand-lime transition-colors">
                  {commit.message}
                </span>
                <span className="text-gray-500 text-sm">{commit.author}</span>
                <span className="text-gray-600 text-xs">
                  {new Date(commit.date).toLocaleDateString()}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Transform raw metrics data to our format
function transformMetrics(data: Record<string, unknown>): Metric[] {
  const metrics: Metric[] = [];

  if (data.uptime !== undefined) {
    metrics.push({
      id: 'uptime',
      label: 'Uptime',
      value: Number(data.uptime),
      unit: '%',
      trend: 'neutral',
      color: '#10b981',
      icon: '✓',
    });
  }

  if (data.automationsToday !== undefined) {
    metrics.push({
      id: 'automations',
      label: 'Automations Today',
      value: Number(data.automationsToday),
      trend: 'up',
      color: '#c0ff6b',
      icon: '⚡',
    });
  }

  if (data.responseTime !== undefined) {
    metrics.push({
      id: 'response-time',
      label: 'API Response Time',
      value: Number(data.responseTime),
      unit: 'ms',
      trend: 'down',
      color: '#22d3ee',
      icon: '⏱',
    });
  }

  return metrics.length > 0 ? metrics : getMockMetrics();
}

// Mock metrics for demo/fallback
function getMockMetrics(): Metric[] {
  const now = new Date();
  const dayProgress = (now.getHours() * 60 + now.getMinutes()) / 1440;

  return [
    {
      id: 'uptime',
      label: 'System Uptime',
      value: 99.97,
      unit: '%',
      trend: 'neutral',
      color: '#10b981',
      icon: '✓',
    },
    {
      id: 'automations',
      label: 'Automations Today',
      value: Math.floor(14000 + dayProgress * 8000 + Math.random() * 500),
      trend: 'up',
      change: 12,
      color: '#c0ff6b',
      icon: '⚡',
    },
    {
      id: 'response-time',
      label: 'API Response',
      value: Math.floor(42 + Math.random() * 15),
      unit: 'ms',
      trend: 'down',
      change: -8,
      color: '#22d3ee',
      icon: '⏱',
    },
    {
      id: 'tokens',
      label: 'AI Tokens Today',
      value: `${(2.5 + dayProgress * 4 + Math.random()).toFixed(1)}M`,
      trend: 'up',
      color: '#a78bfa',
      icon: '🧠',
    },
    {
      id: 'clients',
      label: 'Active Systems',
      value: 12,
      trend: 'up',
      color: '#f59e0b',
      icon: '🏢',
    },
    {
      id: 'slots',
      label: 'Slots This Week',
      value: 3,
      trend: 'neutral',
      color: '#ec4899',
      icon: '📅',
    },
  ];
}
