import { ToolExecutor } from '../toolExecutor';
import { registerToolValidator } from '../toolValidator';

describe('ToolExecutor retries', () => {
  test('retries transient errors and succeeds', async () => {
    let calls = 0;
    const toolMap = {
      flaky: async () => {
        calls += 1;
        if (calls < 3) throw new Error('transient');
        return { ok: true };
      },
    };

    const exec = new ToolExecutor(toolMap as any);
    const res = await exec.execute(
      'flaky',
      {},
      { retries: 3, backoffMs: 1, retryOn: (e) => /transient/.test(e.message) },
    );
    expect(res.status).toBe('success');
    expect(calls).toBe(3);
  });

  test('does not retry non-retriable errors', async () => {
    const toolMap = {
      bad: async () => {
        throw new Error('fatal');
      },
    };
    const exec = new ToolExecutor(toolMap as any);
    const res = await exec.execute(
      'bad',
      {},
      { retries: 2, backoffMs: 1, retryOn: (e) => /transient/.test(e.message) },
    );
    expect(res.status).toBe('execution_error');
  });
});
