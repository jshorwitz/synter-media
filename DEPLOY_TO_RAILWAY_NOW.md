# 🚀 Deploy to Railway NOW - Step by Step

## ✅ Code Status
- **Repository**: `jshorwitz/synter` ✅ Pushed to GitHub
- **Branch**: `main` ✅ Up to date
- **Services Ready**: Node.js Orchestrator + Next.js Dashboard ✅

---

## 🚂 **Railway Deployment Steps**

### 1. **Open Railway Dashboard**
**Link**: https://railway.app/project/astonishing-reflection
- You're logged in as: Joel Horwitz (joel.horwitz@gmail.com) ✅

### 2. **Create PostgreSQL Database**
- Click "**+ New Service**"
- Select "**Database**" → "**PostgreSQL**"
- Name: `synter-postgres`
- Railway will auto-generate `DATABASE_URL`

### 3. **Create Redis Cache**
- Click "**+ New Service**"  
- Select "**Database**" → "**Redis**"
- Name: `synter-redis`
- Railway will auto-generate `REDIS_URL`

### 4. **Deploy Orchestrator API**
- Click "**+ New Service**"
- Select "**GitHub Repo**"
- Repository: `jshorwitz/synter`
- Branch: `main`
- Service Name: `synter-orchestrator`

**Configure Orchestrator:**
- **Root Directory**: `packages/orchestrator`
- **Build Command**: `npm install` (auto-detected)
- **Start Command**: `npm start` (auto-detected)
- **Health Check Path**: `/health`

**Environment Variables** (add in Railway dashboard):
```bash
# Auto-linked by Railway
DATABASE_URL=postgresql://... (link PostgreSQL service)
REDIS_URL=redis://... (link Redis service)

# Required - Add these manually:
NODE_ENV=production
ENABLE_SCHEDULER=true
LOG_LEVEL=info

# Security (generate strong 32+ character secrets)
JWT_SECRET=your_32_char_jwt_secret_here_change_me
SESSION_SECRET=your_32_char_session_secret_here_change_me

# PostHog (required for conversion tracking)
POSTHOG_API_KEY=phc_your_posthog_api_key_here
POSTHOG_HOST=https://us.posthog.com

# Google Services (add your actual values)
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token
GOOGLE_ADS_CUSTOMER_ID=your_google_ads_customer_id

# BigQuery (add your project details)
BIGQUERY_PROJECT_ID=your_gcp_project_id
BIGQUERY_DATASET=synter_analytics

# Optional for testing
MOCK_REDDIT=true
MOCK_TWITTER=true
MOCK_MICROSOFT=true
MOCK_LINKEDIN=true
```

### 5. **Deploy Dashboard UI**
- Click "**+ New Service**"
- Select "**GitHub Repo**"
- Repository: `jshorwitz/synter`
- Branch: `main`
- Service Name: `synter-dashboard`

**Configure Dashboard:**
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build` (auto-detected)
- **Start Command**: `npm start` (auto-detected)
- **Health Check Path**: `/api/health`

**Environment Variables** (add in Railway dashboard):
```bash
# Connection to Orchestrator API (update after orchestrator deploys)
NEXT_PUBLIC_ORCHESTRATOR_API_URL=https://synter-orchestrator-production.up.railway.app

# NextAuth
NEXTAUTH_URL=https://synter-dashboard-production.up.railway.app
NEXTAUTH_SECRET=your_32_char_nextauth_secret_here_change_me
DATABASE_URL=postgresql://... (link same PostgreSQL service)

# PostHog for dashboard analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Google OAuth (for login)
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
```

---

## 📋 **Deployment Checklist**

### ✅ **Pre-Deployment**
- [x] Code pushed to GitHub (`main` branch)
- [x] Node.js Orchestrator service created
- [x] Next.js Dashboard service created
- [x] Railway project ready (`astonishing-reflection`)

### 🔄 **During Deployment**
- [ ] PostgreSQL service created
- [ ] Redis service created
- [ ] Orchestrator deployed with environment variables
- [ ] Dashboard deployed with environment variables
- [ ] Services linked to databases

### ✅ **Post-Deployment**
- [ ] Health checks passing (`/health` and `/api/health`)
- [ ] Update `NEXT_PUBLIC_ORCHESTRATOR_API_URL` in dashboard
- [ ] Upload BigQuery service account JSON
- [ ] Test agent status endpoint
- [ ] Verify PostHog tracking

---

## 🌐 **Expected URLs After Deployment**

```
Orchestrator API: https://synter-orchestrator-production.up.railway.app
├── Health: /health
├── Agents: /api/v1/agents/status
└── Auth: /api/v1/auth/me

Dashboard UI: https://synter-dashboard-production.up.railway.app  
├── Health: /api/health
├── Main: / (agent monitoring dashboard)
└── Admin: /agents (agent management)
```

---

## 🚀 **Start Deployment**

**Click this link to begin:** https://railway.app/project/astonishing-reflection

1. **Add PostgreSQL** → **Add Redis** → **Deploy Orchestrator** → **Deploy Dashboard**
2. **Set environment variables** for each service  
3. **Link databases** to both web services
4. **Verify health checks** are passing

**Estimated deployment time:** 5-10 minutes per service
**Expected result:** 4 healthy Railway services running your cross-platform ads attribution system! 🎉

The code is production-ready and optimized for Railway's managed infrastructure. No Docker needed! ⚡
