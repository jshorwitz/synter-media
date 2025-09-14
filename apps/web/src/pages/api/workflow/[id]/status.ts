/**
 * Mock Workflow Status API - For local development
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Store mock workflows in memory
const mockWorkflows: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Workflow ID is required' });
  }

  // Initialize mock workflow if it doesn't exist
  if (!mockWorkflows[id]) {
    mockWorkflows[id] = {
      workflowId: id,
      status: 'running',
      currentStep: 'analysis',
      steps: [],
      progress: 0,
      isComplete: false,
      hasError: false,
      websiteUrl: 'https://example.com',
      startTime: Date.now(),
    };
  }

  const workflow = mockWorkflows[id];
  const elapsed = Date.now() - workflow.startTime;

  // Simulate workflow progress over time
  if (elapsed < 10000) { // 0-10 seconds
    workflow.currentStep = 'analysis';
    workflow.progress = 25;
    workflow.steps = [
      {
        step: 'analysis',
        status: 'running',
        timestamp: new Date(workflow.startTime),
      }
    ];
  } else if (elapsed < 20000) { // 10-20 seconds
    workflow.currentStep = 'campaign_generation';
    workflow.progress = 50;
    workflow.steps = [
      {
        step: 'analysis',
        status: 'completed',
        result: {
          businessInfo: {
            title: 'Example Business',
            industry: 'Technology',
            description: 'A great technology company'
          }
        },
        timestamp: new Date(workflow.startTime),
      },
      {
        step: 'campaign_generation',
        status: 'running',
        timestamp: new Date(workflow.startTime + 10000),
      }
    ];
  } else if (elapsed < 30000) { // 20-30 seconds
    workflow.currentStep = 'campaign_launch';
    workflow.progress = 75;
    workflow.steps = [
      ...workflow.steps.slice(0, -1),
      {
        step: 'campaign_generation',
        status: 'completed',
        result: {
          strategies: [
            { platform: 'google', campaignType: 'Search' },
            { platform: 'meta', campaignType: 'Conversion' }
          ]
        },
        timestamp: new Date(workflow.startTime + 10000),
      },
      {
        step: 'campaign_launch',
        status: 'running',
        timestamp: new Date(workflow.startTime + 20000),
      }
    ];
  } else { // >30 seconds - complete
    workflow.status = 'completed';
    workflow.currentStep = 'performance_setup';
    workflow.progress = 100;
    workflow.isComplete = true;
    workflow.steps = [
      ...workflow.steps.slice(0, -1),
      {
        step: 'campaign_launch',
        status: 'completed',
        result: {
          launchResults: [
            { platform: 'google', campaignId: 'mock_google_123', status: 'success' },
            { platform: 'meta', campaignId: 'mock_meta_456', status: 'success' }
          ]
        },
        timestamp: new Date(workflow.startTime + 20000),
      },
      {
        step: 'performance_setup',
        status: 'completed',
        result: { trackingSetup: true },
        timestamp: new Date(workflow.startTime + 30000),
      }
    ];
  }

  res.json({
    success: true,
    workflow
  });
}
