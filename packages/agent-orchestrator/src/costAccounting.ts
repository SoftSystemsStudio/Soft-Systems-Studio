import { getPricingForModel, estimateCost } from '@softsystems/core-llm/dist/pricing';
import { emitMetric } from '@softsystems/core-llm/dist/metrics';

export class CostAccountingService {
  estimateCost(model: string, tokensIn: number, tokensOut: number) {
    const res = estimateCost(tokensIn, tokensOut, model);
    // emit small metric
    try {
      emitMetric('cost_estimate_usd', Math.round(res.cost * 1000000) / 1000000, { model });
    } catch (e) {
      // ignore
    }
    return { cost: res.cost };
  }
}
