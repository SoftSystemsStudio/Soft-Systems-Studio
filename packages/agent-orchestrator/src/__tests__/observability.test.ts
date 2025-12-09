import { ExecutionController } from '../executionController';
import { InMemoryObservabilityManager } from '../observability';

// Minimal stub implementations for collaborators
const dummyCtxManager = {
  buildPrompt: async (_history: string[], _system: string) => [{ role: 'system', content: 'hi' }],
  enforceTokenBudget: async () => true,
};
const dummyTokenCounter = {
  countMessages: (_msgs: any) => ({ tokens: 10, method: 'estimate' }),
};
const dummyCostService = {
  estimateCost: (_model: string, _in: number, _out: number) => ({ cost: 0.001 }),
};

describe('ExecutionController observability', () => {
  test('emits metrics and events on runChat', async () => {
    const obs = new InMemoryObservabilityManager();
    const fakeLLM = async () => ({ text: 'ok' });
    const ctrl = new ExecutionController(
      dummyCtxManager as any,
      dummyTokenCounter as any,
      dummyCostService as any,
      undefined,
      undefined,
      obs,
      fakeLLM,
    );

    const res = await ctrl.runChat({ executionId: 'o1' } as any, 'system');
    expect(res.reply).toBeDefined();
    const events = obs.getEvents();
    // expect at least one state change event for completion
    expect(events.some((e) => e.name === 'state.change')).toBe(true);
  });
});
