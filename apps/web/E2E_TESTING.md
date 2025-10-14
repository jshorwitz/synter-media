# E2E Testing Guide - Synter

## Overview
Comprehensive end-to-end testing for the Synter signup and onboarding flow using Playwright.

## Prerequisites
- Playwright installed: `pnpm add -D @playwright/test`
- Chromium browser: `npx playwright install chromium`

## Test Coverage

### Tests Included:
1. **Homepage → Onboarding Redirect** - Tests URL input and redirect to analysis
2. **Ad Footprint & Savings Step** - Verifies platform detection and ROI calculation
3. **Full Onboarding Flow** - Complete end-to-end signup process
4. **Direct Onboarding Access** - Tests entering onboarding without homepage

## Running Tests

### Local Testing (against localhost:3000)
```bash
cd apps/web

# Start dev server in one terminal
pnpm dev

# Run tests in another terminal
pnpm test:e2e              # Headless mode
pnpm test:e2e:headed       # Watch tests run
pnpm test:e2e:ui           # Interactive UI mode
```

### Vercel/Production Testing
```bash
cd apps/web

# Test against deployed Vercel app
pnpm test:e2e:vercel       # Run all tests
pnpm test:e2e:vercel:ui    # Interactive UI

# Or use custom URL
E2E_BASE_URL=https://your-app.vercel.app pnpm test:e2e

# Or use the helper script
./scripts/test-vercel.sh https://synter-fresh.vercel.app
```

### Single Test
```bash
pnpm test:e2e onboarding.spec.ts
pnpm test:e2e --grep "shows Ad Footprint"
```

## Environment Variables

Set `E2E_BASE_URL` to test against a specific deployment:
```bash
export E2E_BASE_URL=https://synter-fresh.vercel.app
pnpm test:e2e
```

Default: `http://localhost:3000`

## What Gets Tested

### 1. Homepage Flow
- ✅ URL input field visible
- ✅ "Get Started" button works
- ✅ Redirects to `/onboarding?url=<domain>`
- ✅ Shows "Analyzing..." state

### 2. Website Analysis (Step 0)
- ✅ AI analysis completes (max 45s)
- ✅ Business type detected
- ✅ Industry identified
- ✅ Continue button appears

### 3. Ad Footprint & Savings (Step 1) **NEW**
- ✅ Initiates platform scan
- ✅ Shows "Detecting..." state
- ✅ Completes scan (max 50s)
- ✅ Displays detected platforms (Google, Meta, LinkedIn, X, Reddit, Microsoft)
- ✅ Shows confidence scores
- ✅ Displays spend estimates per platform
- ✅ Shows ROI savings calculation
- ✅ "Continue to Account Creation" button

### 4. Account Creation (Step 2)
- ✅ Business name input
- ✅ Email input (unique per test run)
- ✅ Password input
- ✅ "Create Account" submits successfully

### 5. Business Details (Step 3)
- ✅ Pre-filled from analysis
- ✅ Industry, audience, budget fields
- ✅ Continue to next step

### 6. Connect Platforms (Step 4)
- ✅ Platform connection cards visible
- ✅ "Skip for now" option
- ✅ "Finish Setup" button

## Test Data

Tests use realistic domains with known ad presence:
- `shopify.com` - Known to run Google, Meta, LinkedIn ads
- `amplitude.com` - B2B SaaS with multi-platform presence

Each test run generates unique emails:
- Pattern: `e2e-test-{timestamp}@syntertest.com`

## Debugging Failed Tests

### View Test Report
```bash
pnpm dlx playwright show-report
```

### Run with Debug Mode
```bash
pnpm test:e2e --debug
```

### Screenshots & Videos
On failure, Playwright saves:
- Screenshots: `test-results/*/test-failed-*.png`
- Videos: `test-results/*/video.webm`
- Traces: `test-results/*/trace.zip`

### View Trace
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: npx playwright install chromium
      
      # Test against preview deployment
      - name: E2E Tests
        env:
          E2E_BASE_URL: ${{ steps.vercel.outputs.preview-url }}
        run: cd apps/web && pnpm test:e2e
```

## Known Issues & Workarounds

### Issue: Tests timeout on Vercel
**Cause:** Cold starts, API rate limits, or slow BuiltWith responses
**Fix:** 
- Tests have 60s timeout per test
- Analysis step: 45s max
- Ad scan step: 50s max
- Increase in `playwright.config.ts` if needed

### Issue: BuiltWith API quota exceeded
**Cause:** Too many test runs against same domains
**Fix:**
- Use different test domains
- Mock BuiltWith response in test environment
- Set `MOCK_BUILTWITH=true` env var

### Issue: Flaky selector matches
**Cause:** Dynamic content, loading states
**Fix:**
- Use `waitFor()` and explicit timeouts
- Use flexible selectors with regex: `text=/Analyzing|Loading/i`
- Retry on failure (configured: 1 retry)

## Best Practices

1. **Always use unique emails** for account creation tests
2. **Wait for network idle** before interacting with forms
3. **Use flexible selectors** that work across deployments
4. **Set appropriate timeouts** for external API calls (analysis, scanning)
5. **Clean up test data** periodically from database
6. **Test against production-like data** (use real domains like shopify.com)

## Metrics

Target test execution times:
- Homepage redirect: ~5s
- Ad Footprint step: ~60s (includes 50s scan)
- Full onboarding: ~120s
- Total suite: ~3-5 minutes

## Maintenance

### Update Tests When:
- ✏️ Onboarding flow changes (new steps, reordering)
- ✏️ Form fields added/removed
- ✏️ Button text changes
- ✏️ API response format changes
- ✏️ Timeout requirements change

### Monthly Review:
- Check test success rate
- Review screenshots of failures
- Update test domains if needed
- Verify BuiltWith API still works
- Clean up old test user accounts

## Support

Questions or issues with E2E tests?
1. Check Playwright docs: https://playwright.dev
2. Review test output and traces
3. Check Vercel deployment logs
4. Verify BuiltWith API key is valid
