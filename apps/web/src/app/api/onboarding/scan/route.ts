import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Platform detection signatures (case-insensitive)
const PLATFORM_SIGNATURES = {
  google: [
    'googleadservices.com',
    'doubleclick.net',
    'gtag',
    'gtm.js',
    'googletagmanager',
    'google-analytics',
    'ga(\'create\'',
    'AW-',
    'googlesyndication.com',
    'adsbygoogle',
    'google_conversion',
  ],
  meta: [
    'connect.facebook.net',
    'fbevents',
    'fbq',
    'facebook.com/tr',
    '_fbp',
    'facebook-pixel',
    'facebook.net',
  ],
  linkedin: [
    'snap.licdn.com',
    'li.lms-analytics',
    'insight.min.js',
    '_linkedin_partner',
    'linkedin.com/px',
    'licdn.com',
  ],
  x: [
    'static.ads-twitter.com',
    'twq',
    'twitter.com/i/adsct',
    'analytics.twitter.com',
    't.co/i/adsct',
  ],
  reddit: [
    'rdt.js',
    'redditstatic.com/ads',
    'rdt(',
    'reddit pixel',
  ],
  microsoft: [
    'bat.bing.com',
    'uetq',
    'UET',
    'bing.com/bat',
    'microsoft advertising',
  ],
};

interface BuiltWithTechnology {
  Name: string;
  Tag: string;
  Categories?: string[];
}

interface BuiltWithResult {
  Results: Array<{
    Paths: Array<{
      Domain: string;
      Url: string;
      Technologies?: BuiltWithTechnology[];
    }>;
  }>;
}

