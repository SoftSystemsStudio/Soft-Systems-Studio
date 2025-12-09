import { IToolExecutor, ToolExecutionResult } from './interfaces';
import { validateToolArgs } from './toolValidator';

export class ToolExecutor implements IToolExecutor {
  // toolMap maps toolName -> function(args) => Promise<any>
  constructor(private toolMap: Record<string, (args: unknown) => Promise<unknown>>) {}

  async execute(toolName: string, args: unknown, opts?: { timeoutMs?: number }): Promise<ToolExecutionResult> {
    // Validate
    const v = validateToolArgs(toolName, args);
    if (!v.ok) {
      return { status: 'validation_error', error_message: 'validation failed', details: v.errors };
    }

    const fn = this.toolMap[toolName];
    if (!fn) {
      return { status: 'execution_error', error_message: 'tool not found', error_code: 'tool_not_found' };
    }

    try {
      // Simple timeout wrapper
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
      return { status: 'success', output: res };
    } catch (err: any) {
      return { status: 'execution_error', error_message: (err && err.message) || String(err), details: err };
    }
  }
}
