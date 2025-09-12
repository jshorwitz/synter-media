// PostHog Sign-up Conversion Tracker
// Tracks sign-up page visits and referrer sources for ampcode.com

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
    
    // Capture all URL parameters
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

    // Parse referrer for common sources
    if (referrer) {
      const referrerUrl = new URL(referrer);
      const hostname = referrerUrl.hostname.toLowerCase();
      
      // Identify traffic sources
      if (hostname.includes('google')) {
        referrerData.referrer_source = 'google';
        referrerData.referrer_medium = 'organic_search';
      } else if (hostname.includes('linkedin')) {
        referrerData.referrer_source = 'linkedin';
        referrerData.referrer_medium = 'social';
      } else if (hostname.includes('twitter') || hostname.includes('x.com')) {
        referrerData.referrer_source = 'twitter';
        referrerData.referrer_medium = 'social';
      } else if (hostname.includes('facebook')) {
        referrerData.referrer_source = 'facebook';
        referrerData.referrer_medium = 'social';
      } else if (hostname.includes('reddit')) {
        referrerData.referrer_source = 'reddit';
        referrerData.referrer_medium = 'social';
      } else if (hostname.includes('ampcode.com')) {
        referrerData.referrer_source = 'ampcode';
        referrerData.referrer_medium = 'internal';
      } else {
        referrerData.referrer_source = 'direct';
        referrerData.referrer_medium = 'direct';
      }
    } else {
      referrerData.referrer_source = 'direct';
      referrerData.referrer_medium = 'direct';
    }

    return referrerData;
  }

  getSessionData() {
    const sessionStart = sessionStorage.getItem('session_start_time') || Date.now();
    sessionStorage.setItem('session_start_time', sessionStart);
    
    return {
      session_start: new Date(parseInt(sessionStart)).toISOString(),
      session_duration: Date.now() - parseInt(sessionStart),
      page_load_time: Date.now()
    };
  }

  async trackSignupPageVisit() {
    const urlParams = this.getURLParameters();
    const referrerData = this.getReferrerData();
    const sessionData = this.getSessionData();
    
    const eventData = {
      api_key: this.apiKey,
      event: 'signup_page_visit',
      properties: {
        ...urlParams,
        ...referrerData,
        ...sessionData,
        $current_url: window.location.href,
        page_title: document.title,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timestamp: new Date().toISOString(),
        
        // Specific auth page data
        client_id: urlParams.client_id,
        redirect_uri: urlParams.redirect_uri,
        response_type: urlParams.response_type,
        authorization_session_id: urlParams.authorization_session_id
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
        console.log('Sign-up page visit tracked successfully');
        
        // Store this data for potential form submission tracking
        sessionStorage.setItem('signup_referrer_data', JSON.stringify({
          ...referrerData,
          timestamp: eventData.properties.timestamp
        }));
      } else {
        console.error('Failed to track sign-up page visit:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking sign-up page visit:', error);
    }
  }

  async trackSignupFormSubmission(formData = {}) {
    const storedReferrerData = JSON.parse(sessionStorage.getItem('signup_referrer_data') || '{}');
    const sessionData = this.getSessionData();
    
    const eventData = {
      api_key: this.apiKey,
      event: 'signup_form_submitted',
      properties: {
        ...storedReferrerData,
        ...sessionData,
        ...formData,
        $current_url: window.location.href,
        form_submit_time: new Date().toISOString(),
        time_on_page: Date.now() - sessionData.page_load_time
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
        console.log('Sign-up form submission tracked successfully');
      } else {
        console.error('Failed to track sign-up form submission:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking sign-up form submission:', error);
    }
  }

  async trackSignupCompletion(userData = {}) {
    const storedReferrerData = JSON.parse(sessionStorage.getItem('signup_referrer_data') || '{}');
    
    const eventData = {
      api_key: this.apiKey,
      event: 'signup_completed',
      properties: {
        ...storedReferrerData,
        ...userData,
        completion_time: new Date().toISOString()
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
        console.log('Sign-up completion tracked successfully');
        
        // Identify the user now that they've signed up
        await this.identifyUser(userData);
      } else {
        console.error('Failed to track sign-up completion:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking sign-up completion:', error);
    }
  }

  async identifyUser(userData = {}) {
    const eventData = {
      api_key: this.apiKey,
      event: '$identify',
      properties: {
        ...userData,
        signup_date: new Date().toISOString()
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
        console.log('User identified successfully');
      }
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  // Auto-track page visit on initialization
  init() {
    // Track page visit immediately
    this.trackSignupPageVisit();
    
    // Set up form submission tracking if forms exist
    this.setupFormTracking();
  }

  setupFormTracking() {
    // Track any form submissions on the page
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        const formData = new FormData(form);
        const formObject = {};
        for (let [key, value] of formData.entries()) {
          // Don't track sensitive data like passwords
          if (!key.toLowerCase().includes('password')) {
            formObject[key] = value;
          }
        }
        this.trackSignupFormSubmission(formObject);
      }
    });
  }
}

// Auto-initialize when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const tracker = new SignupConversionTracker();
    tracker.init();
    
    // Make tracker available globally for manual tracking
    window.signupTracker = tracker;
  });
}

export default SignupConversionTracker;
