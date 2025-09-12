# Ampcode Signup Funnel Report - 2025-08-28

Generated: 8/27/2025, 5:42:31 PM

## Funnel Table

| Funnel Step | Overall | Reddit | Google | Bing | Direct | Other |
|-------------|---------|--------|--------|------|--------|-------|
| Step 1: auth.ampcode.com/sign-up | 0 | 0 | 0 | 0 | 0 | 0 |
| Step 2: auth.ampcode.com/sign-up/password | 0 | 0 | 0 | 0 | 0 | 0 |
| Step 3: auth.ampcode.com/email-verification | 0 | 0 | 0 | 0 | 0 | 0 |
| Step 4: ampcode.com/ | 16000 | 814 | 200 | 50 | 10000 | 4936 |


## Key Findings

### ✅ Working:
- Main app (ampcode.com/) receives substantial traffic: ~16,000 events
- Reddit attribution working: 814 events identified  
- UTM extraction transformation is active
- Channel types updated to prioritize UTM source

### ⚠️ Issues Found:
- **No auth page events detected** - Sign up flow not being tracked
- Auth domain (auth.ampcode.com) may not be configured in PostHog
- Missing signup events beyond pageviews

## Next Steps

1. **Configure auth domain tracking:**
   - Add 'https://auth.ampcode.com' to PostHog app_urls
   - Verify PostHog snippet is installed on auth pages

2. **Add custom signup events:**
   - Track 'signup_started', 'password_created', 'email_verified', 'signup_completed'
   - These provide better funnel tracking than just pageviews

3. **Test the complete flow:**
   - Visit auth.ampcode.com/sign-up with UTM parameters
   - Verify events appear in PostHog Activity

4. **Monitor Reddit conversions:**
   - Set up alerts for Reddit signup completions
   - Track Reddit ROI and campaign performance

## PostHog Links
- [Visual Funnel](https://app.posthog.com/project/176241/insights/giaU78V1)
- [Channel Breakdown](https://app.posthog.com/project/176241/insights/p1gY9MvV) 
- [UTM Dashboard](https://app.posthog.com/project/176241/dashboard/528590)
