# Deploy Ad Footprint Feature to Vercel

## ✅ Completed Steps
- [x] Code committed and pushed to main branch
- [x] Vercel deployment triggered automatically

## 🚀 Required Deployment Steps

### 1. Add Environment Variable to Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
```
BUILTWITH_API_KEY=c6116990-86e1-42d2-ab07-2e20abbcc710
```

**Important:** Add to all environments (Production, Preview, Development)

### 2. Run Database Migration
The new tables need to be created in production database:

**Option A: Automatic (via Vercel build)**
- Already configured in `package.json`: `"build": "prisma generate && prisma migrate deploy && next build"`
- Will run automatically on next deployment after env var is added

**Option B: Manual (if needed)**
```bash
# Connect to production database
DATABASE_URL="your-production-postgres-url" npx prisma db push

# Or generate migration
DATABASE_URL="your-production-postgres-url" npx prisma migrate deploy
```

### 3. Verify Deployment

Once Vercel build completes:

#### Check Homepage
```bash
curl -I https://synter-fresh.vercel.app
# Should return 200 OK
```

#### Check Onboarding API
```bash
curl https://synter-fresh.vercel.app/api/onboarding/scan \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"shopify.com"}'

# Should return: {"scan_id":"..."}
```

#### Check Database Tables
```bash
# In Prisma Studio or SQL client
SELECT * FROM onboarding_scans LIMIT 1;
SELECT * FROM onboarding_scan_platforms LIMIT 1;
```

### 4. Run E2E Tests
```bash
cd apps/web

# Test against production
pnpm test:e2e:vercel

# Or with custom URL
E2E_BASE_URL=https://synter-fresh.vercel.app pnpm test:e2e
```

### 5. Manual Smoke Test
1. Go to https://synter-fresh.vercel.app
2. Enter website: "shopify.com"
3. Click "Get Started"
4. Wait for Website Analysis (~30s)
5. Click "Continue"
6. **Verify Ad Footprint step appears** ✨
7. Wait for platform detection (~15s)
8. **Verify savings calculation and detected platforms**
9. Continue through rest of onboarding

## Troubleshooting

### Build fails with "BUILTWITH_API_KEY not found"
- Ensure env var is added to Vercel
- Redeploy after adding env var

### Database error: "relation 'onboarding_scans' does not exist"
```bash
# Run migration manually
cd apps/web
DATABASE_URL="your-production-url" npx prisma db push
```

### API returns 500 on /api/onboarding/scan
- Check Vercel function logs
- Verify BuiltWith API key is valid
- Check DATABASE_URL is correct

### Tests timeout or fail
- Verify deployment is complete (check Vercel dashboard)
- Test API endpoints manually first
- Check browser console for errors
- Review Playwright traces: `npx playwright show-report`

## Expected Timeline
- Vercel build: 2-3 minutes
- Database migration (if needed): 30 seconds
- E2E tests: 3-5 minutes
- **Total: ~5-8 minutes**

## Verification Checklist
- [ ] Vercel deployment shows "Ready"
- [ ] BUILTWITH_API_KEY environment variable added
- [ ] Database tables created (onboarding_scans, onboarding_scan_platforms)
- [ ] Homepage loads without errors
- [ ] /api/onboarding/scan returns scan_id
- [ ] Onboarding flow shows new Ad Footprint step
- [ ] Platform detection works (test with shopify.com)
- [ ] ROI savings displayed correctly
- [ ] E2E tests pass (at least 3 of 4)

## Rollback Plan
If major issues occur:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or point Vercel to previous deployment
# Via Vercel Dashboard → Deployments → Promote to Production
```

## Post-Deployment Monitoring
- Monitor Vercel function logs for errors
- Check BuiltWith API usage/quota
- Watch for failed scans in database
- Review user feedback on new step

## Success Metrics
After 24 hours, check:
- Scan completion rate
- Average scan duration
- Platform detection accuracy
- Conversion rate through new step
