#!/usr/bin/env node

// Traffic Report Generator - Creates static HTML report
import { writeFileSync } from 'fs';

const POSTHOG_API_KEY = 'REDACTED_POSTHOG_SECRET';
const PROJECT_ID = '176241';
const POSTHOG_BASE_URL = 'https://app.posthog.com';

async function queryPostHog(query) {
  try {
    const response = await fetch(`${POSTHOG_BASE_URL}/api/projects/${PROJECT_ID}/query/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
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
    console.error('PostHog query error:', error);
    return [];
  }
}

async function getTrafficByUTM(days = 30) {
  const query = `
    SELECT 
      coalesce(
        extractURLParameter(properties.$current_url, 'utm_source'),
        extractURLParameter(properties.$referrer, 'utm_source'),
        case 
          when properties.$referrer ILIKE '%reddit%' then 'reddit'
          when properties.$referrer ILIKE '%google%' then 'google'
          when properties.$referrer ILIKE '%bing%' then 'bing'
          when properties.$referrer ILIKE '%facebook%' then 'facebook'
          when properties.$referrer ILIKE '%twitter%' then 'twitter'
          when properties.$referrer IS NULL OR properties.$referrer = '' then 'direct'
          else 'other'
        end
      ) as utm_source,
      count() as pageviews,
      countDistinct(distinct_id) as unique_visitors
    FROM events 
    WHERE event = '$pageview' 
      AND properties.$current_url LIKE '%ampcode.com%'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY utm_source
    ORDER BY pageviews DESC
  `;

  return await queryPostHog(query);
}

async function generateTrafficReport() {
  console.log('🔍 Fetching traffic data from PostHog...');
  
  const trafficData = await getTrafficByUTM(30);
  
  if (trafficData.length === 0) {
    console.log('❌ No traffic data found');
    return;
  }

  console.log('✅ Data retrieved successfully\n');
  
  // Calculate totals
  const totalPageviews = trafficData.reduce((sum, row) => sum + row[1], 0);
  const totalVisitors = trafficData.reduce((sum, row) => sum + row[2], 0);
  
  // Display console table
  console.log('📊 AMPCODE.COM TRAFFIC BY UTM SOURCE (Last 30 Days)\n');
  console.log('┌─────────────────┬────────────┬──────────────┬─────────────┐');
  console.log('│ UTM Source      │ Pageviews  │ Unique Visitors │ % of Traffic │');
  console.log('├─────────────────┼────────────┼──────────────┼─────────────┤');
  
  trafficData.forEach(row => {
    const [utm_source, pageviews, unique_visitors] = row;
    const percentage = ((pageviews / totalPageviews) * 100).toFixed(1);
    const sourceName = utm_source || 'unknown';
    
    console.log(`│ ${sourceName.padEnd(15)} │ ${pageviews.toString().padStart(10)} │ ${unique_visitors.toString().padStart(12)} │ ${percentage.toString().padStart(10)}% │`);
  });
  
  console.log('└─────────────────┴────────────┴──────────────┴─────────────┘');
  console.log(`\n📈 TOTALS: ${totalPageviews.toLocaleString()} pageviews, ${totalVisitors.toLocaleString()} unique visitors`);
  
  // Highlight top sources
  console.log('\n🎯 TOP PERFORMING SOURCES:');
  trafficData.slice(0, 5).forEach((row, index) => {
    const [utm_source, pageviews, unique_visitors] = row;
    const percentage = ((pageviews / totalPageviews) * 100).toFixed(1);
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
    console.log(`${emoji} ${utm_source}: ${pageviews} pageviews (${percentage}%)`);
  });
  
  // Generate HTML report
  generateHTMLReport(trafficData, totalPageviews, totalVisitors);
  
  return trafficData;
}

function generateHTMLReport(data, totalPageviews, totalVisitors) {
  const timestamp = new Date().toLocaleString();
  
  let tableRows = '';
  data.forEach(row => {
    const [utm_source, pageviews, unique_visitors] = row;
    const percentage = ((pageviews / totalPageviews) * 100).toFixed(1);
    const sourceClass = utm_source || 'unknown';
    
    tableRows += `
      <tr>
        <td><span class="utm-source ${sourceClass}">${utm_source || 'unknown'}</span></td>
        <td>${pageviews.toLocaleString()}</td>
        <td>${unique_visitors.toLocaleString()}</td>
        <td>${percentage}%</td>
      </tr>
    `;
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Ampcode Traffic Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 2rem; }
        .header { text-align: center; margin-bottom: 2rem; }
        .header h1 { color: #3b82f6; }
        .stats { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: #1e293b; padding: 1rem; border-radius: 8px; flex: 1; text-align: center; }
        .stat-value { font-size: 2rem; color: #10b981; font-weight: bold; }
        .table-container { background: #1e293b; border-radius: 12px; padding: 1.5rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #334155; }
        th { background: #374151; }
        .reddit { color: #ff4500; font-weight: bold; }
        .google { color: #4285f4; font-weight: bold; }
        .bing { color: #00809d; font-weight: bold; }
        .direct { color: #10b981; font-weight: bold; }
        .other { color: #6b7280; }
        .timestamp { text-align: center; color: #64748b; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Ampcode.com Traffic Report</h1>
        <p>Traffic breakdown by UTM source (Last 30 days)</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${totalPageviews.toLocaleString()}</div>
            <div>Total Pageviews</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalVisitors.toLocaleString()}</div>
            <div>Unique Visitors</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.length}</div>
            <div>Traffic Sources</div>
        </div>
    </div>
    
    <div class="table-container">
        <h2>Traffic by UTM Source</h2>
        <table>
            <thead>
                <tr>
                    <th>UTM Source</th>
                    <th>Pageviews</th>
                    <th>Unique Visitors</th>
                    <th>% of Traffic</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </div>
    
    <div class="timestamp">
        Generated: ${timestamp}<br>
        Data source: PostHog Analytics
    </div>
</body>
</html>
  `;

  const filename = '/Users/joelhorwitz/traffic-dashboard/traffic-report.html';
  writeFileSync(filename, html);
  console.log(`\n💾 HTML report saved to: ${filename}`);
  console.log('🌐 Open in browser to view visual report');
}

// Run the analysis
generateTrafficReport().then(() => {
  console.log('\n🎯 Analysis complete!');
  console.log('\n📱 To run the live dashboard:');
  console.log('   npm start (then visit http://localhost:3000)');
  console.log('\n📄 Static report generated: traffic-report.html');
}).catch(console.error);
