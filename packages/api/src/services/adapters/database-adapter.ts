/**
 * Database Adapter - Manages workflow state and connects to existing database systems
 */

import { Pool } from 'pg';
import { WorkflowStatus, WorkflowStep } from '../workflow-orchestrator';

export class DatabaseAdapter {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * Initialize database tables for workflow management
   */
  async initialize(): Promise<void> {
    await this.createWorkflowTables();
  }

  /**
   * Create workflow-related database tables
   */
  private async createWorkflowTables(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Workflow status table
      await client.query(`
        CREATE TABLE IF NOT EXISTS workflow_status (
          workflow_id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          website_url TEXT NOT NULL,
          status VARCHAR(50) NOT NULL,
          current_step VARCHAR(255),
          steps JSONB DEFAULT '[]',
          result JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Workflow steps table for detailed tracking
      await client.query(`
        CREATE TABLE IF NOT EXISTS workflow_steps (
          id SERIAL PRIMARY KEY,
          workflow_id VARCHAR(255) NOT NULL REFERENCES workflow_status(workflow_id),
          step_name VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          result JSONB,
          error TEXT,
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Campaign tracking table
      await client.query(`
        CREATE TABLE IF NOT EXISTS workflow_campaigns (
          id SERIAL PRIMARY KEY,
          workflow_id VARCHAR(255) NOT NULL REFERENCES workflow_status(workflow_id),
          platform VARCHAR(50) NOT NULL,
          campaign_id VARCHAR(255),
          campaign_name VARCHAR(255),
          status VARCHAR(50),
          budget_daily DECIMAL(10,2),
          budget_total DECIMAL(10,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Performance metrics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS campaign_metrics (
          id SERIAL PRIMARY KEY,
          workflow_id VARCHAR(255) REFERENCES workflow_status(workflow_id),
          campaign_id VARCHAR(255) NOT NULL,
          platform VARCHAR(50) NOT NULL,
          date DATE NOT NULL,
          impressions INTEGER DEFAULT 0,
          clicks INTEGER DEFAULT 0,
          conversions INTEGER DEFAULT 0,
          spend DECIMAL(10,2) DEFAULT 0,
          ctr DECIMAL(5,2) DEFAULT 0,
          cpc DECIMAL(10,2) DEFAULT 0,
          roas DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(campaign_id, platform, date)
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_workflow_status_user_id ON workflow_status(user_id);
        CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
        CREATE INDEX IF NOT EXISTS idx_workflow_campaigns_workflow_id ON workflow_campaigns(workflow_id);
        CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
        CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON campaign_metrics(date);
      `);

      console.log('Workflow database tables initialized successfully');

    } finally {
      client.release();
    }
  }

  /**
   * Save workflow status
   */
  async saveWorkflowStatus(status: WorkflowStatus): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query(`
        INSERT INTO workflow_status (
          workflow_id, user_id, website_url, status, current_step, 
          steps, result, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (workflow_id) 
        DO UPDATE SET
          status = $4,
          current_step = $5,
          steps = $6,
          result = $7,
          updated_at = $9
      `, [
        status.workflowId,
        status.userId,
        status.websiteUrl,
        status.status,
        status.currentStep,
        JSON.stringify(status.steps),
        JSON.stringify(status.result),
        status.createdAt,
        status.updatedAt,
      ]);

    } finally {
      client.release();
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus | null> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM workflow_status WHERE workflow_id = $1
      `, [workflowId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        workflowId: row.workflow_id,
        userId: row.user_id,
        websiteUrl: row.website_url,
        status: row.status,
        currentStep: row.current_step,
        steps: row.steps || [],
        result: row.result,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

    } finally {
      client.release();
    }
  }

  /**
   * Update workflow step
   */
  async updateWorkflowStep(workflowId: string, step: WorkflowStep): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Insert step record
      await client.query(`
        INSERT INTO workflow_steps (
          workflow_id, step_name, status, result, error, 
          started_at, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        workflowId,
        step.step,
        step.status,
        JSON.stringify(step.result),
        step.error,
        step.status === 'running' ? step.timestamp : null,
        step.status === 'completed' || step.status === 'failed' ? step.timestamp : null,
      ]);

      // Update workflow status
      await client.query(`
        UPDATE workflow_status 
        SET 
          current_step = $2,
          status = CASE 
            WHEN $3 = 'failed' THEN 'failed'
            WHEN $3 = 'running' THEN 'running'
            ELSE status 
          END,
          steps = steps || $4::jsonb,
          updated_at = NOW()
        WHERE workflow_id = $1
      `, [
        workflowId,
        step.step,
        step.status,
        JSON.stringify([step]),
      ]);

    } finally {
      client.release();
    }
  }

  /**
   * Save campaign information
   */
  async saveCampaign(
    workflowId: string,
    platform: string,
    campaignId: string,
    campaignName: string,
    status: string,
    budgetDaily: number,
    budgetTotal: number
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query(`
        INSERT INTO workflow_campaigns (
          workflow_id, platform, campaign_id, campaign_name, 
          status, budget_daily, budget_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (workflow_id, platform, campaign_id)
        DO UPDATE SET
          status = $5,
          budget_daily = $6,
          budget_total = $7,
          updated_at = NOW()
      `, [
        workflowId, platform, campaignId, campaignName,
        status, budgetDaily, budgetTotal
      ]);

    } finally {
      client.release();
    }
  }

  /**
   * Save campaign metrics
   */
  async saveCampaignMetrics(
    workflowId: string,
    metrics: {
      campaignId: string;
      platform: string;
      date: Date;
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      ctr: number;
      cpc: number;
      roas: number;
    }[]
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      for (const metric of metrics) {
        await client.query(`
          INSERT INTO campaign_metrics (
            workflow_id, campaign_id, platform, date,
            impressions, clicks, conversions, spend, ctr, cpc, roas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (campaign_id, platform, date)
          DO UPDATE SET
            impressions = $5,
            clicks = $6,
            conversions = $7,
            spend = $8,
            ctr = $9,
            cpc = $10,
            roas = $11
        `, [
          workflowId,
          metric.campaignId,
          metric.platform,
          metric.date,
          metric.impressions,
          metric.clicks,
          metric.conversions,
          metric.spend,
          metric.ctr,
          metric.cpc,
          metric.roas,
        ]);
      }

    } finally {
      client.release();
    }
  }

  /**
   * Get user workflows
   */
  async getUserWorkflows(userId: string, limit: number = 20): Promise<WorkflowStatus[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM workflow_status 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [userId, limit]);

      return result.rows.map(row => ({
        workflowId: row.workflow_id,
        userId: row.user_id,
        websiteUrl: row.website_url,
        status: row.status,
        currentStep: row.current_step,
        steps: row.steps || [],
        result: row.result,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

    } finally {
      client.release();
    }
  }

  /**
   * Get campaign metrics for a workflow
   */
  async getWorkflowMetrics(workflowId: string): Promise<any[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          cm.*,
          wc.campaign_name,
          wc.budget_daily,
          wc.budget_total
        FROM campaign_metrics cm
        LEFT JOIN workflow_campaigns wc ON cm.campaign_id = wc.campaign_id
        WHERE cm.workflow_id = $1
        ORDER BY cm.date DESC, cm.platform
      `, [workflowId]);

      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Clean up old workflow data
   */
  async cleanupOldWorkflows(daysOld: number = 30): Promise<number> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        DELETE FROM workflow_status 
        WHERE created_at < NOW() - INTERVAL '${daysOld} days'
        AND status IN ('completed', 'failed')
      `);

      return result.rowCount || 0;

    } finally {
      client.release();
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
