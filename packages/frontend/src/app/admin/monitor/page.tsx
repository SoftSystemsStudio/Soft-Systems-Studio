'use client';

import React from 'react';
import { useMetrics, type MetricSnapshot, type ConnectionStatus } from '@/hooks/useMetrics';

export default function MonitorPage() {
  const { metrics, status } = useMetrics();

  return (
    <main className="p-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">System Monitor</h1>
        <ConnectionIndicator status={status} />
      </div>

      {/* Metrics Grid */}
      {metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            label="Uptime"
            value={`${metrics.uptime}%`}
            icon="⚡"
            color="text-green-400"
          />
          <MetricCard
            label="Automations Today"
            value={metrics.automationsToday}
            trend={metrics.automationsTrend}
            change={metrics.automationsChange}
            icon="🤖"
            color="text-lime-400"
          />
          <MetricCard
            label="Avg Response Time"
            value={`${metrics.avgResponseTime}ms`}
            trend={metrics.responseTimeTrend}
            change={metrics.responseTimeChange}
            icon="⚡"
            color="text-cyan-400"
          />
          <MetricCard
            label="Tokens Today"
            value={metrics.tokensToday}
            icon="🎯"
            color="text-purple-400"
          />
          <MetricCard
            label="Active Clients"
            value={metrics.activeClients}
            icon="👥"
            color="text-blue-400"
          />
          <MetricCard
            label="Queue Depth"
            value={metrics.queueDepth}
            icon="📦"
            color="text-yellow-400"
          />
          <MetricCard
            label="Error Rate"
            value={metrics.errorRate}
            icon="⚠️"
            color={metrics.errorRate > 0 ? 'text-red-400' : 'text-gray-400'}
          />
          <MetricCard
            label="Requests/Minute"
            value={metrics.requestsPerMinute}
            icon="📊"
            color="text-indigo-400"
          />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">📊</div>
          <p>Waiting for metrics data...</p>
        </div>
      )}
    </main>
  );
}

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const statusConfig = {
    connecting: { color: 'bg-yellow-400', label: 'Connecting...' },
    connected: { color: 'bg-green-400', label: 'Connected' },
    disconnected: { color: 'bg-red-400', label: 'Disconnected' },
    error: { color: 'bg-red-500', label: 'Connection Error' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-sm text-gray-300">{config.label}</span>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
}

function MetricCard({ label, value, icon, color, trend, change }: MetricCardProps) {
  return (
    <div
      className="bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-[#84CC16] transition-all hover:shadow-lg hover:shadow-[#84CC16]/10"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && <TrendIndicator trend={trend} change={change} />}
      </div>
      <div className={`text-3xl font-bold mb-1 ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function TrendIndicator({ trend, change }: { trend: 'up' | 'down' | 'neutral'; change?: number }) {
  if (trend === 'neutral') {
    return (
      <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
        <span>━</span>
        <span>0%</span>
      </span>
    );
  }

  const isUp = trend === 'up';
  const color = isUp ? 'text-green-400' : 'text-red-400';
  const arrow = isUp ? '↑' : '↓';

  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${color}`}>
      <span>{arrow}</span>
      {change !== undefined && <span>{Math.abs(change)}%</span>}
    </span>
  );
}
