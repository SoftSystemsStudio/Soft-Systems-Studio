import { ToolExecutor } from '../toolExecutor';

describe('ToolExecutor defaults', () => {
  test('applies per-tool default retries when no opts passed', async () => {
    let calls = 0;
    const toolMap = {
      d: async () => {
        calls += 1;
        if (calls < 2) throw new Error('transient');
        return { ok: true };
      },
    };

    const defaults = { d: { retries: 2, backoffMs: 1 } };
    const exec = new ToolExecutor(toolMap as any, undefined as any, defaults);
    const res = await exec.execute('d', {}, undefined);
    expect(res.status).toBe('success');
    expect(calls).toBe(2);
  });

  test('jitter affects wait but does not break retry', async () => {
    // Mock Math.random for deterministic jitter
    const orig = Math.random;
    Math.random = () => 0.5;
    try {
      let calls = 0;
      const toolMap = {
        j: async () => {
          calls += 1;
          if (calls < 2) throw new Error('transient');
          return { ok: true };
        },
      };
      const defaults = { j: { retries: 2, backoffMs: 1, jitterMs: 10 } };
      const exec = new ToolExecutor(toolMap as any, undefined as any, defaults);
      const res = await exec.execute('j', {}, undefined);
      expect(res.status).toBe('success');
      expect(calls).toBe(2);
    } finally {
      Math.random = orig;
    }
  });
});
