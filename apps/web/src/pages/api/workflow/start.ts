/**
 * Mock Workflow API - For local development without backend services
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { websiteUrl, platforms, budget, dryRun } = req.body;

  if (!websiteUrl) {
    return res.status(400).json({ 
      success: false,
      error: 'Website URL is required' 
    });
  }

  // Generate a mock workflow ID
  const workflowId = `mock_workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`Starting mock workflow for ${websiteUrl}`);

  // Simulate workflow creation
  res.json({
    success: true,
    workflowId,
    message: 'Mock workflow started successfully',
    estimatedDuration: '2-3 minutes',
    note: 'Running in mock mode for local development'
  });
}
