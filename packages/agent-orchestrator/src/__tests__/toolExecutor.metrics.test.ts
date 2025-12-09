import { ToolExecutor } from '../toolExecutor';

class MockObs {
  public metrics: Array<{ name: string; value: number; labels?: Record<string, string> }> = [];
  emitMetric(name: string, value: number, labels?: Record<string, string>) {
    this.metrics.push({ name, value, labels });
  }
  emitEvent(_name: string, _payload?: unknown) {}
}

describe('ToolExecutor metrics', () => {
  test('emits retry and success metrics', async () => {
    let calls = 0;
    const toolMap = {
      flaky: async () => {
        calls += 1;
        if (calls < 2) throw new Error('transient');
        return { ok: true };
      },
    };
    const obs = new MockObs();
    const exec = new ToolExecutor(toolMap as any, obs as any);
    const res = await exec.execute(
      'flaky',
      {},
      { retries: 2, backoffMs: 1, retryOn: (e) => /transient/.test(e.message) },
    );
    expect(res.status).toBe('success');
    // should have a retry metric and a success metric
    expect(obs.metrics.some((m) => m.name === 'tool.retry')).toBe(true);
    expect(obs.metrics.some((m) => m.name === 'tool.success')).toBe(true);
  });

  test('emits failure metric on final failure', async () => {
    const toolMap = {
      bad: async () => {
        throw new Error('fatal');
      },
    };
    const obs = new MockObs();
    const exec = new ToolExecutor(toolMap as any, obs as any);
    const res = await exec.execute('bad', {}, { retries: 1, backoffMs: 1, retryOn: (e) => false });
    expect(res.status).toBe('execution_error');
    expect(obs.metrics.some((m) => m.name === 'tool.failure')).toBe(true);
  });
});
