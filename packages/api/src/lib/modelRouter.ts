/**
 * modelRouter.ts — Provider-agnostic LLM router
 * Selects an analysis (primary) or creative model based on task.
 * Enforces simple cost/latency guards via optional callbacks.
 */

export type ModelSpec = {
  provider: 'openai' | 'anthropic' | 'vertex' | 'azureopenai' | 'cohere' | 'mistral' | string;
  model: string;
  temperature: number;
  maxInputTokens: number;
  maxOutputTokens: number;
};

export type Route = 'analysis' | 'creative';

export type GuardCallbacks = {
  beforeCall?: (route: Route, spec: ModelSpec, approxInputTokens?: number) => Promise<void> | void;
  afterCall?: (route: Route, spec: ModelSpec, tokensUsed: { input: number; output: number }, latencyMs: number, costUSD?: number) => Promise<void> | void;
  onAbort?: (reason: string) => Promise<void> | void;
};

function num(key: string, def: number): number {
  const v = process.env[key];
  const n = v ? Number(v) : def;
  return Number.isFinite(n) ? n : def;
}

const analysis: ModelSpec = {
  provider: (process.env.LLM_PRIMARY_PROVIDER || 'openai') as ModelSpec['provider'],
  model: process.env.LLM_PRIMARY_MODEL || 'gpt-5o',
  temperature: num('LLM_TEMPERATURE_ANALYSIS', 0.3),
  maxInputTokens: num('LLM_MAX_INPUT_TOKENS', 120000),
  maxOutputTokens: num('LLM_MAX_OUTPUT_TOKENS', 4096),
};

const creative: ModelSpec = {
  provider: (process.env.LLM_CREATIVE_PROVIDER || analysis.provider) as ModelSpec['provider'],
  model: process.env.LLM_CREATIVE_MODEL || 'gpt-5o-mini',
  temperature: num('LLM_TEMPERATURE_CREATIVE', 0.7),
  maxInputTokens: analysis.maxInputTokens,
  maxOutputTokens: analysis.maxOutputTokens,
};

export function chooseModel(route: Route): ModelSpec {
  return route === 'analysis' ? analysis : creative;
}

/**
 * Simple guard utility (optional): enforces latency/cost budgets if you pass telemetry.
 */
export class BudgetGuard {
  private costBudgetUSD: number;
  private latencySlaMs: number;
  private costSoFar: number = 0;

  constructor() {
    this.costBudgetUSD = num('LLM_COST_BUDGET_USD', 15);
    this.latencySlaMs = num('LLM_LATENCY_SLA_MS', 12000);
  }

  beforeCall(route: Route, spec: ModelSpec, approxInputTokens = 0) {
    // Could estimate pre-cost here if you maintain a token->cost map per model.
    // For now we do nothing.
  }

  afterCall(route: Route, spec: ModelSpec, tokensUsed: { input: number; output: number }, latencyMs: number, costUSD = 0) {
    this.costSoFar += costUSD;
    if (this.costSoFar > this.costBudgetUSD) {
      throw new Error(`LLM budget exceeded: ${this.costSoFar.toFixed(2)} > ${this.costBudgetUSD.toFixed(2)} USD`);
    }
    if (latencyMs > this.latencySlaMs) {
      // Not fatal; callers may decide to downgrade model next call.
      // You can throw here if you want strict enforcement.
      // throw new Error(`Latency SLA exceeded: ${latencyMs}ms > ${this.latencySlaMs}ms`);
    }
  }
}
