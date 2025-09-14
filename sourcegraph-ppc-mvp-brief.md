# Sourcegraph PPC Manager — MVP Build Brief for **Amp** (Coding Agent)

**Doc owner:** You  
**Target repo name:** `sourcegraph-ppc-manager`  
**Goal:** Ship an MVP that **reads**, **analyzes**, and **manages** Google Ads campaigns for **Sourcegraph.com**, with safe, auditable write actions (negative keywords, pausing keywords, and budget adjustments).  
**Status:** Implementation-ready (v1.0)  
**Last updated:** 2025-09-13

---

## 0) TL;DR for Amp

Build a small service + thin UI that:
1) **Connects to Google Ads API** (OAuth2 + developer token).  
2) **Ingests** campaigns/ad groups/keywords/search terms + core metrics (last 90 days).  
3) **Scores ICP relevance** for Sourcegraph’s audience (v0 rules in this doc).  
4) **Surfaces recommendations** (negative keywords, pauses, budget shifts) with impact estimates.  
5) **Applies changes** to Google Ads with *validate-only* dry‑runs and an audit log.  
6) **Protects** via role-based approvals and policy gates.

**Tech choices (opinionated & minimal):**
- **Backend:** Python 3.11 + FastAPI + official `google-ads` client.  
- **Store:** PostgreSQL (or SQLite for local dev).  
- **UI:** Next.js (app router) or a minimal FastAPI Jinja UI (MVP acceptable).  
- **Auth to app:** Basic auth (MVP) → upgrade to OIDC later.  
- **Packaging:** Docker + docker-compose for local dev.

---

## 1) Sourcegraph Context (for ICP & keywords)

**ICP (v0, B2B developer tooling):**
- **Companies:** Mid‑market & enterprise (200+ FTE), tech, finance, SaaS, ISVs.  
- **Personas:** VP Eng, Director Eng, Principal/Staff Engineers, DevX/Platform, SecEng/AppSec, DevOps/SRE.  
- **Geos (v0):** US, UK, DACH, AU/NZ, Nordics.  
- **Signals (positive):** Code search, code intelligence, AI coding assistant for enterprises, code navigation, semantic code search, code discovery across monorepos, IDE & CI/CD integration.  
- **Signals (negative):** Student queries, homework, generic tutorials, “cracked”, “torrent”, “free unlimited”, career/job hunting.

**Brand vs. Non‑Brand:**
- *Brand:* `sourcegraph`, `sourcegraph enterprise`, `sourcegraph ai`, `sourcegraph code search`.  
- *Non‑Brand examples:* `semantic code search`, `enterprise code search`, `codebase search tool`, `ai code assistant for enterprise`, `code indexing`, `repo search`, `code navigation`, `code discovery tool`.

**Primary conversions (map in UI):**
- *Demo Request*, *Talk to Sales*, *Start trial/signup*, *(optional)* offline: **MQL → SQL → Opp → Won** via CRM upload.

---

## 2) System Architecture (MVP)

```
[Google Ads API]
      ^        \
      | OAuth2 \ GAQL (read) + Mutate (write)
      |         \
+-----------------------------+
|  FastAPI service (Python)   |
|  - /auth/google_ads         |
|  - /sync/* (GAQL loaders)   |
|  - /score/icp               |
|  - /recommendations         |
|  - /apply/* (mutations)     |
|  - /audit/*                 |
+-----------------------------+
            |
         SQL Store (Postgres/SQLite)
            |
         Thin UI (Next.js or Jinja)
```

**Key principles:** safe-by-default (`validate_only` on writes), explicit approvals, every change auditable.

---

## 3) Milestones & Deliverables

### M0 — Repo bootstrap (Day 0–1)
- Create repo `sourcegraph-ppc-manager` with:
```
/backend
  /ads (client + GAQL queries + writers)
  /models (ORM)
  /routers (FastAPI endpoints)
  /services (scoring, recommend, budgets)
  /tests
  main.py
/frontend (optional Next.js for MVP UI)
/ops (Dockerfile, docker-compose.yml, Makefile)
README.md
.env.example
```
- Add pre-commit (black, isort, flake8, mypy).

### M1 — Google Ads read-only sync (Day 1–3)
- OAuth2 + developer token wiring. Store refresh token securely.
- Implement GAQL pull for last 90 days into tables:
  - `campaigns`, `ad_groups`, `keywords`, `search_terms`, `daily_metrics`.
- Nightly full + 4‑hour incremental jobs.

