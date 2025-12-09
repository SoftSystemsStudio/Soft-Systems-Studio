import type { ChatMessage } from './interfaces';
import { TokenCounter } from './tokenCounter';

export class ContextWindowManager {
  private tokenCounter = new TokenCounter();

  async buildPrompt(
    history: string[],
    systemPrompt: string,
    tools?: unknown[],
    config?: { maxContextTokens?: number },
  ): Promise<ChatMessage[]> {
    // naive composition: system + history (joined) + placeholder for tools
    const joined = history.join('\n\n');
    const content = `${systemPrompt}\n\n${joined}`;
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ];
    return messages;
  }

  async enforceTokenBudget(
    messages: ChatMessage[],
    model: string,
    maxTokens: number,
    safetyMargin = 0.05,
  ): Promise<ChatMessage[]> {
    const { tokens, method } = this.tokenCounter.countMessages(messages as any);
    const effectiveMax = Math.floor(maxTokens * (1 - safetyMargin));
    if (tokens <= effectiveMax) return messages;

    // Simple truncation strategy: drop oldest content from user messages until under budget.
    const remaining: ChatMessage[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      remaining.unshift(messages[i]);
      const curr = this.tokenCounter.countMessages(remaining as any).tokens;
      if (curr > effectiveMax) {
        // remove earliest in remaining and continue
        remaining.shift();
      }
    }
    // If still too large, return last message only as fallback
    if (this.tokenCounter.countMessages(remaining as any).tokens > effectiveMax) {
      const last = messages[messages.length - 1];
      return [last];
    }

    return remaining;
  }
}
