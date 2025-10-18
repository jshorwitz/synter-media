# 🚀 Synter Engineering Onboarding

**Last Updated:** October 18, 2025  
**Project:** Synter - AI-Powered Cross-Platform Ads Management  
**Repository:** https://github.com/jshorwitz/synter-clean

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [What We Completed](#what-we-completed)
3. [What's Left To Build](#whats-left-to-build)
4. [Setup Instructions](#setup-instructions)
5. [Local Development](#local-development)
6. [Priority Roadmap](#priority-roadmap)

---

## 1. PROJECT OVERVIEW

### What is Synter?

Synter is a **cross-platform advertising command center** that unifies campaign management across multiple ad networks with AI-driven optimization.

**Key Features:**
- 📊 **Unified Dashboard** - Monitor all platforms in one place
- 🤖 **AI Optimization** - Frontier models analyze campaigns 24/7
- 💰 **Credit-Based Billing** - Pay-as-you-go for AI operations
- 🔗 **Multi-Platform** - Google, Microsoft, Reddit, X, LinkedIn Ads
- 📈 **Attribution Analytics** - Cross-channel conversion tracking

### Tech Stack

```
Frontend:  Next.js 15 (App Router) + TypeScript + Tailwind
Backend:   FastAPI (Python 3.11+) + PostgreSQL + BigQuery
Auth:      Custom (Prisma sessions + Magic Links)
Payments:  Stripe (one-time credit purchases)
Email:     Loops.so (transactional emails)
AI:        OpenAI GPT-4 (considering Amp SDK)
Hosting:   Vercel (web) + Railway/Render (backend)
Database:  PostgreSQL (app data) + BigQuery (analytics)
```

### Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   apps/web      │ ──────> │  apps/ppc-backend│
│   (Next.js)     │   API   │   (FastAPI)      │
│                 │ <────── │                  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         ▼                           ▼
   ┌─────────┐              ┌───────────────┐
   │PostgreSQL│              │   BigQuery    │
   │(App Data)│              │ (Analytics)   │
   └──────────┘              └───────────────┘
```

---

## 2. WHAT WE COMPLETED ✅

### Session: October 18, 2025

#### 🔐 **Auth & Session Management**
- ✅ Fixed login/logout navigation (login→/dashboard, logout→/)
- ✅ Magic link password reset flow with dev mode fallback
- ✅ Session persistence using `synter_session` cookie
- ✅ User menu dropdown with avatar and role badge
- ✅ Admin role enforcement (joel@syntermedia.ai elevated to ADMIN)
- ✅ Both uppercase/lowercase role checking in admin pages

#### 🧭 **Navigation Restructure**
- ✅ Created real `/dashboard` page with Overview component
- ✅ Renamed `/ppc` → `/optimizations`
- ✅ Added permanent redirects for backward compatibility
- ✅ Updated sidebar: Dashboard, Campaigns, Optimizations, Conversions, Settings
- ✅ Removed duplicate "Launch Campaign" (merged into workflow)

#### 💳 **Billing Updates**
- ✅ Updated credit packages: $10, $20, $100 (with 10% bonus)
- ✅ Replaced "View All Packages" with "Contact Sales"
- ✅ Created Stripe product setup script (`npm run stripe:setup-products`)
- ✅ Credit package configuration supports $10 increments

#### 🎨 **UI/UX Improvements**
- ✅ Fixed button contrast (outline variant now visible on dark background)
- ✅ User menu design matches mockups (square avatar, role badge, menu items)
- ✅ Homepage redirects logged-in users to dashboard
- ✅ Restored beautiful D3.js dashboard with charts and metrics
- ✅ Fixed campaigns API auth to use session tokens

#### 📸 **Screenshots & Assets**
- ✅ Updated screenshot capture script for new routes
- ✅ Fresh ppc-recommendations.png screenshot
- ✅ Fixed broken image paths in waitlist
- ✅ Created single-screenshot capture utility

---

## 3. WHAT'S LEFT TO BUILD 🚧

### 🔴 **CRITICAL (Must Fix for MVP)**

#### 1. Stripe Webhook Implementation (8h - BLOCKER)
**File:** `apps/ppc-backend/app/webhooks/stripe.py`

```python
# Required functionality:
- Verify webhook signature
- Handle checkout.session.completed
- Handle invoice.payment_succeeded  
- Map payment to user/workspace
- Accrue credits to CreditLedger
- Update WorkspaceBalance atomically
- Use event.id as idempotency key
```

**Database Schema Needed:**
```sql
-- Add to Prisma schema
model WorkspaceBalance {
  workspaceId String @id
  balance     Int    @default(0)
  updatedAt   DateTime @updatedAt
}

model CreditLedger {
  id             String   @id @default(cuid())
  workspaceId    String
  delta          Int
  reason         String
  idempotencyKey String   @unique
  createdAt      DateTime @default(now())
}
```

#### 2. Credit Deduction System (6h)
**File:** `apps/ppc-backend/app/billing/credits.py`

```python
async def atomic_deduct_credits(
    workspace_id: str,
    amount: int,
    reason: str,
    idempotency_key: str
) -> bool:
    # SELECT balance FOR UPDATE
    # If balance >= amount:
    #   INSERT ledger (-amount)
    #   UPDATE balance
    #   COMMIT, return True
    # Else: ROLLBACK, return False
```

#### 3. Balance API Endpoints (2h)
```
GET  /api/billing/balance       -> current balance, lifetime
GET  /api/billing/transactions  -> ledger history
POST /api/billing/purchase      -> create Stripe checkout
```

#### 4. Campaign API Auth Fix (1h)
- ✅ DONE - All campaign routes now use `synter_session`

---

### 🟡 **HIGH PRIORITY (Needed for Beta)**

#### 5. Agent System Core (16-24h)
**Files:**
- `apps/ppc-backend/app/agents/optimizer.py`
- `apps/ppc-backend/app/jobs/runner.py`
- `apps/ppc-backend/app/jobs/models.py`

**Requirements:**
- Job queue (Postgres-backed with FOR UPDATE SKIP LOCKED)
- Retry policy with exponential backoff
- Credit enforcement before execution
- Status tracking (queued→running→done/failed)
- Logging and observability

#### 6. Google Ads Integration (12h)
**OAuth Flow:**
```
1. User clicks "Connect Google Ads"
2. Redirect to Google OAuth consent
3. Callback receives code
4. Exchange for refresh_token
5. Store in PlatformCredential table
6. Fetch accounts and campaigns
7. Sync to BigQuery
```

**Required Scopes:**
- `https://www.googleapis.com/auth/adwords`

#### 7. Platform Data Sync (8h each platform)
- Google Ads reporting API integration
- Reddit Ads API wrapper
- Microsoft Ads API wrapper  
- X Ads API wrapper
- Normalize to BigQuery schema

---

### 🟢 **NICE TO HAVE (Post-MVP)**

#### 8. UI Polish
- Empty states for campaigns/conversions
- Loading skeletons
- Error boundaries and toast notifications
- Mobile responsive fixes

#### 9. Testing Suite
- E2E auth flows (Playwright)
- Stripe webhook simulation
- Credit concurrency tests
- Platform API mocking

#### 10. Observability
- Structured logging
- Error monitoring (Sentry)
- Performance tracking
- Webhook failure alerts

---

## 4. SETUP INSTRUCTIONS

### A. GitHub Repository Setup

#### Clone Repository
```bash
git clone git@github.com:jshorwitz/synter-clean.git synter-fresh
cd synter-fresh
```

#### Branch Strategy
```
main          → Production (auto-deploys to Vercel)
develop       → Integration branch (optional)
feature/*     → Feature branches
fix/*         → Bug fixes
```

#### Conventional Commits
```
feat: add credit purchase modal
fix: correct session cookie expiry
chore: update dependencies
docs: add API documentation
```

---

### B. Vercel Deployment (Web App)

#### 1. Create New Project
- Go to https://vercel.com/new
- Import: `jshorwitz/synter-clean`
- **Root Directory:** `apps/web` ⚠️ CRITICAL
- Framework: Next.js (auto-detected)

#### 2. Build Settings
```
Framework:        Next.js
Root Directory:   apps/web
Build Command:    npm run build
Output Directory: .next
Install Command:  npm ci
Node Version:     18.x or higher
```

#### 3. Environment Variables

**Add to Production, Preview, and Development:**

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://syntermedia.ai

# Database
DATABASE_URL=postgresql://user:pass@host:5432/synter_web?sslmode=require

# Auth
JWT_SECRET=<generate-with-openssl-rand-hex-32>
SESSION_SECRET=<generate-with-openssl-rand-hex-32>

# Google OAuth (User Login)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_OAUTH_REDIRECT_URI=https://syntermedia.ai/api/auth/google/callback

# Stripe (Billing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_CREDITS_TIER_10_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_CREDITS_TIER_20_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_CREDITS_TIER_100_PRICE_ID=price_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Loops.so (Email)
LOOPS_API_KEY=xxxxx
LOOPS_MAGIC_LINK_TEMPLATE_ID=cmlw8qyx201i7rh0icuby5hq3

# Backend API
PPC_BACKEND_URL=https://api.syntermedia.ai
PPC_BACKEND_BASIC_USER=admin
PPC_BACKEND_BASIC_PASS=<secure-password>
```

#### 4. Domain Configuration
- **Production:** syntermedia.ai
- **API:** api.syntermedia.ai (for backend)
- Update DNS and SSL in Vercel domains settings

---

### C. Stripe Configuration

#### 1. Create Products & Prices

**Option A: Use Script (Recommended)**
```bash
cd apps/web
STRIPE_SECRET_KEY=sk_test_xxxxx npm run stripe:setup-products
```

This creates:
- $10 → 100 credits
- $20 → 200 credits
- $30 → 300 credits
- $40 → 400 credits
- $50 → 500 credits
- $100 → 1,100 credits (10% bonus)

**Option B: Manual Setup**
1. Go to https://dashboard.stripe.com/products
2. Create each product:
   - Name: "100 Credits", "200 Credits", etc.
   - Pricing: One-time payment
   - Price: $10.00, $20.00, etc.
3. Copy Price IDs → add to Vercel env vars

#### 2. Webhook Setup

**Backend Webhook (Recommended):**
1. Endpoint: `https://api.syntermedia.ai/stripe/webhook`
2. Events to subscribe:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `charge.refunded` (optional)
3. Copy **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

**Local Testing:**
```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```

#### 3. Test Mode vs Live Mode
- **Development/Preview:** Use `sk_test_` keys
- **Production:** Use `sk_live_` keys
- Keep products separate in test and live dashboards

---

### D. Loops.so Email Setup

#### 1. Create Account
- Sign up at https://loops.so
- Create workspace for Synter

#### 2. Email Templates

**Magic Link Template:**
```
Subject: Sign in to Synter
Body: 
Hi {{FirstName}},

Click below to sign in securely:

[Button: Sign In] → {{magic_url}}

This link expires in 10 minutes.
```

**Template ID:** Copy from Loops → `LOOPS_MAGIC_LINK_TEMPLATE_ID`

#### 3. API Configuration
- Generate API key in Loops dashboard
- Configure sending domain (syntermedia.ai)
- Set up DKIM/SPF records for deliverability

#### 4. Environment Variables
```bash
LOOPS_API_KEY=xxxxx
LOOPS_MAGIC_LINK_TEMPLATE_ID=cmlw8qyx201i7rh0icuby5hq3
LOOPS_WAITLIST_TEMPLATE_ID=xxxxx (if using waitlist emails)
```

---

### E. Google Cloud OAuth 2.0 Setup

#### 1. Create OAuth 2.0 Credentials

**Google Cloud Console:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Application type: **Web application**
4. Name: "Synter Production"

#### 2. Configure Consent Screen
```
App name:         Synter
Support email:    support@syntermedia.ai
App domain:       syntermedia.ai
Authorized domains: syntermedia.ai
```

#### 3. Redirect URIs
```
Local Development:
http://localhost:3000/api/auth/google/callback

Production:
https://syntermedia.ai/api/auth/google/callback

Preview (Optional):
https://your-preview.vercel.app/api/auth/google/callback
```

#### 4. Required Scopes
```
https://www.googleapis.com/auth/adwords
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
openid
```

#### 5. Test Users (if in Testing mode)
Add your email addresses to test users list

#### 6. Environment Variables
```bash
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_OAUTH_REDIRECT_URI=https://syntermedia.ai/api/auth/google/callback
```

---

### F. AI SDK: OpenAI vs Amp SDK

#### Current Implementation: OpenAI SDK

**Files:**
- `apps/web/src/lib/ai/openai.ts`
- `apps/ppc-backend/app/services/ai_service.py`

**Pros:**
- ✅ Mature, well-documented
- ✅ GPT-4 Turbo, GPT-4o available
- ✅ Function calling for structured output
- ✅ Large ecosystem

**Cons:**
- ❌ Vendor lock-in
- ❌ Cost can be high
- ❌ Rate limiting needs manual handling

#### Option: Migrate to Amp SDK

**Amp SDK Benefits:**
- ✅ Multi-provider abstraction (OpenAI, Anthropic, etc.)
- ✅ Built-in rate limiting
- ✅ Cost tracking
- ✅ Unified interface

**Migration Effort:** ~8-16 hours

**Migration Plan (if approved):**
```typescript
// 1. Install Amp SDK
npm install @amp/sdk

// 2. Create wrapper interface
// apps/web/src/lib/ai/client.ts
export interface AIClient {
  complete(prompt: string, options?: any): Promise<string>
  chat(messages: Message[]): Promise<string>
}

// 3. Implement both adapters
class OpenAIClient implements AIClient { ... }
class AmpClient implements AIClient { ... }

// 4. Factory pattern
export function createAI(): AIClient {
  return process.env.AI_PROVIDER === 'amp' 
    ? new AmpClient() 
    : new OpenAIClient()
}

// 5. Update all call sites incrementally
```

**Recommendation:** 
- **Stay with OpenAI** for now (MVP focus)
- Revisit after agent system is stable
- Add to roadmap for Phase 4

---

## 5. LOCAL DEVELOPMENT

### Prerequisites

```bash
# Required
Node.js 18+
Python 3.11+
PostgreSQL 14+
pnpm (recommended) or npm

# Optional
Stripe CLI (for webhook testing)
Docker (for local Postgres)
```

### Installation Steps

#### 1. Install Dependencies

**Web App:**
```bash
cd apps/web
npm ci
# or
pnpm install
```

**Backend:**
```bash
cd apps/ppc-backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Environment Setup

**Web (.env.local):**
```bash
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values
```

**Backend (.env):**
```bash
cp apps/ppc-backend/.env.example apps/ppc-backend/.env
# Edit .env with your values
```

#### 3. Database Setup

**Start PostgreSQL:**
```bash
# Using Docker
docker run --name synter-postgres \
  -e POSTGRES_PASSWORD=synter_pass \
  -e POSTGRES_USER=synter_user \
  -e POSTGRES_DB=synter \
  -p 5432:5432 \
  -d postgres:15
```

**Run Migrations:**
```bash
cd apps/web
npx prisma generate
npx prisma migrate dev
```

**Seed Admin Account:**
```bash
npx prisma db seed
# Or
npm run db:check-role  # Ensures joel@syntermedia.ai is ADMIN
```

#### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd apps/ppc-backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Web:**
```bash
cd apps/web
npm run dev
```

**Terminal 3 - Stripe Webhooks (Optional):**
```bash
stripe listen --forward-to localhost:8000/stripe/webhook
# Copy webhook secret to .env
```

#### 5. Access Application
```
Web:      http://localhost:3000
Backend:  http://localhost:8000/docs
Database: npx prisma studio
```

### Test Credentials

**Admin Login:**
```
Email:    joel@syntermedia.ai
Password: (check ADMIN_PASSWORD env or default: changeme123)
```

**Stripe Test Card:**
```
Number:   4242 4242 4242 4242
Expiry:   Any future date
CVC:      Any 3 digits
ZIP:      Any 5 digits
```

---

## 6. PRIORITY ROADMAP

### 🔴 PHASE 1: Fix Billing (2-3 days)

**Goal:** Users can purchase credits and see balance

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Implement Stripe webhook handler | 8h | Backend | ⏳ TODO |
| Add WorkspaceBalance + CreditLedger models | 2h | Backend | ⏳ TODO |
| Create atomic credit deduction function | 6h | Backend | ⏳ TODO |
| Build balance API endpoints | 2h | Backend | ⏳ TODO |
| Show balance in dashboard header | 1h | Frontend | ⏳ TODO |
| Wire "Buy Credits" button to Stripe checkout | 2h | Frontend | ⏳ TODO |
| Test end-to-end purchase flow | 2h | QA | ⏳ TODO |

**Success Criteria:**
- ✅ User can purchase $10 package and receive 100 credits
- ✅ Balance updates in real-time
- ✅ Credits deducted when AI features used
- ✅ Webhook processes payments idempotently

---

### 🟡 PHASE 2: Agent System MVP (1 week)

**Goal:** AI can analyze campaigns and propose optimizations

| Task | Effort | Owner | Status |
|------|--------|-------|--------|
| Design job queue schema | 2h | Backend | ⏳ TODO |
| Implement job runner with SKIP LOCKED | 8h | Backend | ⏳ TODO |
| Build campaign analysis agent | 12h | Backend | ⏳ TODO |
| Create optimization proposal UI | 6h | Frontend | ⏳ TODO |
| Add apply/reject recommendation flow | 4h | Full Stack | ⏳ TODO |
| Integrate credit deduction | 2h | Backend | ⏳ TODO |

**Success Criteria:**
- ✅ User clicks "Analyze Campaign"
- ✅ Agent runs async, deducts 5 credits
- ✅ Generates 3-5 optimization recommendations
- ✅ User can review and apply changes

---

### 🟢 PHASE 3: Platform Integrations (2-3 weeks)

**Priority Order:**
1. **Google Ads** (most critical - 70% of users)
2. **Microsoft Ads** (20% of users)
3. **Reddit Ads** (10% of users)
4. **X Ads** (future)
5. **LinkedIn Ads** (future)

#### Google Ads Integration

| Task | Effort | Status |
|------|--------|--------|
| OAuth 2.0 flow | 4h | ⏳ TODO |
| Account/campaign fetch | 4h | ⏳ TODO |
| Performance metrics API | 6h | ⏳ TODO |
| BigQuery sync | 4h | ⏳ TODO |
| Budget update API | 4h | ⏳ TODO |

---

### 🔵 PHASE 4: Testing & Polish (1 week)

| Category | Tasks | Effort |
|----------|-------|--------|
| E2E Tests | Auth, billing, campaign CRUD | 8h |
| Unit Tests | Credit system, webhooks | 6h |
| Integration Tests | Platform APIs, BigQuery | 8h |
| Security Audit | Auth, CORS, secrets | 4h |
| Performance | Load testing, caching | 6h |

---

## 🔧 COMMON COMMANDS

### Development
```bash
# Web dev server
cd apps/web && npm run dev

# Backend dev server
cd apps/ppc-backend && uvicorn main:app --reload

# Database studio
cd apps/web && npx prisma studio

# Run migrations
cd apps/web && npx prisma migrate dev

# Check user role
cd apps/web && npm run db:check-role

# Setup Stripe products
cd apps/web && npm run stripe:setup-products
```

### Deployment
```bash
# Deploy to Vercel (auto via git push to main)
git push origin main

# Manual Vercel deploy
cd apps/web && vercel --prod

# Backend deploy (Railway example)
railway up
```

### Testing
```bash
# E2E tests
cd apps/web && npm run test:e2e

# Stripe webhook testing
stripe listen --forward-to localhost:8000/stripe/webhook
stripe trigger checkout.session.completed
```

---

## 📞 SUPPORT & RESOURCES

### Documentation
- **Project Docs:** See `/docs` folder
- **AGENTS.md:** Agent system specification
- **BUILD_SETTINGS.md:** Billing & workspace spec
- **API Docs (Backend):** http://localhost:8000/docs

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Loops.so Docs](https://loops.so/docs)
- [Google Ads API](https://developers.google.com/google-ads/api)
- [OpenAI API](https://platform.openai.com/docs)

### Key Contacts
- **Product Owner:** Joel Horwitz (joel@syntermedia.ai)
- **Repository:** https://github.com/jshorwitz/synter-clean
- **Support:** support@syntermedia.ai

---

## ⚠️ KNOWN ISSUES & GOTCHAS

1. **Billing webhook not implemented** - Payments won't grant credits yet
2. **Agent system scaffolded only** - Core execution logic pending
3. **Google Ads not connected** - OAuth flow exists but platform sync pending
4. **Credit deduction not enforced** - Users can use AI features without balance check
5. **Session expiry mismatch** - Cookie set for 24h, ensure DB session matches

---

## 🎯 SUCCESS METRICS

### MVP Launch Criteria
- [ ] Users can signup/login with magic links
- [ ] Admin can access admin panels (/admin/waitlist, /admin/credits)
- [ ] Users can purchase credits ($10, $20, $100 packages)
- [ ] Balance displays correctly after purchase
- [ ] AI recommendations run and deduct credits
- [ ] At least Google Ads platform connected
- [ ] Basic campaign CRUD operations work

### Beta Criteria
- [ ] All 4 platforms integrated (Google, Microsoft, Reddit, X)
- [ ] Agent system runs on schedule
- [ ] Attribution analytics working
- [ ] E2E test coverage >70%
- [ ] <100ms p95 response time
- [ ] Zero critical security vulnerabilities

---

## 📝 NOTES FOR NEW TEAM

- **Start with Phase 1** - Billing must work before other features matter
- **Use the Oracle** - Complex debugging? Ask the Amp Oracle for help
- **Test locally first** - Use Stripe test mode and webhook forwarding
- **Admin access** - Run `npm run db:check-role` to verify/update roles
- **Screenshots** - Use `capture-single-screenshot.mjs` to update marketing images

**Welcome to the team! Let's build something great.**

---

*Generated: October 18, 2025*
