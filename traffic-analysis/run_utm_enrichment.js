import UTMEnrichment from './utm_enrichment.js';

// Initialize with PostHog production project
const enricher = new UTMEnrichment('REDACTED_POSTHOG_PROJECT_KEY', '176241');

// Process the last 500 pageview events for UTM parameters
enricher.processAndEnrich(500).then(result => {
  console.log('UTM Enrichment Results:');
  console.log('- Events processed:', result.processed);
  console.log('- Events with UTM data sent:', result.sent);
  console.log('- Failed sends:', result.failed);
  
  if (result.processed === 0) {
    console.log('\nNo UTM parameters found in any pageview URLs.');
    console.log('This means either:');
    console.log('1. No traffic has come with UTM parameters');
    console.log('2. UTM parameters are being stripped before reaching PostHog');
    console.log('3. The UTM-tagged visits happened outside the last 500 pageviews');
  }
}).catch(error => {
  console.error('Error during UTM enrichment:', error);
});
