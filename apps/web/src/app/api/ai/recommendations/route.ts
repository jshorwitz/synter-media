import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// Fetch and extract site content
async function fetchSiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Synter AI Campaign Builder/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    
    if (!response.ok) return ''
    
    const html = await response.text()
    
    // Strip scripts, styles, and HTML tags
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000) // Limit to ~10K chars
    
    return cleaned
  } catch (error) {
    console.error('Site fetch error:', error)
    return ''
  }
}

// Generate competitor keywords
function generateCompetitorKeywords(domain: string, industry: string): string[] {
  const industryMap: Record<string, string[]> = {
    'Technology': ['software alternative', 'tech platform', 'SaaS solution', 'enterprise software'],
    'E-commerce': ['online store', 'ecommerce platform', 'shopping cart'],
    'Finance': ['fintech solution', 'payment platform', 'banking software'],
    'Healthcare': ['healthcare software', 'telemedicine', 'patient management'],
    'Education': ['edtech platform', 'learning management', 'online education'],
  }
  
  const baseKeywords = industryMap[industry] || industryMap['Technology']
  const competitorTerms = [
    `best ${domain} alternative`,
    `${domain} vs competitors`,
    `${domain} pricing`,
    `${domain} reviews`,
  ]
  
  return [...baseKeywords.slice(0, 3), ...competitorTerms.slice(0, 2)]
}

