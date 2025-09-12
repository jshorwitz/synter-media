#!/usr/bin/env node

// PostHog UTM Parameter Update Script
// Updates existing events with UTM parameters extracted from URLs

// Using native fetch (Node.js 18+)

class PostHogUTMUpdater {
  constructor(apiKey, projectId) {
    this.apiKey = apiKey || 'REDACTED_POSTHOG_SECRET';
    this.projectId = projectId || '176241';
    this.baseUrl = 'https://app.posthog.com';
  }

  // Extract UTM parameters from URL
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

  // Query PostHog using HogQL
  async queryPostHog(query) {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${this.projectId}/query/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
        throw new Error(`PostHog API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('PostHog query error:', error);
      throw error;
    }
  }

  // Send custom event to PostHog with UTM data
  async sendEventWithUTM(distinctId, eventName, properties, utmParams) {
    try {
      const eventData = {
        api_key: this.apiKey,
        event: eventName,
        distinct_id: distinctId,
        properties: {
          ...properties,
          ...utmParams,
          utm_enriched: true,
          utm_enriched_at: new Date().toISOString()
        }
      };

      const response = await fetch(`${this.baseUrl}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending enriched event:', error);
      return false;
    }
  }

  // Get events without UTM parameters that have URLs with UTM data
  async getEventsToEnrich(days = 7, limit = 1000) {
    console.log(`🔍 Finding events from last ${days} days that need UTM enrichment...`);
    
    const query = `
      SELECT 
        uuid,
        distinct_id,
        event,
        timestamp,
        properties.$current_url as current_url,
        properties.$referrer as referrer,
        properties
      FROM events 
      WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND (
          properties.$current_url LIKE '%utm_%' OR 
          properties.$referrer LIKE '%utm_%'
        )
        AND (
          properties.utm_source IS NULL OR 
          properties.utm_medium IS NULL OR 
          properties.utm_campaign IS NULL
        )
        AND properties.$current_url LIKE '%ampcode.com%'
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    return await this.queryPostHog(query);
  }

  // Process events and send enriched versions
  async enrichEvents(days = 7, limit = 1000) {
    console.log('🚀 Starting UTM parameter enrichment...');
    
    try {
      const events = await this.getEventsToEnrich(days, limit);
      
      if (events.length === 0) {
        console.log('✅ No events found that need UTM enrichment.');
        return { processed: 0, enriched: 0 };
      }

      console.log(`📊 Found ${events.length} events to process`);
      
      let enrichedCount = 0;
      const utmSources = new Set();
      
      for (const event of events) {
        // Extract UTM from current URL first, then referrer
        let utmParams = this.extractUTMFromUrl(event.current_url);
        if (Object.keys(utmParams).length === 0) {
          utmParams = this.extractUTMFromUrl(event.referrer);
        }
        
        if (Object.keys(utmParams).length > 0) {
          // Track unique UTM sources
          if (utmParams.utm_source) {
            utmSources.add(utmParams.utm_source);
          }
          
          // Send enriched event
          const success = await this.sendEventWithUTM(
            event.distinct_id,
            `${event.event}_utm_enriched`,
            event.properties,
            utmParams
          );
          
          if (success) {
            enrichedCount++;
            console.log(`✅ Enriched event ${enrichedCount}/${events.length}: ${utmParams.utm_source || 'unknown'}`);
          } else {
            console.log(`❌ Failed to enrich event for ${event.distinct_id}`);
          }
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('\n🎯 UTM Sources Found:');
      Array.from(utmSources).sort().forEach(source => {
        console.log(`  - ${source}`);
      });
      
      return {
        processed: events.length,
        enriched: enrichedCount,
        utmSources: Array.from(utmSources)
      };
      
    } catch (error) {
      console.error('❌ Error during enrichment:', error);
      throw error;
    }
  }

  // Test connection to PostHog API
  async testConnection() {
    try {
      console.log('🔗 Testing PostHog API connection...');
      
      const testQuery = `
        SELECT event, count() as count 
        FROM events 
        WHERE timestamp >= now() - INTERVAL 1 DAY
          AND properties.$current_url LIKE '%ampcode.com%'
        GROUP BY event 
        ORDER BY count DESC 
        LIMIT 5
      `;
      
      const results = await this.queryPostHog(testQuery);
      
      console.log('✅ Connection successful!');
      console.log('📊 Recent events from ampcode.com:');
      results.forEach(row => {
        console.log(`  ${row[0]}: ${row[1]} events`);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }

  // Check current UTM parameter coverage
  async checkUTMCoverage(days = 7) {
    console.log(`📈 Checking UTM parameter coverage for last ${days} days...`);
    
    const query = `
      SELECT 
        'Total Events' as metric,
        count() as value
      FROM events 
      WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$current_url LIKE '%ampcode.com%'
        
      UNION ALL
      
      SELECT 
        'Events with UTM Source' as metric,
        count() as value
      FROM events 
      WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$current_url LIKE '%ampcode.com%'
        AND (
          properties.utm_source IS NOT NULL OR
          extractURLParameter(properties.$current_url, 'utm_source') IS NOT NULL OR
          extractURLParameter(properties.$referrer, 'utm_source') IS NOT NULL
        )
        
      UNION ALL
      
      SELECT 
        'URLs with UTM Parameters' as metric,
        count() as value
      FROM events 
      WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$current_url LIKE '%ampcode.com%'
        AND (
          properties.$current_url LIKE '%utm_%' OR 
          properties.$referrer LIKE '%utm_%'
        )
    `;
    
    try {
      const results = await this.queryPostHog(query);
      
      console.log('\n📊 UTM Coverage Report:');
      results.forEach(row => {
        console.log(`  ${row[0]}: ${row[1]}`);
      });
      
      return results;
    } catch (error) {
      console.error('Error checking UTM coverage:', error);
      return [];
    }
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new PostHogUTMUpdater();
  
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'test':
      await updater.testConnection();
      break;
      
    case 'coverage':
      const days = parseInt(process.argv[3]) || 7;
      await updater.checkUTMCoverage(days);
      break;
      
    case 'enrich':
      const enrichDays = parseInt(process.argv[3]) || 7;
      const limit = parseInt(process.argv[4]) || 1000;
      const result = await updater.enrichEvents(enrichDays, limit);
      console.log('\n🎉 Enrichment Complete:');
      console.log(`  Processed: ${result.processed} events`);
      console.log(`  Enriched: ${result.enriched} events`);
      console.log(`  UTM Sources: ${result.utmSources?.join(', ') || 'none'}`);
      break;
      
    default:
      console.log(`
📊 PostHog UTM Parameter Updater

Usage:
  node posthog_utm_updater.js test                    # Test API connection
  node posthog_utm_updater.js coverage [days]         # Check UTM coverage (default: 7 days)
  node posthog_utm_updater.js enrich [days] [limit]   # Enrich events (default: 7 days, 1000 events)

Examples:
  node posthog_utm_updater.js test
  node posthog_utm_updater.js coverage 14
  node posthog_utm_updater.js enrich 30 500
      `);
  }
}

export default PostHogUTMUpdater;
