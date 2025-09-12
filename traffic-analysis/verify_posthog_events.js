// Verify PostHog events using the PostHog API
import https from 'https';

class PostHogEventVerifier {
  constructor() {
    this.projectApiKey = 'REDACTED_POSTHOG_SECRET'; // Personal API key
    this.projectId = '176241';
    this.baseUrl = 'app.posthog.com';
  }

  // Query recent events from PostHog
  async queryRecentEvents() {
    console.log('🔍 Querying PostHog for recent signup-related events...');
    
    const query = {
      query: {
        kind: 'EventsQuery',
        select: [
          'event',
          'distinct_id', 
          'timestamp',
          'properties.$referrer',
          'properties.referrer_source',
          'properties.client_id'
        ],
        where: [
          {
            type: 'events',
            key: 'event',
            value: ['signup_page_visit', 'signup_form_submitted', 'signup_completed', '$identify'],
            operator: 'in'
          }
        ],
        limit: 20,
        orderBy: ['timestamp DESC']
      }
    };

    return this.makePostHogAPIRequest('/api/projects/' + this.projectId + '/query/', query);
  }

  // Send a test event with a more identifiable name
  async sendIdentifiableTestEvent() {
    console.log('🧪 Sending easily identifiable test event...');
    
    const distinctId = 'VERIFICATION_TEST_' + Date.now();
    const eventData = {
      api_key: 'REDACTED_POSTHOG_PROJECT_KEY',
      event: 'posthog_verification_test',
      properties: {
        test_type: 'signup_tracking_verification',
        timestamp: new Date().toISOString(),
        verification_id: distinctId,
        $referrer: 'https://www.google.com/search?q=test+verification',
        referrer_source: 'google',
        referrer_medium: 'organic_search',
        client_id: 'client_01JNSEYM3V0J5AXK4YXNXRXTGP'
      },
      distinct_id: distinctId
    };

    const success = await this.sendEventToPostHog(eventData);
    if (success) {
      console.log(`✅ Verification event sent with distinct_id: ${distinctId}`);
      console.log(`🔍 Search for this in PostHog: "${distinctId}"`);
    }
    
    return distinctId;
  }

  async sendEventToPostHog(eventData) {
    return new Promise((resolve) => {
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
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve(res.statusCode === 200);
        });
      });

      req.on('error', () => resolve(false));
      req.write(postData);
      req.end();
    });
  }

  makePostHogAPIRequest(path, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.projectApiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(responseData);
              resolve(parsed);
            } catch (e) {
              console.log('❌ Failed to parse response:', responseData);
              resolve(null);
            }
          } else {
            console.log(`❌ API request failed: ${res.statusCode}`);
            console.log(`Response: ${responseData}`);
            resolve(null);
          }
        });
      });

      req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
        reject(error);
      });

      if (data) {
        req.write(postData);
      }
      req.end();
    });
  }

  async run() {
    console.log('🔧 PostHog Event Verification');
    console.log('=' .repeat(50));
    
    // First, send a very obvious test event
    const testId = await this.sendIdentifiableTestEvent();
    
    console.log('\n⏱️  Waiting 10 seconds for event to process...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Then try to query for events
    const events = await this.queryRecentEvents();
    
    if (events && events.results) {
      console.log('\n📊 Recent signup-related events found:');
      events.results.forEach((event, index) => {
        console.log(`${index + 1}. Event: ${event[0]}`);
        console.log(`   User: ${event[1]}`);
        console.log(`   Time: ${event[2]}`);
        console.log(`   Referrer: ${event[3] || 'N/A'}`);
        console.log(`   Source: ${event[4] || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ Could not retrieve events from PostHog API');
      console.log('   This might be due to API permissions or the query format');
    }
    
    console.log('🔍 Manual verification steps:');
    console.log('1. Go to https://app.posthog.com/project/176241/events');
    console.log('2. In the search box, type: "posthog_verification_test"');
    console.log(`3. Or search for distinct_id: "${testId}"`);
    console.log('4. Check the "Live events" tab for real-time events');
    console.log('5. Try the "Explore" tab to see all events');
  }
}

const verifier = new PostHogEventVerifier();
verifier.run().catch(console.error);
