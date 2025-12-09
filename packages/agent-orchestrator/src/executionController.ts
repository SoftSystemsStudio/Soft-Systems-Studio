import type { RunInput, RunResult, IContextWindowManager, ITokenCounter, ICostAccountingService } from './interfaces';
import { callChat } from '@softsystems/core-llm';

export class ExecutionController {
  constructor(
    private ctxManager: IContextWindowManager,
    private tokenCounter: ITokenCounter,
    private costService: ICostAccountingService,
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

    // call LLM via shared adapter
    const reply = await callChat(messages, { model });

    // naive out tokens (unknown here) — set 0
    const outCount = 0;

    const cost = this.costService.estimateCost(model, inCount, outCount);

    return { reply, tokensIn: inCount, tokensOut: outCount, costEstimateUsd: cost.cost };
  }
}
