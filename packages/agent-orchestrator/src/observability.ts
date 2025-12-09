function tryEmitMetric(name: string, value: number, labels?: Record<string, string>) {
  try {
    // require at runtime to avoid static type resolution issues during incremental refactor
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const core = require('@softsystems/core-llm');
    if (core && typeof core.emitMetric === 'function') core.emitMetric(name, value, labels);
  } catch (e) {
    // ignore when core-llm not present
  }
}

export interface IObservabilityManager {
  emitMetric(name: string, value: number, labels?: Record<string, string>): void;
  emitEvent(name: string, payload?: unknown): void;
}

/** In-memory observability manager that forwards to `core-llm` emitter when available. */
export class InMemoryObservabilityManager implements IObservabilityManager {
  private events: Array<{ name: string; payload?: unknown }> = [];
  private metrics: Array<{ name: string; value: number; labels?: Record<string, string> }> = [];
  private statsd: any | null = null;

  constructor() {
    // Optionally wire to statsd when configured
    try {
      if (process.env.METRICS_BACKEND === 'statsd') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const StatsD = require('hot-shots');
        const host = process.env.STATSD_HOST || '127.0.0.1';
        const port = process.env.STATSD_PORT ? Number(process.env.STATSD_PORT) : 8125;
        this.statsd = new StatsD({ host, port });
      }
    } catch (e) {
      // if hot-shots not installed or misconfigured, ignore
      this.statsd = null;
    }
  }

  emitMetric(name: string, value: number, labels?: Record<string, string>) {
    // record locally for tests
    this.metrics.push({ name, value, labels });
    tryEmitMetric(name, value, labels);
    // forward to StatsD when available
    try {
      if (this.statsd) {
        // heuristics: counters start with 'tool.' or 'tokens.'; costs use gauge
        if (name.startsWith('tool.') || name.startsWith('tokens.')) {
          this.statsd.increment(name, value, 1, labels);
        } else {
          this.statsd.gauge(name, value, 1, labels);
        }
      }
    } catch (e) {
      // swallow
    }
  }

  emitEvent(name: string, payload?: unknown) {
    this.events.push({ name, payload });
  }

  getEvents() {
    return this.events.slice();
  }

  getMetrics() {
    return this.metrics.slice();
  }
}

export class NoOpObservabilityManager implements IObservabilityManager {
  emitMetric(_name: string, _value: number, _labels?: Record<string, string>) {}
  emitEvent(_name: string, _payload?: unknown) {}
}

export const defaultObservability = new InMemoryObservabilityManager();

export default InMemoryObservabilityManager;
