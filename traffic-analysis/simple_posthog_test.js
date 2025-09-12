// Ultra simple PostHog test with different approach
import https from 'https';

// Test with both the client key (phc_) and the project key (phx_)
const tests = [
  {
    name: 'Test with Client Key (phc_)',
    apiKey: 'REDACTED_POSTHOG_PROJECT_KEY',
    event: 'simple_test_client_key'
  },
  {
    name: 'Test with Project Key (phx_)', 
    apiKey: 'REDACTED_POSTHOG_SECRET',
    event: 'simple_test_project_key'
  }
];

async function sendSimpleEvent(apiKey, eventName) {
  const distinctId = `SIMPLE_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  const eventData = {
    api_key: apiKey,
    event: eventName,
    properties: {
      test_message: 'Hello from Node.js test!',
      timestamp: new Date().toISOString(),
      page_url: 'https://auth.ampcode.com/sign-up',
      test_id: distinctId
    },
    distinct_id: distinctId
  };

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

    console.log(`📡 Sending ${eventName} with distinct_id: ${distinctId}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const success = res.statusCode === 200;
        console.log(`${success ? '✅' : '❌'} Status: ${res.statusCode}, Response: ${data}`);
        resolve({ success, distinctId, response: data });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Simple PostHog Tests');
  console.log('=' .repeat(50));
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🔬 ${test.name}`);
    const result = await sendSimpleEvent(test.apiKey, test.event);
    results.push({ ...test, ...result });
    
    // Wait a moment between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📋 Test Summary:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.success) {
      console.log(`   🔍 Search for: "${result.distinctId}" in PostHog`);
    }
  });
  
  console.log('\n🌐 Check in PostHog:');
  console.log('   URL: https://app.posthog.com/project/176241/events');
  console.log('   Look for events: simple_test_client_key, simple_test_project_key');
}

runTests().catch(console.error);
