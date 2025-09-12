#!/usr/bin/env node

// PostHog Referral Source Insight Generator
// Creates insights for traffic from Reddit, Google, and Sourcegraph referrers/UTM sources

import dotenv from 'dotenv';
dotenv.config();

class PostHogReferralInsight {
  constructor() {
    this.apiKey = process.env.POSTHOG_API_KEY || 'REDACTED_POSTHOG_SECRET';
    this.projectId = process.env.POSTHOG_PROJECT_ID || '176241';
    this.baseUrl = 'https://app.posthog.com';
    
    console.log('🔧 PostHog Referral Insight initialized');
    console.log(`  Project ID: ${this.projectId}`);
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

  // Extract source from referrer URL
  getSourceFromUrl(url) {
    if (!url) return 'direct';
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('reddit.com')) return 'reddit';
      if (hostname.includes('google.')) return 'google';
      if (hostname.includes('sourcegraph.com')) return 'sourcegraph';
      if (hostname.includes('bing.')) return 'bing';
      if (hostname.includes('duckduckgo.')) return 'duckduckgo';
      if (hostname.includes('twitter.com') || hostname.includes('t.co')) return 'twitter';
      if (hostname.includes('linkedin.com')) return 'linkedin';
      if (hostname.includes('facebook.com')) return 'facebook';
      
      return hostname;
    } catch {
      return 'unknown';
    }
  }

  // Get referral traffic breakdown for the last N days
  async getReferralTrafficBreakdown(days = 7) {
    console.log(`📊 Getting referral traffic breakdown for last ${days} days...`);
    
    const query = `
      SELECT 
        extractURLParameter(properties.$current_url, 'utm_source') as utm_source,
        count() as count
      FROM events 
      WHERE timestamp >= now() - INTERVAL ${days} DAY
        AND event = '$pageview'
        AND properties.$current_url LIKE '%ampcode.com%'
      GROUP BY utm_source 
      ORDER BY count DESC 
      LIMIT 20
    `;

    return await this.queryPostHog(query);
  }

  // Get specific Reddit, Google, Sourcegraph traffic details
  async getTargetSourceDetails(days = 7) {
    console.log(`🎯 Getting detailed traffic from Reddit, Google, and Sourcegraph (last ${days} days)...`);
    
    const query = `
      SELECT 
        CASE 
          WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'reddit' OR 
               extractURLParameter(properties.$referrer, 'utm_source') = 'reddit' OR
               properties.$referrer LIKE '%reddit.com%' THEN 'reddit'
          WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'google' OR 
               extractURLParameter(properties.$referrer, 'utm_source') = 'google' OR
               properties.$referrer LIKE '%google.%' THEN 'google'  
          WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'sourcegraph' OR 
               extractURLParameter(properties.$referrer, 'utm_source') = 'sourcegraph' OR
               properties.$referrer LIKE '%sourcegraph.com%' THEN 'sourcegraph'
        END as source,
        extractURLParameter(properties.$current_url, 'utm_medium') as utm_medium,
        extractURLParameter(properties.$current_url, 'utm_campaign') as utm_campaign,
        properties.$referrer as referrer_url,
        properties.$current_url as landing_page,
        count() as pageviews,
        countDistinct(distinct_id) as unique_visitors,
        min(timestamp) as first_seen,
        max(timestamp) as last_seen
      FROM events 
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$current_url LIKE '%ampcode.com%'
        AND (
          extractURLParameter(properties.$current_url, 'utm_source') IN ('reddit', 'google', 'sourcegraph') OR 
          extractURLParameter(properties.$referrer, 'utm_source') IN ('reddit', 'google', 'sourcegraph') OR
          properties.$referrer LIKE '%reddit.com%' OR 
          properties.$referrer LIKE '%google.%' OR 
          properties.$referrer LIKE '%sourcegraph.com%'
        )
      GROUP BY source, utm_medium, utm_campaign, referrer_url, landing_page
      HAVING source IS NOT NULL
      ORDER BY source, pageviews DESC
    `;

    return await this.queryPostHog(query);
  }

  // Get top landing pages for each source
  async getTopLandingPagesBySource(days = 7) {
    console.log(`📄 Getting top landing pages by source (last ${days} days)...`);
    
    const query = `
      SELECT 
        CASE 
          WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'reddit' OR 
               extractURLParameter(properties.$referrer, 'utm_source') = 'reddit' OR
               properties.$referrer LIKE '%reddit.com%' THEN 'reddit'
          WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'google' OR 
               extractURLParameter(properties.$referrer, 'utm_source') = 'google' OR
               properties.$referrer LIKE '%google.%' THEN 'google'  
          WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'sourcegraph' OR 
               extractURLParameter(properties.$referrer, 'utm_source') = 'sourcegraph' OR
               properties.$referrer LIKE '%sourcegraph.com%' THEN 'sourcegraph'
        END as source,
        properties.$pathname as landing_page,
        count() as pageviews,
        countDistinct(distinct_id) as unique_visitors
      FROM events 
      WHERE event = '$pageview'
        AND timestamp >= now() - INTERVAL ${days} DAY
        AND properties.$current_url LIKE '%ampcode.com%'
        AND (
          extractURLParameter(properties.$current_url, 'utm_source') IN ('reddit', 'google', 'sourcegraph') OR 
          extractURLParameter(properties.$referrer, 'utm_source') IN ('reddit', 'google', 'sourcegraph') OR
          properties.$referrer LIKE '%reddit.com%' OR 
          properties.$referrer LIKE '%google.%' OR 
          properties.$referrer LIKE '%sourcegraph.com%'
        )
      GROUP BY source, landing_page
      HAVING source IS NOT NULL
      ORDER BY source, pageviews DESC
    `;

    return await this.queryPostHog(query);
  }

  // Format and display results
  displayResults(title, results, columns) {
    console.log(`\n${title}`);
    console.log('='.repeat(title.length));
    
    if (results.length === 0) {
      console.log('No data found.');
      return;
    }
    
    // Display column headers
    const header = columns.join(' | ');
    console.log(header);
    console.log('-'.repeat(header.length));
    
    // Display data rows
    results.forEach(row => {
      const formattedRow = columns.map((_, index) => {
        const value = row[index];
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'string' && value.length > 30) {
          return value.substring(0, 30) + '...';
        }
        return String(value);
      });
      console.log(formattedRow.join(' | '));
    });
  }

  // Generate comprehensive referral source report
  async generateReferralReport(days = 7) {
    console.log(`🚀 Generating referral source report for last ${days} days...`);
    
    try {
      // Get overall traffic breakdown
      const overallTraffic = await this.getReferralTrafficBreakdown(days);
      this.displayResults(
        `📊 Overall Traffic Sources (Last ${days} Days)`,
        overallTraffic,
        ['Source', 'Pageviews', 'Unique Visitors']
      );
      
      // Get detailed target source info
      const targetSourceDetails = await this.getTargetSourceDetails(days);
      this.displayResults(
        `🎯 Reddit, Google & Sourcegraph Traffic Details`,
        targetSourceDetails,
        ['Source', 'UTM Medium', 'UTM Campaign', 'Referrer URL', 'Landing Page', 'Pageviews', 'Unique Visitors', 'First Seen', 'Last Seen']
      );
      
      // Get top landing pages by source
      const landingPages = await this.getTopLandingPagesBySource(days);
      this.displayResults(
        `📄 Top Landing Pages by Source`,
        landingPages,
        ['Source', 'Landing Page', 'Pageviews', 'Unique Visitors']
      );
      
      // Generate summary
      const redditTraffic = overallTraffic.filter(row => row[0].includes('reddit'));
      const googleTraffic = overallTraffic.filter(row => row[0].includes('google'));
      const sourcegraphTraffic = overallTraffic.filter(row => row[0].includes('sourcegraph'));
      
      console.log('\n🎯 Summary:');
      console.log(`  Reddit Traffic: ${redditTraffic.reduce((sum, row) => sum + (row[1] || 0), 0)} pageviews, ${redditTraffic.reduce((sum, row) => sum + (row[2] || 0), 0)} unique visitors`);
      console.log(`  Google Traffic: ${googleTraffic.reduce((sum, row) => sum + (row[1] || 0), 0)} pageviews, ${googleTraffic.reduce((sum, row) => sum + (row[2] || 0), 0)} unique visitors`);
      console.log(`  Sourcegraph Traffic: ${sourcegraphTraffic.reduce((sum, row) => sum + (row[1] || 0), 0)} pageviews, ${sourcegraphTraffic.reduce((sum, row) => sum + (row[2] || 0), 0)} unique visitors`);
      
      return {
        overallTraffic,
        targetSourceDetails,
        landingPages
      };
      
    } catch (error) {
      console.error('❌ Error generating referral report:', error);
      throw error;
    }
  }

  // Create PostHog insight URL (for manual creation in UI)
  generatePostHogInsightURLs() {
    console.log('\n🔗 PostHog Insight Creation URLs:');
    console.log('\nTo create these insights manually in PostHog:');
    console.log(`1. Go to: ${this.baseUrl}/project/${this.projectId}/insights`);
    console.log('2. Click "New insight" > "SQL"');
    console.log('3. Use one of these HogQL queries:\n');
    
    console.log('📊 Overall Referral Sources Breakdown:');
    console.log(`
SELECT 
  CASE 
    WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'reddit' THEN 'reddit (utm)'
    WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'google' THEN 'google (utm)'  
    WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'sourcegraph' THEN 'sourcegraph (utm)'
    WHEN extractURLParameter(properties.$referrer, 'utm_source') = 'reddit' THEN 'reddit (utm)'
    WHEN extractURLParameter(properties.$referrer, 'utm_source') = 'google' THEN 'google (utm)'
    WHEN extractURLParameter(properties.$referrer, 'utm_source') = 'sourcegraph' THEN 'sourcegraph (utm)'
    WHEN properties.$referrer LIKE '%reddit.com%' THEN 'reddit (referrer)'
    WHEN properties.$referrer LIKE '%google.%' THEN 'google (referrer)'
    WHEN properties.$referrer LIKE '%sourcegraph.com%' THEN 'sourcegraph (referrer)'
    WHEN properties.$referrer IS NULL OR properties.$referrer = '' THEN 'direct'
    ELSE 'other'
  END as source,
  count() as pageviews,
  countDistinct(distinct_id) as unique_visitors
FROM events 
WHERE event = '$pageview'
  AND timestamp >= now() - INTERVAL 7 DAY
  AND properties.$current_url LIKE '%ampcode.com%'
GROUP BY source
ORDER BY pageviews DESC
    `);

    console.log('\n🎯 Reddit/Google/Sourcegraph Traffic Details:');
    console.log(`
SELECT 
  CASE 
    WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'reddit' OR 
         extractURLParameter(properties.$referrer, 'utm_source') = 'reddit' OR
         properties.$referrer LIKE '%reddit.com%' THEN 'reddit'
    WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'google' OR 
         extractURLParameter(properties.$referrer, 'utm_source') = 'google' OR
         properties.$referrer LIKE '%google.%' THEN 'google'  
    WHEN extractURLParameter(properties.$current_url, 'utm_source') = 'sourcegraph' OR 
         extractURLParameter(properties.$referrer, 'utm_source') = 'sourcegraph' OR
         properties.$referrer LIKE '%sourcegraph.com%' THEN 'sourcegraph'
  END as source,
  extractURLParameter(properties.$current_url, 'utm_medium') as utm_medium,
  extractURLParameter(properties.$current_url, 'utm_campaign') as utm_campaign,
  count() as pageviews,
  countDistinct(distinct_id) as unique_visitors
FROM events 
WHERE event = '$pageview'
  AND timestamp >= now() - INTERVAL 7 DAY
  AND properties.$current_url LIKE '%ampcode.com%'
  AND (
    extractURLParameter(properties.$current_url, 'utm_source') IN ('reddit', 'google', 'sourcegraph') OR 
    extractURLParameter(properties.$referrer, 'utm_source') IN ('reddit', 'google', 'sourcegraph') OR
    properties.$referrer LIKE '%reddit.com%' OR 
    properties.$referrer LIKE '%google.%' OR 
    properties.$referrer LIKE '%sourcegraph.com%'
  )
GROUP BY source, utm_medium, utm_campaign
HAVING source IS NOT NULL
ORDER BY source, pageviews DESC
    `);
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'help';
  const insight = new PostHogReferralInsight();
  
  switch (command) {
    case 'report':
      const days = parseInt(process.argv[3]) || 7;
      await insight.generateReferralReport(days);
      break;
      
    case 'breakdown':
      const breakdownDays = parseInt(process.argv[3]) || 7;
      const results = await insight.getReferralTrafficBreakdown(breakdownDays);
      insight.displayResults(
        `Traffic Sources Breakdown (Last ${breakdownDays} Days)`,
        results,
        ['Source', 'Pageviews', 'Unique Visitors']
      );
      break;
      
    case 'urls':
      insight.generatePostHogInsightURLs();
      break;
      
    default:
      console.log(`
🎯 PostHog Referral Source Insight Generator

Usage:
  node referral_source_insight.js report [days]      # Generate comprehensive referral report (default: 7 days)
  node referral_source_insight.js breakdown [days]   # Show traffic source breakdown (default: 7 days)  
  node referral_source_insight.js urls              # Show HogQL queries for manual insight creation

Examples:
  node referral_source_insight.js report 30         # 30-day referral report
  node referral_source_insight.js breakdown 7       # 7-day traffic breakdown
  node referral_source_insight.js urls              # Get HogQL for PostHog insights

The script tracks traffic from:
  - Reddit (utm_source=reddit OR referrer contains reddit.com)
  - Google (utm_source=google OR referrer contains google.)
  - Sourcegraph (utm_source=sourcegraph OR referrer contains sourcegraph.com)
  - Other major sources (Twitter, LinkedIn, etc.)
      `);
  }
}

export default PostHogReferralInsight;
