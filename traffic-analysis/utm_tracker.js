// UTM Parameter Tracker for PostHog
// This script captures UTM parameters from URLs and sends them to PostHog

class UTMTracker {
  constructor(posthogApiKey, options = {}) {
    this.apiKey = posthogApiKey;
    this.baseUrl = options.baseUrl || 'https://app.posthog.com';
    this.distinctId = options.distinctId || this.generateDistinctId();
  }

  generateDistinctId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  getUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};
    
    // Standard UTM parameters
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });

    return utmParams;
  }

  async trackUTMParameters() {
    const utmParams = this.getUTMParameters();
    
    if (Object.keys(utmParams).length === 0) {
      console.log('No UTM parameters found');
      return;
    }

    const eventData = {
      api_key: this.apiKey,
      event: 'utm_parameters_captured',
      properties: {
        ...utmParams,
        $current_url: window.location.href,
        $referrer: document.referrer,
        timestamp: new Date().toISOString()
      },
      distinct_id: this.distinctId
    };

    try {
      const response = await fetch(`${this.baseUrl}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        console.log('UTM parameters tracked successfully:', utmParams);
      } else {
        console.error('Failed to track UTM parameters:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking UTM parameters:', error);
    }
  }

  // Store UTM parameters in session storage for later use
  storeUTMParameters() {
    const utmParams = this.getUTMParameters();
    if (Object.keys(utmParams).length > 0) {
      sessionStorage.setItem('utm_parameters', JSON.stringify(utmParams));
    }
  }

  // Get stored UTM parameters
  getStoredUTMParameters() {
    const stored = sessionStorage.getItem('utm_parameters');
    return stored ? JSON.parse(stored) : {};
  }

  // Track conversion with original UTM parameters
  async trackConversion(conversionEvent, additionalProperties = {}) {
    const storedUTM = this.getStoredUTMParameters();
    
    const eventData = {
      api_key: this.apiKey,
      event: conversionEvent,
      properties: {
        ...storedUTM,
        ...additionalProperties,
        timestamp: new Date().toISOString()
      },
      distinct_id: this.distinctId
    };

    try {
      const response = await fetch(`${this.baseUrl}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        console.log('Conversion tracked with UTM attribution:', conversionEvent);
      } else {
        console.error('Failed to track conversion:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }
}

// Usage example:
// const tracker = new UTMTracker('your-posthog-api-key');
// 
// // Track UTM parameters on page load
// tracker.trackUTMParameters();
// tracker.storeUTMParameters();
// 
// // Later, track conversions with UTM attribution
// tracker.trackConversion('signup_completed', { plan: 'pro' });

export default UTMTracker;
