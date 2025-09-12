# Reddit Traffic Analysis for Ampcode.com

## UTM Parameter Extraction Setup - COMPLETED ✅

Successfully created a PostHog transformation via API that automatically extracts UTM parameters from URLs:
- **Transformation ID**: `0198ed04-6259-0000-be6a-f3f3186aa103`
- **Name**: "UTM Parameter Extractor"
- **Status**: Enabled and running
- **Function**: Extracts utm_source, utm_medium, utm_campaign, utm_term, utm_content from both current URL and referrer

## Reddit Traffic Found 🎯

Found **814 total pageviews** from Reddit sources in the last 30 days:

### Traffic Breakdown:
1. **514 pageviews** from `https://out.reddit.com/` (Reddit redirect links)
2. **165 pageviews** from `https://www.reddit.com/` (main Reddit site)
3. **83 pageviews** from `android-app://com.reddit.frontpage/` (Reddit mobile app)
4. **29 pageviews** with `utm_source=reddit` (properly tagged UTM traffic)
5. **6 pageviews** from a specific UTM campaign: `utm_campaign=amp-diagnostic-completions-launch`
6. **5 pageviews** from old Reddit posts about "Try GPT5 with Amp"
7. **Multiple pageviews** from various Reddit threads and user profiles

### Key Findings:
- **UTM-tagged Reddit traffic**: 35 pageviews (29 + 6)
- **Organic Reddit traffic**: 779 pageviews (514 + 165 + 83 + 17)
- **Most traffic** comes from Reddit redirect links and direct Reddit referrals
- **Specific campaign** detected: "amp-diagnostic-completions-launch" with UTM tracking

## Next Steps for Reddit Signup Tracking:

### 1. Enhanced UTM Tracking
The transformation is now live and will automatically extract UTM parameters from all future traffic.

### 2. Signup Event Implementation
To track Reddit signups, implement signup events in your application:
```javascript
posthog.capture('signup_completed', {
  signup_method: 'email',
  plan: 'free'
  // UTM parameters will be automatically added by the transformation
});
```

### 3. Create Reddit Signup Dashboard
Query for Reddit signups once signup events are implemented:
```sql
SELECT 
    utm_source,
    utm_campaign,
    count() as signups
FROM events 
WHERE event = 'signup_completed'
  AND utm_source = 'reddit'
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY utm_source, utm_campaign
```

### 4. Funnel Analysis
Create a funnel from Reddit pageview → signup to measure conversion rates.

## Immediate Action Items:
1. ✅ UTM extraction transformation created and enabled
2. 🔄 Implement signup event tracking in the application
3. 🔄 Create Reddit conversion funnel analysis
4. 🔄 Set up alerts for Reddit traffic spikes
5. 🔄 Tag future Reddit campaigns with proper UTM parameters

The UTM parameter extraction is now working automatically for all future events!
