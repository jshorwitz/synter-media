# PostHog Auth Domain Verification Steps

## ✅ What You've Done:
- Added `https://auth.ampcode.com` to PostHog app_urls
- UTM extraction transformation is active
- Channel types configured for UTM source priority

## 🧪 How to Test If It's Working:

### Method 1: Check PostHog Project Settings
1. Go to: https://app.posthog.com/project/176241/settings
2. Scroll to **App URLs** section
3. Verify `https://auth.ampcode.com` is listed

### Method 2: Test Auth Page Tracking
1. **Visit this test URL**: `https://auth.ampcode.com/sign-up?utm_source=test&utm_medium=verification`
2. **Wait 1-2 minutes**
3. **Check PostHog Activity** for your pageview event
4. **Look for UTM properties** on the event

### Method 3: Monitor Live Events
1. Go to **PostHog Activity** tab
2. **Refresh the page** 
3. **Look for events** from `auth.ampcode.com` domains
4. **Check if UTM parameters** are being extracted

### Method 4: Run Updated Funnel Analysis
```bash
node signup_funnel_table.js
```

## 🔍 What to Expect:

### ✅ If Working:
- Auth page events appear in Activity
- UTM parameters show as event properties
- Funnel steps 1-3 show non-zero data
- Channel types reflect UTM sources

### ❌ If Not Working:
- Still no auth.ampcode.com events
- PostHog snippet missing from auth pages
- CORS/domain configuration issues

## 🛠️ Additional Setup Needed:

### 1. PostHog Snippet on Auth Pages
Ensure the PostHog JavaScript snippet is installed on:
- `auth.ampcode.com/sign-up`
- `auth.ampcode.com/sign-up/password` 
- `auth.ampcode.com/email-verification`

### 2. Custom Signup Events (Recommended)
Add these events to your auth flow:
```javascript
// On signup page load
posthog.capture('signup_started');

// When password is set
posthog.capture('password_created');

// When email is verified  
posthog.capture('email_verified');

// When signup completes
posthog.capture('signup_completed');
```

### 3. Test the Complete Flow
1. Visit: `https://auth.ampcode.com/sign-up?utm_source=reddit&utm_medium=social&utm_campaign=test`
2. Complete the signup process
3. Check if all steps appear in PostHog

## 📊 Updated Analysis
Once tracking is working, run the funnel analysis again:
```bash
node funnel_table_generator.js
```

This will show actual conversion data for each step by UTM source.

## 🎯 Success Metrics
You'll know it's working when:
- [ ] Auth page events appear in PostHog Activity
- [ ] UTM parameters are extracted automatically  
- [ ] Funnel steps 1-3 show visitor counts
- [ ] Reddit signup conversion rates are visible
- [ ] Channel types properly categorize traffic
