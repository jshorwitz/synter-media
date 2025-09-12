# Sign-up Conversion Tracking Implementation Guide

## Overview
This guide shows how to implement PostHog conversion tracking on the auth.ampcode.com sign-up page to track referrer sources and conversion events.

## Implementation Steps

### 1. Add the Tracking Script to Sign-up Page

Add this script tag to your `https://auth.ampcode.com/sign-up` page, preferably in the `<head>` section:

```html
<script>
// PostHog Sign-up Conversion Tracker - Inline Version
(function() {
  class SignupConversionTracker {
    constructor() {
      this.apiKey = 'REDACTED_POSTHOG_PROJECT_KEY';
      this.baseUrl = 'https://app.posthog.com';
      this.distinctId = this.getOrCreateDistinctId();
    }

    getOrCreateDistinctId() {
      let distinctId = localStorage.getItem('posthog_distinct_id');
      if (!distinctId) {
        distinctId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('posthog_distinct_id', distinctId);
      }
      return distinctId;
    }

    getURLParameters() {
      const urlParams = new URLSearchParams(window.location.search);
      const params = {};
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      return params;
    }

    getReferrerData() {
      const referrer = document.referrer;
      const referrerData = {
        $referrer: referrer,
        $referring_domain: referrer ? new URL(referrer).hostname : null
      };

      if (referrer) {
        const hostname = new URL(referrer).hostname.toLowerCase();
        
        if (hostname.includes('google')) {
          referrerData.referrer_source = 'google';
          referrerData.referrer_medium = 'organic_search';
        } else if (hostname.includes('linkedin')) {
          referrerData.referrer_source = 'linkedin';
          referrerData.referrer_medium = 'social';
        } else if (hostname.includes('twitter') || hostname.includes('x.com')) {
          referrerData.referrer_source = 'twitter';
          referrerData.referrer_medium = 'social';
        } else if (hostname.includes('reddit')) {
          referrerData.referrer_source = 'reddit';
          referrerData.referrer_medium = 'social';
        } else if (hostname.includes('ampcode.com')) {
          referrerData.referrer_source = 'ampcode';
          referrerData.referrer_medium = 'internal';
        } else {
          referrerData.referrer_source = 'other';
          referrerData.referrer_medium = 'referral';
        }
      } else {
        referrerData.referrer_source = 'direct';
        referrerData.referrer_medium = 'direct';
      }

      return referrerData;
    }

    async trackSignupPageVisit() {
      const urlParams = this.getURLParameters();
      const referrerData = this.getReferrerData();
      
      const eventData = {
        api_key: this.apiKey,
        event: 'signup_page_visit',
        properties: {
          ...urlParams,
          ...referrerData,
          $current_url: window.location.href,
          page_title: document.title,
          timestamp: new Date().toISOString(),
          client_id: urlParams.client_id,
          redirect_uri: urlParams.redirect_uri,
          authorization_session_id: urlParams.authorization_session_id
        },
        distinct_id: this.distinctId
      };

      try {
        const response = await fetch(`${this.baseUrl}/capture/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });

        if (response.ok) {
          console.log('Sign-up page visit tracked');
          sessionStorage.setItem('signup_referrer_data', JSON.stringify(referrerData));
        }
      } catch (error) {
        console.error('Error tracking sign-up page visit:', error);
      }
    }

    init() {
      this.trackSignupPageVisit();
    }
  }

  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const tracker = new SignupConversionTracker();
      tracker.init();
    });
  } else {
    const tracker = new SignupConversionTracker();
    tracker.init();
  }
})();
</script>
```

### 2. Alternative: External Script Implementation

If you prefer to load the script externally:

```html
<script src="https://your-domain.com/signup_conversion_tracker.js"></script>
```

### 3. Track Form Submissions (Optional)

To track when users submit the sign-up form, add this after form submission:

```javascript
// After successful form submission
if (window.signupTracker) {
  window.signupTracker.trackSignupFormSubmission({
    email: userEmail, // don't include passwords
    signup_method: 'oauth'
  });
}
```

### 4. Track Conversion Completion

When the sign-up is successfully completed:

```javascript
// After successful sign-up completion
if (window.signupTracker) {
  window.signupTracker.trackSignupCompletion({
    user_id: newUserId,
    email: userEmail,
    signup_source: 'auth_page'
  });
}
```

## Events Being Tracked

### 1. `signup_page_visit`
Tracked automatically when the sign-up page loads.

**Properties captured:**
- `$referrer` - Full referrer URL
- `$referring_domain` - Referrer domain
- `referrer_source` - Categorized source (google, linkedin, twitter, reddit, ampcode, direct, other)
- `referrer_medium` - Medium type (organic_search, social, internal, direct, referral)
- `client_id` - Auth client ID from URL params
- `redirect_uri` - Redirect URI from URL params
- `authorization_session_id` - Session ID from URL params
- `$current_url` - Current page URL
- `page_title` - Page title
- `timestamp` - Event timestamp

### 2. `signup_form_submitted` (Optional)
Tracked when the sign-up form is submitted.

### 3. `signup_completed` (Optional) 
Tracked when sign-up process is completed successfully.

## PostHog Analysis

Once implemented, you can analyze the data in PostHog:

### 1. View Conversion Funnel
- Go to **Insights** → **Funnels**
- Step 1: `signup_page_visit`
- Step 2: `signup_form_submitted` 
- Step 3: `signup_completed`

### 2. Analyze Referrer Sources
- Go to **Insights** → **Trends**
- Event: `signup_page_visit`
- Breakdown by: `referrer_source` or `referrer_medium`

### 3. Create Dashboard
Create a dashboard with:
- Sign-up page visits by referrer source
- Conversion rates by traffic source
- Daily/weekly sign-up trends
- Top referring domains

## Testing

Test the implementation by:

1. **Visit the sign-up page** from different referrers:
   - Direct (type URL in browser)
   - From Google search
   - From LinkedIn
   - From ampcode.com

2. **Check PostHog Events**:
   - Go to PostHog → Activity → Live Events
   - Look for `signup_page_visit` events
   - Verify referrer data is captured correctly

3. **Verify in Browser Console**:
   - Open Developer Tools
   - Look for "Sign-up page visit tracked" message

## Configuration

The tracker uses these PostHog settings:
- **API Key**: `REDACTED_POSTHOG_PROJECT_KEY`
- **Host**: `https://app.posthog.com`
- **Project**: Traffic Analysis (Project ID: 176241)

## Privacy Considerations

- No passwords or sensitive data are tracked
- User consent may be required depending on jurisdiction
- Consider adding privacy notice about analytics tracking
