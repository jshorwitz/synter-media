import { NextRequest, NextResponse } from 'next/server'

// Mock workflow progress simulation
const mockWorkflowProgress: Record<string, any> = {}

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params
    
    // Initialize mock workflow if it doesn't exist
    if (!mockWorkflowProgress[workflowId]) {
      mockWorkflowProgress[workflowId] = {
        workflowId,
        status: 'running',
        currentStep: 'analysis',
        steps: [
          {
            step: 'analysis',
            status: 'running',
            timestamp: new Date().toISOString()
          },
          {
            step: 'campaign_generation',
            status: 'pending',
            timestamp: new Date().toISOString()
          },
          {
            step: 'campaign_launch',
            status: 'pending',
            timestamp: new Date().toISOString()
          },
          {
            step: 'performance_setup',
            status: 'pending',
            timestamp: new Date().toISOString()
          }
        ],
        progress: 0,
        isComplete: false,
        hasError: false,
        createdAt: Date.now()
      }
    }
    
    const workflow = mockWorkflowProgress[workflowId]
    
    // Simulate progress over time
    const elapsed = Date.now() - workflow.createdAt
    const stepDuration = 5000 // 5 seconds per step
    const currentStepIndex = Math.min(Math.floor(elapsed / stepDuration), 3)
    
    // Update steps based on elapsed time
    workflow.steps.forEach((step: any, index: number) => {
      if (index < currentStepIndex) {
        step.status = 'completed'
      } else if (index === currentStepIndex) {
        step.status = 'running'
        workflow.currentStep = step.step
      } else {
        step.status = 'pending'
      }
    })
    
    // Calculate progress
    workflow.progress = Math.min((currentStepIndex / 4) * 100 + 25, 100)
    
    // Mark as complete when all steps are done
    if (currentStepIndex >= 4) {
      workflow.status = 'completed'
      workflow.isComplete = true
      workflow.progress = 100
      workflow.steps.forEach((step: any) => {
        step.status = 'completed'
      })
    }
    
    return NextResponse.json({
      success: true,
      workflow
    })
  } catch (error) {
    console.error('Workflow status error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workflow status'
      },
      { status: 500 }
    )
  }
}
