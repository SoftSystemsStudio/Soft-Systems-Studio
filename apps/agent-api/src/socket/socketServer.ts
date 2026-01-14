import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../logger';
import { collectMetrics, MetricSnapshot } from '../services/metricsCollector';

/**
 * Socket.IO server for real-time metrics broadcasting
 *
 * Features:
 * - Live metrics push to connected clients
 * - Room-based subscriptions
 * - Automatic reconnection handling
 * - Rate-limited broadcasts
 */

let io: SocketIOServer | null = null;
let metricsInterval: NodeJS.Timeout | null = null;

const METRICS_BROADCAST_INTERVAL = 3000; // 3 seconds

interface ConnectedClient {
  socketId: string;
  subscriptions: Set<string>;
  connectedAt: Date;
}

const connectedClients = new Map<string, ConnectedClient>();

/**
 * Initialize Socket.IO server
 */
export function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://softsystems.studio', 'https://www.softsystems.studio', /\.vercel\.app$/]
          : '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', handleConnection);

  // Start metrics broadcasting
  startMetricsBroadcast();

  logger.info('Socket.IO server initialized');

  return io;
}

/**
 * Handle new socket connection
 */
function handleConnection(socket: Socket): void {
  const clientId = socket.id;

  logger.info({ clientId }, 'Client connected');

  // Register client
  connectedClients.set(clientId, {
    socketId: clientId,
    subscriptions: new Set(),
    connectedAt: new Date(),
  });

  // Handle subscription requests
  socket.on('subscribe', (room: string) => {
    const validRooms = ['metrics', 'automations', 'alerts'];

    if (!validRooms.includes(room)) {
      socket.emit('error', { message: `Invalid room: ${room}` });
      return;
    }

    socket.join(room);

    const client = connectedClients.get(clientId);
    if (client) {
      client.subscriptions.add(room);
    }

    logger.debug({ clientId, room }, 'Client subscribed to room');

    // Send initial data immediately
    if (room === 'metrics') {
      void sendMetricsToSocket(socket);
    }
  });

  // Handle unsubscribe
  socket.on('unsubscribe', (room: string) => {
    socket.leave(room);

    const client = connectedClients.get(clientId);
    if (client) {
      client.subscriptions.delete(room);
    }

    logger.debug({ clientId, room }, 'Client unsubscribed from room');
  });

  // Handle ping for latency measurement
  socket.on('ping', (timestamp: number) => {
    socket.emit('pong', { timestamp, serverTime: Date.now() });
  });

  // Handle disconnect
  socket.on('disconnect', (reason: string) => {
    connectedClients.delete(clientId);
    logger.info({ clientId, reason }, 'Client disconnected');
  });

  // Handle errors
  socket.on('error', (error: Error) => {
    logger.error({ clientId, error }, 'Socket error');
  });
}

/**
 * Start broadcasting metrics to subscribed clients
 */
function startMetricsBroadcast(): void {
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }

  metricsInterval = setInterval(() => {
    void broadcastMetrics();
  }, METRICS_BROADCAST_INTERVAL);

  logger.debug('Metrics broadcast started');
}

/**
 * Broadcast metrics to all subscribed clients
 */
async function broadcastMetrics(): Promise<void> {
  if (!io) return;

  const metricsRoom = io.sockets.adapter.rooms.get('metrics');
  if (!metricsRoom || metricsRoom.size === 0) {
    return; // No subscribers, skip
  }

  try {
    const metrics = await collectMetrics();

    io.to('metrics').emit('metrics', {
      timestamp: new Date().toISOString(),
      metrics: formatMetricsForClient(metrics),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to broadcast metrics');
  }
}

/**
 * Send metrics to a specific socket
 */
async function sendMetricsToSocket(socket: Socket): Promise<void> {
  try {
    const metrics = await collectMetrics();

    socket.emit('metrics', {
      timestamp: new Date().toISOString(),
      metrics: formatMetricsForClient(metrics),
    });
  } catch (error) {
    logger.error({ error, socketId: socket.id }, 'Failed to send metrics to socket');
  }
}

/**
 * Format metrics for frontend consumption
 */
function formatMetricsForClient(metrics: MetricSnapshot): Array<{
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  color: string;
  icon?: string;
}> {
  return [
    {
      id: 'uptime',
      label: 'System Uptime',
      value: metrics.uptime,
      unit: '%',
      trend: 'neutral',
      color: '#10b981',
      icon: '✓',
    },
    {
      id: 'automations',
      label: 'Automations Today',
      value: metrics.automationsToday,
      trend: metrics.automationsTrend,
      change: metrics.automationsChange,
      color: '#c0ff6b',
      icon: '⚡',
    },
    {
      id: 'response-time',
      label: 'API Response',
      value: metrics.avgResponseTime,
      unit: 'ms',
      trend: metrics.responseTimeTrend,
      change: metrics.responseTimeChange,
      color: '#22d3ee',
      icon: '⏱',
    },
    {
      id: 'tokens',
      label: 'AI Tokens Today',
      value: metrics.tokensToday,
      trend: 'up',
      color: '#a78bfa',
      icon: '🧠',
    },
    {
      id: 'clients',
      label: 'Active Systems',
      value: metrics.activeClients,
      trend: 'up',
      color: '#f59e0b',
      icon: '🏢',
    },
    {
      id: 'queue',
      label: 'Queue Depth',
      value: metrics.queueDepth,
      trend: metrics.queueDepth > 100 ? 'up' : 'neutral',
      color: metrics.queueDepth > 100 ? '#ef4444' : '#6b7280',
      icon: '📋',
    },
  ];
}

/**
 * Emit custom event to specific room
 */
export function emitToRoom(room: string, event: string, data: unknown): void {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit');
    return;
  }

  io.to(room).emit(event, data);
}

/**
 * Emit event to all connected clients
 */
export function broadcast(event: string, data: unknown): void {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot broadcast');
    return;
  }

  io.emit(event, data);
}

/**
 * Get connected client count
 */
export function getConnectedClientCount(): number {
  return connectedClients.size;
}

/**
 * Get Socket.IO instance
 */
export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Cleanup on shutdown
 */
export function shutdownSocketIO(): void {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
  }

  if (io) {
    io.disconnectSockets();
    io.close();
    io = null;
  }

  connectedClients.clear();
  logger.info('Socket.IO server shutdown');
}
