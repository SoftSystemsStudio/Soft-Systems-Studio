// Local pricing fallback to avoid hard dependency on core-llm during refactor
type Pricing = { inputCostPer1k: number; outputCostPer1k: number };
const DEFAULT: Record<string, Pricing> = {
  'gpt-4o-mini': { inputCostPer1k: 0.03, outputCostPer1k: 0.06 },
  'gpt-4o': { inputCostPer1k: 0.06, outputCostPer1k: 0.12 },
};

export class CostAccountingService {
  estimateCost(model: string, tokensIn: number, tokensOut: number) {
    const p = DEFAULT[model] ?? { inputCostPer1k: 0.05, outputCostPer1k: 0.1 };
    const cost = (tokensIn / 1000) * p.inputCostPer1k + (tokensOut / 1000) * p.outputCostPer1k;
    // basic console metric for visibility
    // eslint-disable-next-line no-console
    console.info(
      'metric',
      JSON.stringify({
        name: 'cost_estimate_usd',
        value: Math.round(cost * 1000000) / 1000000,
        labels: { model },
      }),
    );
    return { cost };
  }
}
