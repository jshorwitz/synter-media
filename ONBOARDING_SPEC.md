# ONBOARDING_SPEC.md — One‑Field Onboarding & Instant Ad Insights

**Goal:** Build a frictionless onboarding where the user enters only their **website URL**, then within ~60s we:
1) discover their **ads, keywords, competitors**,
2) estimate or read **KPIs** (impressions, clicks, CTR, CPC, CAC),
3) produce an **LLM‑generated optimization brief** with **persona‑specific** recommendations,
4) prompt to **connect ad accounts** for deeper data & activation.

This spec is written for an AI coding agent to implement end‑to‑end.

(See sections 0–13 for assumptions, API surface, DB schema, worker pipeline, prompts, env, and acceptance criteria.)