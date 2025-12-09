import type { IStateManager, ExecutionState } from './stateManager';

/**
 * RedisStateManager stores execution state at Redis key `state:{id}` as JSON.
 * The constructor accepts any Redis-like client with `get`, `set`, and `del` methods
 * that return Promises.
 */
export class RedisStateManager implements IStateManager {
  constructor(
    private client: {
      get(key: string): Promise<string | null>;
      set(key: string, val: string): Promise<any>;
      del(key: string): Promise<any>;
    },
  ) {}

  private key(id: string) {
    return `state:${id}`;
  }

  private async read(id: string): Promise<ExecutionState | undefined> {
    const raw = await this.client.get(this.key(id));
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as ExecutionState;
    } catch (e) {
      return undefined;
    }
  }

  private async write(id: string, state: ExecutionState) {
    await this.client.set(this.key(id), JSON.stringify(state));
  }

  async create(id: string) {
    const existing = await this.read(id);
    if (existing) throw new Error('execution already exists');
    await this.write(id, { status: 'pending', startedAt: Date.now() });
  }

  async start(id: string) {
    const s = await this.read(id);
    if (!s) throw new Error('execution not found');
    if (s.status !== 'pending') throw new Error('cannot start non-pending execution');
    await this.write(id, { status: 'running', startedAt: s.startedAt });
  }

  async complete(id: string, result?: unknown) {
    const s = await this.read(id);
    if (!s) throw new Error('execution not found');
    const startedAt = (s as any).startedAt ?? Date.now();
    await this.write(id, { status: 'completed', startedAt, completedAt: Date.now(), result });
  }

  async fail(id: string, err: Error | string) {
    const s = await this.read(id);
    if (!s) throw new Error('execution not found');
    const startedAt = (s as any).startedAt ?? Date.now();
    await this.write(id, {
      status: 'failed',
      startedAt,
      failedAt: Date.now(),
      error: (err && (err as any).message) || String(err),
    });
  }

  async get(id: string) {
    return this.read(id);
  }
}

export default RedisStateManager;
