import EventEmitter from 'events';

export type Metric = { name: string; value: number; labels?: Record<string, string> };

const emitter = new EventEmitter();

export function emitMetric(name: string, value: number, labels?: Record<string, string>) {
  const m: Metric = { name, value, labels };
  // non-blocking: listeners may forward to Prometheus/StatsD
  emitter.emit('metric', m);
  // basic console emit for visibility
  // eslint-disable-next-line no-console
  console.info('metric', JSON.stringify(m));
}

export function onMetric(fn: (m: Metric) => void) {
  emitter.on('metric', fn);
}

export function offMetric(fn: (m: Metric) => void) {
  emitter.off('metric', fn);
}
