import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // TODO: Save onboarding data to database
    // For now, just validate and return success
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding data saved'
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}
