#!/usr/bin/env node

// Reddit Conversions API (CAPI) Integration with PostHog
// Sends conversion events from PostHog to Reddit CAPI for ad attribution

import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

class RedditCAPIIntegration {
  constructor(config = {}) {
    // Reddit CAPI Configuration
    this.pixelId = config.pixelId || process.env.REDDIT_PIXEL_ID;
    this.accessToken = config.accessToken || process.env.REDDIT_CONVERSION_ACCESS_TOKEN;
    this.endpoint = 'https://ads-api.reddit.com/api/v2.0/conversions';
    
    // PostHog Configuration
    this.posthogApiKey = config.posthogApiKey || process.env.POSTHOG_API_KEY || 'REDACTED_POSTHOG_SECRET';
    this.posthogProjectId = config.posthogProjectId || process.env.POSTHOG_PROJECT_ID || '176241';
    this.posthogBaseUrl = 'https://app.posthog.com';
    
    // Validate required configuration
    if (!this.pixelId || !this.accessToken) {
      console.error('❌ Missing Reddit CAPI configuration:');
      console.error('  - REDDIT_PIXEL_ID required');
      console.error('  - REDDIT_CONVERSION_ACCESS_TOKEN required');
      process.exit(1);
    }
    
    // Event mapping: PostHog event names to Reddit conversion events
    this.eventMapping = {
      'signup_completed': 'Lead',
      'subscription_started': 'Subscribe',
      'purchase_completed': 'Purchase',
      'trial_started': 'FreeTrial',
      'email_verified': 'CompleteRegistration',
      'onboarding_completed': 'CompleteRegistration',
      'plan_upgraded': 'Purchase',
      'checkout_started': 'InitiateCheckout',
      'product_viewed': 'ViewContent',
      'add_to_cart': 'AddToCart',
      ...config.eventMapping
    };
    
    console.log('🔧 Reddit CAPI Integration initialized');
    console.log(`  Pixel ID: ${this.pixelId}`);
    console.log(`  PostHog Project: ${this.posthogProjectId}`);
  }

  // Hash email with SHA-256 if not already hashed
  hashEmail(email) {
    if (!email) return null;
    
    // Check if already hashed (64 character hex string)
    if (/^[a-f0-9]{64}$/i.test(email)) {
      return email.toLowerCase();
    }
    
    // Hash and normalize email
    const normalized = email.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  // Hash external ID with SHA-256 if not already hashed
  hashExternalId(id) {
    if (!id) return null;
    
    // Check if already hashed
    if (/^[a-f0-9]{64}$/i.test(id)) {
      return id.toLowerCase();
    }
    
    return crypto.createHash('sha256').update(String(id)).digest('hex');
  }

  // Generate unique conversion ID for deduplication
  generateConversionId(event) {
    const base = `${event.distinct_id}_${event.event}_${event.timestamp}`;
    return crypto.createHash('sha256').update(base).digest('hex').substring(0, 32);
  }

  // Transform PostHog event to Reddit CAPI format
  transformEvent(posthogEvent) {
    const redditEvent = posthogEvent.event;
    const properties = posthogEvent.properties || {};
    const timestamp = new Date(posthogEvent.timestamp).toISOString();
    
    // Map PostHog event to Reddit conversion event
    const conversionEventType = this.eventMapping[posthogEvent.event] || 'Custom';
    
    // Extract UTM source to verify Reddit attribution
    const utmSource = properties.utm_source || 
                     (properties.$current_url ? this.extractUTMFromUrl(properties.$current_url, 'utm_source') : null) ||
                     (properties.$referrer ? this.extractUTMFromUrl(properties.$referrer, 'utm_source') : null);
    
    // Build conversion event
    const conversionEvent = {
      // Required fields
      pixel_id: this.pixelId,
      event_type: conversionEventType,
      event_time: Math.floor(new Date(posthogEvent.timestamp).getTime() / 1000), // Unix timestamp
      conversion_id: this.generateConversionId(posthogEvent),
      
      // Event metadata
      event_metadata: {
        event_name: redditEvent,
        custom_data: {
          posthog_event: posthogEvent.event,
          utm_source: utmSource,
          page_url: properties.$current_url,
          referrer: properties.$referrer
        }
      },
      
      // User data for matching
      user_data: {}
    };
    
    // Add value and currency if available
    if (properties.revenue || properties.value) {
      conversionEvent.event_metadata.value = parseFloat(properties.revenue || properties.value);
      conversionEvent.event_metadata.currency = properties.currency || 'USD';
    }
    
    if (properties.quantity || properties.item_count) {
      conversionEvent.event_metadata.item_count = parseInt(properties.quantity || properties.item_count);
    }
    
    // Add user data for attribution matching
    if (properties.email || properties.$user_email) {
      conversionEvent.user_data.email = this.hashEmail(properties.email || properties.$user_email);
    }
    
    if (posthogEvent.distinct_id) {
      conversionEvent.user_data.external_id = this.hashExternalId(posthogEvent.distinct_id);
    }
    
    if (properties.$ip) {
      conversionEvent.user_data.ip_address = properties.$ip;
    }
    
    if (properties.$user_agent || properties.$useragent) {
      conversionEvent.user_data.user_agent = properties.$user_agent || properties.$useragent;
    }
    
    if (properties.$screen_width) {
      conversionEvent.user_data.screen_width = parseInt(properties.$screen_width);
    }
    
    if (properties.$screen_height) {
      conversionEvent.user_data.screen_height = parseInt(properties.$screen_height);
    }
    
    // Add Reddit UUID if available (from Reddit Pixel)
    if (properties.reddit_uuid || properties.$reddit_uuid) {
      conversionEvent.user_data.uuid = properties.reddit_uuid || properties.$reddit_uuid;
    }
    
    return conversionEvent;
  }

  // Extract UTM parameter from URL
  extractUTMFromUrl(url, param) {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get(param);
    } catch {
      return null;
    }
  }

