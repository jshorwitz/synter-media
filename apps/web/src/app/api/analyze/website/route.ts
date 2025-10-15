import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!openai) {
      return NextResponse.json({
        industry: 'Technology',
        businessType: 'B2B SaaS',
        targetAudience: 'Business professionals and decision makers',
        suggestedBudget: 5000,
        keyInsights: [
          'Professional website with clear value proposition',
          'Likely targeting enterprise customers',
          'Focus on productivity and efficiency',
        ],
        modelUsed: 'fallback',
      })
    }

    // Fetch website content for better analysis
    let websiteContent = '';
    let productDescription = '';
    
    try {
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      const res = await fetch(cleanUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SynterBot/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      
      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        
        websiteContent = [
          titleMatch?.[1],
          descMatch?.[1] || ogDescMatch?.[1],
        ].filter(Boolean).join('\n');
        
        // Try to find product description
        const productMatch = html.match(/<meta[^>]*name=["']product["'][^>]*content=["']([^"']+)["']/i);
        if (productMatch) {
          productDescription = productMatch[1];
        }
      }
    } catch (err) {
      console.log('Failed to fetch website content:', err);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing analyst expert. Analyze websites and provide business insights for advertising strategy.',
        },
        {
          role: 'user',
          content: `Analyze this business website: ${url}

${websiteContent ? `Website info:\n${websiteContent}\n\n` : ''}

Please provide:
1. Industry/sector
2. Business type (B2B, B2C, etc.)
3. Product/service description (concise, 1-2 sentences)
4. Target audience description (specific)
5. 3-5 key insights about their market positioning

Format as JSON with keys: industry, businessType, productDescription, targetAudience, keyInsights (array)`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const analysis = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      ...analysis,
      websiteUrl: url,
      analyzedAt: new Date().toISOString(),
      modelUsed: 'gpt-4o',
    })
  } catch (error: any) {
    console.error('Website analysis error:', error)
    
    return NextResponse.json({
      industry: 'Technology',
      businessType: 'B2B',
      targetAudience: 'Business professionals',
      suggestedBudget: 5000,
      keyInsights: [
        'Professional business website',
        'Likely serves B2B market',
        'Could benefit from targeted advertising',
      ],
      websiteUrl: request.url,
      modelUsed: 'fallback',
    })
  }
}
