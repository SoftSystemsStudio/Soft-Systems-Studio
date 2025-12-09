import type { ChatMessage } from '@softsystems/core-llm';

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
  buildPrompt(history: string[], systemPrompt: string, tools?: unknown[], config?: unknown): Promise<ChatMessage[]>;
  enforceTokenBudget(messages: ChatMessage[], model: string, maxTokens: number, safetyMargin?: number): Promise<ChatMessage[]>;
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
