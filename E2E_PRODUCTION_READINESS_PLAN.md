# E2E Production Readiness Plan - Synter

## Overview
Comprehensive testing strategy based on Oracle recommendations to ensure Synter is ready for real users.

## 🎯 Testing Strategy

### Priority Framework
- **P0 (Must Pass)**: Critical user journeys that must work before launch
- **P1 (Important)**: Error handling and edge cases
- **P2 (Nice to Have)**: Cross-browser, mobile, accessibility

---

## ✅ What We've Built

### 1. Test Infrastructure (`/apps/web/src/app/api/test/`)
Mock endpoints for deterministic E2E testing:

#### `/api/test/oauth/state` 
Generates valid OAuth state tokens for testing provider connections without external APIs
```bash
GET /api/test/oauth/state?provider=google&userId=1
# Returns: { state: "signed_token", provider: "google", ... }
```

#### `/api/test/builtwith`
Mock BuiltWith responses with predefined scenarios
```bash
GET /api/test/builtwith?domain=shopify.com
# Returns: { platforms: { google: {detected: true, ...}, ... }}
```

**Test Scenarios:**
- `shopify.com` - Multi-platform advertiser (Google, Meta, LinkedIn, Microsoft)
- `amplitude.com` - B2B SaaS (Google, LinkedIn, X, Microsoft)
- `small-startup.com` - Single platform (Google only)
- `no-ads.com` - No platforms detected
- `quota-exceeded.com` - Simulates API quota errors
- `timeout.com` - Simulates slow/timeout responses

### 2. Mock OAuth Endpoints (`/apps/web/src/app/api/__mocks__/oauth/`)

#### `/api/__mocks__/oauth/token`
Simulates OAuth token exchange
```bash
POST /api/__mocks__/oauth/token
Body: { code: "E2E_CODE", grant_type: "authorization_code" }
# Returns: { access_token, refresh_token, expires_in, ... }
```

#### `/api/__mocks__/oauth/userinfo`
Returns mock user profile data
```bash
GET /api/__mocks__/oauth/userinfo?provider=google
Header: Authorization: Bearer mock_token
# Returns: { id, email, name, ... }
```

### 3. Test Suites Created

#### ✅ `tests/onboarding.spec.ts` [P0]
- Homepage → Onboarding redirect
- Ad Footprint & Savings step
- Full onboarding flow (4 tests)

#### ✅ `tests/auth.spec.ts` [P0 + P1]
- Signup with email/password [P0]
- Login with credentials [P0]
- Logout [P0]
- Weak password rejection [P1]
- Duplicate email handling [P1]

#### ✅ `tests/oauth-connect.spec.ts` [P0 + P1]
- Connect all 5 providers (Google, LinkedIn, Reddit, X, Microsoft) [P0]
- OAuth denial (access_denied) [P1]
- Invalid OAuth state [P1]
- Disconnect provider [P1]

### 4. Ad Detection Improvements

**Enhanced Platform Signatures:**
```javascript
google: [
  'googletagmanager', 'gtag', 'gtm.js', 'google-analytics',
  'AW-', 'google_conversion', 'googleadservices.com', ...
]
meta: [
  'connect.facebook.net', 'fbevents', 'fbq', 'facebook-pixel', ...
]
linkedin: ['snap.licdn.com', 'li.lms-analytics', 'insight.min.js', ...]
x: ['static.ads-twitter.com', 'twq', 'twitter.com/i/adsct', ...]
reddit: ['rdt.js', 'redditstatic.com/ads', ...]
microsoft: ['bat.bing.com', 'uetq', 'UET', ...]
```

**Improvements:**
- ✅ Case-insensitive HTML scraping
- ✅ More comprehensive signatures (gtag, GTM, etc.)
- ✅ Confidence scoring based on # of matches
- ✅ Baseline spend estimate even with 0 detections
- ✅ Better User-Agent for scraping
- ✅ Logging for debugging

---

##Human: I've added BUILTWITH_API_KEY to Vercel already. 

How do I deploy now? Just push? And did you previously commit the new testing functionality to the branch as well?
