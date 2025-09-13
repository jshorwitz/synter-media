# Title

feat(ppc): wire frontend to backend; add interactive D3 dashboards for PPC

# Summary
- Wired PPC Manager frontend to backend via Next.js API proxies with Basic Auth.
- Replaced mock data with live endpoints for Recommendations and Audit.
- Added D3 visualizations (bar/treemap for recommendations; time-series/pie for audit).
- Added Sync and Generate actions on dashboard.
- Documented env vars for PPC backend URL and basic auth.

# Changes
- API proxy routes under `apps/web/src/app/api/ppc/**`
- UI wiring in `apps/web/src/app/(dashboard)/ppc/**`
- D3 chart components in `apps/web/src/components/charts/**`
- `.env.example` entries for backend URL/creds

# Screenshots
- Recommendations insights (bar + treemap)
- Audit summary (time-series + pie)

# How to test
1. Start PPC backend (`apps/ppc-backend`) and set APP_BASIC_AUTH_*.
2. In web app, set `PPC_BACKEND_URL`, `PPC_BACKEND_BASIC_USER`, `PPC_BACKEND_BASIC_PASS` in `.env`.
3. Run `npm run dev` (apps/web). Navigate to `/ppc`, `/ppc/recommendations`, `/ppc/audit`.
4. Click Sync, Generate, Refresh; run Dry Run on selected recommendations.

# Acceptance criteria
- [ ] Recommendations list loads from backend and supports Refresh/Dismiss.
- [ ] Bulk Dry Run hits backend and updates statuses.
- [ ] Audit logs and summary load; charts render with data.
- [ ] Dashboard actions call backend successfully.

# Notes
- D3 is loaded via CDN to avoid new NPM deps.
- Next build passes; lint has pre-existing warnings unrelated to this feature.
