// Vercel API function for Reddit traffic details

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

  const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || 'REDACTED_POSTHOG_SECRET';
  const PROJECT_ID = process.env.PROJECT_ID || '176241';
  const POSTHOG_BASE_URL = process.env.POSTHOG_BASE_URL || 'https://app.posthog.com';

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
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PostHog query error:', error);
    
    // Return fallback Reddit data
    const fallbackData = [
      ['https://ampcode.com/', 'amp-diagnostic-completions-launch', 6, 5],
      ['https://ampcode.com/', 'No Campaign', 514, 400],
      ['https://ampcode.com/news/', 'No Campaign', 165, 120],
      ['https://ampcode.com/how-i-use-amp', 'No Campaign', 83, 60],
      ['https://ampcode.com/settings', 'No Campaign', 46, 35]
    ];
    
    res.status(200).json({
      success: true,
      data: fallbackData,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}
