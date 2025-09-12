# ANALYST_AGENT.md — LLM‑Powered Advertising Analyst (v2)

An LLM‑powered agent that **researches competitors**, finds **low‑cost/high‑intent keyword opportunities**, and **recommends new campaigns** (Google, Reddit, X/Twitter). It reads from your warehouse and selected APIs (e.g., Keywords Everywhere), writes structured recommendations, and can open PRs or tickets to implement changes.

This version adds a practical guide on **how to select the right LLM** and how to **route between multiple models** (cost/latency/quality trade‑offs).

---

## 0) Goals

1) Discover **opportunities**: gaps vs competitors, rising queries, low‑CPC long‑tails.  
2) Propose **new campaigns/ad groups** with initial bids, audiences, keywords, and creatives.  
3) Suggest **budget reallocation** guided by CAC/ROAS & marginal performance.  
4) Generate a **human‑readable brief** + a **machine‑readable plan** (JSON) that the optimizer and builders can act on.

---

## 1) Selecting the Right Model

### 1.1 Decision Criteria (score 1–5 each)
- **Reasoning quality**: multi‑step analysis, tool use reliability, following schemas.  
- **Context length**: can it ingest 50–150k tokens of KPIs, logs, and pages?  
- **Tool use / function calling**: structured tool calls, JSON durability.  
- **Latency**: sub‑5s desirable for sync UI; async jobs can tolerate longer.  
- **Cost**: $/1K input + $/1K output tokens; expect 50–200K tokens/run for deep research.  
- **Safety & guardrails**: hallucination resistance; refusal/PII handling.  
- **Availability & quotas**: rate limits, regional/data residency.  
- **Vendor constraints**: procurement, SOC2, HIPAA, on‑prem, etc.

> Maintain a **model scorecard** in your repo (e.g., `docs/model_scorecard.csv`). Re‑evaluate quarterly.

### 1.2 Typical Choices (examples; pick 2–3 to support)
- **High‑end reasoning (weekly analyst runs):** a top‑tier “Sonnet/Pro/Large” class model for deep analysis.  
- **Fast/cheap drafts (copy variants):** a “Mini/Small” class model for headline/desc ideation.  
- **Long‑context scraping/synthesis:** a model with 100k+ tokens if you feed large tables/pages.  

### 1.3 Routing Policy (recommended)
- **Analysis mode:** use the high‑end model.  
- **Creative mode:** use the fast/cheap model.  
- **Fallback:** if primary model fails or exceeds latency/cost budget → fallback model.

**ENV (provider‑agnostic):**
```
LLM_ROUTER=enabled
LLM_PRIMARY_PROVIDER=openai|anthropic|vertex|azureopenai|cohere|mistral
LLM_PRIMARY_MODEL=sonnet-pro|gpt-5o|gemini-1.5-pro|command-r-plus|mistral-large
LLM_CREATIVE_PROVIDER=openai|anthropic|...
LLM_CREATIVE_MODEL=gpt-5o-mini|haiku|gemini-1.5-flash|command-r|mistral-small
LLM_MAX_INPUT_TOKENS=120000
LLM_MAX_OUTPUT_TOKENS=4096
LLM_TEMPERATURE_ANALYSIS=0.3
LLM_TEMPERATURE_CREATIVE=0.7
LLM_COST_BUDGET_USD=15          # cap per run
LLM_LATENCY_SLA_MS=12000        # 12s per top-level tool call
```

### 1.4 Programmatic Router (pseudocode)
```ts
type ModelSpec = { provider: string; model: string; temp: number; maxInput: number; maxOutput: number };
const analysis: ModelSpec = {
  provider: process.env.LLM_PRIMARY_PROVIDER!,
  model: process.env.LLM_PRIMARY_MODEL!,
  temp: Number(process.env.LLM_TEMPERATURE_ANALYSIS ?? 0.3),
  maxInput: Number(process.env.LLM_MAX_INPUT_TOKENS ?? 120000),
  maxOutput: Number(process.env.LLM_MAX_OUTPUT_TOKENS ?? 4096)
};
const creative: ModelSpec = {
  provider: process.env.LLM_CREATIVE_PROVIDER!,
  model: process.env.LLM_CREATIVE_MODEL!,
  temp: Number(process.env.LLM_TEMPERATURE_CREATIVE ?? 0.7),
  maxInput: analysis.maxInput,
  maxOutput: analysis.maxOutput
};

export function chooseModel(task: 'analysis'|'creative') {
  return task === 'analysis' ? analysis : creative;
}
```

### 1.5 Cost & Latency Guards
- Track tokens and latency per tool call. Abort if exceeding `LLM_COST_BUDGET_USD` or `LLM_LATENCY_SLA_MS`.  
- Prefer **retrieval + summarization** (query the warehouse; don’t dump raw data).  
- Cache expensive results (e.g., KE queries) for 24h.

---

## 2) Tools (Function‑Calling Interfaces)

The agent uses **tools** to fetch data instead of “imagining” facts.

### 2.1 WarehouseQuery
Query KPIs and entities from the warehouse (SingleStore/BigQuery).

**Schema contracts it expects:**
- `ad_metrics(platform, date, account_id, campaign_id, adgroup_id, ad_id, impressions, clicks, spend, conversions, revenue)`
- `fact_attribution_last_touch(conversion_id, user_id, conversion_event, conversion_time, platform, campaign, adgroup, ad_id)`
- `keywords_external(source, keyword, monthly_volume, est_cpc, competition, pulled_at)`
- `campaign_map(platform, account_id, campaign_id, normalized_campaign)`

**Tool signature:**
```json
{
  "name": "WarehouseQuery",
  "description": "Run SQL and return rows and summary stats.",
  "parameters": { "sql": "string", "row_limit": "integer" }
}
```

