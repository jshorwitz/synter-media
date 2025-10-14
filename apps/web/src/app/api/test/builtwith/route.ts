import { NextRequest, NextResponse } from 'next/server';

// Test-only endpoint to provide mock BuiltWith responses
// Used by E2E tests for deterministic platform detection

export async function GET(request: NextRequest) {
  // Only allow in test/development
  if (process.env.NODE_ENV === 'production' && process.env.E2E_MODE !== 'true') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');
  const scenario = searchParams.get('scenario') || 'default';

  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 });
  }

  // Predefined test scenarios
  const scenarios: Record<string, any> = {
    // Shopify-like: Multi-platform advertiser
    'shopify.com': {
      platforms: {
        google: { detected: true, confidence: 90, tags: ['Google Ads', 'Google Analytics'], estimated_spend: 450000 }, // $4,500
        meta: { detected: true, confidence: 85, tags: ['Facebook Pixel'], estimated_spend: 200000 }, // $2,000
        linkedin: { detected: true, confidence: 80, tags: ['LinkedIn Insight'], estimated_spend: 150000 }, // $1,500
        x: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        reddit: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        microsoft: { detected: true, confidence: 70, tags: ['Bing UET'], estimated_spend: 50000 }, // $500
      },
    },
    // B2B SaaS: Google + LinkedIn heavy
    'amplitude.com': {
      platforms: {
        google: { detected: true, confidence: 95, tags: ['Google Ads'], estimated_spend: 1350000 }, // $13,500
        meta: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        linkedin: { detected: true, confidence: 90, tags: ['LinkedIn Insight'], estimated_spend: 450000 }, // $4,500
        x: { detected: true, confidence: 60, tags: ['Twitter Pixel'], estimated_spend: 240000 }, // $2,400
        reddit: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        microsoft: { detected: true, confidence: 75, tags: ['Microsoft UET'], estimated_spend: 150000 }, // $1,500
      },
    },
    // Small advertiser: Google only
    'small-startup.com': {
      platforms: {
        google: { detected: true, confidence: 85, tags: ['Google Ads'], estimated_spend: 250000 }, // $2,500
        meta: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        linkedin: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        x: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        reddit: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        microsoft: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
      },
    },
    // No ads detected
    'no-ads.com': {
      platforms: {
        google: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        meta: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        linkedin: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        x: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        reddit: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
        microsoft: { detected: false, confidence: 0, tags: [], estimated_spend: 0 },
      },
    },
    // Error scenarios
    'quota-exceeded.com': { error: 'quota_exceeded', status: 429 },
    'timeout.com': { error: 'timeout', status: 504 },
  };

  // Special scenario handling
  if (scenario === 'quota-exceeded' || domain === 'quota-exceeded.com') {
    return NextResponse.json(
      { error: 'BuiltWith API quota exceeded' },
      { status: 429 }
    );
  }

  if (scenario === 'timeout' || domain === 'timeout.com') {
    // Simulate slow response
    await new Promise((resolve) => setTimeout(resolve, 35000));
    return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
  }

  // Default or domain-specific fixture
  const fixture = scenarios[domain] || scenarios['shopify.com'];

  return NextResponse.json(fixture);
}
