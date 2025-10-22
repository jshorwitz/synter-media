# Synter Media Setup and Quickstart

This guide helps you run Synter Media - AI Advertising Agency locally. Complete setup includes the marketing homepage, dashboard, API, and background workers for cross-platform ads management.

## 1) Prerequisites

- Node.js 18+
- pnpm 8+
- Redis endpoint (Railway OK) — URL like `redis://` or `rediss://`
- MySQL-compatible DB (local SingleStore or hosted)

## 2) Configure environment

1. Copy the example env file and edit values:

```bash
cp .env.example .env
```

2. Set required variables in `.env`:
- Redis (from Railway):
  - `REDIS_URL=rediss://<user>:<pass>@<host>:<port>`
- Database (choose one):
  - Local SingleStore/MySQL: keep defaults (`DB_HOST=127.0.0.1`, `DB_USER=root`, etc.)
  - Hosted DB: set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Mocks (recommended for first run):
  - `MOCK_REDDIT=true`
  - `MOCK_TWITTER=true`

## 3) Install deps

```bash
pnpm install
```

## 4) Migrate and seed the database

This creates tables and inserts demo users, events, conversions, and policies.

```bash
pnpm migrate
pnpm seed
```

Keep the printed admin password for login.

## 5) Launch the Complete Application

### Quick Start (Recommended)
```bash
./launch.sh
```

This will:
1. Check your environment configuration
2. Build all services  
3. Start the complete application with homepage, dashboard, and workers

### Manual Start (Alternative)
```bash
./start-dashboard.sh
```

### Access Points

Once started, you can access:

- **🏠 Synter Homepage:** http://localhost:8000
- **📊 Dashboard:** http://localhost:8000/dashboard  
- **🔐 Login/Signup:** http://localhost:8000 (click buttons)
- **📈 Traffic Analytics:** http://localhost:3000
- **🔧 API Health:** http://localhost:8000/health
- **📋 API Documentation:** http://localhost:8000/docs

### Test Account Configuration
The system is configured for **sourcegraph.com** as the test account across:
- Google Ads campaigns
- Reddit Ads
- X (Twitter) Ads  
- Google Search Console

## 6) Authenticate and enqueue agent runs

Login and capture the session cookie, then trigger mock agents. Replace `<admin-pass>` with the password printed by the seed step.

```bash
# Login, store cookie
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<admin-pass>"}' \
  http://localhost:8088/auth/login

# Enqueue mock runs
curl -b cookies.txt -H "Content-Type: application/json" \
  -d '{"agent":"ingestor-google"}' \
  http://localhost:8088/agents/run

curl -b cookies.txt -H "Content-Type: application/json" \
  -d '{"agent":"ingestor-reddit","dryRun":true}' \
  http://localhost:8088/agents/run

curl -b cookies.txt -H "Content-Type: application/json" \
  -d '{"agent":"ingestor-x","dryRun":true}' \
  http://localhost:8088/agents/run
```

## 7) Verify runs and reports

```bash
# Recent runs
curl -b cookies.txt "http://localhost:8088/agents/runs?limit=20"

# KPIs (adjust dates)
curl -b cookies.txt "http://localhost:8088/reports/kpis?start=2025-09-01&end=2025-09-30"

# Attribution
curl -b cookies.txt "http://localhost:8088/reports/attribution?start=2025-09-01&end=2025-09-30"
```

If KPIs return rows, your data flow is working: seed → ingestors → ad_metrics → reports.

## Troubleshooting

- "forbidden"/"unauthenticated": ensure you logged in and are sending the cookie.
- Empty KPIs: set `MOCK_REDDIT=true` and `MOCK_TWITTER=true`, re-run ingestors; confirm DB credentials.
- Redis not receiving jobs: verify `REDIS_URL` is identical in both API and workers.
- Migrations/seed issues: verify DB connectivity and permissions; re-run `pnpm migrate` then `pnpm seed`.
