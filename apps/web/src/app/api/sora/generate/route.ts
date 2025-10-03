import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { prompt } = await request.json()

    const videoPrompt = prompt || `A sleek, modern dashboard interface showing real-time advertising campaign analytics across multiple platforms. The scene transitions smoothly between different sections: Google Ads metrics updating in real-time, LinkedIn campaign performance graphs, and Reddit ad engagement charts. Professional, clean UI design with vibrant data visualizations, smooth animations, and a futuristic tech aesthetic. Camera slowly pans across the unified dashboard showing seamless integration of all platforms.`

    // Generate video with Sora
    const video = await openai.videos.generate({
      model: 'sora-1.0-turbo',
      prompt: videoPrompt,
      size: '1280x720',
    })

    return NextResponse.json({
      videoUrl: video.url,
      prompt: videoPrompt,
      model: 'sora-1.0-turbo',
    })
  } catch (error: any) {
    console.error('Sora generation error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate video',
        details: error.response?.data || null 
      },
      { status: 500 }
    )
  }
}
