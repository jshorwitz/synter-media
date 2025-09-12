// UTM Enrichment Script for PostHog
// Extracts UTM parameters from URLs and sends enriched events

class UTMEnrichment {
  constructor(posthogApiKey, projectId) {
    this.apiKey = posthogApiKey;
    this.projectId = projectId;
    this.baseUrl = 'https://app.posthog.com';
  }

  // Extract UTM parameters from a URL string
  extractUTMFromUrl(url) {
    if (!url) return {};
    
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      const utmParams = {};
      
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      
      utmKeys.forEach(key => {
        const value = params.get(key);
        if (value) {
          utmParams[key] = value;
        }
      });
      
      return utmParams;
    } catch (e) {
      return {};
    }
  }

  // Fetch pageview events and enrich with UTM data
  async enrichPageviewsWithUTM(limit = 100) {
    try {
      // Fetch pageview events
      const response = await fetch(`${this.baseUrl}/api/projects/${this.projectId}/events/?event=$pageview&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const enrichedEvents = [];

      // Process each pageview event
      for (const event of data.results) {
        const currentUrl = event.properties?.$current_url;
        const referrer = event.properties?.$referrer;
        
        // Extract UTM parameters from current URL and referrer
        const currentUrlUTM = this.extractUTMFromUrl(currentUrl);
        const referrerUTM = this.extractUTMFromUrl(referrer);
        
        // Combine UTM parameters (current URL takes precedence)
        const allUTM = { ...referrerUTM, ...currentUrlUTM };
        
        // If we found UTM parameters, create an enriched event
        if (Object.keys(allUTM).length > 0) {
          const enrichedEvent = {
            api_key: this.apiKey,
            event: 'pageview_with_utm',
            timestamp: event.timestamp,
            distinct_id: event.distinct_id,
            properties: {
              ...event.properties,
              ...allUTM,
              original_event_id: event.id,
              utm_extracted_from: currentUrl && Object.keys(currentUrlUTM).length > 0 ? 'current_url' : 'referrer'
            }
          };
          
          enrichedEvents.push(enrichedEvent);
        }
      }

      return enrichedEvents;
    } catch (error) {
      console.error('Error fetching pageview events:', error);
      return [];
    }
  }

  // Send enriched events back to PostHog
  async sendEnrichedEvents(enrichedEvents) {
    const results = [];
    
    for (const eventData of enrichedEvents) {
      try {
        const response = await fetch(`${this.baseUrl}/capture/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });

        if (response.ok) {
          results.push({ success: true, event: eventData.event });
          console.log(`Successfully sent enriched event for ${eventData.distinct_id}`);
        } else {
          results.push({ success: false, error: response.statusText });
          console.error(`Failed to send enriched event:`, response.statusText);
        }
      } catch (error) {
        results.push({ success: false, error: error.message });
        console.error('Error sending enriched event:', error);
      }
    }
    
    return results;
  }

  // Main function to process and enrich events
  async processAndEnrich(limit = 100) {
    console.log(`Processing up to ${limit} pageview events...`);
    
    const enrichedEvents = await this.enrichPageviewsWithUTM(limit);
    
    if (enrichedEvents.length === 0) {
      console.log('No events with UTM parameters found in pageview data.');
      return { processed: 0, sent: 0 };
    }
    
    console.log(`Found ${enrichedEvents.length} events with UTM parameters.`);
    console.log('UTM parameters found:');
    
    enrichedEvents.forEach((event, index) => {
      const utmData = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
        if (event.properties[key]) {
          utmData[key] = event.properties[key];
        }
      });
      console.log(`Event ${index + 1}:`, utmData);
    });
    
    // Send enriched events back to PostHog
    const results = await this.sendEnrichedEvents(enrichedEvents);
    const successful = results.filter(r => r.success).length;
    
    return {
      processed: enrichedEvents.length,
      sent: successful,
      failed: enrichedEvents.length - successful
    };
  }
}

// Usage example:
// const enricher = new UTMEnrichment('REDACTED_POSTHOG_PROJECT_KEY', '176241');
// enricher.processAndEnrich(500).then(result => {
//   console.log('Processing complete:', result);
// });

export default UTMEnrichment;
