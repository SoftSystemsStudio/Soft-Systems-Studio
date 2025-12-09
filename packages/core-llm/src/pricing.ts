export type PricingModel = {
  model: string;
  inputCostPer1k: number; // USD per 1k input tokens
  outputCostPer1k: number; // USD per 1k output tokens
};

const DEFAULT_PRICING: Record<string, PricingModel> = {
  'gpt-4o-mini': { model: 'gpt-4o-mini', inputCostPer1k: 0.03, outputCostPer1k: 0.06 },
  'gpt-4o': { model: 'gpt-4o', inputCostPer1k: 0.06, outputCostPer1k: 0.12 },
  'gpt-4o-mini-embed': { model: 'gpt-4o-mini-embed', inputCostPer1k: 0.01, outputCostPer1k: 0.01 },
};

export function getPricingForModel(model: string): PricingModel {
  return DEFAULT_PRICING[model] ?? { model, inputCostPer1k: 0.05, outputCostPer1k: 0.1 };
}

export function estimateCost(tokensIn: number, tokensOut: number, model: string) {
  const p = getPricingForModel(model);
  const cost = (tokensIn / 1000) * p.inputCostPer1k + (tokensOut / 1000) * p.outputCostPer1k;
  return { cost, model: p.model, inputCostPer1k: p.inputCostPer1k, outputCostPer1k: p.outputCostPer1k };
}