  // Send conversion event to Reddit CAPI
  async sendConversionEvent(conversionEvent) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PostHog-Reddit-CAPI-Integration/1.0'
        },
        body: JSON.stringify({
          data: [conversionEvent]
        })
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status}`);
      console.log(`Response text: ${responseText}`);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Reddit CAPI returned invalid JSON. Status: ${response.status}, Response: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(`Reddit CAPI Error: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      return {
        success: true,
        response: responseData,
        conversionId: conversionEvent.conversion_id
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        conversionId: conversionEvent.conversion_id
      };
    }
  }

  // Query PostHog for conversion events
  async getPostHogConversionEvents(hours = 1) {
    const eventNames = Object.keys(this.eventMapping).map(name => `'${name}'`).join(',');
    
    const query = `
      SELECT 
        uuid,
        distinct_id,
        event,
        timestamp,
        properties
      FROM events 
      WHERE timestamp >= now() - INTERVAL ${hours} HOUR
        AND event IN (${eventNames})
        AND (
          extractURLParameter(properties.$current_url, 'utm_source') = 'reddit' OR
          extractURLParameter(properties.$referrer, 'utm_source') = 'reddit' OR
          properties.utm_source = 'reddit'
        )
      ORDER BY timestamp DESC
      LIMIT 1000
    `;

    try {
      const response = await fetch(`${this.posthogBaseUrl}/api/projects/${this.posthogProjectId}/query/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.posthogApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query: query
          }
        })
      });

      if (!response.ok) {
        throw new Error(`PostHog API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
      
    } catch (error) {
      console.error('❌ Error querying PostHog:', error);
      return [];
    }
  }

  // Process conversion events from PostHog to Reddit CAPI
  async processConversions(hours = 1) {
    console.log(`🔄 Processing Reddit conversions from last ${hours} hour(s)...`);
    
    try {
      // Get conversion events from PostHog
      const events = await this.getPostHogConversionEvents(hours);
      
      if (events.length === 0) {
        console.log('✅ No Reddit-attributed conversion events found');
        return { processed: 0, sent: 0, errors: 0 };
      }
      
      console.log(`📊 Found ${events.length} Reddit conversion events to process`);
      
      let sentCount = 0;
      let errorCount = 0;
      const results = [];
      
      for (const eventRow of events) {
        // Parse PostHog event data
        const posthogEvent = {
          uuid: eventRow[0],
          distinct_id: eventRow[1],
          event: eventRow[2],
          timestamp: eventRow[3],
          properties: eventRow[4]
        };
        
        // Transform to Reddit CAPI format
        const conversionEvent = this.transformEvent(posthogEvent);
        
        // Send to Reddit CAPI
        const result = await this.sendConversionEvent(conversionEvent);
        results.push(result);
        
        if (result.success) {
          sentCount++;
          console.log(`✅ Sent: ${posthogEvent.event} (${result.conversionId})`);
        } else {
          errorCount++;
          console.log(`❌ Failed: ${posthogEvent.event} - ${result.error}`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const summary = {
        processed: events.length,
        sent: sentCount,
        errors: errorCount,
        results: results
      };
      
      console.log('\n🎯 Processing Summary:');
      console.log(`  Events processed: ${summary.processed}`);
      console.log(`  Successfully sent: ${summary.sent}`);
      console.log(`  Errors: ${summary.errors}`);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Error processing conversions:', error);
      throw error;
    }
  }

  // Test Reddit CAPI connection
  async testConnection() {
    console.log('🧪 Testing Reddit CAPI connection...');
    
    // Create a test conversion event
    const testEvent = {
      pixel_id: this.pixelId,
      event_type: 'Custom',
      event_time: Math.floor(Date.now() / 1000),
      conversion_id: 'test_' + Date.now(),
      event_metadata: {
        event_name: 'test_connection',
        custom_data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      },
      user_data: {
        external_id: this.hashExternalId('test_user_123')
      }
    };
    
    const result = await this.sendConversionEvent(testEvent);
    
    if (result.success) {
      console.log('✅ Reddit CAPI connection successful!');
      console.log(`  Test conversion ID: ${result.conversionId}`);
    } else {
      console.log('❌ Reddit CAPI connection failed:');
      console.log(`  Error: ${result.error}`);
    }
    
    return result.success;
  }

  // Monitor and sync conversions continuously
  async startMonitoring(intervalMinutes = 5) {
    console.log(`🔄 Starting Reddit CAPI monitoring (every ${intervalMinutes} minutes)...`);
    
    const processInterval = async () => {
      try {
        await this.processConversions(intervalMinutes / 60);
      } catch (error) {
        console.error('❌ Error in monitoring cycle:', error);
      }
    };
    
    // Process immediately
    await processInterval();
    
    // Set up recurring processing
    setInterval(processInterval, intervalMinutes * 60 * 1000);
    
    console.log('📡 Monitoring started. Press Ctrl+C to stop.');
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'help';
  const integration = new RedditCAPIIntegration();
  
  switch (command) {
    case 'test':
      await integration.testConnection();
      break;
      
    case 'process':
      const hours = parseFloat(process.argv[3]) || 1;
      await integration.processConversions(hours);
      break;
      
    case 'monitor':
      const intervalMinutes = parseInt(process.argv[3]) || 5;
      await integration.startMonitoring(intervalMinutes);
      break;
      
    default:
      console.log(`
🎯 Reddit Conversions API (CAPI) Integration

Usage:
  node reddit_capi_integration.js test                    # Test Reddit CAPI connection
  node reddit_capi_integration.js process [hours]         # Process conversions from last N hours (default: 1)
  node reddit_capi_integration.js monitor [minutes]       # Start continuous monitoring (default: 5 min intervals)

Environment Variables Required:
  REDDIT_PIXEL_ID                  # Your Reddit Ads Pixel ID
  REDDIT_CONVERSION_ACCESS_TOKEN   # Your Reddit Conversions API access token

Environment Variables Optional:
  POSTHOG_API_KEY                  # PostHog API key (defaults to embedded key)
  POSTHOG_PROJECT_ID               # PostHog project ID (defaults to 176241)

Examples:
  node reddit_capi_integration.js test
  node reddit_capi_integration.js process 24
  node reddit_capi_integration.js monitor 10

Setup Instructions:
1. Get your Reddit Pixel ID from Reddit Ads Manager
2. Generate a Conversions API access token in Reddit Ads settings
3. Set environment variables or add them to a .env file
4. Run the test command to verify connection
5. Use process command to send recent conversions
6. Use monitor command for continuous syncing
      `);
  }
}

export default RedditCAPIIntegration;
