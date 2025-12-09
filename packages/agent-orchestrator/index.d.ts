declare module '@softsystems/agent-orchestrator' {
  export type ChatMessage = { role: string; content: string };

  export class ContextWindowManager {
    constructor();
    buildPrompt(history: string[], systemPrompt: string, tools?: unknown[], config?: unknown): Promise<ChatMessage[]>;
    enforceTokenBudget(messages: ChatMessage[], model: string, maxTokens: number, safetyMargin?: number): Promise<ChatMessage[]>;
  }

  export class TokenCounter {
    countMessages(messages: ChatMessage[]): { tokens: number; method: string };
  }

  export class CostAccountingService {
    estimateCost(model: string, tokensIn: number, tokensOut: number): { cost: number };
  }

  export type RunInput = { workspaceId: string; userId?: string; message: string };
  export type RunResult = { reply: string; needsHuman?: boolean; tokensIn?: number; tokensOut?: number; costEstimateUsd?: number };

  export class ExecutionController {
    constructor(ctxManager: any, tokenCounter: any, costService: any, toolExecutor?: any);
    runChat(input: RunInput, systemPrompt: string): Promise<RunResult>;
  }

  export function registerToolValidator(name: string, fn: any): void;
  export class ToolExecutor {
    constructor(toolMap: Record<string, (args: unknown) => Promise<unknown>>);
    execute(toolName: string, args: unknown, opts?: { timeoutMs?: number }): Promise<any>;
  }
}
