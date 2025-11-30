import { SOLUTION_BRIEF_PROMPT, PHASE_PROPOSAL_PROMPT } from '../../agency-core/src/prompts';

/**
 * Thin LLM helper.
 * - Uses prompts from `packages/agency-core`.
 * - For now this is a stub: if `OPENAI_API_KEY` is present it will attempt to call
 *   an external LLM via fetch; otherwise it returns a deterministic placeholder.
 */
export async function generateSolutionBrief(clientConfigJson: string) {
  const prompt = SOLUTION_BRIEF_PROMPT.replace('{{CLIENT_CONFIG}}', clientConfigJson);
  return generateFromPrompt(prompt);
}

export async function generatePhaseProposal(clientConfigJson: string, phase: number) {
  const prompt = PHASE_PROPOSAL_PROMPT(phase).replace('{{CLIENT_CONFIG}}', clientConfigJson);
  return generateFromPrompt(prompt);
}

async function generateFromPrompt(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Deterministic stub for local/dev use
    return `DUMMY OUTPUT (no OPENAI_API_KEY). Prompt snippet: ${prompt.slice(0, 160)}`;
  }

  // Minimal real implementation using fetch; keep intentionally small.
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text}`);
  }

  const payload = await res.json();
  const reply = payload.choices?.[0]?.message?.content ?? '';
  return reply;
}
