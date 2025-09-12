#!/usr/bin/env node

// Funnel Table Generator - Direct API approach
// Creates a comprehensive table of signup funnel steps with UTM source breakdown

import { writeFileSync } from 'fs';

class FunnelAnalyzer {
  constructor() {
    this.apiKey = 'REDACTED_POSTHOG_SECRET';
    this.projectId = '176241';
    this.baseUrl = 'https://app.posthog.com';
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
              else 'direct'
            end
          ) as utm_source
        FROM events 
        WHERE event = '$pageview' 
          AND timestamp >= now() - INTERVAL 30 DAY
          AND (
            properties.$current_url ILIKE '%auth.ampcode.com/sign-up%' OR 
            properties.$current_url ILIKE '%auth.ampcode.com/email-verification%' OR
            properties.$current_url = 'https://ampcode.com/'
          )
      )
      SELECT 
        step,
        utm_source,
        count() as events,
        countDistinct(distinct_id) as unique_users
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
        utm_source
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
        countDistinct(distinct_id) as total_unique_users
      FROM events 
      WHERE event = '$pageview' 
        AND timestamp >= now() - INTERVAL 30 DAY
        AND (
          properties.$current_url ILIKE '%auth.ampcode.com/sign-up%' OR 
          properties.$current_url ILIKE '%auth.ampcode.com/email-verification%' OR
          properties.$current_url = 'https://ampcode.com/'
        )
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

  processDataIntoTable(funnelData, overallData) {
    const steps = [
      'Step 1: Sign Up',
      'Step 2: Password',
      'Step 3: Email Verification', 
      'Step 4: Main App'
    ];

    // Get all unique UTM sources
    const utmSources = [...new Set(funnelData.map(row => row[1]))].sort();
    
    // Create data lookup
    const dataLookup = {};
    funnelData.forEach(row => {
      const [step, utm_source, events, unique_users] = row;
      if (!dataLookup[step]) dataLookup[step] = {};
      dataLookup[step][utm_source] = { events, unique_users };
    });

    const overallLookup = {};
    overallData.forEach(row => {
      const [step, total_events, total_unique_users] = row;
      overallLookup[step] = { events: total_events, unique_users: total_unique_users };
    });

    // Generate table
    let table = '\n## Signup Funnel Analysis Table\n\n';
    table += '| Step | Overall Events | Overall Users |';
    utmSources.forEach(source => {
      table += ` ${source} Events | ${source} Users |`;
    });
    table += '\n';

    // Header separator
    table += '|' + '------|'.repeat(2 + utmSources.length * 2) + '\n';

    // Data rows
    steps.forEach(step => {
      const overall = overallLookup[step] || { events: 0, unique_users: 0 };
      table += `| ${step} | ${overall.events} | ${overall.unique_users} |`;
      
      utmSources.forEach(source => {
        const sourceData = dataLookup[step]?.[source] || { events: 0, unique_users: 0 };
        table += ` ${sourceData.events} | ${sourceData.unique_users} |`;
      });
      table += '\n';
    });

    return table;
  }

  async generateReport() {
    console.log('🔍 Querying PostHog for funnel data...');
    
    const [funnelData, overallData] = await Promise.all([
      this.getFunnelStepData(),
      this.getOverallStepData()
    ]);

    console.log(`📊 Found ${funnelData.length} funnel data points`);
    console.log(`📈 Found ${overallData.length} overall data points`);

    if (funnelData.length === 0 && overallData.length === 0) {
      console.log('⚠️  No signup funnel data found. This could mean:');
      console.log('   - No users have visited the auth pages yet');
      console.log('   - The auth pages are not being tracked');
      console.log('   - Different URL patterns are being used');
      return;
    }

    const table = this.processDataIntoTable(funnelData, overallData);
    
    console.log(table);

    // Save to file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `/Users/joelhorwitz/signup_funnel_${timestamp}.md`;
    
    const content = `# Ampcode Signup Funnel Analysis - ${timestamp}

Generated: ${new Date().toISOString()}

## Funnel Flow:
1. **auth.ampcode.com/sign-up** - Initial signup page
2. **auth.ampcode.com/sign-up/password** - Password creation
3. **auth.ampcode.com/email-verification** - Email verification
4. **ampcode.com/** - Successfully reached main app

${table}

## Raw Data:

### By UTM Source:
\`\`\`json
${JSON.stringify(funnelData, null, 2)}
\`\`\`

### Overall Totals:
\`\`\`json
${JSON.stringify(overallData, null, 2)}
\`\`\`

## PostHog Visual Funnels:
- [Complete Signup Flow](https://app.posthog.com/project/176241/insights/giaU78V1)
- [By Channel Type](https://app.posthog.com/project/176241/insights/p1gY9MvV)
`;

    writeFileSync(filename, content);
    console.log(`\n💾 Complete analysis saved to: ${filename}`);
    
    return { table, filename, dataPoints: funnelData.length + overallData.length };
  }
}

// Run the analysis
const analyzer = new FunnelAnalyzer();
analyzer.generateReport().then(result => {
  if (result) {
    console.log(`\n✅ Analysis complete! Found ${result.dataPoints} data points.`);
    console.log('\n🎯 Next steps:');
    console.log('1. Check the generated markdown file for detailed breakdown');
    console.log('2. View visual funnels in PostHog for interactive analysis');
    console.log('3. Set up alerts for funnel drop-offs');
  }
}).catch(error => {
  console.error('❌ Analysis failed:', error);
});
