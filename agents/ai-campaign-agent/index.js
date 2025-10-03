// AI Campaign Agent for Sourcegraph Google Ads Management
// Integrates with existing Python Google Ads agents and BigQuery data

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSourcegraphCampaignConfig } from './sourcegraph-campaigns.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SourcegraphAICampaignAgent {
  constructor(config = {}) {
    this.config = {
      dryRun: config.dryRun || process.env.DRY_RUN === 'true',
      googleAdsCustomerId: config.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID,
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      bigqueryProjectId: config.bigqueryProjectId || process.env.BIGQUERY_PROJECT_ID,
      pythonAgentsPath: config.pythonAgentsPath || path.resolve(__dirname, '../../google-python'),
      ...config
    };
    
    console.log('🤖 Sourcegraph AI Campaign Agent initialized');
    console.log(`   Dry Run: ${this.config.dryRun}`);
    console.log(`   Customer ID: ${this.config.googleAdsCustomerId?.slice(0, 6)}...`);
  }

  /**
   * Main AI Campaign Management Flow
   */
  async runCampaignOptimization(params = {}) {
    try {
      console.log('🚀 Starting AI Campaign Optimization for Sourcegraph...');
      
      const results = {
        timestamp: new Date().toISOString(),
        dryRun: this.config.dryRun,
        optimizations: [],
        metrics: {},
        recommendations: []
      };

      // 1. Analyze current campaign performance
      console.log('📊 Step 1: Analyzing current campaign performance...');
      const performanceData = await this.analyzeCampaignPerformance(params.dateRange);
      results.metrics = performanceData;

      // 2. Run AI-powered optimization recommendations
      console.log('🧠 Step 2: Generating AI optimization recommendations...');
      const aiRecommendations = await this.generateAIRecommendations(performanceData);
      results.recommendations = aiRecommendations;

      // 3. Execute high-confidence optimizations
      console.log('⚡ Step 3: Executing optimization actions...');
      const optimizations = await this.executeOptimizations(aiRecommendations);
      results.optimizations = optimizations;

      // 4. Update campaign structure if needed
      console.log('🏗️ Step 4: Updating campaign structure...');
      const structureUpdates = await this.updateCampaignStructure();
      results.structureUpdates = structureUpdates;

      // 5. Generate performance report
      console.log('📈 Step 5: Generating performance report...');
      const report = await this.generatePerformanceReport(results);
      
      console.log('✅ AI Campaign Optimization completed');
      return { success: true, ...results, report };

    } catch (error) {
      console.error('❌ AI Campaign Optimization failed:', error);
      return { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString() 
      };
    }
  }

  /**
   * Analyze current Sourcegraph campaign performance using Python agents
   */
  async analyzeCampaignPerformance(dateRange = { days: 14 }) {
    try {
      console.log('   📊 Fetching Sourcegraph campaign data...');
      
      // Call the existing Python Google Ads agent
      const pythonScript = path.join(this.config.pythonAgentsPath, 'get_real_sourcegraph_data.py');
      const performanceData = await this.runPythonAgent(pythonScript, {
        date_range: dateRange,
        customer_id: this.config.googleAdsCustomerId,
        output_format: 'json'
      });

      // Parse and structure the data
      const campaigns = performanceData.campaigns || [];
      const keywords = performanceData.keywords || [];
      
      // Calculate key metrics
      const totalSpend = campaigns.reduce((sum, c) => sum + (c.cost || 0), 0);
      const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
      const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);

      const metrics = {
        totalSpend,
        totalConversions,
        cac: totalConversions > 0 ? totalSpend / totalConversions : 0,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        campaignCount: campaigns.length,
        keywordCount: keywords.length,
        topPerformingCampaigns: campaigns
          .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
          .slice(0, 5),
        underperformingCampaigns: campaigns
          .filter(c => (c.conversions || 0) === 0 && (c.cost || 0) > 50)
          .slice(0, 10)
      };

      console.log(`   ✅ Analyzed ${campaigns.length} campaigns, $${totalSpend.toFixed(2)} spend`);
      return metrics;

    } catch (error) {
      console.error('   ❌ Failed to analyze performance:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered optimization recommendations
   */
  async generateAIRecommendations(performanceData) {
    try {
      console.log('   🧠 Generating AI recommendations...');
      
      const prompt = this.buildOptimizationPrompt(performanceData);
      const recommendations = await this.callOpenAI(prompt);
      
      // Structure recommendations by priority and type
      const structuredRecommendations = {
        highPriority: recommendations.filter(r => r.priority === 'high'),
        mediumPriority: recommendations.filter(r => r.priority === 'medium'),
        lowPriority: recommendations.filter(r => r.priority === 'low'),
        budgetOptimizations: recommendations.filter(r => r.type === 'budget'),
        keywordOptimizations: recommendations.filter(r => r.type === 'keywords'),
        adCopyOptimizations: recommendations.filter(r => r.type === 'ad_copy'),
        biddingOptimizations: recommendations.filter(r => r.type === 'bidding')
      };

      console.log(`   ✅ Generated ${recommendations.length} AI recommendations`);
      return structuredRecommendations;

    } catch (error) {
      console.error('   ❌ Failed to generate AI recommendations:', error);
      return { highPriority: [], mediumPriority: [], lowPriority: [] };
    }
  }

  /**
   * Execute optimization actions using existing Python agents
   */
  async executeOptimizations(recommendations) {
    try {
      console.log('   ⚡ Executing optimization actions...');
      
      const executedOptimizations = [];

      // Execute budget optimizations using the Python Budget Optimizer
      if (recommendations.budgetOptimizations?.length > 0) {
        console.log('   💰 Running budget optimizations...');
        const budgetResults = await this.runPythonAgent(
          path.join(this.config.pythonAgentsPath, 'src/synter_agent/budget_optimizer.py'),
          { 
            dry_run: this.config.dryRun,
            window: { days: 14 },
            recommendations: recommendations.budgetOptimizations
          }
        );
        executedOptimizations.push(...(budgetResults.optimizations || []));
      }

      // Execute keyword optimizations
      if (recommendations.keywordOptimizations?.length > 0) {
        console.log('   🔍 Running keyword optimizations...');
        const keywordResults = await this.runKeywordOptimizations(recommendations.keywordOptimizations);
        executedOptimizations.push(...keywordResults);
      }

      // Execute campaign structure updates
      if (recommendations.structureUpdates?.length > 0) {
        console.log('   🏗️ Running campaign structure updates...');
        const structureResults = await this.runCampaignStructureUpdates(recommendations.structureUpdates);
        executedOptimizations.push(...structureResults);
      }

      console.log(`   ✅ Executed ${executedOptimizations.length} optimizations`);
      return executedOptimizations;

    } catch (error) {
      console.error('   ❌ Failed to execute optimizations:', error);
      return [];
    }
  }

  /**
   * Update Sourcegraph campaign structure using existing campaign consolidator
   */
  async updateCampaignStructure() {
    try {
      console.log('   🏗️ Updating Sourcegraph campaign structure...');
      
      // Use the existing campaign consolidation system
      const consolidationScript = path.join(this.config.pythonAgentsPath, 'src/ads/optimize.py');
      const results = await this.runPythonAgent(consolidationScript, {
        action: 'consolidate_campaigns',
        dry_run: this.config.dryRun,
        customer_id: this.config.googleAdsCustomerId,
        apply_sourcegraph_structure: true
      });

      return results.structureUpdates || [];

    } catch (error) {
      console.error('   ❌ Failed to update campaign structure:', error);
      return [];
    }
  }

  /**
   * Run keyword optimizations (negative keywords, bid adjustments, etc.)
   */
  async runKeywordOptimizations(keywordRecommendations) {
    const optimizations = [];
    
    for (const rec of keywordRecommendations) {
      try {
        if (rec.action === 'add_negative_keywords') {
          // Add negative keywords to campaigns
          const result = await this.addNegativeKeywords(rec.keywords, rec.campaigns);
          optimizations.push(result);
        } else if (rec.action === 'adjust_keyword_bids') {
          // Adjust keyword bids based on performance
          const result = await this.adjustKeywordBids(rec.adjustments);
          optimizations.push(result);
        } else if (rec.action === 'pause_keywords') {
          // Pause underperforming keywords
          const result = await this.pauseKeywords(rec.keywords);
          optimizations.push(result);
        }
      } catch (error) {
        console.error(`   ❌ Failed keyword optimization: ${rec.action}`, error);
        optimizations.push({ 
          action: rec.action, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return optimizations;
  }

  /**
   * Build optimization prompt for AI analysis
   */
  buildOptimizationPrompt(performanceData) {
    return `
# Google Ads Campaign Optimization Analysis for Sourcegraph

## Campaign Performance Data:
- Total Spend: $${performanceData.totalSpend?.toFixed(2)}
- Total Conversions: ${performanceData.totalConversions}
- CAC: $${performanceData.cac?.toFixed(2)}
- CTR: ${performanceData.ctr?.toFixed(2)}%
- Conversion Rate: ${performanceData.conversionRate?.toFixed(2)}%
- Active Campaigns: ${performanceData.campaignCount}

## Top Performing Campaigns:
${performanceData.topPerformingCampaigns?.map(c => 
  `- ${c.name}: $${c.cost?.toFixed(2)} spend, ${c.conversions} conversions, CAC: $${(c.cost/c.conversions || 0).toFixed(2)}`
).join('\n')}

## Underperforming Campaigns:
${performanceData.underperformingCampaigns?.map(c => 
  `- ${c.name}: $${c.cost?.toFixed(2)} spend, ${c.conversions || 0} conversions`
).join('\n')}

## Task:
Analyze this Google Ads performance data for Sourcegraph's AI coding assistant (Amp) product and provide specific optimization recommendations. Focus on:

1. **Budget Reallocation**: Which campaigns should get more/less budget?
2. **Keyword Optimization**: Which keywords to pause, add, or adjust bids?
3. **Campaign Structure**: Any consolidation or restructuring needed?
4. **Negative Keywords**: What negative keywords should be added?
5. **Bidding Strategy**: Any bidding strategy changes?

Provide recommendations in JSON format with priority levels (high/medium/low) and specific actions that can be executed via Google Ads API.

Format response as JSON:
{
  "budgetOptimizations": [...],
  "keywordOptimizations": [...], 
  "structureOptimizations": [...],
  "negativeKeywords": [...],
  "biddingOptimizations": [...]
}
`;
  }

  /**
   * Call OpenAI for AI-powered optimization recommendations
   */
  async callOpenAI(prompt) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Google Ads campaign optimizer specializing in B2B software and developer tools. Provide specific, actionable recommendations for campaign optimization.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Try to parse as JSON, fallback to structured text parsing
      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        console.warn('   ⚠️ AI response not JSON, parsing manually...');
        return this.parseAIRecommendations(aiResponse);
      }

    } catch (error) {
      console.error('   ❌ OpenAI API call failed:', error);
      // Return mock recommendations if AI fails
      return this.getMockRecommendations();
    }
  }

  /**
   * Execute Python Google Ads agents
   */
  async runPythonAgent(scriptPath, params = {}) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath], {
        cwd: this.config.pythonAgentsPath,
        env: {
          ...process.env,
          DRY_RUN: this.config.dryRun.toString(),
          GOOGLE_ADS_CUSTOMER_ID: this.config.googleAdsCustomerId
        }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Try to parse JSON output
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (parseError) {
            // If not JSON, return as text
            resolve({ output: stdout, raw: true });
          }
        } else {
          reject(new Error(`Python agent failed with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });

      // Send input parameters if provided
      if (Object.keys(params).length > 0) {
        pythonProcess.stdin.write(JSON.stringify(params));
        pythonProcess.stdin.end();
      }
    });
  }

  /**
   * Generate performance report with insights and recommendations
   */
  async generatePerformanceReport(results) {
    const report = {
      summary: {
        optimizationsExecuted: results.optimizations.length,
        recommendationsGenerated: results.recommendations.length,
        totalSpend: results.metrics.totalSpend,
        projectedSavings: this.calculateProjectedSavings(results.optimizations),
        projectedCACImprovement: this.calculateCACImprovement(results.optimizations)
      },
      topRecommendations: results.recommendations.slice(0, 5),
      executedActions: results.optimizations.filter(opt => opt.success),
      failedActions: results.optimizations.filter(opt => !opt.success),
      nextSteps: this.generateNextSteps(results)
    };

    // Save report for audit trail
    const reportPath = path.join(__dirname, `reports/ai-campaign-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   📋 Report saved: ${reportPath}`);
    return report;
  }

  /**
   * Add negative keywords to campaigns
   */
  async addNegativeKeywords(keywords, campaignIds) {
    if (this.config.dryRun) {
      console.log(`   🔕 [DRY RUN] Would add negative keywords: ${keywords.join(', ')}`);
      return { 
        action: 'add_negative_keywords', 
        success: true, 
        dryRun: true, 
        keywords, 
        campaigns: campaignIds 
      };
    }

    // Execute via Python Google Ads agent
    const scriptPath = path.join(this.config.pythonAgentsPath, 'src/ads/keywords.py');
    return await this.runPythonAgent(scriptPath, {
      action: 'add_negative_keywords',
      keywords,
      campaign_ids: campaignIds
    });
  }

  /**
   * Adjust keyword bids based on performance
   */
  async adjustKeywordBids(adjustments) {
    if (this.config.dryRun) {
      console.log(`   💰 [DRY RUN] Would adjust ${adjustments.length} keyword bids`);
      return { 
        action: 'adjust_keyword_bids', 
        success: true, 
        dryRun: true, 
        adjustments 
      };
    }

    // Execute via Python Google Ads agent
    const scriptPath = path.join(this.config.pythonAgentsPath, 'src/ads/keywords.py');
    return await this.runPythonAgent(scriptPath, {
      action: 'adjust_keyword_bids',
      adjustments
    });
  }

  /**
   * Calculate projected savings from optimizations
   */
  calculateProjectedSavings(optimizations) {
    return optimizations.reduce((total, opt) => {
      if (opt.type === 'budget_reduction' && opt.success) {
        return total + (opt.savedAmount || 0);
      }
      return total;
    }, 0);
  }

  /**
   * Calculate projected CAC improvement
   */
  calculateCACImprovement(optimizations) {
    const budgetSavings = this.calculateProjectedSavings(optimizations);
    const conversionImprovements = optimizations
      .filter(opt => opt.type === 'conversion_improvement')
      .reduce((total, opt) => total + (opt.additionalConversions || 0), 0);
    
    return {
      budgetSavings,
      additionalConversions: conversionImprovements,
      estimatedCACReduction: budgetSavings > 0 ? (budgetSavings / (conversionImprovements || 1)) : 0
    };
  }

  /**
   * Generate next steps based on results
   */
  generateNextSteps(results) {
    const nextSteps = [];
    
    if (results.recommendations.highPriority?.length > 0) {
      nextSteps.push({
        action: 'implement_high_priority_recommendations',
        description: `Implement ${results.recommendations.highPriority.length} high-priority recommendations`,
        timeframe: '24 hours'
      });
    }
    
    if (results.metrics.cac > 100) {
      nextSteps.push({
        action: 'cac_optimization_focus',
        description: 'Focus on CAC reduction - current CAC is above $100',
        timeframe: '1 week'
      });
    }
    
    if (results.optimizations.some(opt => !opt.success)) {
      nextSteps.push({
        action: 'retry_failed_optimizations',
        description: 'Retry failed optimizations after reviewing errors',
        timeframe: '3 days'
      });
    }
    
    return nextSteps;
  }

  /**
   * Mock recommendations if AI is not available
   */
  getMockRecommendations() {
    return {
      budgetOptimizations: [
        {
          type: 'budget',
          priority: 'high',
          action: 'increase_budget',
          campaign: 'Amp Promotion - North America',
          currentBudget: 100,
          recommendedBudget: 150,
          reason: 'High conversion rate and low CAC'
        }
      ],
      keywordOptimizations: [
        {
          type: 'keywords',
          priority: 'medium',
          action: 'add_negative_keywords',
          keywords: ['free', 'cheap', 'student'],
          reason: 'Filtering out low-intent traffic'
        }
      ]
    };
  }

  /**
   * Parse AI recommendations from text if JSON parsing fails
   */
  parseAIRecommendations(text) {
    // Simple text parsing fallback
    return {
      budgetOptimizations: [],
      keywordOptimizations: [],
      structureOptimizations: [],
      parsed_from_text: true,
      original_response: text
    };
  }
}

// Export for orchestrator integration
export { SourcegraphAICampaignAgent };

// Agent runner function for orchestrator
export async function run(params = {}) {
  const agent = new SourcegraphAICampaignAgent(params.config);
  return await agent.runCampaignOptimization(params);
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new SourcegraphAICampaignAgent();
  const result = await agent.runCampaignOptimization();
  console.log('\n📊 Final Results:', JSON.stringify(result, null, 2));
}