### M2 — ICP scoring (Day 3–5)
- Rule-based scoring (0–100) using lexicons below.
- Persist `icp_score`, `rationale`, `confidence` for both **keywords** and **search_terms**.

### M3 — Recommendations (Day 5–7)
- **Negative keywords**: low-fit (&lt;40), spend &gt; $300 in last 7 days, 0 convs.  
- **Pauses**: keyword with spend &gt; $500, conv rate &lt; account 25th percentile, icp &lt; 50.  
- **Budget shift**: reallocate from low-fit to high-fit (≥80) within same campaign type.

### M4 — Apply + Audit (Day 7–9)
- Endpoints to **apply**: add negative keyword, pause keyword, adjust budget.  
- `validate_only=true` by default; approval flag required to execute.  
- Full audit log (who/what/when/before/after/API response).

### M5 — Thin UI (Day 9–10)
- Pages: **Today**, **Search Terms**, **Recommendations**, **Audit**.  
- Buttons: “Dry‑run”, “Apply”, “Schedule”.

---

## 4) Configuration & Secrets

Create `.env` from `.env.example`:
```
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_ID= # MCC if applicable, digits only
GOOGLE_ADS_CUSTOMER_ID=       # The account to manage, digits only
APP_BASIC_AUTH_USER=admin
APP_BASIC_AUTH_PASS=change-me
DATABASE_URL=sqlite:///./ppc.db  # or postgres://...
DEFAULT_CURRENCY=USD
```
> Use digits only for IDs (strip dashes). Never commit real tokens. Prefer Postgres in team use.

---

## 5) Data Model (ORM sketch)

```python
# models.py (SQLAlchemy)
class Campaign(Base):
    id: str; name: str; status: str; daily_budget_micros: int

class AdGroup(Base):
    id: str; campaign_id: str; name: str; status: str

class Keyword(Base):
    id: str; ad_group_id: str; text: str; match_type: str; status: str
    cpc_bid_micros: int | None
    icp_score: int | None; icp_rationale: str | None; icp_confidence: float | None

class SearchTerm(Base):
    id: str; ad_group_id: str; text: str
    matched_keyword_text: str | None
    last_seen: date
    icp_score: int | None; icp_rationale: str | None; icp_confidence: float | None

class DailyMetric(Base):
    date: date; level: str  # campaign/ad_group/keyword/term
    ref_id: str
    impressions: int; clicks: int; cost_micros: int
    conversions: float; conv_value: float

class Recommendation(Base):
    id: str; type: str  # negative_keyword | pause_keyword | budget_shift
    target_level: str; target_id: str
    details_json: str; projected_impact: float; risk: float
    status: str  # proposed|dry_run_ok|applied|dismissed

class AuditLog(Base):
    id: str; action: str; payload_json: str
    user: str; ts: datetime; result: str; google_change_id: str | None
```

---

## 6) GAQL Queries (copy/paste ready)

**Keywords (last 90 days aggregated):**
```sql
SELECT
  customer.id,
  campaign.id, campaign.name, campaign.status,
  ad_group.id, ad_group.name, ad_group.status,
  ad_group_criterion.criterion_id,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group_criterion.status,
  metrics.impressions, metrics.clicks, metrics.cost_micros,
  metrics.conversions, metrics.conversions_value
FROM keyword_view
WHERE segments.date DURING LAST_90_DAYS
```

**Search terms (queries):**
```sql
SELECT
  search_term_view.search_term,
  ad_group.id, ad_group.name,
  ad_group_criterion.keyword.text,
  metrics.impressions, metrics.clicks, metrics.cost_micros,
  metrics.conversions, metrics.conversions_value
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
```

**Campaign budgets & pacing:**
```sql
SELECT
  campaign.id, campaign.name, campaign.status,
  campaign_budget.amount_micros, campaign_budget.status,
  segments.date, metrics.cost_micros
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
```

---

## 7) ICP Relevance Scoring (v0 rules)

**Include lexicon (boost):**
```
"semantic code search", "enterprise code search", "codebase search",
"code discovery", "code navigation", "code intelligence", "ai code assistant",
"repo search", "monorepo search", "code indexing", "search in code",
"large codebase", "semantic search code", "code understanding"
```

**Brand lexicon (always high fit):**
```
"sourcegraph", "sourcegraph enterprise", "sourcegraph ai", "sourcegraph code search"
```

**Exclude/penalize lexicon:**
```
"homework", "assignment", "tutorial", "course", "learn", "leetcode",
"job", "salary", "interview", "pdf", "definition", "free download",
"torrent", "crack", "cheat", "student"
```

