export type ExecutionState =
  | { status: 'pending'; startedAt: number }
  | { status: 'running'; startedAt: number }
  | { status: 'completed'; startedAt: number; completedAt: number; result?: unknown }
  | { status: 'failed'; startedAt: number; failedAt: number; error: string };

export interface IStateManager {
  create(id: string): Promise<void> | void;
  start(id: string): Promise<void> | void;
  complete(id: string, result?: unknown): Promise<void> | void;
  fail(id: string, err: Error | string): Promise<void> | void;
  get(id: string): Promise<ExecutionState | undefined> | ExecutionState | undefined;
}

/** In-memory StateManager intended as a simple default implementation.
 *  For production this should be replaced with a persistent implementation.
 */
export class InMemoryStateManager implements IStateManager {
  private store: Record<string, ExecutionState> = {};

  async create(id: string) {
    if (this.store[id]) throw new Error('execution already exists');
    this.store[id] = { status: 'pending', startedAt: Date.now() };
  }

  async start(id: string) {
    const s = this.store[id];
    if (!s) throw new Error('execution not found');
    if (s.status !== 'pending') throw new Error('cannot start non-pending execution');
    this.store[id] = { status: 'running', startedAt: s.startedAt };
  }

  async complete(id: string, result?: unknown) {
    const s = this.store[id];
    if (!s) throw new Error('execution not found');
    if (s.status === 'completed') throw new Error('already completed');
    const startedAt = s.startedAt ?? Date.now();
    this.store[id] = { status: 'completed', startedAt, completedAt: Date.now(), result };
  }

  async fail(id: string, err: Error | string) {
    const s = this.store[id];
    if (!s) throw new Error('execution not found');
    const startedAt = s.startedAt ?? Date.now();
    this.store[id] = {
      status: 'failed',
      startedAt,
      failedAt: Date.now(),
      error: (err && (err as any).message) || String(err),
    };
  }

  async get(id: string) {
    return this.store[id];
  }
}

/** No-op manager for use when not provided. */
export class NoOpStateManager implements IStateManager {
  async create(_id: string) {}
  async start(_id: string) {}
  async complete(_id: string, _result?: unknown) {}
  async fail(_id: string, _err: Error | string) {}
  async get(_id: string) {
    return undefined;
  }
}

export default InMemoryStateManager;
