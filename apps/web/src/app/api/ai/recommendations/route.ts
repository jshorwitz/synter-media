import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    const { goal, audience, budget, platform } = await request.json()
    
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

    const prompt = `You are an expert digital marketing strategist. Generate campaign recommendations for:

Goal: ${goal}
Target Audience: ${audience}
Daily Budget: $${budget}
Platform: ${platform}

Provide:
1. 10-15 highly relevant keywords
2. A compelling ad headline (max 30 chars)
3. Ad description (max 90 chars)
4. Recommended targeting strategy

Format as JSON with keys: keywords (array), headline, description, targeting`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert digital marketing strategist specializing in paid advertising campaigns.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const recommendations = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      keywords: recommendations.keywords || [],
      adCopy: `${recommendations.headline}\n\n${recommendations.description}`,
      targeting: recommendations.targeting || '',
      modelUsed: 'gpt-4o-mini',
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
