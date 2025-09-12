# Onboarding Stubs

This bundle contains API and Worker stubs for the one-field onboarding flow:

- API routes: `packages/api/src/routes/onboarding/index.ts`
  - `POST /onboarding/scan`
  - `GET /onboarding/status`
  - `GET /onboarding/result`

- Workers: `packages/workers/src/onboarding/*`
  - Sequential processing loop with steps:
    - `stepDiscover` (mock ad discovery)
    - `stepKeywords` (mock KE results)
    - `stepKpiEstimate` (heuristic KPIs)
    - `stepLlm` (placeholder markdown/personas/plan)

- Migration: `migrations/003_onboarding.sql`

Integrate by copying these into your repo, running migrations, and starting workers. Ensure `scan_runs` is polled by the worker (this stub loops forever). Set `MOCK_DISCOVERY=true` for demo behavior.
