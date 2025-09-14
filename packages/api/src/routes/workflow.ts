/**
 * Workflow API Routes - Main entry point for the unified advertising workflow
 * 
 * Routes:
 * POST /workflow/start - Start the complete advertising workflow
 * GET /workflow/:id/status - Get workflow status
 * GET /workflow/:id/metrics - Get campaign performance metrics
 * POST /workflow/health - Health check for all services
 */

import express from 'express';
import { z } from 'zod';
import { WorkflowOrchestrator, createWorkflowOrchestrator, WorkflowInput } from '../services/workflow-orchestrator';
import { WebsiteAnalyzerAdapter } from '../services/adapters/website-analyzer-adapter';
import { CampaignGeneratorAdapter } from '../services/adapters/campaign-generator-adapter';
import { CampaignLauncherAdapter } from '../services/adapters/campaign-launcher-adapter';
import { PerformanceTrackerAdapter } from '../services/adapters/performance-tracker-adapter';
import { DatabaseAdapter } from '../services/adapters/database-adapter';

const router = express.Router();

// Initialize services
const websiteAnalyzer = new WebsiteAnalyzerAdapter();
const campaignGenerator = new CampaignGeneratorAdapter();
const campaignLauncher = new CampaignLauncherAdapter();
const performanceTracker = new PerformanceTrackerAdapter();
const database = new DatabaseAdapter();

// Initialize orchestrator
const orchestrator = createWorkflowOrchestrator({
  websiteAnalyzer,
  campaignGenerator,
  campaignLauncher,
  performanceTracker,
  database,
});

// Initialize database tables
database.initialize().catch(console.error);

// Request schemas
const StartWorkflowSchema = z.object({
  websiteUrl: z.string().url('Please provide a valid website URL'),
  platforms: z.array(z.enum(['google', 'meta', 'reddit', 'x'])).min(1, 'Select at least one platform').default(['google']),
  budget: z.number().min(100, 'Minimum budget is $100').max(50000, 'Maximum budget is $50,000').default(1000),
  dryRun: z.boolean().default(true),
});

/**
 * POST /workflow/start
 * Start the complete advertising workflow
 */
router.post('/start', async (req, res) => {
  try {
    console.log('Starting new workflow:', req.body);

    // Validate request
    const validatedData = StartWorkflowSchema.parse(req.body);
    
    // Add user ID (from auth middleware)
    const workflowInput: WorkflowInput = {
      ...validatedData,
      userId: (req as any).user?.id || 'anonymous', // Assume auth middleware adds user
    };

    // Start workflow
    const workflowId = await orchestrator.startWorkflow(workflowInput);

    res.json({
      success: true,
      workflowId,
      message: 'Workflow started successfully',
      estimatedDuration: '5-10 minutes',
    });

  } catch (error) {
    console.error('Workflow start error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to start workflow',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /workflow/:id/status
 * Get workflow status and progress
 */
router.get('/:id/status', async (req, res) => {
  try {
    const workflowId = req.params.id;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required',
      });
    }

    const status = await orchestrator.getWorkflowStatus(workflowId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    // Calculate progress percentage
    const totalSteps = ['analysis', 'campaign_generation', 'campaign_launch', 'performance_setup'];
    const completedSteps = status.steps.filter(step => step.status === 'completed').length;
    const progress = Math.round((completedSteps / totalSteps.length) * 100);

    res.json({
      success: true,
      workflow: {
        ...status,
        progress,
        isComplete: status.status === 'completed',
        hasError: status.status === 'failed',
      },
    });

  } catch (error) {
    console.error('Get workflow status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /workflow/:id/metrics
 * Get campaign performance metrics for a workflow
 */
router.get('/:id/metrics', async (req, res) => {
  try {
    const workflowId = req.params.id;
    
    const status = await orchestrator.getWorkflowStatus(workflowId);
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    // Get campaign IDs from workflow result
    const campaignIds = status.result?.launchResults
      ?.filter((result: any) => result.campaignId)
      ?.map((result: any) => result.campaignId) || [];

    if (campaignIds.length === 0) {
      return res.json({
        success: true,
        metrics: [],
        message: 'No campaigns launched yet',
      });
    }

    // Get performance metrics
    const metrics = await performanceTracker.trackCampaigns(campaignIds);

    // Group metrics by platform
    const metricsByPlatform = metrics.reduce((acc, metric) => {
      if (!acc[metric.platform]) {
        acc[metric.platform] = [];
      }
      acc[metric.platform].push(metric);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate summary stats
    const summary = {
      totalSpend: metrics.reduce((sum, m) => sum + m.spend, 0),
      totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
      totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
      totalConversions: metrics.reduce((sum, m) => sum + m.conversions, 0),
      averageROAS: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.roas, 0) / metrics.length : 0,
    };

    res.json({
      success: true,
      metrics: metricsByPlatform,
      summary,
      campaignCount: campaignIds.length,
      lastUpdated: new Date(),
    });

  } catch (error) {
    console.error('Get workflow metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /workflow/user/:userId
 * Get all workflows for a user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const workflows = await database.getUserWorkflows(userId, limit);

    res.json({
      success: true,
      workflows,
      count: workflows.length,
    });

  } catch (error) {
    console.error('Get user workflows error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user workflows',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /workflow/health
 * Health check for all services
 */
router.get('/health', async (req, res) => {
  try {
    console.log('Performing health checks...');

    const [
      websiteAnalyzerHealth,
      campaignGeneratorHealth,
      campaignLauncherHealth,
      performanceTrackerHealth,
      databaseHealth,
    ] = await Promise.all([
      websiteAnalyzer.healthCheck(),
      campaignGenerator.healthCheck(),
      campaignLauncher.healthCheck(),
      performanceTracker.healthCheck(),
      database.healthCheck(),
    ]);

    const overallHealth = {
      websiteAnalyzer: websiteAnalyzerHealth,
      campaignGenerator: campaignGeneratorHealth,
      campaignLauncher: campaignLauncherHealth,
      performanceTracker: performanceTrackerHealth,
      database: databaseHealth,
    };

    const isHealthy = Object.values(overallHealth).every(health => 
      typeof health === 'boolean' ? health : Object.values(health).some(v => v)
    );

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      services: overallHealth,
      timestamp: new Date(),
      message: isHealthy ? 'All services healthy' : 'Some services are unavailable',
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /workflow/:id
 * Cancel a running workflow
 */
router.delete('/:id', async (req, res) => {
  try {
    const workflowId = req.params.id;
    
    const status = await orchestrator.getWorkflowStatus(workflowId);
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    if (status.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed workflow',
      });
    }

    // TODO: Implement workflow cancellation logic
    // For now, just mark as failed
    status.status = 'failed';
    status.updatedAt = new Date();
    await database.saveWorkflowStatus(status);

    res.json({
      success: true,
      message: 'Workflow cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel workflow',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
