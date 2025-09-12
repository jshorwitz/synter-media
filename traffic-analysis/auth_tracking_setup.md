# Auth Page Tracking Setup Requirements

## ✅ Completed:
- Added `https://auth.ampcode.com` to PostHog app_urls
- UTM extraction transformation is active
- Channel types configured

## ❌ Still Needed:

### 1. Install PostHog Snippet on Auth Pages

The auth pages need the PostHog JavaScript snippet installed. Add this to the `<head>` of:
- `auth.ampcode.com/sign-up`
- `auth.ampcode.com/sign-up/password`
- `auth.ampcode.com/email-verification`

```html
<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);var n=t;if("undefined"!=typeof e){for(var p=e.split("."),r=0;r<p.length-1;r++){var i=p[r];i in n||(n[i]={}),n=n[i]}var s=p[p.length-1];return n[s]=o,n[s]=o,n[s]}return n}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||{},u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('REDACTED_POSTHOG_PROJECT_KEY', {api_host: 'https://app.posthog.com'})
</script>
```

### 2. Test the Tracking

**Test URL with UTM parameters:**
```
https://auth.ampcode.com/sign-up?utm_source=test&utm_medium=verification&utm_campaign=tracking_test
```

**What should happen:**
1. Visit the test URL
2. PostHog captures the pageview
3. UTM transformation extracts parameters
4. Event appears with utm_source="test"

### 3. Add Custom Signup Events (Recommended)

Beyond pageviews, add these events in your auth flow:

```javascript
// When user starts signup
posthog.capture('signup_started', {
  signup_method: 'email'
});

// When password is created  
posthog.capture('password_created');

// When email verification is sent
posthog.capture('email_verification_sent');

// When email is verified
posthog.capture('email_verified');

// When signup is complete
posthog.capture('signup_completed', {
  user_id: userId,
  plan: 'free'
});
```

## 🔧 Quick Verification Steps:

1. **Check current project settings:**
   ```bash
   curl -H "Authorization: Bearer REDACTED" \\
   https://app.posthog.com/api/projects/176241/ | jq '.app_urls'
   ```

2. **Look for auth events:**
   ```bash
   curl -H "Authorization: Bearer REDACTED" \\
   "https://app.posthog.com/api/projects/176241/events/?limit=50" | grep "auth.ampcode"
   ```

3. **Test transformation:**
   Visit auth page with UTM and check Activity tab

## 🚨 Common Issues:

### Issue 1: No PostHog Snippet
**Symptom:** No events from auth.ampcode.com
**Solution:** Install PostHog JavaScript on auth pages

### Issue 2: CORS/Domain Issues  
**Symptom:** Events blocked or not sending
**Solution:** Verify auth domain in app_urls (✅ already done)

### Issue 3: Different URL Patterns
**Symptom:** Auth pages use different URL structure
**Solution:** Check actual auth page URLs and update funnel filters

## 📈 Expected Results After Setup:

The funnel table should show:
```
| Step 1: auth.ampcode.com/sign-up      | 100+ | 5+ | 10+ | 2+ | 50+ | 30+ |
| Step 2: password                      |  80+ | 4+ |  8+ | 1+ | 40+ | 27+ |
| Step 3: email-verification            |  60+ | 3+ |  6+ | 1+ | 30+ | 20+ |
| Step 4: ampcode.com/                  |  50+ | 2+ |  5+ | 1+ | 25+ | 17+ |
```

With actual conversion rates by UTM source!