**Scoring heuristic:**
- Start at **50**.  
- +40 if brand match (exact or phrase).  
- +25 if include phrase present (stemmed, fuzzy ≤1 edit).  
- −30 if exclude phrase present.  
- −15 if query contains “free”, “open source” without “enterprise”.  
- Clamp to [0, 100].  
- Set `confidence = min(1.0, log10(clicks+10)/2)`.

**Rationale string example:**  
`"Match: 'semantic code search' (+25); Exclude: none; Brand: no"`

> v1 can add semantic embeddings (sentence-transformers) and trainable calibration. Not required for MVP.

---

## 8) Recommendation Engine (deterministic MVP)

### Types
1) **NEGATIVE_KEYWORD** (search-term based):
   - Condition: `icp_score < 40` AND `cost >= 300` last 7 days AND `conversions == 0`.
   - Action: propose **campaign-level negative** (exact) with preview of affected terms.

2) **PAUSE_KEYWORD**:
   - Condition: keyword `icp_score < 50` AND `spend >= 500` last 14 days AND `conv_rate < p25(account)`.
   - Action: pause ad group criterion.

3) **BUDGET_SHIFT** (within same campaign type):
   - Condition: high-fit segments (`icp >= 80`) limited by budget while low-fit segments overspend.
   - Action: suggest `±10–20%` reallocation; do not exceed global daily cap.

### Projection (simple):
- `projected_impact = Δspend * (target_cvr - source_cvr)`  
- `risk = 1 - min(confidence_high_fit, 0.9)`

### Policy gates
- No write if account had **< 20 conversions** in last 30 days (data scarcity).  
- Never reduce a campaign budget below **$100/day** (configurable).  
- Changes over **20%** require approval flag.

---

## 9) Write Operations (with dry-run)

Use official Python `google-ads` client; always support `validate_only=True` dry-run.

**Add negative keyword (campaign level):**
```python
from google.ads.googleads.client import GoogleAdsClient

def add_campaign_negative_keyword(client, customer_id, campaign_id, keyword_text, validate_only=True):
    service = client.get_service("CampaignCriterionService")
    op = client.get_type("CampaignCriterionOperation")
    crit = op.create
    crit.campaign = client.get_service("GoogleAdsService").campaign_path(customer_id, campaign_id)
    crit.negative = True
    crit.keyword.text = keyword_text
    crit.keyword.match_type = client.enums.KeywordMatchTypeEnum.EXACT

    try:
        with client.configure().operation_settings(validate_only=validate_only):
            resp = service.mutate_campaign_criteria(customer_id=customer_id, operations=[op])
        return {"status": "ok", "resource_names": [r.resource_name for r in resp.results]}
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

**Pause a keyword:**
```python
def pause_keyword(client, customer_id, ad_group_id, criterion_id, validate_only=True):
    service = client.get_service("AdGroupCriterionService")
    op = client.get_type("AdGroupCriterionOperation")
    crit = op.update
    crit.resource_name = service.ad_group_criterion_path(customer_id, ad_group_id, criterion_id)
    crit.status = client.enums.AdGroupCriterionStatusEnum.PAUSED
    client.copy_from(op.update_mask, client.get_type("FieldMask")(paths=["status"]))

    with client.configure().operation_settings(validate_only=validate_only):
        return service.mutate_ad_group_criteria(customer_id=customer_id, operations=[op])
```

**Adjust campaign budget (±%):**
```python
def adjust_budget(client, customer_id, campaign_budget_id, pct_delta, validate_only=True):
    service = client.get_service("CampaignBudgetService")
    op = client.get_type("CampaignBudgetOperation")
    budget = op.update
    budget.resource_name = service.campaign_budget_path(customer_id, campaign_budget_id)

    # Fetch current amount_micros beforehand; here assume passed in:
    new_amount_micros = int(budget.amount_micros * (1 + pct_delta))
    budget.amount_micros = new_amount_micros

    client.copy_from(op.update_mask, client.get_type("FieldMask")(paths=["amount_micros"]))
    with client.configure().operation_settings(validate_only=validate_only):
        return service.mutate_campaign_budgets(customer_id=customer_id, operations=[op])
