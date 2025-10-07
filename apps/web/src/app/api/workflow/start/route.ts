import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    // Generate a workflow ID
    const workflowId = randomUUID()
    
    // TODO: In production, save workflow to database and queue processing
    // For now, return a workflow ID for polling
    
    console.log('Starting workflow:', {
      workflowId,
      websiteUrl: config.websiteUrl,
      platforms: config.platforms,
      budget: config.budget,
      dryRun: config.dryRun
    })
    
    return NextResponse.json({
      success: true,
      workflowId,
      message: 'Workflow started'
    })
  } catch (error) {
    console.error('Workflow start error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start workflow'
      },
      { status: 500 }
    )
  }
}
