# Vercel Deployment Checklist ✅

## Status: Ready to Deploy

All critical blockers have been fixed. The Next.js app is now ready for Vercel deployment.

## Fixes Applied

### ✅ 1. Fixed vercel.json Configuration
- **Issue:** Catch-all route `/(.*) → /apps/web/$1` was breaking Next.js routing
- **Fix:** Simplified to minimal config; moved rewrites to next.config.js
- **File:** [vercel.json](./vercel.json)

### ✅ 2. Moved Rewrites to Next.js Config
- **Issue:** Workflow API rewrite was in vercel.json (suboptimal)
- **Fix:** Added `async rewrites()` to next.config.js
- **File:** [apps/web/next.config.js](./apps/web/next.config.js)

### ✅ 3. Fixed Session Cookie Inconsistency
- **Issue:** Mixed use of `session` and `synter_session` cookie names
- **Fix:** Standardized to `synter_session` across all routes
- **Files:**
  - [apps/web/src/app/api/auth/magic/route.ts](./apps/web/src/app/api/auth/magic/route.ts)
  - [apps/web/src/app/api/auth/logout/route.ts](./apps/web/src/app/api/auth/logout/route.ts)
  - [apps/web/src/app/api/traffic/utm/route.ts](./apps/web/src/app/api/traffic/utm/route.ts)

### ✅ 4. Added Missing createSession Export
- **Issue:** Magic link route imported `createSession` but it didn't exist
- **Fix:** Added `createSession` function to lib/auth.ts
- **File:** [apps/web/src/lib/auth.ts](./apps/web/src/lib/auth.ts)

### ✅ 5. Removed Duplicate Config
- **Issue:** Both next.config.js and next.config.ts existed
- **Fix:** Removed next.config.ts, kept .js version
- **File:** apps/web/next.config.ts (deleted)

### ✅ 6. Fixed Output File Tracing
- **Issue:** Monorepo imports may not be traced correctly
- **Fix:** Set `outputFileTracingRoot` to repo root (`../../`)
- **File:** [apps/web/next.config.js](./apps/web/next.config.js)

## Vercel Project Settings

### Required Settings

**1. Project Root Directory:**
```
apps/web
```

**2. Framework Preset:**
```
Next.js
```

**3. Node.js Version:**
```
20.x
```