### 2.2 KeywordsEverywhere
Fetch keyword metrics and related suggestions for seed terms and competitors’ brand/product names.

```json
{
  "name": "KeywordsEverywhere",
  "description": "Get volume, CPC, competition for given keywords; suggest related.",
  "parameters": { "keywords": "string[]", "include_related": "boolean" }
}
```

### 2.3 WebIntel (optional, compliance‑friendly)
Search curated sources for **competitor pages** to derive seed terms (respect robots/TOS).

```json
{
  "name": "WebIntel",
  "description": "Search competitor pages to extract seed terms (no scraping of disallowed endpoints).",
  "parameters": { "queries": "string[]", "site_filters": "string[]" }
}
```

### 2.4 CampaignPlanner
Validate that recommendations conform to platform constraints.

```json
{
  "name": "CampaignPlanner",
  "description": "Validate and normalize campaign/adgroup/keyword proposals.",
  "parameters": { "plan": "object" }
}
```

---

## 3) Loop & Orchestration

1) **Kickoff** (weekly or manual): provide **brand**, **competitors**, **geos**, **verticals**, **constraints**.  
2) Pull last 28–90 days from `ad_metrics` & attribution → baseline KPIs.  
3) Query `keywords_external` and call `KeywordsEverywhere` for fresh metrics.  
4) Synthesize a **ranked opportunity set** with rationale and expected CPC/volume.  
5) Draft **Campaign Plan JSON** + **Brief (Markdown)**.  
6) Validate with `CampaignPlanner`; on success write to `proposed_campaigns` and open a ticket/PR.

**Schedule:** every **Monday 07:00**; manual trigger allowed.

---

## 4) Inputs, Config, Outputs

### 4.1 Inputs
- **Brand**, **Competitors**, **Geos**, **Verticals**, **Constraints** (`target_cac`, `min_conversions`, `daily_budget_cap`, `exclude_keywords`, `brand_protection`)  
- **Channels enabled:** `["google","reddit","x"]`

**Config table (`analyst_config`):**
```sql
CREATE TABLE IF NOT EXISTS analyst_config (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(128) NOT NULL,
  competitors JSON,
  geos JSON,
  verticals JSON,
  constraints JSON,
  channels JSON,
  updated_at DATETIME(6) DEFAULT NOW(6) ON UPDATE NOW(6)
);
```

### 4.2 Outputs
**Human Brief (Markdown)** and **Machine Plan (JSON)**. Store to `proposed_campaigns`.

```sql
CREATE TABLE IF NOT EXISTS proposed_campaigns (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(128) NOT NULL,
  plan JSON NOT NULL,
  created_at DATETIME(6) DEFAULT NOW(6),
  status ENUM('proposed','approved','rejected','implemented') DEFAULT 'proposed'
);
```

---

## 5) Prompt Templates

### 5.1 System (analysis)
> You are an advertising analyst. Use only provided tools to gather facts. Prioritize low‑CPC, high‑intent opportunities. Consider brand safety and developer relevance. Return both a Markdown brief and a JSON plan that passes the schema. Never fabricate metrics; call tools for data.

### 5.2 User (per run)
```
Brand: {{brand}}
Competitors: {{competitors|join(', ')}}
Geos: {{geos|join(', ')}}
Verticals: {{verticals|join(', ')}}
Constraints: {{json(constraints)}}
Channels: {{channels|join(', ')}}

Tasks:
1) Identify 10–25 keyword opportunities with estimated volume/CPC (from KE) and fit to brand.
2) Propose 3–6 campaigns with adgroups, keywords, negatives, initial CPC/bids.
3) Include brief ad copy variants aligned to dev audience.
4) Output: Markdown brief + JSON plan adhering to the schema.
```

### 5.3 Creative (copy)
> Generate 5 headline/description pairs for Google Ads targeting developers evaluating {{product}}. Keep it technical, avoid hype, ≤30 char headlines, ≤90 char descriptions.

---

## 6) Guardrails

- **Data integrity:** If any metric is missing, label as “Unknown” and include follow‑up tool calls.  
- **Brand safety:** Auto‑exclude adult/piracy terms; enforce negative keyword lists.  
- **Compliance:** Respect API TOS; no scraping disallowed endpoints.  
- **Cost controls:** Enforce `LLM_COST_BUDGET_USD` and `daily_budget_cap`.  
- **Explainability:** Cite data sources (KE, warehouse KPI, WebIntel page).

---

## 7) Evaluation

- **Schema validation:** Plan JSON must validate against `schemas/campaign_plan.schema.json`.  
- **Completeness:** ≥3 campaigns, each with ≥1 adgroup and ≥2 ad variants.  
- **Budget sanity:** campaign budgets within caps.  
- **A/B readiness:** ad variants present; negatives defined.

---

## 8) Integration Points

- **Tickets:** Create GitHub/Linear issues with plan + brief.  
- **Optimizer:** Use approved plan to spin up campaigns or feed budget caps.  
- **Dashboard:** “Analyst Recommendations” page reading `proposed_campaigns` with approve/reject.

---

## 9) Minimal API Endpoints

- `POST /analyst/run` → `{ brand, competitors, geos, verticals, constraints, channels, mode: 'analysis'|'creative' }`  
- `GET /analyst/plans?brand=...`  
- `POST /analyst/plans/:id/approve`  
- `POST /analyst/plans/:id/reject`

---

## 10) Dev Notes

- Add per‑provider keys (OpenAI/Anthropic/Vertex/etc.) via platform secrets.  
- Log tokens & cost per run; store to `analyst_runs` table.  
- Cache KE results for 24h.  
- If X Ads data is limited, bias toward Google/Reddit opportunities.

---
