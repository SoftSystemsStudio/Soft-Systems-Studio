import type {
  RunInput,
  RunResult,
  IContextWindowManager,
  ITokenCounter,
  ICostAccountingService,
} from './interfaces';
// We dynamically require the LLM adapter at runtime to avoid static resolution issues during refactor.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const coreLlm = (() => {
  try {
    // Try to require the workspace package
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@softsystems/core-llm');
  } catch (e) {
    return null;
  }
})();

const callChat = coreLlm ? (coreLlm.callChat as any) : async () => {
  throw new Error('LLM adapter not available');
};
import type { IToolExecutor } from './interfaces';

type ToolDescriptor = { name: string; args?: unknown };

export class ExecutionController {
  constructor(
    private ctxManager: IContextWindowManager,
    private tokenCounter: ITokenCounter,
    private costService: ICostAccountingService,
    private toolExecutor?: IToolExecutor,
  ) {}

  async runChat(input: RunInput, systemPrompt: string): Promise<RunResult> {
    const history: string[] = []; // placeholder - real impl would fetch conversation history
    const messages = await this.ctxManager.buildPrompt(history, systemPrompt);

    // enforce model budget (example)
    const model = 'gpt-4o-mini';
    const budget = 8000;
    const ok = await this.ctxManager.enforceTokenBudget(messages, model, budget);

    // count tokens
    const inCount = this.tokenCounter.countMessages(messages as any).tokens;

    // Example: if tools present in config we would validate/execute them before calling LLM
    // For now, look for a special tool descriptor in the messages (placeholder)
    const tools: ToolDescriptor[] = [];
    if (this.toolExecutor && tools.length > 0) {
      for (const t of tools) {
        const result = await this.toolExecutor.execute(t.name, t.args ?? {}, { timeoutMs: 5000 });
        if (result.status !== 'success') {
          // surface the tool failure as an execution error
          throw new Error(`Tool ${t.name} failed: ${result.error_message || 'unknown'}`);
        }
        // Optionally, inject tool output into messages or logs
      }
    }

    // call LLM via shared adapter
    const reply = await callChat(messages, { model });

    // naive out tokens (unknown here) — set 0
    const outCount = 0;

    const cost = this.costService.estimateCost(model, inCount, outCount);

    return { reply, tokensIn: inCount, tokensOut: outCount, costEstimateUsd: cost.cost };
  }
}
