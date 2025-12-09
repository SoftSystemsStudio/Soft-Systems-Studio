import { RedisStateManager } from '../stateManager.redis';

// Fake Redis client using an in-memory Map
function makeFakeRedis() {
  const map = new Map<string, string>();
  return {
    async get(k: string) {
      return map.has(k) ? map.get(k)! : null;
    },
    async set(k: string, v: string) {
      map.set(k, v);
      return 'OK';
    },
    async del(k: string) {
      return map.delete(k) ? 1 : 0;
    },
  };
}

describe('RedisStateManager (fake redis)', () => {
  test('persist lifecycle', async () => {
    const client = makeFakeRedis();
    const m = new RedisStateManager(client as any);
    await m.create('r1');
    const p = await m.get('r1');
    expect(p).toBeDefined();
    expect(p!.status).toBe('pending');
    await m.start('r1');
    expect((await m.get('r1'))!.status).toBe('running');
    await m.complete('r1', { x: 1 });
    const done = await m.get('r1');
    expect(done!.status).toBe('completed');
    expect((done as any).result).toEqual({ x: 1 });
  });

  test('fail and double create check', async () => {
    const client = makeFakeRedis();
    const m = new RedisStateManager(client as any);
    await m.create('r2');
    await expect(m.create('r2')).rejects.toThrow();
    await m.start('r2');
    await m.fail('r2', 'boom');
    const s = await m.get('r2');
    expect(s!.status).toBe('failed');
    expect((s as any).error).toMatch(/boom/);
  });
});
