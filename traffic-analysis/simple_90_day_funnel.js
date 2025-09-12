#!/usr/bin/env node

// Simple 90-Day Funnel View
// Creates a basic funnel analysis using working PostHog queries

import { writeFileSync } from 'fs';

class SimpleFunnelAnalyzer {
  constructor() {
    this.apiKey = 'REDACTED_POSTHOG_SECRET';
    this.projectId = '176241';
    this.baseUrl = 'https://app.posthog.com';
    this.days = 90;
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

  async getBasicTrafficData() {
    const query = `
      SELECT 
        properties.$current_url as url,
        coalesce(
          extractURLParameter(properties.$current_url, 'utm_source'),
          extractURLParameter(properties.$referrer, 'utm_source'),
          case 
            when properties.$referrer ILIKE '%reddit%' then 'reddit'
            when properties.$referrer ILIKE '%google%' then 'google' 
            when properties.$referrer ILIKE '%bing%' then 'bing'
            when properties.$referrer ILIKE '%twitter%' then 'twitter'
            else 'direct'
          end
        ) as utm_source,
        count() as events,
        uniq(distinct_id) as unique_users
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= now() - INTERVAL ${this.days} DAY
        AND properties.$current_url ILIKE '%ampcode.com%'
      GROUP BY url, utm_source
      ORDER BY events DESC
      LIMIT 100
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying traffic data:', error.message);
      return [];
    }
  }

  async getUTMSourceSummary() {
    const query = `
      SELECT 
        coalesce(
          extractURLParameter(properties.$current_url, 'utm_source'),
          extractURLParameter(properties.$referrer, 'utm_source'),
          case 
            when properties.$referrer ILIKE '%reddit%' then 'reddit'
            when properties.$referrer ILIKE '%google%' then 'google'
            when properties.$referrer ILIKE '%bing%' then 'bing'
            when properties.$referrer ILIKE '%twitter%' then 'twitter'
            else 'direct'
          end
        ) as utm_source,
        count() as total_events,
        countDistinct(distinct_id) as total_users
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= now() - INTERVAL ${this.days} DAY
        AND properties.$current_url ILIKE '%ampcode.com%'
      GROUP BY utm_source
      ORDER BY total_events DESC
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying UTM summary:', error.message);
      return [];
    }
  }

  categorizeFunnelStep(url) {
    if (!url) return 'Other';
    
    if (url.includes('auth.ampcode.com/sign-up/password')) return 'Step 2: Password';
    if (url.includes('auth.ampcode.com/email-verification')) return 'Step 3: Email Verification';
    if (url.includes('auth.ampcode.com/sign-up')) return 'Step 1: Sign Up';
    if (url === 'https://ampcode.com/' || url.includes('ampcode.com/') && !url.includes('auth.')) return 'Step 4: Main App';
    
    return 'Other';
  }

  processIntoFunnelView(trafficData, utmSummary) {
    // Categorize traffic data into funnel steps
    const funnelData = {};
    const stepOrder = ['Step 1: Sign Up', 'Step 2: Password', 'Step 3: Email Verification', 'Step 4: Main App', 'Other'];
    
    trafficData.forEach(row => {
      const [url, utm_source, events, users] = row;
      const step = this.categorizeFunnelStep(url);
      
      if (!funnelData[step]) funnelData[step] = {};
      if (!funnelData[step][utm_source]) {
        funnelData[step][utm_source] = { events: 0, users: 0 };
      }
      
      funnelData[step][utm_source].events += events;
      funnelData[step][utm_source].users += users;
    });

    return { funnelData, stepOrder };
  }

  generateFunnelTable(funnelData, stepOrder, utmSummary) {
    // Get top UTM sources
    const topSources = utmSummary.slice(0, 6).map(row => row[0]);
    
    let table = '\n## 90-Day Signup Funnel Analysis\n\n';
    table += '| Step |';
    topSources.forEach(source => table += ` ${source} Events | ${source} Users |`);
    table += ' Total Events | Total Users |\n';
    
    // Header separator
    const cols = 1 + (topSources.length * 2) + 2;
    table += '|' + '------|'.repeat(cols) + '\n';

    // Data rows
    stepOrder.forEach(step => {
      const stepData = funnelData[step] || {};
      let totalEvents = 0;
      let totalUsers = 0;
      
      table += `| ${step} |`;
      
      topSources.forEach(source => {
        const data = stepData[source] || { events: 0, users: 0 };
        table += ` ${data.events} | ${data.users} |`;
        totalEvents += data.events;
        totalUsers += data.users;
      });
      
      // Add totals for other sources not shown
      Object.keys(stepData).forEach(source => {
        if (!topSources.includes(source)) {
          totalEvents += stepData[source].events;
          totalUsers += stepData[source].users;
        }
      });
      
      table += ` ${totalEvents} | ${totalUsers} |\n`;
    });

    return table;
  }

