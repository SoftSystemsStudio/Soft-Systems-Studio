import { ToolExecutor } from '../toolExecutor';
import { registerToolValidator } from '../toolValidator';

describe('ToolExecutor', () => {
  test('executes tool successfully', async () => {
    const toolMap = {
      echo: async (args: any) => ({ out: args }),
    };
    const exec = new ToolExecutor(toolMap);
    const res = await exec.execute('echo', { foo: 'bar' });
    expect(res.status).toBe('success');
    expect(res.output).toEqual({ out: { foo: 'bar' } });
  });

  test('reports validation errors', async () => {
    registerToolValidator('sum', (args: any) => {
      if (args && typeof args.a === 'number' && typeof args.b === 'number')
        return { ok: true, parsed: args };
      return { ok: false, errors: ['a and b required'] };
    });
    const toolMap = { sum: async ({ a, b }: any) => a + b };
    const exec = new ToolExecutor(toolMap);
    const bad = await exec.execute('sum', { a: 1 });
    expect(bad.status).toBe('validation_error');
  });

  test('times out long running tool', async () => {
    const toolMap = { slow: async () => new Promise((r) => setTimeout(() => r('ok'), 200)) };
    const exec = new ToolExecutor(toolMap);
    const res = await exec.execute('slow', {}, { timeoutMs: 50 });
    expect(res.status).toBe('execution_error');
    expect(res.error_message).toMatch(/timeout/i);
  });
});
