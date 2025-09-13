# AGENTS.md — Autonomous & Assisted Agents for Synter

This document defines the **agents** (autonomous jobs and assistant tools) that run the cross-channel ads platform and the **Auth** layer (signup/login) so humans can safely operate it. It’s designed for an AI coding agent (e.g., Ampcode.com) to implement directly.

---

## 0) Overview

- **Goal:** Run a warehouse-centric, cross-platform ads & attribution system for Google Ads, Reddit Ads, and X/Twitter Ads, with PostHog events and BigQuery/SingleStore as data backends.
- **You already have:** Google Ads integration, PostHog, BigQuery.
- **This doc adds:** Agent specs (capabilities, triggers, prompts, error handling, APIs) **and** a production-ready **Auth** layer (signup/login, sessions, roles).

---

## 1) Agent Taxonomy

| Agent | Type | Trigger | Core Responsibilities | Inputs | Outputs |
|---|---|---|---|---|---|
| **Ingestor-Google** | ETL | Cron (2h) / Manual | Pull daily metrics (impressions, clicks, spend, conv), normalize to `ad_metrics` | OAuth creds, date range | Upserts into `ad_metrics` |
| **Ingestor-Reddit** | ETL | Cron (2h) / Manual | Pull Reddit Ads metrics (mockable), normalize | OAuth creds, date range | Upserts into `ad_metrics` |
| **Ingestor-X** | ETL | Cron (2h) / Manual | Pull X/Twitter Ads metrics (mockable), normalize | OAuth creds, date range | Upserts into `ad_metrics` |
| **Touchpoint-Extractor** | Transform | Cron (10m) | Derive click/landing touchpoints from `events` (PostHog) → `touchpoints` | `events` | Inserts `touchpoints` rows |
| **Conversion-Uploader** | Activation | Nightly | Send server-side conversions back to platforms (GCLID/WBRAID/GBRAID; Reddit CAPI; X CAPI) | `conversions`, mapping | Provider API responses |
| **Budget-Optimizer** | Decision | Nightly | Compute CAC/ROAS by campaign; scale budgets ±10–20% with guardrails | `ad_metrics`, `fact_attribution_*` | Budget/bid adjustments via provider APIs |
| **Keywords-Hydrator (optional)** | Research | Weekly | Pull KE metrics for seed keywords; store `keywords_external` | KE API key, keyword list | Upserts `keywords_external` |
| **Alerting-Sentry** | SRE | 5m | Monitor failed jobs, schema drift, API quota; send Slack/Email alerts | Job logs, health checks | Notifications |

**All agents** must support:
- `DRY_RUN=true` (compute only, no writes to external APIs)
- `MOCK_{PROVIDER}=true` (generate synthetic rows)
- Idempotency (upsert on unique keys)
- Retry with exponential backoff

---

## 2) Common Agent Contract

### 2.1 Configuration (Environment)
```
LOG_LEVEL=info
DRY_RUN=false

# Queues
REDIS_URL=redis://redis:6379

# Storage
# PostgreSQL for auth/transactional data
POSTGRES_URL=postgresql://synter_user:synter_pass@postgres:5432/synter

# BigQuery for analytics data  
BIGQUERY_PROJECT_ID=your-gcp-project-id
BIGQUERY_DATASET=synter_analytics
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Providers (placeholders)
GOOGLE_ADS_*=...
REDDIT_*=...
TWITTER_*=...
```

### 2.2 Job Envelope (TypeScript interface)
```ts
export type AgentJobInput = {
  job_id: string;
  run_id: string;     // unique per execution
  params?: Record<string, any>;
  window?: { start?: string; end?: string }; // YYYY-MM-DD
  dryRun?: boolean;
};

export type AgentResult = {
  job_id: string;
  run_id: string;
  ok: boolean;
  metrics: Record<string, number>;
  records_written?: number;
  notes?: string[];
};
```

### 2.3 Error & Retry Policy
- **Transient** errors (5xx, rate limit, network): retry with exponential backoff (1m, 4m, 10m) up to 5 attempts.
- **Auth errors (4xx)**: mark job **FAILED-AUTH**; notify **Alerting-Sentry**.
- **Schema errors**: mark **FAILED-SCHEMA**; open ticket & notify.

---

## 3) Agent Specs

### 3.1 Ingestor-Google
- **Prompt (for AI agent):**
  > Implement GAQL reporting for daily stats by campaign/adgroup/ad. Normalize to `ad_metrics(platform='google')`. Use `uniq_row` constraint on (platform,date,account_id,campaign_id,adgroup_id,ad_id). Convert costMicros→USD.
- **Inputs:** `{ window: {start,end} }` else default to yesterday.
- **Success Metrics:** rows upserted, API latency, costMicros aggregated vs prior run.

### 3.2 Ingestor-Reddit
- **Prompt:**
  > Call Reddit Ads Reporting API (or mock). Map metrics to `ad_metrics(platform='reddit')`. Respect pagination & rate limits. Include `raw` JSON.
