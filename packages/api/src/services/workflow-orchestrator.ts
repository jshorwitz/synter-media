/**
 * Workflow Orchestrator - Connects all existing Synter components into unified flow
 * 
 * Flow: Website URL → Analysis → Personas → Campaign Generation → Launch → Tracking
 */

import { z } from 'zod';

// Schemas for the workflow
const WorkflowInputSchema = z.object({
  websiteUrl: z.string().url(),
  userId: z.string(),
  platforms: z.array(z.enum(['google', 'meta', 'reddit', 'x'])).default(['google']),
  budget: z.number().min(100).default(1000),
  dryRun: z.boolean().default(true),
});

const WorkflowStepSchema = z.object({
  step: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  result: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.date(),
});

const WorkflowStatusSchema = z.object({
  workflowId: z.string(),
  userId: z.string(),
  websiteUrl: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  currentStep: z.string().optional(),
  steps: z.array(WorkflowStepSchema),
  result: z.any().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowInput = z.infer<typeof WorkflowInputSchema>;
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

interface WorkflowServices {
  websiteAnalyzer: WebsiteAnalyzerService;
  campaignGenerator: CampaignGeneratorService;
  campaignLauncher: CampaignLauncherService;
  performanceTracker: PerformanceTrackerService;
  database: DatabaseService;
}

// Service interfaces for existing components
interface WebsiteAnalyzerService {
  analyzeWebsite(url: string): Promise<WebsiteAnalysis>;
}

interface CampaignGeneratorService {
  generateCampaigns(analysis: WebsiteAnalysis, platforms: string[]): Promise<CampaignStrategy[]>;
}

interface CampaignLauncherService {
  launchCampaigns(strategies: CampaignStrategy[], dryRun: boolean): Promise<CampaignLaunchResult[]>;
}

interface PerformanceTrackerService {
  trackCampaigns(campaignIds: string[]): Promise<PerformanceMetrics[]>;
}

interface DatabaseService {
  saveWorkflowStatus(status: WorkflowStatus): Promise<void>;
  getWorkflowStatus(workflowId: string): Promise<WorkflowStatus | null>;
  updateWorkflowStep(workflowId: string, step: WorkflowStep): Promise<void>;
}

// Data types from existing systems
interface WebsiteAnalysis {
  businessInfo: {
    title: string;
    description: string;
    industry: string;
    businessType: string;
  };
  personas: {
    demographics: any;
    interests: string[];
    painPoints: string[];
    valueProps: string[];
  }[];
  competitorInsights: {
    competitors: string[];
    adOpportunities: string[];
  };
  adReadiness: {
    score: number;
    recommendations: string[];
  };
}

interface CampaignStrategy {
  platform: string;
  campaignType: string;
  targeting: {
    demographics: any;
    interests: string[];
    keywords: string[];
  };
  adCopy: {
    headlines: string[];
    descriptions: string[];
    callToActions: string[];
  };
  budget: {
    daily: number;
    total: number;
  };
  bidStrategy: string;
}

interface CampaignLaunchResult {
  platform: string;
  campaignId?: string;
  status: 'success' | 'failed';
  error?: string;
  metrics?: {
    impressions: number;
    clicks: number;
    spend: number;
  };
}

interface PerformanceMetrics {
  campaignId: string;
  platform: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  roas: number;
  timestamp: Date;
}

export class WorkflowOrchestrator {
  private services: WorkflowServices;

  constructor(services: WorkflowServices) {
    this.services = services;
  }

  /**
   * Start the complete advertising workflow
   */
  async startWorkflow(input: WorkflowInput): Promise<string> {
    const validatedInput = WorkflowInputSchema.parse(input);
    const workflowId = this.generateWorkflowId();

    // Initialize workflow status
    const workflow: WorkflowStatus = {
      workflowId,
      userId: validatedInput.userId,
      websiteUrl: validatedInput.websiteUrl,
      status: 'pending',
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.services.database.saveWorkflowStatus(workflow);

    // Start workflow execution (async)
    this.executeWorkflow(validatedInput, workflowId).catch(error => {
      console.error(`Workflow ${workflowId} failed:`, error);
      this.handleWorkflowError(workflowId, error);
    });

    return workflowId;
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus | null> {
    return this.services.database.getWorkflowStatus(workflowId);
  }

  /**
   * Execute the complete workflow
   */
  private async executeWorkflow(input: WorkflowInput, workflowId: string): Promise<void> {
    try {
      // Step 1: Website Analysis
      await this.updateWorkflowStep(workflowId, 'analysis', 'running');
      const analysis = await this.services.websiteAnalyzer.analyzeWebsite(input.websiteUrl);
      await this.updateWorkflowStep(workflowId, 'analysis', 'completed', analysis);

      // Step 2: Campaign Generation
      await this.updateWorkflowStep(workflowId, 'campaign_generation', 'running');
      const strategies = await this.services.campaignGenerator.generateCampaigns(
        analysis, 
        input.platforms
      );
      await this.updateWorkflowStep(workflowId, 'campaign_generation', 'completed', strategies);

      // Step 3: Campaign Launch
      await this.updateWorkflowStep(workflowId, 'campaign_launch', 'running');
      const launchResults = await this.services.campaignLauncher.launchCampaigns(
        strategies, 
        input.dryRun
      );
      await this.updateWorkflowStep(workflowId, 'campaign_launch', 'completed', launchResults);

      // Step 4: Performance Tracking Setup
      const campaignIds = launchResults
        .filter(result => result.campaignId)
        .map(result => result.campaignId!);

      if (campaignIds.length > 0) {
        await this.updateWorkflowStep(workflowId, 'performance_setup', 'running');
        const metrics = await this.services.performanceTracker.trackCampaigns(campaignIds);
        await this.updateWorkflowStep(workflowId, 'performance_setup', 'completed', metrics);
      }

      // Mark workflow as completed
      await this.markWorkflowCompleted(workflowId, {
        analysis,
        strategies,
        launchResults,
        campaignIds,
      });

    } catch (error) {
      await this.handleWorkflowError(workflowId, error as Error);
      throw error;
    }
  }

  /**
   * Update workflow step status
   */
  private async updateWorkflowStep(
    workflowId: string, 
    stepName: string, 
    status: 'pending' | 'running' | 'completed' | 'failed',
    result?: any,
    error?: string
  ): Promise<void> {
    const step: WorkflowStep = {
      step: stepName,
      status,
      result,
      error,
      timestamp: new Date(),
    };

    await this.services.database.updateWorkflowStep(workflowId, step);
  }

  /**
   * Mark workflow as completed
   */
  private async markWorkflowCompleted(workflowId: string, result: any): Promise<void> {
    const workflow = await this.services.database.getWorkflowStatus(workflowId);
    if (workflow) {
      workflow.status = 'completed';
      workflow.result = result;
      workflow.updatedAt = new Date();
      await this.services.database.saveWorkflowStatus(workflow);
    }
  }

  /**
   * Handle workflow errors
   */
  private async handleWorkflowError(workflowId: string, error: Error): Promise<void> {
    const workflow = await this.services.database.getWorkflowStatus(workflowId);
    if (workflow) {
      workflow.status = 'failed';
      workflow.updatedAt = new Date();
      
      // Add error step
      const errorStep: WorkflowStep = {
        step: 'error',
        status: 'failed',
        error: error.message,
        timestamp: new Date(),
      };
      workflow.steps.push(errorStep);
      
      await this.services.database.saveWorkflowStatus(workflow);
    }
  }

  /**
   * Generate unique workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export factory function for easy setup
export function createWorkflowOrchestrator(services: WorkflowServices): WorkflowOrchestrator {
  return new WorkflowOrchestrator(services);
}
