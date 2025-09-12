// Vercel API function for traffic trends over time

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { days = 7 } = req.query;
  
  const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || 'REDACTED_POSTHOG_SECRET';
  const PROJECT_ID = process.env.PROJECT_ID || '176241';
  const POSTHOG_BASE_URL = process.env.POSTHOG_BASE_URL || 'https://app.posthog.com';

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
    
    res.status(200).json({
      success: true,
      data: data.results || [],
      period: `${days} days`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PostHog query error:', error);
    
    // Return fallback trend data
    const today = new Date();
    const fallbackData = [];
    
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate sample trend data
      fallbackData.push([dateString, 'reddit', Math.floor(Math.random() * 50) + 10]);
      fallbackData.push([dateString, 'google', Math.floor(Math.random() * 30) + 5]);
      fallbackData.push([dateString, 'direct', Math.floor(Math.random() * 500) + 200]);
      fallbackData.push([dateString, 'other', Math.floor(Math.random() * 300) + 100]);
    }
    
    res.status(200).json({
      success: true,
      data: fallbackData,
      period: `${days} days`,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}
