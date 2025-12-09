import { countTokensFromMessages } from '@softsystems/core-llm/dist/tokenizer';

export class TokenCounter {
  countMessages(messages: { role: string; content: string }[]) {
    const res = countTokensFromMessages(messages as any);
    return { tokens: res.tokens, method: res.method };
  }
}