- **Feature Flag:** `MOCK_REDDIT=true` → generate deterministic synthetic rows.

### 3.3 Ingestor-X
- **Prompt:**
  > Call X Ads Analytics endpoints (or mock). Normalize to `ad_metrics(platform='x')`. Handle limited access tiers gracefully.
- **Feature Flag:** `MOCK_TWITTER=true`.

### 3.4 Touchpoint-Extractor
- **Prompt:**
  > From `events`, select recent rows with `gclid|gbraid|wbraid|rdt_cid|twclid|utm_*`. Derive platform, write to `touchpoints`. De-dupe by (user_id, ts, platform, campaign?).
- **Notes:** set platform order: `gclid→google`, `rdt_cid→reddit`, `twclid→x`, else `other`.

### 3.5 Conversion-Uploader
- **Prompt:**
  > For new `conversions` since last watermark, push to provider APIs using available identifiers (click IDs preferred). Support `DRY_RUN`. Write provider response summaries to logs.
- **Mapping:** conversion name per platform configurable in DB/ENV.

### 3.6 Budget-Optimizer
- **Prompt:**
  > Compute trailing 14-day CAC & ROAS by campaign. If `CAC < target` & `conversions≥N` → +15% budget; if `CAC > threshold` & `conversions≥N` → −20%/pause. Respect min/max budget caps. `DRY_RUN` logs JSON patch; else call provider upload endpoints.
- **Config sources:** per-campaign targets & caps from table `campaign_policies`.

### 3.7 Keywords-Hydrator (optional)
- **Prompt:**
  > Batch KE API calls (≤100 keywords per request). Upsert `keywords_external` with (`source='ke'`, `keyword`, `monthly_volume`, `est_cpc`, `competition`, `pulled_at`).

### 3.8 Alerting-Sentry
- **Prompt:**
  > Poll job status & error queues. On `FAILED-*` or >3 retries, send Slack/email with run_id, last error, suggested fix.

---

## 4) Agent Orchestration

### 4.1 Schedules
- Ingestors (Google/Reddit/X): **every 2 hours**
- Touchpoint-Extractor: **every 10 minutes**
- Conversion-Uploader: **daily at 02:00**
- Budget-Optimizer: **daily at 03:00**
- Keywords-Hydrator: **weekly Monday 04:00**
- Alerting-Sentry: **every 5 minutes**

### 4.2 Manual Triggers (API)
- `POST /agents/run` body:
```json
{ "agent": "ingestor-google", "window": { "start":"2025-09-01", "end":"2025-09-10" }, "dryRun": true }
```

