#!/usr/bin/env node

// 90-Day Funnel Analysis Generator
// Creates comprehensive signup funnel view for the last 90 days

import { writeFileSync } from 'fs';

class Funnel90DayAnalyzer {
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  async getFunnelStepData() {
    const query = `
      WITH funnel_data AS (
        SELECT 
          distinct_id,
          case 
            when properties.$current_url ILIKE '%auth.ampcode.com/sign-up/password%' then 'Step 2: Password'
            when properties.$current_url ILIKE '%auth.ampcode.com/email-verification%' then 'Step 3: Email Verification'  
            when properties.$current_url ILIKE '%auth.ampcode.com/sign-up%' then 'Step 1: Sign Up'
            when properties.$current_url = 'https://ampcode.com/' then 'Step 4: Main App'
          end as step,
          coalesce(
            extractURLParameter(properties.$current_url, 'utm_source'),
            extractURLParameter(properties.$referrer, 'utm_source'),
            case 
              when properties.$referrer ILIKE '%reddit%' then 'reddit'
              when properties.$referrer ILIKE '%google%' then 'google' 
              when properties.$referrer ILIKE '%bing%' then 'bing'
              when properties.$referrer ILIKE '%twitter%' then 'twitter'
              when properties.$referrer ILIKE '%facebook%' then 'facebook'
              when properties.$referrer ILIKE '%linkedin%' then 'linkedin'
              else 'direct'
            end
          ) as utm_source,
          DATE(timestamp) as date
        FROM events 
        WHERE event = '$pageview' 
          AND timestamp >= now() - INTERVAL ${this.days} DAY
          AND properties.$current_url ILIKE '%ampcode.com%'
      )
      SELECT 
        step,
        utm_source,
        count() as events,
        countDistinct(distinct_id) as unique_users,
        min(date) as first_seen,
        max(date) as last_seen,
        countDistinct(date) as days_active
      FROM funnel_data
      WHERE step IS NOT NULL
      GROUP BY step, utm_source
      ORDER BY 
        case step
          when 'Step 1: Sign Up' then 1
          when 'Step 2: Password' then 2  
          when 'Step 3: Email Verification' then 3
          when 'Step 4: Main App' then 4
        end,
        events DESC
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying funnel data:', error);
      return [];
    }
  }

  async getOverallStepData() {
    const query = `
      SELECT 
        case 
          when properties.$current_url ILIKE '%auth.ampcode.com/sign-up/password%' then 'Step 2: Password'
          when properties.$current_url ILIKE '%auth.ampcode.com/email-verification%' then 'Step 3: Email Verification'  
          when properties.$current_url ILIKE '%auth.ampcode.com/sign-up%' then 'Step 1: Sign Up'
          when properties.$current_url = 'https://ampcode.com/' then 'Step 4: Main App'
        end as step,
        count() as total_events,
        countDistinct(distinct_id) as total_unique_users,
        DATE(min(timestamp)) as first_seen,
        DATE(max(timestamp)) as last_seen,
        countDistinct(DATE(timestamp)) as days_with_activity
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= now() - INTERVAL ${this.days} DAY
        AND properties.$current_url ILIKE '%ampcode.com%'
      GROUP BY step
      ORDER BY 
        case step
          when 'Step 1: Sign Up' then 1
          when 'Step 2: Password' then 2  
          when 'Step 3: Email Verification' then 3
          when 'Step 4: Main App' then 4
        end
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying overall data:', error);
      return [];
    }
  }

  async getWeeklyTrends() {
    const query = `
      SELECT 
        toMonday(DATE(timestamp)) as week_start,
        case 
          when properties.$current_url ILIKE '%auth.ampcode.com/sign-up/password%' then 'Step 2: Password'
          when properties.$current_url ILIKE '%auth.ampcode.com/email-verification%' then 'Step 3: Email Verification'  
          when properties.$current_url ILIKE '%auth.ampcode.com/sign-up%' then 'Step 1: Sign Up'
          when properties.$current_url = 'https://ampcode.com/' then 'Step 4: Main App'
        end as step,
        count() as weekly_events,
        countDistinct(distinct_id) as weekly_users
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= now() - INTERVAL ${this.days} DAY
        AND properties.$current_url ILIKE '%ampcode.com%'
      GROUP BY week_start, step
      ORDER BY week_start DESC, step
    `;

    try {
      return await this.queryPostHog(query);
    } catch (error) {
      console.error('Error querying weekly trends:', error);
      return [];
    }
  }

  processDataIntoTable(funnelData, overallData) {
    const steps = [
      'Step 1: Sign Up',
      'Step 2: Password',
      'Step 3: Email Verification', 
      'Step 4: Main App'
    ];

    // Get all unique UTM sources, sorted by total events
    const utmSources = [...new Set(funnelData.map(row => row[1]))].sort();
    
    // Create data lookup
    const dataLookup = {};
    funnelData.forEach(row => {
      const [step, utm_source, events, unique_users, first_seen, last_seen, days_active] = row;
      if (!dataLookup[step]) dataLookup[step] = {};
      dataLookup[step][utm_source] = { 
        events, 
        unique_users, 
        first_seen, 
        last_seen, 
        days_active 
      };
    });

    const overallLookup = {};
    overallData.forEach(row => {
      const [step, total_events, total_unique_users, first_seen, last_seen, days_active] = row;
      overallLookup[step] = { 
        events: total_events, 
        unique_users: total_unique_users,
        first_seen,
        last_seen,
        days_active
      };
    });

    // Generate main funnel table
    let table = '\n## 90-Day Signup Funnel Analysis\n\n';
    table += '| Step | Overall Events | Overall Users | Days Active |';
    utmSources.forEach(source => {
      table += ` ${source} Events | ${source} Users |`;
    });
    table += '\n';

    // Header separator
    const cols = 3 + (utmSources.length * 2);
    table += '|' + '------|'.repeat(cols) + '\n';

    // Data rows
    steps.forEach(step => {
      const overall = overallLookup[step] || { events: 0, unique_users: 0, days_active: 0 };
      table += `| ${step} | ${overall.events} | ${overall.unique_users} | ${overall.days_active} |`;
      
      utmSources.forEach(source => {
        const sourceData = dataLookup[step]?.[source] || { events: 0, unique_users: 0 };
        table += ` ${sourceData.events} | ${sourceData.unique_users} |`;
      });
      table += '\n';
    });

    return table;
  }

  generateInsights(funnelData, overallData) {
    let insights = '\n## 📊 Key Insights (90 Days)\n\n';
    
    // Calculate total traffic
    const totalEvents = overallData.reduce((sum, row) => sum + row[1], 0);
    const totalUsers = overallData.reduce((sum, row) => sum + row[2], 0);
    
    insights += `### Traffic Volume\n`;
    insights += `- **Total Events**: ${totalEvents.toLocaleString()}\n`;
    insights += `- **Unique Users**: ${totalUsers.toLocaleString()}\n`;
    insights += `- **Events per User**: ${totalUsers > 0 ? (totalEvents / totalUsers).toFixed(2) : '0'}\n\n`;

    // UTM Source breakdown
    const utmBreakdown = {};
    funnelData.forEach(row => {
      const [step, utm_source, events, unique_users] = row;
      if (!utmBreakdown[utm_source]) {
        utmBreakdown[utm_source] = { events: 0, users: 0 };
      }
      utmBreakdown[utm_source].events += events;
      utmBreakdown[utm_source].users += unique_users;
    });

    const sortedSources = Object.entries(utmBreakdown)
      .sort((a, b) => b[1].events - a[1].events)
      .slice(0, 5);

    insights += `### Top Traffic Sources\n`;
    sortedSources.forEach(([source, data], index) => {
      const percentage = totalEvents > 0 ? ((data.events / totalEvents) * 100).toFixed(1) : '0';
      insights += `${index + 1}. **${source}**: ${data.events.toLocaleString()} events (${percentage}%), ${data.users.toLocaleString()} users\n`;
    });
    
    return insights;
  }

  generateWeeklyTrendsTable(weeklyData) {
    if (weeklyData.length === 0) return '\n## No weekly trend data available\n';

    let table = '\n## 📈 Weekly Trends (Last 12 Weeks)\n\n';
    
    // Group by week
    const weeklyGrouped = {};
    weeklyData.forEach(row => {
      const [week_start, step, events, users] = row;
      if (!weeklyGrouped[week_start]) weeklyGrouped[week_start] = {};
      weeklyGrouped[week_start][step] = { events, users };
    });

    const weeks = Object.keys(weeklyGrouped).sort().reverse().slice(0, 12);
    
    table += '| Week Starting | Step 1 | Step 2 | Step 3 | Step 4 | Total |\n';
    table += '|---------------|--------|--------|--------|--------|-------|\n';

    weeks.forEach(week => {
      const weekData = weeklyGrouped[week];
      const step1 = weekData['Step 1: Sign Up']?.events || 0;
      const step2 = weekData['Step 2: Password']?.events || 0;
      const step3 = weekData['Step 3: Email Verification']?.events || 0;
      const step4 = weekData['Step 4: Main App']?.events || 0;
      const total = step1 + step2 + step3 + step4;
      
      table += `| ${week} | ${step1} | ${step2} | ${step3} | ${step4} | ${total} |\n`;
    });

    return table;
  }

  async generateReport() {
    console.log(`🔍 Querying PostHog for ${this.days}-day funnel data...`);
    
    const [funnelData, overallData, weeklyData] = await Promise.all([
      this.getFunnelStepData(),
      this.getOverallStepData(),
      this.getWeeklyTrends()
    ]);

    console.log(`📊 Found ${funnelData.length} detailed funnel data points`);
    console.log(`📈 Found ${overallData.length} overall step summaries`);
    console.log(`📅 Found ${weeklyData.length} weekly trend points`);

    if (funnelData.length === 0 && overallData.length === 0) {
      console.log('⚠️  No signup funnel data found for the last 90 days.');
      console.log('   This could indicate:');
      console.log('   - No users visited auth pages in the last 90 days');
      console.log('   - Auth domain tracking needs to be configured');
      console.log('   - Different URL patterns are in use');
      return;
    }

    const table = this.processDataIntoTable(funnelData, overallData);
    const insights = this.generateInsights(funnelData, overallData);
    const weeklyTrends = this.generateWeeklyTrendsTable(weeklyData);
    
    console.log(table);
    console.log(insights);

    // Save to file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `/Users/joelhorwitz/dev/traffic-analysis/funnel_90_day_analysis_${timestamp}.md`;
    
    const content = `# Ampcode 90-Day Signup Funnel Analysis

Generated: ${new Date().toISOString()}
Analysis Period: Last ${this.days} days

## Executive Summary

This report analyzes the complete signup funnel over the last 90 days, providing insights into user behavior, conversion rates, and traffic source performance.

${table}

${insights}

${weeklyTrends}

## Detailed Data

### Funnel Breakdown by Source:
\`\`\`json
${JSON.stringify(funnelData.slice(0, 20), null, 2)}
\`\`\`

### Overall Step Performance:
\`\`\`json
${JSON.stringify(overallData, null, 2)}
\`\`\`

## Methodology

- **Data Source**: PostHog pageview events
- **Time Period**: ${this.days} days from ${new Date().toISOString().split('T')[0]}
- **Funnel Steps**: 
  1. auth.ampcode.com/sign-up (Initial signup page)
  2. auth.ampcode.com/sign-up/password (Password creation)
  3. auth.ampcode.com/email-verification (Email verification)
  4. ampcode.com/ (Successfully reached main app)
- **Attribution**: UTM parameters + referrer analysis

## PostHog Links
- [Visual Funnel](https://app.posthog.com/project/176241/insights/giaU78V1)
- [Channel Breakdown](https://app.posthog.com/project/176241/insights/p1gY9MvV)
- [Project Dashboard](https://app.posthog.com/project/176241)

## Next Steps

1. **Optimize Drop-off Points**: Focus on steps with highest abandonment rates
2. **Source Performance**: Invest more in high-converting traffic sources
3. **Weekly Monitoring**: Set up alerts for significant funnel changes
4. **A/B Testing**: Test improvements to low-performing funnel steps
`;

    writeFileSync(filename, content);
    console.log(`\n💾 Complete 90-day analysis saved to: ${filename}`);
    
    return { 
      table, 
      filename, 
      dataPoints: funnelData.length + overallData.length,
      totalEvents: overallData.reduce((sum, row) => sum + row[1], 0),
      totalUsers: overallData.reduce((sum, row) => sum + row[2], 0)
    };
  }
}

// Run the analysis
const analyzer = new Funnel90DayAnalyzer();
analyzer.generateReport().then(result => {
  if (result) {
    console.log(`\n✅ 90-day analysis complete!`);
    console.log(`📊 Total Events: ${result.totalEvents.toLocaleString()}`);
    console.log(`👥 Total Users: ${result.totalUsers.toLocaleString()}`);
    console.log(`📋 Data Points: ${result.dataPoints}`);
    console.log(`\n🎯 View your comprehensive report at: ${result.filename}`);
  }
}).catch(error => {
  console.error('❌ Analysis failed:', error);
});