**4. Build Command:**
```
next build
```
(Default - don't override)

**5. Output Directory:**
```
.next
```
(Default - don't override)

**6. Install Command:**
```
pnpm install --frozen-lockfile
```

**7. Package Manager:**
```
pnpm
```

### Required Environment Variables

Add these in Vercel Project Settings → Environment Variables:

#### Core Application
```bash
# Database (use pooled connection!)
DATABASE_URL=postgresql://user:pass@host:5432/db?pgbouncer=true

# JWT for auth
JWT_SECRET=<generate-random-string-64-chars>

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Email/SMTP
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
FROM_EMAIL=noreply@yourdomain.com
```

#### Backend API Proxy
```bash
# URL to your FastAPI backend (Railway/Render/etc)
PPC_BACKEND_URL=https://your-backend.railway.app
PPC_BACKEND_BASIC_USER=admin
PPC_BACKEND_BASIC_PASS=<your-backend-password>

# Optional: if different
AI_AGENCY_API_URL=https://your-backend.railway.app
```

#### OAuth (Optional - for social login)
```bash
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

REDDIT_CLIENT_ID=<your-client-id>
REDDIT_CLIENT_SECRET=<your-client-secret>

X_CLIENT_ID=<your-client-id>
X_CLIENT_SECRET=<your-client-secret>

LINKEDIN_CLIENT_ID=<your-client-id>
LINKEDIN_CLIENT_SECRET=<your-client-secret>
```

## Important: Database Connection

### ⚠️ Use Connection Pooling for Serverless

Serverless functions create many short-lived connections. Without pooling, you'll exhaust database connection limits.

**Options:**

1. **Neon with PgBouncer** (Recommended)
   ```
   DATABASE_URL=postgresql://user:pass@host.neon.tech/db?pgbouncer=true
   ```

2. **Prisma Accelerate** (Recommended)
   - Sign up at https://www.prisma.io/accelerate
   - Add Accelerate URL as DATABASE_URL
   ```
   DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=...
   ```

3. **Supabase with Pooler**
   ```
   DATABASE_URL=postgresql://postgres.xxxx.supabase.co:6543/postgres?pgbouncer=true
   ```

## Deployment Steps

### 1. Connect GitHub Repository

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select your GitHub repo: `jshorwitz/synter`
4. Click "Import"

### 2. Configure Project

1. **Root Directory:** `apps/web`
2. **Framework:** Next.js (auto-detected)
3. **Build Settings:** Keep defaults
4. Click "Environment Variables"
5. Add all required variables from above
6. Click "Deploy"

### 3. Wait for Build

Build should complete in 2-3 minutes. Check logs for any errors.

### 4. Verify Deployment

Once deployed:
- Visit your Vercel URL
- Test login/signup
- Verify API routes work
- Check OAuth flows (if configured)

## Post-Deployment Checklist

- [ ] Test homepage loads
- [ ] Test user signup with email
- [ ] Test magic link login
- [ ] Test social OAuth (if configured)
- [ ] Test dashboard access (requires auth)
- [ ] Verify PPC backend proxy works
- [ ] Check that sessions persist across page loads
- [ ] Test logout
- [ ] Verify HTTPS and cookies work correctly

## Monitoring & Debugging

### View Logs
- Go to Vercel Dashboard → Your Project → Functions
- Click on any function to see invocations and logs
- Check for errors in Real-time Logs

### Common Issues

**"Too many database connections"**
- Fix: Use connection pooling (see Database Connection section above)

**"Session cookie not set"**
- Fix: Ensure `secure: true` in production and HTTPS is working
- Check SameSite settings

**"API route timeout"**
- Fix: Add `export const maxDuration = 30` to slow routes
- Consider moving long operations to backend

**"Module not found"**
- Fix: Check `outputFileTracingRoot` in next.config.js
- Verify all imports are correct

## Architecture Notes

### What Deploys Where

**Vercel (Frontend):**
- ✅ Next.js app (apps/web)
- ✅ App Router routes
- ✅ API routes (serverless functions)
- ✅ OAuth callbacks
- ✅ Static assets

**External (Backend - Deploy Separately):**
- ❌ FastAPI backend (apps/ppc-backend) → Railway/Render/Fly.io
- ❌ Background scheduler → Railway/Render
- ❌ Database → Neon/Supabase/Render

**Flow:**
```
User → Vercel (Next.js)
       ↓ (API proxy)
       → Railway (FastAPI backend)
          ↓
          → Database (Neon/Supabase)
```

## Security Checklist

- [ ] JWT_SECRET is strong random string
- [ ] All OAuth client secrets are set
- [ ] DATABASE_URL uses SSL (?sslmode=require)
- [ ] SMTP credentials are secure
- [ ] Backend API uses Basic Auth
- [ ] Session cookies are HttpOnly + Secure
- [ ] No secrets in client-side code

## Next Steps After Deployment

1. **Set up custom domain** (Vercel Dashboard → Domains)
2. **Configure DNS** (add CNAME to Vercel)
3. **Deploy backend** to Railway/Render
4. **Update PPC_BACKEND_URL** in Vercel env vars
5. **Test end-to-end flow**
6. **Set up monitoring** (Vercel Analytics, Sentry)

## Support

- 📖 [Vercel Docs](https://vercel.com/docs)
- 🚀 [Next.js Deployment](https://nextjs.org/docs/deployment)
- 💾 [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Summary

✅ **All blocking issues fixed**
✅ **Configuration optimized for Vercel**
✅ **Session management standardized**
✅ **Routing properly configured**
✅ **Ready to deploy!**

Click "Deploy" in Vercel and you're good to go! 🚀
