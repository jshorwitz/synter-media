// AI Campaign Agent Executor for Synter Orchestrator
import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../utils/logger.js';

export class AICampaignExecutor {
  constructor(config = {}) {
    this.config = {
      dryRun: config.dryRun || process.env.DRY_RUN === 'true',
      aiAgentPath: config.aiAgentPath || path.resolve(process.cwd(), 'agents/ai-campaign-agent'),
      pythonAgentsPath: config.pythonAgentsPath || path.resolve(process.cwd(), 'agents/google-python'),
      ...config
    };
  }

  /**
   * Execute AI Campaign Agent
   */
  async execute(jobData) {
    const { runId, window, params = {} } = jobData;
    
    try {
      logger.info(`🤖 Starting AI Campaign Agent (Run ID: ${runId})`);
      
      const startTime = Date.now();
      
      // Run the AI Campaign Agent
      const result = await this.runAICampaignAgent({
        dateRange: window,
        dryRun: this.config.dryRun,
        ...params
      });
      
      const duration = Date.now() - startTime;
      
      // Structure result for orchestrator
      const agentResult = {
        runId,
        agent: 'ai-campaign-agent',
        success: result.success,
        duration,
        metrics: {
          optimizations_executed: result.optimizations?.length || 0,
          recommendations_generated: result.recommendations?.length || 0,
          campaigns_analyzed: result.metrics?.campaignCount || 0,
          total_spend_analyzed: result.metrics?.totalSpend || 0,
          projected_savings: result.report?.summary?.projectedSavings || 0
        },
        output: {
          optimizations: result.optimizations,
          recommendations: result.recommendations,
          performance_metrics: result.metrics,
          report_summary: result.report?.summary
        },
        timestamp: new Date().toISOString()
      };

      if (result.success) {
        logger.info(`✅ AI Campaign Agent completed successfully (${duration}ms)`);
        logger.info(`   📊 Analyzed ${result.metrics?.campaignCount} campaigns`);
        logger.info(`   💡 Generated ${result.recommendations?.length} recommendations`);
        logger.info(`   ⚡ Executed ${result.optimizations?.length} optimizations`);
      } else {
        logger.error(`❌ AI Campaign Agent failed: ${result.error}`);
      }

      return agentResult;

    } catch (error) {
      logger.error('❌ AI Campaign Agent execution failed:', error);
      
      return {
        runId,
        agent: 'ai-campaign-agent',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run the Node.js AI Campaign Agent
   */
  async runAICampaignAgent(params) {
    return new Promise((resolve, reject) => {
      const agentScript = path.join(this.config.aiAgentPath, 'index.js');
      
      const nodeProcess = spawn('node', [agentScript], {
        cwd: this.config.aiAgentPath,
        env: {
          ...process.env,
          DRY_RUN: params.dryRun?.toString() || 'false',
          GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
          BIGQUERY_PROJECT_ID: process.env.BIGQUERY_PROJECT_ID
        }
      });

      let stdout = '';
      let stderr = '';

      nodeProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        logger.info(`AI Campaign Agent: ${output.trim()}`);
      });

      nodeProcess.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        logger.warn(`AI Campaign Agent Error: ${error.trim()}`);
      });

      nodeProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Parse the JSON output from the AI agent
            const result = JSON.parse(stdout.split('\n').find(line => line.includes('"success"')) || '{}');
            resolve(result);
          } catch (parseError) {
            // If output isn't JSON, consider it successful if exit code is 0
            resolve({
              success: true,
              output: stdout,
              raw: true
            });
          }
        } else {
          reject(new Error(`AI Campaign Agent failed with exit code ${code}: ${stderr}`));
        }
      });

      nodeProcess.on('error', (error) => {
        logger.error('Failed to spawn AI Campaign Agent:', error);
        reject(error);
      });

      // Send parameters as JSON to the agent
      if (Object.keys(params).length > 0) {
        nodeProcess.stdin.write(JSON.stringify(params));
        nodeProcess.stdin.end();
      }
    });
  }

  /**
   * Health check for AI Campaign Agent
   */
  async healthCheck() {
    try {
      // Check if required files exist
      const agentScript = path.join(this.config.aiAgentPath, 'index.js');
      const pythonAgentsPath = this.config.pythonAgentsPath;
      
      const agentExists = await this.fileExists(agentScript);
      const pythonExists = await this.fileExists(pythonAgentsPath);
      
      return {
        status: agentExists && pythonExists ? 'healthy' : 'unhealthy',
        components: {
          ai_agent_script: agentExists ? 'found' : 'missing',
          python_agents_path: pythonExists ? 'found' : 'missing',
          dry_run_mode: this.config.dryRun,
          openai_configured: !!process.env.OPENAI_API_KEY,
          google_ads_configured: !!process.env.GOOGLE_ADS_CUSTOMER_ID
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async fileExists(filePath) {
    try {
      await import('fs').then(fs => fs.promises.access(filePath));
      return true;
    } catch {
      return false;
    }
  }
}