```

> Always log request/response, `validate_only` flag, and any partial failures.

---

## 10) FastAPI Endpoints (spec)

```
GET  /healthz
POST /auth/google_ads/start              -> OAuth dance (local dev may use installed app flow)
GET  /sync/keywords?days=90              -> pulls keywords + metrics
GET  /sync/search_terms?days=30
POST /score/icp?level=term|keyword       -> computes & saves scores
GET  /recommendations?types=neg,pause,budget&limit=200
POST /apply/negative_keyword             -> {campaign_id, keyword_text, validate_only, reason}
POST /apply/pause_keyword                -> {ad_group_id, criterion_id, validate_only, reason}
POST /apply/adjust_budget                -> {budget_id, pct_delta, validate_only, reason}
GET  /audit?since=...
```

**Auth to app:** Basic auth header required for all but `/healthz`.

---

## 11) Thin UI (requirements)

- **Today:** KPI strip (Spend, Conversions, CPA/CPL), top *waste* terms (low ICP, high spend).  
- **Search Terms:** table with `term`, `matched_keyword`, `spend`, `clicks`, `conversions`, `icp_score`, **Add Negative** button.  
- **Recommendations:** cards with rationale, projected impact, **Dry‑run** and **Apply**.  
- **Audit:** table of changes with filters; show Google resource names/IDs.

> If skipping Next.js, render basic pages using FastAPI/Jinja + HTMX. Keep it simple.

---

## 12) Testing & Acceptance

**Unit tests:** scoring and recommendation rules deterministically reproducible.  
**Integration (sandbox):** use `validate_only=True` to dry‑run writes; assert 200 + no partial failures.  
**Data parity check:** account‑level totals for last 7 days within ±3% of Ads UI (query vs UI rounding differences).

**Definition of Done (MVP):**
- Can ingest last 90 days data for specified customer ID without errors.  
- Can compute & persist ICP scores for **keywords** and **search terms**.  
- Can list at least **3 actionable recommendations** on a typical account.  
- Can **dry‑run** and **apply**: (a) add negative keyword, (b) pause keyword, (c) adjust budget.  
- Every apply action creates an **AuditLog** entry with response IDs.  
- Policies & approvals enforced (no large, unapproved changes).

---

## 13) Runbook (local dev)

```
make dev       # builds images, starts db + backend (+ frontend if present)
make seed      # optional: seed with fake rows for UI dev
make sync      # performs GAQL pulls (requires .env)
make score     # runs ICP scoring
make recs      # computes recommendations
make dryrun    # runs all planned writes with validate_only=True
```

**Troubleshooting:**
- `AUTHENTICATION_ERROR`: check developer token status, OAuth client, refresh token, and login_customer_id.  
- `PERMISSION_DENIED`: ensure user has access to the target customer ID.  
- Empty search terms: ensure search term reporting access and time window.

---

## 14) Backlog (post-MVP)

- Semantic scoring w/ embeddings; active learning labeler.  
- GA4 conversion import status & offline/enhanced conversion upload UI.  
- Budget pacing visualizer + forecast.  
- Auto‑apply policies with thresholds and weekly change windows.  
- Multi‑account (MCC) support and templatized rules per campaign type.

---

## 15) Safety, Privacy, Governance

- All writes default to **dry‑run**; require explicit `approve=true`.  
- Role-based approvals for changes >20% budget or >$1,000 7‑day spend on a term.  
- Keep tokens in env vars / secret manager; no plaintext logs.  
- Audit logs immutable (append-only).

---

## 16) Handoff Checklist for Amp

- [ ] Repo scaffold created and pushed.  
- [ ] `.env.example` filled with placeholders.  
- [ ] OAuth flow tested and refresh token stored.  
- [ ] GAQL sync endpoints working (keywords, search terms, metrics).  
- [ ] Scoring function returns stable scores and rationales.  
- [ ] Recommendation generation returns deterministic list on fixture data.  
- [ ] Write endpoints support `validate_only` and real apply.  
- [ ] UI buttons wired to endpoints; audit log visible.  
- [ ] README with setup + common errors.

---

### Appendix A — Minimal FastAPI skeleton

```python
# backend/main.py
import os
from fastapi import FastAPI, Depends, HTTPException
from routers import sync, score, recommend, apply, audit

app = FastAPI(title="Sourcegraph PPC Manager")
app.include_router(sync.router, prefix="/sync", tags=["sync"])
app.include_router(score.router, prefix="/score", tags=["icp"])
app.include_router(recommend.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(apply.router, prefix="/apply", tags=["apply"])
app.include_router(audit.router, prefix="/audit", tags=["audit"])

@app.get("/healthz")
def healthz():
    return {"ok": True}
```

```dockerfile
# ops/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend /app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```text
# backend/requirements.txt
fastapi
uvicorn[standard]
google-ads
sqlalchemy
pydantic
python-dotenv
```

---

**End of file — ready for Amp to implement.**