### 4.3 Health & Watermarks
- Each agent writes `agent_runs(agent, run_id, started_at, finished_at, ok, stats JSON, watermark)`.

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS agent_runs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  agent VARCHAR(64) NOT NULL,
  run_id VARCHAR(64) NOT NULL,
  started_at DATETIME(6) NOT NULL,
  finished_at DATETIME(6) NULL,
  ok BOOLEAN,
  stats JSON,
  watermark VARCHAR(64),
  UNIQUE KEY uniq_run (agent, run_id)
);
```

---

## 5) Auth: Signup & Login (Users, Sessions, Roles)

### 5.1 Requirements
- Support **Email+Password**, **Magic Link (passwordless)**, and **Google OAuth**.
- **Session security:** HttpOnly secure cookies with short-lived session; refresh via rotating token.
- **JWT (server-issued)** for API calls by dashboard and CLI.
- **RBAC:** Roles `admin`, `analyst`, `viewer`. Admin can run agents and configure policies.

### 5.2 Schema (PostgreSQL for auth data; BigQuery for analytics data)
```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) UNIQUE NOT NULL,
  password_hash VARCHAR(255),         -- null if passwordless only
  name VARCHAR(128),
  role ENUM('admin','analyst','viewer') DEFAULT 'viewer',
  created_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  updated_at DATETIME(6) NOT NULL DEFAULT NOW(6) ON UPDATE NOW(6),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  session_token CHAR(64) NOT NULL,    -- random, stored hashed if desired
  created_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  expires_at DATETIME(6) NOT NULL,
  user_agent VARCHAR(255),
  ip VARCHAR(64),
  UNIQUE KEY uniq_token (session_token),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS magic_links (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token CHAR(64) NOT NULL,            -- single-use, expires quickly
  created_at DATETIME(6) NOT NULL DEFAULT NOW(6),
  expires_at DATETIME(6) NOT NULL,
  used_at DATETIME(6),
  UNIQUE KEY uniq_magic (token),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  provider VARCHAR(32) NOT NULL,      -- 'google'
  provider_user_id VARCHAR(128) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME,
  UNIQUE KEY uniq_provider (provider, provider_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 5.3 Password Policy
- Store `password_hash` with **Argon2id** (preferred) or **bcrypt** (12+ rounds).
- Enforce minimum 12 chars; reject breached passwords (k-Anon Pwned Passwords check if available).

### 5.4 Routes (API)

#### Signup / Login
- `POST /auth/signup` → `{ email, password?, name }`  
  - Creates user; if no password, send magic link.
- `POST /auth/login` → `{ email, password }`  
  - Verifies, issues **session cookie** (`Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax`).
- `POST /auth/logout` → clears cookie, revokes session.

#### Magic Link
- `POST /auth/magic-link` → `{ email }`  
  - Creates user if not exist (role=viewer), inserts token, emails URL: `https://app/auth/magic?token=...`
- `GET /auth/magic` → consumes token (single use), sets session cookie.

#### Google OAuth
- `GET /auth/google` → redirect to Google OAuth.
- `GET /auth/google/callback` → exchange code; link or create user; set session cookie.

#### Session & Me
- `GET /auth/me` → returns `{ id, email, name, role }` if authenticated.
- `POST /auth/rotate` → rotates session token (extend session).

### 5.5 Email Templates
- **Magic Link:** “Sign in to Unified Ads — Click to continue” with 10-minute expiry.
- **Welcome:** role + quickstart links.
- **Security:** new device login notification.

### 5.6 Auth Middleware (RBAC)
- `requireAuth()` → 401 if no valid session.
- `requireRole(['admin','analyst'])` on agent triggers & config routes.
- Default dashboard routes permit `viewer` with read-only access.

---

## 6) Human UI & Agent Controls

### 6.1 Dashboard Pages
- **Login/Signup**: email+password, magic link, Google SSO.
- **Overview**: KPIs (Spend, Clicks, Conversions, CAC, ROAS) by platform.
- **Attribution**: table from `fact_attribution_last_touch`.
- **Agents**:
  - Status list (`agent_runs`)
  - Manual run form (agent + date range + DRY_RUN)
  - Logs view (link to job output)
- **Settings**:
  - Provider credentials (encrypted at rest)
  - Campaign policies (targets, caps)
  - User management (role assignment; admin only)

### 6.2 Public API (for CLI/Automation)
- `GET /agents/list`
- `POST /agents/run`
- `GET /agents/runs?agent=...`
- `GET /reports/kpis?start=...&end=...`
- `GET /reports/attribution?start=...&end=...`

All **require** session cookie or Bearer JWT issued at login.

---

## 7) Security & Compliance

- **Cookies:** HttpOnly, Secure, SameSite=Lax; domain‐scoped to app.
- **CSRF:** For state-changing endpoints when using cookies from browser: CSRF token (double submit) or SameSite=strict + header check.
- **CORS:** Lock to your app origin(s).
- **PII Minimization:** Store only necessary fields; hash any PII sent to Google Enhanced Conversions.
- **Secrets Management:** ENV via platform secrets; in DB, encrypt provider tokens (AES-GCM).
- **Audit Logs:** Record admin actions (user role changes, policy edits, manual agent runs).

---

## 8) Seed Data & Demo Flows

### 8.1 Seed Script
- Admin user: `admin@example.com` / generated password (printed to logs)
- Two viewer users
- Campaign policies for examples (targets, caps)
- A handful of `events` and `conversions` across dates

### 8.2 Demo Scenario
1. **Signup** via magic link.  
2. **Connect** Reddit & X in Settings (or enable MOCK).  
3. **Run** `Ingestor-Google` (manual) for last 7 days.  
4. **Check** KPIs dashboard.  
5. **Run** Budget-Optimizer (DRY_RUN) and view proposed changes.

---

## 9) Example Prompts (for Ampcode.com)

- *“Create the auth tables and routes as specified in AGENTS.md §5 with Argon2id hashing, session cookies, magic links, and Google OAuth. Add RBAC middleware.”*
- *“Implement the agent_runs table and a /agents/run endpoint that enqueues a BullMQ job with payload `{agent, window, dryRun}`.”*
- *“Implement Ingestor-Reddit and Ingestor-X with MOCK flags and normalize into ad_metrics.”*
- *“Add a Dashboard page for Agents showing status from agent_runs and a form to manually trigger agents.”*
- *“Wire CSRF protection on POST/PUT/DELETE routes when called from browser; allow Bearer JWT for programmatic calls.”*

---

## 10) Acceptance Criteria (MVP)

- Users can **sign up** (password or magic link) and **log in**; Google SSO works.
- RBAC enforced: only **admin/analyst** can trigger agents or edit policies.
- All ingest agents run on schedule and on demand (mock OK).
- `ad_metrics`, `touchpoints`, `conversions`, and `fact_attribution_last_touch` populated.
- Conversion-Uploader logs outbound payloads (**DRY_RUN**).
- Budget-Optimizer produces JSON proposals (**DRY_RUN**).
- Dashboard shows KPIs; Agents page shows recent runs with statuses.

---

## 11) Nice-to-Have (Post-MVP)

- Passwordless-only tenants.
- Webhooks for job completion events.
- Time-decay & position-based attribution models (dbt).
- Slack OAuth and channel alerts.
- SSO via SAML/OIDC for enterprise.

---