async function detectPlatformsBuiltWith(domain: string): Promise<Record<string, { detected: boolean; confidence: number; tags: string[] }>> {
  const apiKey = process.env.BUILTWITH_API_KEY;
  
  if (!apiKey) {
    console.warn('BuiltWith API key not configured, skipping BuiltWith detection');
    return {};
  }

  try {
    const url = `https://api.builtwith.com/v22/api.json?KEY=${apiKey}&HIDETEXT=yes&NOMETA=yes&NOPII=yes&NOATTR=yes&LOOKUP=${domain}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Synter/1.0' },
    });

    if (!response.ok) {
      console.error('BuiltWith API error:', response.status, await response.text());
      return {};
    }

    const data: BuiltWithResult = await response.json();
    const results: Record<string, { detected: boolean; confidence: number; tags: string[] }> = {};

    // Parse technologies from first result
    const technologies = data.Results?.[0]?.Paths?.[0]?.Technologies || [];

    // Map technologies to platforms
    for (const [platform, signatures] of Object.entries(PLATFORM_SIGNATURES)) {
      const matchedTags: string[] = [];
      
      for (const tech of technologies) {
        const techName = tech.Name?.toLowerCase() || '';
        const techTag = tech.Tag?.toLowerCase() || '';
        
        for (const signature of signatures) {
          if (techName.includes(signature.toLowerCase()) || techTag.includes(signature.toLowerCase())) {
            matchedTags.push(tech.Name || tech.Tag);
            break;
          }
        }
      }

      if (matchedTags.length > 0) {
        results[platform] = {
          detected: true,
          confidence: 90,
          tags: [...new Set(matchedTags)],
        };
      }
    }

    return results;
  } catch (error) {
    console.error('BuiltWith detection error:', error);
    return {};
  }
}

async function detectPlatformsScrape(url: string): Promise<Record<string, { detected: boolean; confidence: number; tags: string[] }>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`Scrape failed for ${url}: ${response.status}`);
      return {};
    }

    const html = await response.text();
    const htmlLower = html.toLowerCase(); // Case-insensitive matching
    const results: Record<string, { detected: boolean; confidence: number; tags: string[] }> = {};

    for (const [platform, signatures] of Object.entries(PLATFORM_SIGNATURES)) {
      const matchedTags: string[] = [];
      
      for (const signature of signatures) {
        const sigLower = signature.toLowerCase();
        // Check both original HTML and lowercase for case-insensitive matches
        if (htmlLower.includes(sigLower)) {
          matchedTags.push(signature);
        }
      }

      if (matchedTags.length > 0) {
        // Higher confidence with more matches
        const confidence = Math.min(70 + (matchedTags.length * 5), 90);
        results[platform] = {
          detected: true,
          confidence,
          tags: matchedTags,
        };
      }
    }

    console.log(`Scrape results for ${url}:`, Object.keys(results));
    return results;
  } catch (error) {
    console.error('Scrape detection error:', error);
    return {};
  }
}

function estimateSpend(platformsDetected: number): Record<string, number> {
  // Heuristic: more platforms = higher total spend
  // If 0 detected, assume small baseline for estimation purposes
  let baseSpend = 0;
  
  if (platformsDetected === 0) {
    baseSpend = 100000; // $1,000/mo baseline if nothing detected
  } else if (platformsDetected === 1) {
    baseSpend = 300000; // $3,000/mo in cents
  } else if (platformsDetected === 2) {
    baseSpend = 1200000; // $12,000/mo
  } else if (platformsDetected >= 3) {
    baseSpend = 3500000; // $35,000/mo
  }

  // Distribution percentages by platform
  const distribution: Record<string, number> = {
    google: 0.45,
    meta: 0.20,
    linkedin: 0.15,
    x: 0.08,
    reddit: 0.07,
    microsoft: 0.05,
  };

  const result: Record<string, number> = {};
  for (const platform of Object.keys(distribution)) {
    result[platform] = Math.round(baseSpend * distribution[platform]);
  }

  return result;
}

async function performScan(scanId: string, url: string, domain: string) {
  try {
    // Update status to discovering
    await prisma.onboardingScan.update({
      where: { scan_id: scanId },
      data: { status: 'discovering', progress: 10 },
    });

    // Try BuiltWith first
    let detectionResults = await detectPlatformsBuiltWith(domain);
    
    // Fallback to scraping if BuiltWith didn't find anything
    if (Object.keys(detectionResults).length === 0) {
      await prisma.onboardingScan.update({
        where: { scan_id: scanId },
        data: { status: 'analyzing', progress: 40 },
      });
      
      detectionResults = await detectPlatformsScrape(url);
    }

    // Calculate spend estimates
    const platformsDetected = Object.keys(detectionResults).length;
    const spendDistribution = estimateSpend(platformsDetected);

    // Update status to analyzing
    await prisma.onboardingScan.update({
      where: { scan_id: scanId },
      data: { status: 'analyzing', progress: 70 },
    });

    // Create platform records
    const allPlatforms = ['google', 'meta', 'linkedin', 'x', 'reddit', 'microsoft'];
    
    for (const platform of allPlatforms) {
      const detection = detectionResults[platform];
      
      await prisma.onboardingScanPlatform.create({
        data: {
          scan_id: (await prisma.onboardingScan.findUnique({ where: { scan_id: scanId } }))!.id,
          platform,
          detected: detection?.detected || false,
          confidence: detection?.confidence || 0,
          tags: detection?.tags || [],
          estimated_spend: detection ? spendDistribution[platform] : 0,
        },
      });
    }

    // Mark as done
    await prisma.onboardingScan.update({
      where: { scan_id: scanId },
      data: {
        status: 'done',
        progress: 100,
        finished_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Scan error:', error);
    await prisma.onboardingScan.update({
      where: { scan_id: scanId },
      data: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        finished_at: new Date(),
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Parse domain from URL
    let domain: string;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Generate scan ID
    const scanId = randomBytes(16).toString('hex');

    // Create scan record
    await prisma.onboardingScan.create({
      data: {
        scan_id: scanId,
        url,
        domain,
        status: 'queued',
        progress: 0,
      },
    });

    // Start background scan (non-blocking)
    performScan(scanId, url, domain).catch(console.error);

    return NextResponse.json({ scan_id: scanId }, { status: 200 });
  } catch (error) {
    console.error('Scan creation error:', error);
    return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 });
  }
}
