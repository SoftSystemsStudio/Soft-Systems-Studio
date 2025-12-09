export type RunInput = {
  workspaceId: string;
  userId?: string;
  message: string;
};

export type RunResult = {
  reply: string;
  needsHuman?: boolean;
  tokensIn?: number;
  tokensOut?: number;
  costEstimateUsd?: number;
};

export interface IContextWindowManager {
  buildPrompt(
    history: string[],
    systemPrompt: string,
    tools?: unknown[],
    config?: unknown,
  ): Promise<ChatMessage[]>;
  enforceTokenBudget(
    messages: ChatMessage[],
    model: string,
    maxTokens: number,
    safetyMargin?: number,
  ): Promise<ChatMessage[]>;
}

export interface ITokenCounter {
  countMessages(messages: ChatMessage[]): { tokens: number; method: string };
}

export interface ICostAccountingService {
  estimateCost(model: string, tokensIn: number, tokensOut: number): { cost: number };
}

export interface IExecutionController {
  runChat(input: RunInput, systemPrompt: string): Promise<RunResult>;
}

// Local ChatMessage type to avoid cross-package type resolution during refactor.
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type ToolExecutionStatus = 'success' | 'validation_error' | 'execution_error';

export type ToolExecutionResult = {
  status: ToolExecutionStatus;
  output?: unknown;
  error_code?: string;
  error_message?: string;
  details?: unknown;
};

export interface IToolSchemaValidator {
  validate(
    toolName: string,
    args: unknown,
  ): { ok: true; parsed: unknown } | { ok: false; errors: string[] };
}

export interface IToolExecutor {
  execute(
    toolName: string,
    args: unknown,
    opts?: { timeoutMs?: number },
  ): Promise<ToolExecutionResult>;
}