  generateInsights(utmSummary, funnelData) {
    let insights = '\n## 📊 Key Insights (90 Days)\n\n';
    
    const totalEvents = utmSummary.reduce((sum, row) => sum + row[1], 0);
    const totalUsers = utmSummary.reduce((sum, row) => sum + row[2], 0);
    
    insights += `### Overall Traffic\n`;
    insights += `- **Total Events**: ${totalEvents.toLocaleString()}\n`;
    insights += `- **Unique Users**: ${totalUsers.toLocaleString()}\n`;
    insights += `- **Events per User**: ${totalUsers > 0 ? (totalEvents / totalUsers).toFixed(2) : '0'}\n\n`;

    insights += `### Top Traffic Sources\n`;
    utmSummary.slice(0, 5).forEach((row, index) => {
      const [source, events, users] = row;
      const percentage = totalEvents > 0 ? ((events / totalEvents) * 100).toFixed(1) : '0';
      insights += `${index + 1}. **${source}**: ${events.toLocaleString()} events (${percentage}%), ${users.toLocaleString()} users\n`;
    });

    // Analyze funnel steps
    insights += `\n### Funnel Step Analysis\n`;
    const stepOrder = ['Step 1: Sign Up', 'Step 2: Password', 'Step 3: Email Verification', 'Step 4: Main App'];
    
    stepOrder.forEach(step => {
      const stepData = funnelData[step];
      if (stepData) {
        const stepTotal = Object.values(stepData).reduce((sum, data) => sum + data.events, 0);
        insights += `- **${step}**: ${stepTotal.toLocaleString()} events\n`;
      } else {
        insights += `- **${step}**: No data found\n`;
      }
    });

    return insights;
  }

  async generateReport() {
    console.log(`🔍 Analyzing ${this.days}-day funnel data...`);
    
    const [trafficData, utmSummary] = await Promise.all([
      this.getBasicTrafficData(),
      this.getUTMSourceSummary()
    ]);

    console.log(`📊 Found ${trafficData.length} traffic data points`);
    console.log(`🎯 Found ${utmSummary.length} UTM sources`);

    if (trafficData.length === 0) {
      console.log('⚠️  No traffic data found for the last 90 days.');
      return;
    }

    const { funnelData, stepOrder } = this.processIntoFunnelView(trafficData, utmSummary);
    const table = this.generateFunnelTable(funnelData, stepOrder, utmSummary);
    const insights = this.generateInsights(utmSummary, funnelData);
    
    console.log(table);
    console.log(insights);

    // Save to file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `/Users/joelhorwitz/dev/traffic-analysis/funnel_90_day_report_${timestamp}.md`;
    
    const content = `# Ampcode 90-Day Traffic & Funnel Report

Generated: ${new Date().toISOString()}
Analysis Period: Last ${this.days} days

${table}

${insights}

## Detailed URL Breakdown

### Top 20 URLs by Traffic:
| URL | UTM Source | Events | Users |
|-----|------------|--------|-------|
${trafficData.slice(0, 20).map(row => 
  `| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} |`
).join('\n')}

## Methodology

- **Data Source**: PostHog pageview events from ampcode.com domains
- **Time Period**: ${this.days} days ending ${new Date().toISOString().split('T')[0]}
- **Attribution**: UTM parameters + referrer domain analysis
- **Funnel Steps**: Categorized by URL patterns

## PostHog Links
- [Visual Funnel](https://app.posthog.com/project/176241/insights/giaU78V1)
- [Project Dashboard](https://app.posthog.com/project/176241)

## Notes

This report shows traffic patterns over the last 90 days. The funnel categorization is based on URL patterns:
- Step 1: auth.ampcode.com/sign-up pages
- Step 2: auth.ampcode.com/sign-up/password pages  
- Step 3: auth.ampcode.com/email-verification pages
- Step 4: Main ampcode.com pages

If auth domain events are not showing, verify PostHog tracking is configured on auth.ampcode.com.
`;

    writeFileSync(filename, content);
    console.log(`\n💾 90-day funnel report saved to: ${filename}`);
    
    return { 
      filename, 
      totalEvents: utmSummary.reduce((sum, row) => sum + row[1], 0),
      totalUsers: utmSummary.reduce((sum, row) => sum + row[2], 0),
      topSources: utmSummary.slice(0, 5).map(row => row[0])
    };
  }
}

// Run the analysis
const analyzer = new SimpleFunnelAnalyzer();
analyzer.generateReport().then(result => {
  if (result) {
    console.log(`\n✅ 90-day funnel analysis complete!`);
    console.log(`📊 Total Events: ${result.totalEvents.toLocaleString()}`);
    console.log(`👥 Total Users: ${result.totalUsers.toLocaleString()}`);
    console.log(`🎯 Top Sources: ${result.topSources.join(', ')}`);
  }
}).catch(error => {
  console.error('❌ Analysis failed:', error);
});
