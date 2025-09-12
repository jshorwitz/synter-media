#!/usr/bin/env node

// Local Traffic Dashboard Server
// Shows ampcode.com traffic by UTM source using PostHog API

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// PostHog API configuration
const POSTHOG_API_KEY = 'REDACTED_POSTHOG_SECRET';
const PROJECT_ID = '176241';
const POSTHOG_BASE_URL = 'https://app.posthog.com';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Query PostHog for traffic data
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

// Get traffic by UTM source
app.get('/api/traffic-by-utm', async (req, res) => {
  const days = req.query.days || 30;
  
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
      countDistinct(distinct_id) as unique_visitors,
      round(avg(case when properties.$session_duration IS NOT NULL 
        then toFloat64(properties.$session_duration) else NULL end), 2) as avg_session_duration
    FROM events 
    WHERE event = '$pageview' 
      AND properties.$current_url LIKE '%ampcode.com%'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY utm_source
    ORDER BY pageviews DESC
  `;

  try {
    const data = await queryPostHog(query);
    res.json({
      success: true,
      data: data,
      period: `${days} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false, 
      error: error.message
    });
  }
});

// Get traffic trends over time
app.get('/api/traffic-trends', async (req, res) => {
  const days = req.query.days || 7;
  
  const query = `
    SELECT 
      toDate(timestamp) as date,
      coalesce(
        extractURLParameter(properties.$current_url, 'utm_source'),
        extractURLParameter(properties.$referrer, 'utm_source'),
        case 
          when properties.$referrer ILIKE '%reddit%' then 'reddit'
          when properties.$referrer ILIKE '%google%' then 'google'
          when properties.$referrer ILIKE '%bing%' then 'bing'
          else 'other'
        end
      ) as utm_source,
      count() as daily_pageviews
    FROM events 
    WHERE event = '$pageview' 
      AND properties.$current_url LIKE '%ampcode.com%'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY date, utm_source
    ORDER BY date DESC, daily_pageviews DESC
  `;

  try {
    const data = await queryPostHog(query);
    res.json({
      success: true,
      data: data,
      period: `${days} days`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message  
    });
  }
});

// Get Reddit-specific traffic details
app.get('/api/reddit-traffic', async (req, res) => {
  const query = `
    SELECT 
      properties.$current_url as page,
      coalesce(
        extractURLParameter(properties.$current_url, 'utm_campaign'),
        extractURLParameter(properties.$referrer, 'utm_campaign'),
        'No Campaign'
      ) as campaign,
      count() as pageviews,
      countDistinct(distinct_id) as unique_visitors
    FROM events 
    WHERE event = '$pageview' 
      AND properties.$current_url LIKE '%ampcode.com%'
      AND (
        extractURLParameter(properties.$current_url, 'utm_source') = 'reddit' OR
        extractURLParameter(properties.$referrer, 'utm_source') = 'reddit' OR
        properties.$referrer ILIKE '%reddit%'
      )
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY page, campaign
    ORDER BY pageviews DESC
  `;

  try {
    const data = await queryPostHog(query);
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Traffic Dashboard running at: http://localhost:${PORT}`);
  console.log('📊 Fetching live data from PostHog...');
  console.log('🎯 Tracking UTM sources: reddit, google, bing, facebook, twitter, direct, other');
});
