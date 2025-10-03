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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing analyst expert. Analyze websites and provide business insights for advertising strategy.',
        },
        {
          role: 'user',
          content: `Analyze this business website and provide insights for advertising: ${url}

Please provide:
1. Industry/sector
2. Business type (B2B, B2C, etc.)
3. Target audience description
4. Suggested monthly ad budget (USD)
5. 3-5 key insights about their market positioning

Format as JSON with keys: industry, businessType, targetAudience, suggestedBudget, keyInsights (array)`,
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
