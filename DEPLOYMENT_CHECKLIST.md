# Deployment Checklist - Ad Footprint Feature

## Current Status
- ✅ All code committed and pushed
- ⏳ Vercel deployment in progress
- ⏳ Waiting for build to complete

## Latest Commits
1. `80ce1f2e` - Fixed missing jose dependency + Speed Insights
2. `66ecddfb` - Added Ad Footprint & Savings feature

## Critical: Environment Variable Required

Before the feature will work, you MUST add to Vercel:

### Step-by-Step:
1. Go to https://vercel.com/dashboard
2. Select your project (synter-fresh or synter-clean)
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name:** `BUILTWITH_API_KEY`
   - **Value:** `c6116990-86e1-42d2-ab07-2e20abbcc710`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**
7. **Redeploy** (Deployments tab → Latest → Redeploy)

## Verify Deployment Success

### 1. Check Build Logs
Go to Vercel → Deployments → Latest
Look for:
- ✅ "prisma migrate deploy" succeeded
- ✅ "next build" succeeded
- ✅ Status: "Ready"

### 2. Test Homepage
```bash
curl -I https://synter-fresh.vercel.app
# Should return: HTTP/2 200
```

### 3. Test API Endpoint
```bash
curl https://synter-fresh.vercel.app/api/onboarding/scan \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"shopify.com"}'

# Expected: {"scan_id":"..."}
```

### 4. Manual Browser Test
1. Visit: https://synter-fresh.vercel.app
2. Enter website: `shopify.com`
3. Click "Get Started"
4. Wait for analysis (~30s)
5. Click "Continue"
6. **NEW STEP SHOULD APPEAR:** "Ad Footprint & Savings"
7. Wait for detection (~15s)
8. Should show:
   - Detected platforms with checkmarks
   - Estimated spend per platform
   - ROI savings calculation
   - "You could save $X - $Y/month"

### 5. Run E2E Tests
```bash
cd apps/web

# Test against production
pnpm test:e2e:vercel

# Or with your actual URL
E2E_BASE_URL=https://your-deployment.vercel.app pnpm test:e2e
```

## Troubleshooting

### Problem: Build still failing
**Check:** Vercel build logs for specific error
**Solution:** Check dependencies, ensure all packages are in package.json

### Problem: 404 on homepage
**Possible causes:**
- Deployment still in progress (wait 2-3 min)
- Build failed (check Vercel logs)
- Wrong URL (verify project name in Vercel)

### Problem: API returns "BUILTWITH_API_KEY not found"
**Solution:** 
1. Add env var in Vercel (see above)
2. Redeploy after adding env var
3. Verify env var is set for Production environment

### Problem: "relation 'onboarding_scans' does not exist"
**Solution:**
Database migration didn't run. Manually run:
```bash
# Get production DATABASE_URL from Vercel env vars
cd apps/web
DATABASE_URL="your-prod-url" npx prisma db push
```

### Problem: BuiltWith API returns errors
**Check:**
- API key is correct
- Not hitting rate limits
- Domain is accessible

### Problem: E2E tests timeout
**Possible causes:**
- Cold start (first request takes longer)
- API analysis taking >45s
- BuiltWith scan taking >50s

**Solution:**
- Run tests with `--headed` to see what's happening
- Check browser console for errors
- Increase timeouts in playwright.config.ts

## What Was Built

### New Files:
- `apps/web/src/app/api/onboarding/scan/route.ts` - Platform detection
- `apps/web/src/app/api/onboarding/status/route.ts` - Poll scan progress
- `apps/web/src/app/api/onboarding/result/route.ts` - Return results with ROI
- `apps/web/tests/onboarding.spec.ts` - E2E tests
- `apps/web/playwright.config.ts` - Test configuration

### Modified Files:
- `apps/web/prisma/schema.prisma` - Added OnboardingScan tables
- `apps/web/src/app/(dashboard)/onboarding/page.tsx` - New step in flow
- `apps/web/src/app/page.tsx` - Fixed localStorage handoff
- `apps/web/src/app/layout.tsx` - Added Speed Insights
- `apps/web/package.json` - Added test scripts

### Database Tables:
- `onboarding_scans` - Stores scan metadata
- `onboarding_scan_platforms` - Stores detected platforms with estimates

## Success Criteria

After deployment completes, verify:
- [ ] Homepage loads (200 status)
- [ ] Onboarding flow accessible
- [ ] Website analysis completes
- [ ] **NEW:** Ad Footprint step appears
- [ ] Platform detection works
- [ ] ROI savings displayed
- [ ] Can proceed to account creation
- [ ] E2E tests pass (3+ of 4 tests)

## Performance Expectations

- Website analysis: 20-40 seconds
- Ad footprint scan: 10-20 seconds
- Total new onboarding time: ~1 minute longer
- BuiltWith API: ~2-3 seconds response time

## Documentation

Full details in:
- [AD_FOOTPRINT_IMPLEMENTATION.md](./AD_FOOTPRINT_IMPLEMENTATION.md) - Feature overview
- [E2E_TESTING.md](./apps/web/E2E_TESTING.md) - Testing guide
- [DEPLOY_AD_FOOTPRINT.md](./DEPLOY_AD_FOOTPRINT.md) - Deployment guide

## Quick Commands

```bash
# Check Vercel deployment
vercel ls

# Test locally
cd apps/web && pnpm dev

# Run E2E tests locally
cd apps/web && pnpm test:e2e

# Test against Vercel
cd apps/web && pnpm test:e2e:vercel

# View test report
cd apps/web && npx playwright show-report

# Check database
cd apps/web && npx prisma studio
```

## Contact / Support

If stuck:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Check database connection
4. Verify BuiltWith API key
5. Review Playwright traces for failed tests

## Next Steps After Deployment

1. Monitor first 10 users through new flow
2. Check scan completion rate
3. Verify platform detection accuracy
4. Review BuiltWith API usage/quota
5. Gather user feedback on savings message
6. A/B test different ROI messaging

---

**Expected Total Time:** 5-10 minutes from now
