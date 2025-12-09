import { IToolExecutor, ToolExecutionResult } from './interfaces';
import { validateToolArgs } from './toolValidator';
import type { IObservabilityManager } from './observability';
import { NoOpObservabilityManager, defaultObservability } from './observability';

export class ToolExecutor implements IToolExecutor {
  // toolMap maps toolName -> function(args) => Promise<any>
  constructor(
    private toolMap: Record<string, (args: unknown) => Promise<unknown>>,
    private obs: IObservabilityManager = defaultObservability,
    private toolDefaults: Record<
      string,
      {
        retries?: number;
        backoffMs?: number;
        jitterMs?: number;
        retryOn?: (err: any) => boolean;
      }
    > = {},
  ) {}

  /**
   * Execute a tool with optional timeout and retry/backoff options.
   * opts: { timeoutMs?, retries?, backoffMs?, retryOn?: (err)=>boolean }
   */
  async execute(
    toolName: string,
    args: unknown,
    opts?: {
      timeoutMs?: number;
      retries?: number;
      backoffMs?: number;
      jitterMs?: number;
      retryOn?: (err: any) => boolean;
    },
  ): Promise<ToolExecutionResult> {
    // Validate
    const v = validateToolArgs(toolName, args);
    if (!v.ok) {
      return { status: 'validation_error', error_message: 'validation failed', details: v.errors };
    }

    const fn = this.toolMap[toolName];
    if (!fn) {
      return {
        status: 'execution_error',
        error_message: 'tool not found',
        error_code: 'tool_not_found',
      };
    }

    const td = this.toolDefaults[toolName] ?? {};
    const retries = opts?.retries ?? td.retries ?? 0;
    const backoffMs = opts?.backoffMs ?? td.backoffMs ?? 100;
    const jitterMs = opts?.jitterMs ?? td.jitterMs ?? 0;
    const retryOn = opts?.retryOn ?? td.retryOn ?? ((_err: any) => true);

    let attempt = 0;
    while (true) {
      try {
        const p = fn(v.parsed);
        let res: unknown;
        if (opts?.timeoutMs) {
          res = await Promise.race([
            p,
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), opts.timeoutMs)),
          ]);
        } else {
          res = await p;
        }
        try {
          this.obs.emitMetric('tool.success', 1, { tool: toolName });
        } catch (e) {}
        return { status: 'success', output: res };
      } catch (err: any) {
        const shouldRetry = attempt < retries && retryOn(err);
        if (!shouldRetry) {
          try {
            this.obs.emitMetric('tool.failure', 1, { tool: toolName });
          } catch (e) {}
          return {
            status: 'execution_error',
            error_message: (err && err.message) || String(err),
            details: err,
          };
        }
        // backoff before next attempt (exponential) with optional jitter
        const base = backoffMs * Math.pow(2, attempt);
        const jitter = jitterMs > 0 ? Math.floor(Math.random() * (jitterMs + 1)) : 0;
        const wait = base + jitter;
        try {
          this.obs.emitMetric('tool.retry', 1, { tool: toolName, attempt: String(attempt + 1) });
        } catch (e) {}
        await new Promise((res) => setTimeout(res, wait));
        attempt += 1;
        // continue loop
      }
    }
  }
}
