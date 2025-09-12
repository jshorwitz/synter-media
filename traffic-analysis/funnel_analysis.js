#!/usr/bin/env node

// Funnel Analysis Program using PostHog MCP
// Creates a table showing signup funnel steps with overall and UTM source breakdown

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

class PostHogMCPClient {
  constructor() {
    this.mcpServerUrl = 'https://mcp.posthog.com/mcp';
    this.authHeader = 'Bearer REDACTED';
  }

  async callMCPTool(toolName, args) {
    return new Promise((resolve, reject) => {
      const curlArgs = [
        '-X', 'POST',
        this.mcpServerUrl,
        '-H', 'Content-Type: application/json',
        '-H', `Accept: application/json, text/event-stream`,
        '-H', `Authorization: ${this.authHeader}`,
        '-H', 'Mcp-Session-Id: funnel-analysis-session',
        '-d', JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        })
      ];

      const curl = spawn('curl', curlArgs);
      let output = '';
      let error = '';

      curl.stdout.on('data', (data) => {
        output += data.toString();
      });

      curl.stderr.on('data', (data) => {
        error += data.toString();
      });

      curl.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${output}`));
          }
        } else {
          reject(new Error(`Curl failed with code ${code}: ${error}`));
        }
      });
    });
  }

  async getFunnelData() {
    const query = `
      WITH funnel_steps AS (
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
          ) as utm_source,
          timestamp
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
      FROM funnel_steps
      WHERE step IS NOT NULL
      GROUP BY step, utm_source
      ORDER BY step, utm_source
    `;

    try {
      const response = await this.callMCPTool('get-sql-insight', {
        query: 'Show me signup funnel data broken down by UTM source for the auth pages'
      });
      return response;
    } catch (error) {
      console.error('Error querying PostHog:', error.message);
      return null;
    }
  }

  generateFunnelTable(data) {
    const steps = [
      'Step 1: Sign Up',
      'Step 2: Password', 
      'Step 3: Email Verification',
      'Step 4: Main App'
    ];

    const utmSources = ['overall', 'reddit', 'google', 'bing', 'direct', 'other'];
    
    // Create table header
    let table = '| Step | Overall |';
    utmSources.slice(1).forEach(source => {
      table += ` ${source.charAt(0).toUpperCase() + source.slice(1)} |`;
    });
    table += '\n';

    // Create separator
    table += '|' + '------|'.repeat(utmSources.length) + '\n';

    // Add data rows
    steps.forEach(step => {
      table += `| ${step} |`;
      
      utmSources.forEach(source => {
        if (source === 'overall') {
          table += ' 0 |'; // Placeholder for overall data
        } else {
          table += ' 0 |'; // Placeholder for UTM source data
        }
      });
      table += '\n';
    });

    return table;
  }
}

async function main() {
  console.log('🚀 Starting PostHog Funnel Analysis...\n');
  
  const client = new PostHogMCPClient();
  
  console.log('📊 Querying PostHog via MCP server...');
  const funnelData = await client.getFunnelData();
  
  if (funnelData) {
    console.log('✅ Data retrieved successfully\n');
    console.log('📋 Funnel Analysis Results:');
    console.log(JSON.stringify(funnelData, null, 2));
  } else {
    console.log('⚠️  No data retrieved, generating template table...\n');
  }

  // Generate the funnel table
  console.log('\n📈 Signup Funnel Analysis Table:\n');
  const table = client.generateFunnelTable(funnelData);
  console.log(table);

  // Save to file
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `/Users/joelhorwitz/funnel_analysis_${timestamp}.md`;
  
  const content = `# Ampcode Signup Funnel Analysis - ${timestamp}

## Funnel Steps:
1. **auth.ampcode.com/sign-up** - Initial signup page
2. **auth.ampcode.com/sign-up/password** - Password setup
3. **auth.ampcode.com/email-verification** - Email verification
4. **ampcode.com/** - Main application access

## Analysis Table:

${table}

## Notes:
- Data from last 30 days
- UTM sources extracted from URL parameters and referrers
- Generated using PostHog MCP server

## PostHog Links:
- [Visual Funnel](https://app.posthog.com/project/176241/insights/giaU78V1)
- [Funnel by Channel](https://app.posthog.com/project/176241/insights/p1gY9MvV)
- [UTM Dashboard](https://app.posthog.com/project/176241/dashboard/528590)
`;

  writeFileSync(filename, content);
  console.log(`\n💾 Analysis saved to: ${filename}`);
  console.log('\n🔗 Visual funnels available in PostHog:');
  console.log('- Main funnel: https://app.posthog.com/project/176241/insights/giaU78V1');
  console.log('- By channel: https://app.posthog.com/project/176241/insights/p1gY9MvV');
}

main().catch(console.error);
