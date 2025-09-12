// Test script to verify PostHog signup conversion tracking
// This simulates the signup_conversion_tracker.js functionality

import https from 'https';
import http from 'http';

class SignupConversionTest {
  constructor() {
    this.apiKey = 'REDACTED_POSTHOG_PROJECT_KEY';
    this.baseUrl = 'https://app.posthog.com';
    this.distinctId = 'test_user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Simulate the browser environment data
  getTestData() {
    return {
      // Simulated URL parameters for auth.ampcode.com/sign-up
      client_id: 'client_01JNSEYM3V0J5AXK4YXNXRXTGP',
      redirect_uri: 'https://ampcode.com/auth/callback',
      response_type: 'code',
      authorization_session_id: '01JV53DW6QM6AMSCCK1QRXAGCY',
      
      // Simulated referrer data
      $referrer: 'https://google.com/search?q=ampcode',
      $referring_domain: 'google.com',
      referrer_source: 'google',
      referrer_medium: 'organic_search',
      
      // Page data
      $current_url: 'https://auth.ampcode.com/sign-up?client_id=client_01JNSEYM3V0J5AXK4YXNXRXTGP&redirect_uri=https%3A%2F%2Fampcode.com%2Fauth%2Fcallback&response_type=code&authorization_session_id=01JV53DW6QM6AMSCCK1QRXAGCY',
      page_title: 'Sign Up - Ampcode Auth',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      screen_resolution: '1920x1080',
      timestamp: new Date().toISOString()
    };
  }

  async testSignupPageVisit() {
    console.log('🧪 Testing signup page visit tracking...');
    
    const testData = this.getTestData();
    
    const eventData = {
      api_key: this.apiKey,
      event: 'signup_page_visit',
      properties: testData,
      distinct_id: this.distinctId
    };

    return this.sendToPostHog(eventData);
  }

  async testSignupFormSubmission() {
    console.log('🧪 Testing signup form submission tracking...');
    
    const testData = this.getTestData();
    
    const eventData = {
      api_key: this.apiKey,
      event: 'signup_form_submitted',
      properties: {
        ...testData,
        email: 'test@example.com',
        signup_method: 'oauth',
        form_submit_time: new Date().toISOString(),
        time_on_page: 45000 // 45 seconds
      },
      distinct_id: this.distinctId
    };

    return this.sendToPostHog(eventData);
  }

  async testSignupCompletion() {
    console.log('🧪 Testing signup completion tracking...');
    
    const testData = this.getTestData();
    
    const eventData = {
      api_key: this.apiKey,
      event: 'signup_completed',
      properties: {
        ...testData,
        user_id: 'new_user_123',
        email: 'test@example.com',
        signup_source: 'auth_page',
        completion_time: new Date().toISOString()
      },
      distinct_id: this.distinctId
    };

    return this.sendToPostHog(eventData);
  }

  async testUserIdentification() {
    console.log('🧪 Testing user identification...');
    
    const eventData = {
      api_key: this.apiKey,
      event: '$identify',
      properties: {
        email: 'test@example.com',
        signup_date: new Date().toISOString(),
        user_id: 'new_user_123'
      },
      distinct_id: this.distinctId
    };

    return this.sendToPostHog(eventData);
  }

  sendToPostHog(eventData) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(eventData);
      
      const options = {
        hostname: 'app.posthog.com',
        port: 443,
        path: '/capture/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`✅ Event '${eventData.event}' sent successfully`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${data}`);
            resolve({ success: true, status: res.statusCode, data });
          } else {
            console.log(`❌ Failed to send event '${eventData.event}'`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${data}`);
            resolve({ success: false, status: res.statusCode, error: data });
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ Error sending event '${eventData.event}':`, error.message);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  async runAllTests() {
    console.log('🚀 Starting PostHog Signup Conversion Tracking Tests');
    console.log(`📊 Using Project: 176241`);
    console.log(`👤 Test User ID: ${this.distinctId}`);
    console.log('=' .repeat(60));

    try {
      // Test each event type
      await this.testSignupPageVisit();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      await this.testSignupFormSubmission();
      await new Promise(resolve => setTimeout(resolve, 1000));

      await this.testSignupCompletion();
      await new Promise(resolve => setTimeout(resolve, 1000));

      await this.testUserIdentification();

      console.log('=' .repeat(60));
      console.log('✅ All tests completed!');
      console.log('');
      console.log('🔍 Check PostHog for events:');
      console.log('   1. Go to https://app.posthog.com');
      console.log('   2. Navigate to Activity → Live Events');
      console.log('   3. Look for these events:');
      console.log('      - signup_page_visit');
      console.log('      - signup_form_submitted');
      console.log('      - signup_completed');
      console.log('      - $identify');
      console.log(`   4. Filter by distinct_id: ${this.distinctId}`);

    } catch (error) {
      console.log('❌ Test failed:', error.message);
    }
  }
}

// Run the tests
const tester = new SignupConversionTest();
tester.runAllTests();
