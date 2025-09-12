/**
 * modelRouter.ts — Provider-agnostic LLM router
 * Selects an analysis (primary) or creative model based on task.
 * Enforces simple cost/latency guards via optional callbacks.
 */
function num(key, def) {
    const v = process.env[key];
    const n = v ? Number(v) : def;
    return Number.isFinite(n) ? n : def;
}
const analysis = {
    provider: (process.env.LLM_PRIMARY_PROVIDER || 'openai'),
    model: process.env.LLM_PRIMARY_MODEL || 'gpt-5o',
    temperature: num('LLM_TEMPERATURE_ANALYSIS', 0.3),
    maxInputTokens: num('LLM_MAX_INPUT_TOKENS', 120000),
    maxOutputTokens: num('LLM_MAX_OUTPUT_TOKENS', 4096),
};
const creative = {
    provider: (process.env.LLM_CREATIVE_PROVIDER || analysis.provider),
    model: process.env.LLM_CREATIVE_MODEL || 'gpt-5o-mini',
    temperature: num('LLM_TEMPERATURE_CREATIVE', 0.7),
    maxInputTokens: analysis.maxInputTokens,
    maxOutputTokens: analysis.maxOutputTokens,
};
export function chooseModel(route) {
    return route === 'analysis' ? analysis : creative;
}
/**
 * Simple guard utility (optional): enforces latency/cost budgets if you pass telemetry.
 */
export class BudgetGuard {
    costBudgetUSD;
    latencySlaMs;
    costSoFar = 0;
    constructor() {
        this.costBudgetUSD = num('LLM_COST_BUDGET_USD', 15);
        this.latencySlaMs = num('LLM_LATENCY_SLA_MS', 12000);
    }
    beforeCall(route, spec, approxInputTokens = 0) {
        // Could estimate pre-cost here if you maintain a token->cost map per model.
        // For now we do nothing.
    }
    afterCall(route, spec, tokensUsed, latencyMs, costUSD = 0) {
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
