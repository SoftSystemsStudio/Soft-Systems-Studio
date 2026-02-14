'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface MetricSnapshot {
  uptime: number;
  automationsToday: number;
  automationsTrend: 'up' | 'down' | 'neutral';
  automationsChange: number;
  avgResponseTime: number;
  responseTimeTrend: 'up' | 'down' | 'neutral';
  responseTimeChange: number;
  tokensToday: string;
  activeClients: number;
  queueDepth: number;
  errorRate: number;
  requestsPerMinute: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Custom hook for real-time metrics via Socket.IO
 *
 * Auto-connects to backend, subscribes to metrics room,
 * and provides connection status + live metrics data
 */
export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const socket: Socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection handlers
    socket.on('connect', () => {
      setStatus('connected');
      socket.emit('subscribe', 'metrics');
    });

    socket.on('disconnect', () => {
      setStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setStatus('error');
    });

    // Metrics data handler
    socket.on('metrics', (data: { timestamp: string; metrics: MetricSnapshot }) => {
      setMetrics(data.metrics);
    });

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  return { metrics, status };
}
