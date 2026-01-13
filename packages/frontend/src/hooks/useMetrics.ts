import { useState, useEffect, useCallback } from 'react';

export interface Metric {
  id: string;
  title: string;
  value: number;
  unit?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  sparklineData: number[];
}

export interface MetricsData {
  linesOfCode: Metric;
  aiTokens: Metric;
  activeProjects: Metric;
  queueDepth: Metric;
  successRate: Metric;
  lastUpdated: Date;
}

/**
 * Hook for real-time metrics data
 * In production, this would connect via WebSocket to the backend
 * For now, uses mock data with simulated updates
 */
export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error] = useState<string | null>(null);

  // Generate initial mock data
  const generateInitialMetrics = useCallback((): MetricsData => {
    return {
      linesOfCode: {
        id: 'lines-of-code',
        title: 'Lines Shipped',
        value: 14203,
        unit: '',
        icon: '📝',
        color: '#c0ff6b',
        trend: 'up',
        trendValue: 12,
        sparklineData: Array.from({ length: 20 }, () => 10000 + Math.random() * 5000),
      },
      aiTokens: {
        id: 'ai-tokens',
        title: 'AI Tokens Used',
        value: 2847293,
        unit: '',
        icon: '🤖',
        color: '#22d3ee',
        trend: 'up',
        trendValue: 8,
        sparklineData: Array.from({ length: 20 }, () => 2500000 + Math.random() * 500000),
      },
      activeProjects: {
        id: 'active-projects',
        title: 'Active Projects',
        value: 7,
        unit: '',
        icon: '🚀',
        color: '#a78bfa',
        trend: 'stable',
        trendValue: 0,
        sparklineData: Array.from({ length: 20 }, () => 5 + Math.floor(Math.random() * 5)),
      },
      queueDepth: {
        id: 'queue-depth',
        title: 'Queue Depth',
        value: 23,
        unit: 'jobs',
        icon: '📊',
        color: '#fb923c',
        trend: 'down',
        trendValue: 5,
        sparklineData: Array.from({ length: 20 }, () => 20 + Math.floor(Math.random() * 15)),
      },
      successRate: {
        id: 'success-rate',
        title: 'Success Rate',
        value: 98,
        unit: '%',
        icon: '✅',
        color: '#22d3ee',
        trend: 'up',
        trendValue: 2,
        sparklineData: Array.from({ length: 20 }, () => 95 + Math.random() * 5),
      },
      lastUpdated: new Date(),
    };
  }, []);

  // Simulate real-time updates
  const updateMetrics = useCallback((prevMetrics: MetricsData): MetricsData => {
    return {
      linesOfCode: {
        ...prevMetrics.linesOfCode,
        value: prevMetrics.linesOfCode.value + Math.floor(Math.random() * 50),
        sparklineData: [
          ...prevMetrics.linesOfCode.sparklineData.slice(1),
          prevMetrics.linesOfCode.value,
        ],
      },
      aiTokens: {
        ...prevMetrics.aiTokens,
        value: prevMetrics.aiTokens.value + Math.floor(Math.random() * 1000),
        sparklineData: [...prevMetrics.aiTokens.sparklineData.slice(1), prevMetrics.aiTokens.value],
      },
      activeProjects: {
        ...prevMetrics.activeProjects,
        value: Math.max(1, prevMetrics.activeProjects.value + (Math.random() > 0.5 ? 1 : -1)),
        sparklineData: [
          ...prevMetrics.activeProjects.sparklineData.slice(1),
          prevMetrics.activeProjects.value,
        ],
      },
      queueDepth: {
        ...prevMetrics.queueDepth,
        value: Math.max(0, prevMetrics.queueDepth.value + Math.floor(Math.random() * 6 - 3)),
        sparklineData: [
          ...prevMetrics.queueDepth.sparklineData.slice(1),
          prevMetrics.queueDepth.value,
        ],
      },
      successRate: {
        ...prevMetrics.successRate,
        value: Math.min(100, Math.max(90, prevMetrics.successRate.value + (Math.random() * 2 - 1))),
        sparklineData: [
          ...prevMetrics.successRate.sparklineData.slice(1),
          prevMetrics.successRate.value,
        ],
      },
      lastUpdated: new Date(),
    };
  }, []);

  useEffect(() => {
    // Initialize metrics
    const initialMetrics = generateInitialMetrics();
    setMetrics(initialMetrics);
    setIsConnected(true);

    // Simulate WebSocket updates every 5 seconds
    const interval = setInterval(() => {
      setMetrics((prev) => {
        if (!prev) return generateInitialMetrics();
        return updateMetrics(prev);
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [generateInitialMetrics, updateMetrics]);

  return {
    metrics,
    isConnected,
    error,
  };
}
