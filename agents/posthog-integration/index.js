// PostHog Integration Agent for Synter
// Integrates PostHog API with BigQuery for unified conversion tracking

const { PostHogAPI, AttributionExtractor, GoogleAdsTracker } = require('../../traffic-analysis/posthog_api_implementation');
const { BigQuery } = require('@google-cloud/bigquery');

class PostHogBigQueryIntegrator {
  constructor(config = {}) {
    this.posthogApiKey = config.posthogApiKey || process.env.POSTHOG_API_KEY;
    this.posthogHost = config.posthogHost || process.env.POSTHOG_HOST || 'https://us.posthog.com';
    this.bigqueryProjectId = config.bigqueryProjectId || process.env.BIGQUERY_PROJECT_ID;
    this.bigqueryDataset = config.bigqueryDataset || process.env.BIGQUERY_DATASET || 'synter_analytics';
    
    // Initialize services
    this.posthog = new PostHogAPI(this.posthogApiKey, this.posthogHost);
    this.tracker = new GoogleAdsTracker(this.posthogApiKey);
    this.bigquery = new BigQuery({ projectId: this.bigqueryProjectId });
    
    console.log('🔗 PostHog-BigQuery Integrator initialized');
  }

  /**
   * Extract conversions from PostHog and send to BigQuery
   */
  async syncConversions(dateRange = { days: 7 }) {
    try {
      console.log('📊 Starting PostHog → BigQuery conversion sync...');
      
      // 1. Query PostHog for conversion events
      const conversions = await this.queryPostHogConversions(dateRange);
      console.log(`✅ Found ${conversions.length} conversions from PostHog`);
      
      // 2. Transform for BigQuery schema
      const transformedConversions = this.transformForBigQuery(conversions);
      
      // 3. Insert into BigQuery conversions table
      await this.insertConversionsToBigQuery(transformedConversions);
      console.log(`✅ Synced ${transformedConversions.length} conversions to BigQuery`);
      
      // 4. Update touchpoints table
      const touchpoints = this.extractTouchpoints(conversions);
      await this.insertTouchpointsToBigQuery(touchpoints);
      console.log(`✅ Synced ${touchpoints.length} touchpoints to BigQuery`);
      
      return {
        conversions: transformedConversions.length,
        touchpoints: touchpoints.length,
        success: true
      };
    } catch (error) {
      console.error('❌ PostHog → BigQuery sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Query PostHog for conversion events
   */
  async queryPostHogConversions(dateRange) {
    const query = `
      SELECT 
        distinct_id,
        properties,
        timestamp,
        event as conversion_event
      FROM events 
      WHERE event IN ('google_ads_conversion', 'signup', 'purchase', 'subscription_start')
        AND timestamp >= now() - interval ${dateRange.days} day
      ORDER BY timestamp DESC
    `;

    // This would use PostHog's SQL interface or Events API
    // For now, using mock data structure
    return [
      {
        distinct_id: 'user_123',
        conversion_event: 'signup',
        properties: {
          gclid: 'Cj0KCQjw...',
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'sourcegraph-amp',
          user_email: 'user@example.com',
          conversion_value: 0,
          platform: 'google'
        },
        timestamp: new Date().toISOString()
      }
    ];
  }

  /**
   * Transform PostHog events for BigQuery conversions table
   */
  transformForBigQuery(conversions) {
    return conversions.map(conv => ({
      user_id: conv.distinct_id,
      conversion_type: conv.conversion_event,
      conversion_value: conv.properties.conversion_value || 0,
      platform: conv.properties.platform || 'unknown',
      gclid: conv.properties.gclid || null,
      utm_source: conv.properties.utm_source || null,
      utm_medium: conv.properties.utm_medium || null,
      utm_campaign: conv.properties.utm_campaign || null,
      utm_term: conv.properties.utm_term || null,
      utm_content: conv.properties.utm_content || null,
      user_email: conv.properties.user_email || null,
      conversion_timestamp: conv.timestamp,
      created_at: new Date().toISOString(),
      raw_properties: JSON.stringify(conv.properties)
    }));
  }

  /**
   * Extract touchpoint data from conversions
   */
  extractTouchpoints(conversions) {
    return conversions.map(conv => ({
      user_id: conv.distinct_id,
      platform: this.determinePlatform(conv.properties),
      click_id: conv.properties.gclid || conv.properties.fbclid || null,
      utm_source: conv.properties.utm_source,
      utm_medium: conv.properties.utm_medium,
      utm_campaign: conv.properties.utm_campaign,
      landing_page: conv.properties.current_url || null,
      referrer: conv.properties.referrer || null,
      timestamp: conv.timestamp,
      created_at: new Date().toISOString()
    }));
  }

  /**
   * Determine platform from properties
   */
  determinePlatform(properties) {
    if (properties.gclid) return 'google';
    if (properties.fbclid) return 'facebook';
    if (properties.utm_source === 'reddit') return 'reddit';
    if (properties.utm_source === 'twitter') return 'twitter';
    if (properties.utm_source === 'linkedin') return 'linkedin';
    return 'other';
  }

  /**
   * Insert conversions into BigQuery
   */
  async insertConversionsToBigQuery(conversions) {
    const dataset = this.bigquery.dataset(this.bigqueryDataset);
    const table = dataset.table('conversions');
    
    // Ensure table exists
    const [exists] = await table.exists();
    if (!exists) {
      await this.createConversionsTable();
    }
    
    // Insert rows
    await table.insert(conversions);
  }

  /**
   * Insert touchpoints into BigQuery
   */
  async insertTouchpointsToBigQuery(touchpoints) {
    const dataset = this.bigquery.dataset(this.bigqueryDataset);
    const table = dataset.table('touchpoints');
    
    // Ensure table exists
    const [exists] = await table.exists();
    if (!exists) {
      await this.createTouchpointsTable();
    }
    
    // Insert rows
    await table.insert(touchpoints);
  }

  /**
   * Create conversions table in BigQuery
   */
  async createConversionsTable() {
    const dataset = this.bigquery.dataset(this.bigqueryDataset);
    const table = dataset.table('conversions');
    
    const schema = [
      { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'conversion_type', type: 'STRING', mode: 'REQUIRED' },
      { name: 'conversion_value', type: 'FLOAT', mode: 'NULLABLE' },
      { name: 'platform', type: 'STRING', mode: 'REQUIRED' },
      { name: 'gclid', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_source', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_medium', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_campaign', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_term', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_content', type: 'STRING', mode: 'NULLABLE' },
      { name: 'user_email', type: 'STRING', mode: 'NULLABLE' },
      { name: 'conversion_timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'raw_properties', type: 'STRING', mode: 'NULLABLE' }
    ];

    await table.create({ schema });
    console.log('✅ Created conversions table in BigQuery');
  }

  /**
   * Create touchpoints table in BigQuery
   */
  async createTouchpointsTable() {
    const dataset = this.bigquery.dataset(this.bigqueryDataset);
    const table = dataset.table('touchpoints');
    
    const schema = [
      { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'platform', type: 'STRING', mode: 'REQUIRED' },
      { name: 'click_id', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_source', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_medium', type: 'STRING', mode: 'NULLABLE' },
      { name: 'utm_campaign', type: 'STRING', mode: 'NULLABLE' },
      { name: 'landing_page', type: 'STRING', mode: 'NULLABLE' },
      { name: 'referrer', type: 'STRING', mode: 'NULLABLE' },
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
    ];

    await table.create({ schema });
    console.log('✅ Created touchpoints table in BigQuery');
  }

  /**
   * Generate attribution reports combining PostHog and BigQuery data
   */
  async generateAttributionReport(dateRange = { days: 30 }) {
    const query = `
      WITH conversions_with_touchpoints AS (
        SELECT 
          c.user_id,
          c.conversion_type,
          c.conversion_value,
          c.conversion_timestamp,
          t.platform,
          t.utm_source,
          t.utm_medium,
          t.utm_campaign,
          ROW_NUMBER() OVER (PARTITION BY c.user_id ORDER BY t.timestamp ASC) as touch_order,
          ROW_NUMBER() OVER (PARTITION BY c.user_id ORDER BY t.timestamp DESC) as reverse_touch_order
        FROM \`${this.bigqueryProjectId}.${this.bigqueryDataset}.conversions\` c
        LEFT JOIN \`${this.bigqueryProjectId}.${this.bigqueryDataset}.touchpoints\` t
        ON c.user_id = t.user_id
        WHERE c.conversion_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${dateRange.days} DAY)
      )
      SELECT 
        utm_source,
        utm_medium,
        utm_campaign,
        platform,
        COUNT(DISTINCT user_id) as unique_conversions,
        SUM(conversion_value) as total_revenue,
        AVG(conversion_value) as avg_order_value,
        -- First touch attribution
        COUNT(DISTINCT CASE WHEN touch_order = 1 THEN user_id END) as first_touch_conversions,
        -- Last touch attribution  
        COUNT(DISTINCT CASE WHEN reverse_touch_order = 1 THEN user_id END) as last_touch_conversions
      FROM conversions_with_touchpoints
      WHERE utm_source IS NOT NULL
      GROUP BY utm_source, utm_medium, utm_campaign, platform
      ORDER BY unique_conversions DESC
    `;

    const [job] = await this.bigquery.createQueryJob({ query });
    const [rows] = await job.getQueryResults();
    
    return rows;
  }
}

// Export for use as an agent
module.exports = {
  PostHogBigQueryIntegrator,
  
  // Agent function for orchestrator
  async run(params = {}) {
    const integrator = new PostHogBigQueryIntegrator();
    const result = await integrator.syncConversions(params.dateRange);
    
    if (params.generateReport) {
      const report = await integrator.generateAttributionReport(params.dateRange);
      result.attributionReport = report;
    }
    
    return result;
  }
};
