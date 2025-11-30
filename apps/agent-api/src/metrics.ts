import client from 'prom-client';
import express from 'express';
import { ingestQueue } from './queue';

const collectDefault = client.collectDefaultMetrics;
collectDefault({ timeout: 5000 });

// custom metrics
export const queueWaitingGauge = new client.Gauge({
  name: 'ingest_queue_waiting',
  help: 'Number of waiting jobs in ingest queue',
});
export const queueActiveGauge = new client.Gauge({
  name: 'ingest_queue_active',
  help: 'Number of active jobs in ingest queue',
});
export const queueFailedGauge = new client.Gauge({
  name: 'ingest_queue_failed',
  help: 'Number of failed jobs in ingest queue',
});

async function updateQueueMetrics() {
  try {
    const counts = await ingestQueue.getJobCounts();
    queueWaitingGauge.set(counts.waiting || 0);
    queueActiveGauge.set(counts.active || 0);
    queueFailedGauge.set(counts.failed || 0);
  } catch (e) {
    // ignore
  }
}

setInterval(updateQueueMetrics, 5000);

// small express server to expose metrics when run standalone (optional)
export function metricsHandler(req: express.Request, res: express.Response) {
  res.set('Content-Type', client.register.contentType);
  client.register
    .metrics()
    .then((m) => res.send(m))
    .catch((err) => res.status(500).send(err.message));
}

export default client;
