#!/usr/bin/env node

// Sourcegraph Visitors Analysis
// Find visitors from sourcegraph.com since September 3rd

import { writeFileSync } from 'fs';

class SourcegraphAnalyzer {
  constructor() {
    this.apiKey = 'REDACTED_POSTHOG_SECRET';
    this.projectId = '176241';
    this.baseUrl = 'https://app.posthog.com';
    this.startDate = '2025-09-03';
  }

  async queryPostHog(query) {
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
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  async getSourcegraphVisitors() {
    const query = `
      SELECT 
        toDate(timestamp) as visit_date,
        properties.$current_url as landing_page,
        properties.$referrer as referrer_url,
        count() as events,
        uniq(distinct_id) as unique_visitors
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= '${this.startDate}'
        AND (
          properties.$referrer ILIKE '%sourcegraph.com%' OR
          extractURLParameter(properties.$current_url, 'utm_source') = 'sourcegraph' OR
          extractURLParameter(properties.$referrer, 'utm_source') = 'sourcegraph'
        )
        AND properties.$current_url ILIKE '%ampcode.com%'
      GROUP BY visit_date, landing_page, referrer_url
      ORDER BY visit_date DESC, events DESC
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying Sourcegraph visitors:', error.message);
      return [];
    }
  }

  async getSourcegraphSummary() {
    const query = `
      SELECT 
        count() as total_events,
        uniq(distinct_id) as total_unique_visitors,
        min(timestamp) as first_visit,
        max(timestamp) as last_visit,
        uniq(properties.$current_url) as unique_landing_pages
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= '${this.startDate}'
        AND (
          properties.$referrer ILIKE '%sourcegraph.com%' OR
          extractURLParameter(properties.$current_url, 'utm_source') = 'sourcegraph' OR
          extractURLParameter(properties.$referrer, 'utm_source') = 'sourcegraph'
        )
        AND properties.$current_url ILIKE '%ampcode.com%'
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying Sourcegraph summary:', error.message);
      return [];
    }
  }

  async getDailyTrends() {
    const query = `
      SELECT 
        toDate(timestamp) as date,
        count() as daily_events,
        uniq(distinct_id) as daily_visitors
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= '${this.startDate}'
        AND (
          properties.$referrer ILIKE '%sourcegraph.com%' OR
          extractURLParameter(properties.$current_url, 'utm_source') = 'sourcegraph' OR
          extractURLParameter(properties.$referrer, 'utm_source') = 'sourcegraph'
        )
        AND properties.$current_url ILIKE '%ampcode.com%'
      GROUP BY date
      ORDER BY date DESC
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying daily trends:', error.message);
      return [];
    }
  }

  generateReport(detailedData, summaryData, dailyTrends) {
    let report = `# Sourcegraph.com Visitors Analysis\n\n`;
    report += `**Analysis Period**: ${this.startDate} to ${new Date().toISOString().split('T')[0]}\n`;
    report += `**Generated**: ${new Date().toISOString()}\n\n`;

    // Summary section
    if (summaryData.length > 0) {
      const [total_events, total_visitors, first_visit, last_visit, unique_pages] = summaryData[0];
      report += `## 📊 Summary\n\n`;
      report += `- **Total Visitors from Sourcegraph**: ${total_visitors}\n`;
      report += `- **Total Events**: ${total_events}\n`;
      report += `- **Events per Visitor**: ${total_visitors > 0 ? (total_events / total_visitors).toFixed(2) : '0'}\n`;
      report += `- **First Visit**: ${first_visit}\n`;
      report += `- **Most Recent Visit**: ${last_visit}\n`;
      report += `- **Unique Landing Pages**: ${unique_pages}\n\n`;
    } else {
      report += `## 📊 Summary\n\n`;
      report += `**No visitors found from sourcegraph.com since ${this.startDate}**\n\n`;
      return report;
    }

    // Daily trends
    if (dailyTrends.length > 0) {
      report += `## 📈 Daily Visitor Trends\n\n`;
      report += `| Date | Events | Unique Visitors |\n`;
      report += `|------|--------|----------------|\n`;
      dailyTrends.forEach(row => {
        const [date, events, visitors] = row;
        report += `| ${date} | ${events} | ${visitors} |\n`;
      });
      report += `\n`;
    }

    // Detailed breakdown
    if (detailedData.length > 0) {
      report += `## 🔍 Detailed Visit Breakdown\n\n`;
      report += `| Date | Landing Page | Referrer | Events | Visitors |\n`;
      report += `|------|--------------|----------|--------|----------|\n`;
      detailedData.slice(0, 20).forEach(row => {
        const [date, landing_page, referrer, events, visitors] = row;
        const shortLanding = landing_page ? landing_page.substring(0, 50) + (landing_page.length > 50 ? '...' : '') : 'N/A';
        const shortReferrer = referrer ? referrer.substring(0, 40) + (referrer.length > 40 ? '...' : '') : 'N/A';
        report += `| ${date} | ${shortLanding} | ${shortReferrer} | ${events} | ${visitors} |\n`;
      });
      report += `\n`;
    }

    return report;
  }

  async analyze() {
    console.log(`🔍 Analyzing Sourcegraph visitors since ${this.startDate}...`);
    
    const [detailedData, summaryData, dailyTrends] = await Promise.all([
      this.getSourcegraphVisitors(),
      this.getSourcegraphSummary(),
      this.getDailyTrends()
    ]);

    console.log(`📊 Found ${detailedData.length} detailed visit records`);
    console.log(`📈 Found ${dailyTrends.length} days with Sourcegraph traffic`);

    if (summaryData.length > 0) {
      const [total_events, total_visitors] = summaryData[0];
      console.log(`👥 Total unique visitors from Sourcegraph: ${total_visitors}`);
      console.log(`📊 Total events: ${total_events}`);
    } else {
      console.log(`❌ No visitors found from sourcegraph.com since ${this.startDate}`);
    }

    const report = this.generateReport(detailedData, summaryData, dailyTrends);
    console.log('\n' + report);

    // Save to file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `/Users/joelhorwitz/dev/traffic-analysis/sourcegraph_visitors_${timestamp}.md`;
    
    writeFileSync(filename, report);
    console.log(`\n💾 Report saved to: ${filename}`);
    
    return {
      filename,
      totalVisitors: summaryData.length > 0 ? summaryData[0][1] : 0,
      totalEvents: summaryData.length > 0 ? summaryData[0][0] : 0,
      daysWithTraffic: dailyTrends.length
    };
  }
}

// Run the analysis
const analyzer = new SourcegraphAnalyzer();
analyzer.analyze().then(result => {
  if (result) {
    console.log(`\n✅ Sourcegraph visitor analysis complete!`);
    console.log(`👥 Found ${result.totalVisitors} unique visitors`);
    console.log(`📊 ${result.totalEvents} total events`);
    console.log(`📅 Traffic on ${result.daysWithTraffic} different days`);
  }
}).catch(error => {
  console.error('❌ Analysis failed:', error);
});
