import { InMemoryStateManager } from '../stateManager';

describe('InMemoryStateManager', () => {
  test('create, start, complete flow', async () => {
    const m = new InMemoryStateManager();
    await m.create('x');
    const p = await m.get('x');
    expect(p).toBeDefined();
    expect(p!.status).toBe('pending');
    await m.start('x');
    expect((await m.get('x'))!.status).toBe('running');
    await m.complete('x', { foo: 'bar' });
    const done = await m.get('x')!;
    expect(done.status).toBe('completed');
    expect((done as any).result).toEqual({ foo: 'bar' });
  });

  test('fail flow', async () => {
    const m = new InMemoryStateManager();
    await m.create('y');
    await m.start('y');
    await m.fail('y', new Error('boom'));
    const s = await m.get('y')!;
    expect(s.status).toBe('failed');
    expect((s as any).error).toMatch(/boom/);
  });

  test('error on double create', async () => {
    const m = new InMemoryStateManager();
    await m.create('z');
    await expect(m.create('z')).rejects.toThrow();
  });
});
