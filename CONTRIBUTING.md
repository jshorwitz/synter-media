# CONTRIBUTING.md — Synter

Thanks for contributing! This guide explains local setup, coding standards, branching, testing, and how to run agents in dev vs. prod.

---

## 1) Prereqs

- Node.js 20+, pnpm 9+
- Docker & docker-compose
- Python 3.10+ (optional for data tests)
- Make (optional convenience)
- Access to required API creds (see `.env.example`)

---

## 2) Repo Setup

```bash
git clone https://github.com/your-org/unified-ads.git
cd unified-ads
pnpm install
cp .env.example .env
```

> Fill in PostHog, Google Ads, Reddit Ads, X Ads, and DB creds. For first-time dev, you can enable mocks:
>
> ```env
> MOCK_REDDIT=true
> MOCK_TWITTER=true
> DRY_RUN=true
> ```

Start services and migrate DB:
```bash
docker-compose up -d --build
make migrate
```

Run dev processes:
```bash
make dev    # runs API + Workers in watch mode
```

Open dashboard: http://localhost:8080

---

## 3) Project Structure

- `packages/api` — REST API, auth, RBAC, reporting routes
- `packages/workers` — schedulers & agents (ETL, optimizer, uploader)
- `packages/web` — minimal dashboard (optional)
- `migrations` — SQL DDL and views
- `dbt/` — optional modeling
- `AGENTS.md`, `SETUP.md`, `README.md` — docs

---

## 4) Branching & Commits

- **Default branch:** `main`
- **Feature branches:** `feat/<short-title>`
- **Bugfix:** `fix/<short-title>`
- **Chores/infra:** `chore/<short-title>`

**Commit convention (Conventional Commits):**
```
feat(api): add /reports/attribution endpoint
fix(worker): backoff on reddit 429
chore(ci): cache pnpm store
docs: update AGENTS.md
```

Open a PR to `main`. Squash merge by default.

---

## 5) Coding Standards

- **Language:** TypeScript
- **Style:** eslint + prettier (run on commit)
- **API:** explicit zod validation for request bodies/query
- **Errors:** never throw raw; use typed errors + `errors.ts`
- **Logging:** structured logs (pino/winston), no secrets
- **Security:** paramized queries, no string concat; sanitize outputs

Run linters & tests:
```bash
pnpm -C packages/api test
pnpm -C packages/workers test
pnpm -C packages/api lint && pnpm -C packages/workers lint
```

---

## 6) Env & Secrets

- Copy `.env.example` → `.env`
- Do **not** commit `.env` or secrets
- Provider tokens stored encrypted at rest (AES-GCM) when persisted
- Use `DRY_RUN=true` in development to avoid hitting ad APIs

---

## 7) Database & Migrations

Apply migrations:
```bash
make migrate
```

Create a new migration:
```bash
pnpm db:migrate:new --name add_campaign_policies
# add SQL file to migrations/ and re-run make migrate
```

Seed demo data (optional):
```bash
pnpm seed:demo
```

---

## 8) Running Agents

### Local (Dev)
- Use mocks to generate deterministic data:
  ```env
  MOCK_REDDIT=true
  MOCK_TWITTER=true
  DRY_RUN=true
  ```
- Start workers:
  ```bash
  pnpm -C packages/workers dev
  ```
- Manually trigger:
  ```bash
  curl -X POST http://localhost:8080/agents/run     -H 'Content-Type: application/json'     --data '{ "agent": "ingestor-google", "window": {"start":"2025-09-01","end":"2025-09-10"}, "dryRun": true }'
  ```

### Production
- Disable mocks; set real creds.
- Use cron (Cloud Scheduler) or a queue (BullMQ) to schedule per AGENTS.md.
- Enable alerting (Slack/email) via `Alerting-Sentry` agent.

---

## 9) Testing Strategy

- **Unit:** providers with `MOCK_*` and fixtures
- **Integration:** end-to-end job runs against local DB
- **API tests:** supertest for routes; auth flows; RBAC
- **Data tests:** dbt tests for not-null/unique keys (if using dbt)
- **Golden tests:** seed → run agent → compare `ad_metrics` snapshot

Run all:
```bash
pnpm test:all
```

---

## 10) CI/CD

- CI checks: install, lint, typecheck, unit+integration tests
- Build Docker images per package
- Tag images as `:branch-sha`
- Deploy via GitHub Actions → Cloud Run/ECS
- Run migrations on deploy; rollback on failure

---

## 11) Code Generation & Ampcode

You can use Ampcode or similar to scaffold providers/agents. Example prompt:
> “Implement Ingestor-Reddit per AGENTS.md §3.2 with pagination, rate limits, and upsert into `ad_metrics`. Respect `MOCK_REDDIT` and `DRY_RUN`.”

Keep generated code in PRs and review for secrets/logging.

---

## 12) Issue Labels

- `area/api`, `area/workers`, `area/web`, `area/db`
- `type/bug`, `type/feat`, `type/chore`, `type/docs`
- `priority/p0..p3`

---

## 13) Support & Contact

- Open issues with repro steps and logs (redact secrets).
- For access requests (API keys, OAuth apps), contact project admins.

---
