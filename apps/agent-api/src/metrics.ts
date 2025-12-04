import client from 'prom-client';
import express from 'express';

const collectDefault = client.collectDefaultMetrics;
collectDefault();

// Queue metrics with labels for different queues
export const queueWaitingGauge = new client.Gauge({
  name: 'job_queue_waiting',
  help: 'Number of waiting jobs in queue',
  labelNames: ['queue'],
});
export const queueActiveGauge = new client.Gauge({
  name: 'job_queue_active',
  help: 'Number of active jobs in queue',
  labelNames: ['queue'],
});
export const queueFailedGauge = new client.Gauge({
  name: 'job_queue_failed',
  help: 'Number of failed jobs in queue',
  labelNames: ['queue'],
});

// Rate limit metrics
export const rateLimitHitsCounter = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint', 'limit_type'],
});

// Redis connection metrics
export const redisConnectionGauge = new client.Gauge({
  name: 'redis_connection_status',
  help: 'Redis connection status (1 = connected, 0 = disconnected)',
});

// Email metrics
export const emailsSentCounter = new client.Counter({
  name: 'emails_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['template', 'status'],
});

// small express server to expose metrics when run standalone (optional)
export function metricsHandler(_req: express.Request, res: express.Response): void {
  res.set('Content-Type', client.register.contentType);
  void client.register
    .metrics()
    .then((m) => res.send(m))
    .catch((err: Error) => res.status(500).send(err.message));
}

export default client;