const campaignPlanSchema = {
  type: 'object',
  properties: {
    personas: {
      type: 'array',
      description: '2-3 detailed customer personas',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          demographics: {
            type: 'object',
            properties: {
              age: { type: 'string' },
              jobTitle: { type: 'string' },
              location: { type: 'string' },
            },
          },
          painPoints: { type: 'array', items: { type: 'string' } },
          triggers: { type: 'array', items: { type: 'string' } },
          objections: { type: 'array', items: { type: 'string' } },
          valueProps: { type: 'array', items: { type: 'string' } },
          keywords: { type: 'array', items: { type: 'string' } },
          recommendedPlatforms: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    keywordPlan: {
      type: 'object',
      description: 'Organized keyword strategy',
      properties: {
        informational: { type: 'array', items: { type: 'string' } },
        commercial: { type: 'array', items: { type: 'string' } },
        branded: { type: 'array', items: { type: 'string' } },
        competitor: { type: 'array', items: { type: 'string' } },
        longTail: { type: 'array', items: { type: 'string' } },
        negatives: { type: 'array', items: { type: 'string' } },
      },
    },
    adAssets: {
      type: 'object',
      description: 'Platform-specific ad creatives',
      properties: {
        google: {
          type: 'object',
          properties: {
            headlines: { type: 'array', items: { type: 'string' }, description: '6-10 headlines, max 30 chars' },
            descriptions: { type: 'array', items: { type: 'string' }, description: '4 descriptions, max 90 chars' },
            sitelinks: { type: 'array', items: { type: 'string' } },
            callouts: { type: 'array', items: { type: 'string' } },
            structuredSnippets: { type: 'array', items: { type: 'string' } },
          },
        },
        meta: {
          type: 'object',
          properties: {
            primaryTexts: { type: 'array', items: { type: 'string' } },
            headlines: { type: 'array', items: { type: 'string' } },
            descriptions: { type: 'array', items: { type: 'string' } },
            cta: { type: 'string' },
          },
        },
      },
    },
    targeting: {
      type: 'object',
      description: 'Platform-specific targeting',
      properties: {
        google: {
          type: 'object',
          properties: {
            audiences: { type: 'array', items: { type: 'string' } },
            locations: { type: 'array', items: { type: 'string' } },
            devices: { type: 'array', items: { type: 'string' } },
            placements: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    budgetStrategy: {
      type: 'object',
      properties: {
        dailyBudget: { type: 'number' },
        platformSplit: {
          type: 'object',
          properties: {
            google: { type: 'number' },
            meta: { type: 'number' },
            linkedin: { type: 'number' },
          },
        },
        bidStrategy: { type: 'string' },
        targetCPA: { type: 'number' },
      },
    },
    measurement: {
      type: 'object',
      properties: {
        keyEvents: { type: 'array', items: { type: 'string' } },
        utmPlan: { type: 'string' },
        optimizationChecklist: { type: 'array', items: { type: 'string' } },
      },
    },
  },
  required: ['personas', 'keywordPlan', 'adAssets', 'targeting', 'budgetStrategy'],
  additionalProperties: false,
}

export async function POST(request: NextRequest) {
  try {
    const { goal, audience, budget, platform, websiteUrl, industry, competitors } = await request.json()
    
    // Return fallback if OpenAI not configured
    if (!openai) {
      return NextResponse.json({
        keywords: [
          'software solution',
          'enterprise software',
          'b2b platform',
          'business tools',
          'productivity software',
        ],
        adCopy: 'Powerful Software for Modern Teams\n\nIncrease productivity and streamline operations.',
        targeting: 'Business professionals, decision makers, IT managers',
        modelUsed: 'fallback-no-api-key',
      })
    }

    // Optional: Fetch site content if URL provided
    let siteExcerpt = ''
    let competitorKeywordSeeds: string[] = []
    
    if (websiteUrl) {
      siteExcerpt = await fetchSiteContent(websiteUrl)
      
      if (industry) {
        const domain = new URL(websiteUrl).hostname.replace('www.', '')
        competitorKeywordSeeds = generateCompetitorKeywords(domain, industry)
      }
    }

    const enhancedPrompt = `You are an expert digital marketing strategist. Create a comprehensive campaign plan for:

Goal: ${goal}
Target Audience: ${audience}
Daily Budget: $${budget}
Platform: ${platform}
${industry ? `Industry: ${industry}` : ''}
${siteExcerpt ? `\nWebsite Content:\n${siteExcerpt.slice(0, 3000)}` : ''}
${competitorKeywordSeeds.length ? `\nCompetitor Seed Keywords: ${competitorKeywordSeeds.join(', ')}` : ''}
${competitors ? `\nKnown Competitors: ${competitors}` : ''}

Create a detailed campaign plan with:
1. 2-3 distinct customer personas with demographics, pain points, triggers, objections, value props, and keywords
2. Keyword strategy organized by intent (informational, commercial, branded, competitor, long-tail) with negative keywords
3. Platform-specific ad assets:
   - Google: 6-10 headlines (30 chars max), 4 descriptions (90 chars max), sitelinks, callouts
   - Meta/LinkedIn (if applicable): primary texts, headlines, CTAs
4. Targeting strategy: audiences, locations, devices, placements
5. Budget allocation across platforms with bid strategy recommendations
6. Measurement plan: key events, UTM structure, 7-day optimization checklist

Important:
- Ensure all Google ad copy adheres to platform policies (no superlatives without proof, no restricted claims)
- Focus on conversion-driving copy, not just awareness
- Recommend negative keywords to reduce wasted spend (e.g., "free", "jobs", "salary" for B2B software)
- Provide specific, actionable recommendations`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert digital marketing strategist specializing in paid advertising campaigns. You create detailed, data-driven campaign plans with deep persona research and platform-specific optimizations.',
        },
        {
          role: 'user',
          content: enhancedPrompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'CampaignPlan',
          schema: campaignPlanSchema,
          strict: true,
        },
      },
      temperature: 0.3, // Lower for more precise research
    })

    const plan = JSON.parse(completion.choices[0].message.content || '{}')

    // Backward-compatible response
    const allKeywords = [
      ...(plan.keywordPlan?.commercial || []),
      ...(plan.keywordPlan?.branded || []),
      ...(plan.keywordPlan?.longTail || []),
    ]

    const primaryAdCopy = plan.adAssets?.google?.headlines?.[0] && plan.adAssets?.google?.descriptions?.[0]
      ? `${plan.adAssets.google.headlines[0]}\n\n${plan.adAssets.google.descriptions[0]}`
      : 'Powerful Solution for Your Business\n\nGet started today with proven results.'

    const primaryTargeting = plan.targeting?.google?.audiences?.join(', ') || audience

    return NextResponse.json({
      // Backward-compatible fields
      keywords: allKeywords.slice(0, 15),
      adCopy: primaryAdCopy,
      targeting: primaryTargeting,
      modelUsed: 'gpt-4o-mini-enhanced',
      
      // Full structured plan for advanced UI
      recommendations: plan,
    })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    // Fallback recommendations if OpenAI fails
    return NextResponse.json({
      keywords: [
        'software solution',
        'enterprise software',
        'b2b platform',
        'business tools',
        'productivity software',
      ],
      adCopy: 'Powerful Software for Modern Teams\n\nIncrease productivity and streamline operations.',
      targeting: 'Business professionals, decision makers, IT managers',
      modelUsed: 'fallback',
    })
  }
}
