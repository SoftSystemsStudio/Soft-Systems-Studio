import OpenAI from 'openai';
import { config } from '../config';
import { SYSTEM_PROMPT, FUNCTIONS } from './prompts';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export async function generateResponse(
  history: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  language: string,
): Promise<{ text: string; functionCall?: any }> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT + `\n\nCurrent Language: ${language}` },
    ...history,
  ];

  const model = config.LLM_MODEL || 'gpt-3.5-turbo';

  const completion = await openai.chat.completions.create({
    model,
    messages,
    functions: FUNCTIONS,
    function_call: 'auto',
    temperature: 0.6,
    max_tokens: 120,
  });

  const choice = completion.choices[0];
  const text = choice.message.content || '';
  const functionCall = choice.message.function_call;

  return { text, functionCall };
}
