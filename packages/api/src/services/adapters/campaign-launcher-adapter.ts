/**
 * Campaign Launcher Adapter - Connects to existing campaign launch services
 * Located at: apps/ppc-backend/routers/apply.py and ai-adwords/src/ads/campaigns.py
 */

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

export class CampaignLauncherAdapter {
  private ppcBackendUrl: string;
  private aiAdwordsPath: string;

  constructor() {
    this.ppcBackendUrl = process.env.PPC_BACKEND_URL || 'http://localhost:8080';
    this.aiAdwordsPath = 'ai-adwords/src/ads/campaigns.py';
  }

  /**
   * Launch campaigns using existing services
   */
  async launchCampaigns(
    strategies: CampaignStrategy[], 
    dryRun: boolean = true
  ): Promise<CampaignLaunchResult[]> {
    console.log(`Launching ${strategies.length} campaigns (dryRun: ${dryRun})`);
    
    const results: CampaignLaunchResult[] = [];

    // Launch campaigns for each platform
    for (const strategy of strategies) {
      try {
        const result = await this.launchSingleCampaign(strategy, dryRun);
        results.push(result);
      } catch (error) {
        console.error(`Failed to launch ${strategy.platform} campaign:`, error);
        results.push({
          platform: strategy.platform,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Launch a single campaign based on platform
   */
  private async launchSingleCampaign(
    strategy: CampaignStrategy, 
    dryRun: boolean
  ): Promise<CampaignLaunchResult> {
    switch (strategy.platform) {
      case 'google':
        return this.launchGoogleCampaign(strategy, dryRun);
      case 'meta':
        return this.launchMetaCampaign(strategy, dryRun);
      case 'reddit':
        return this.launchRedditCampaign(strategy, dryRun);
      case 'x':
        return this.launchXCampaign(strategy, dryRun);
      default:
        throw new Error(`Unsupported platform: ${strategy.platform}`);
    }
  }

  /**
   * Launch Google Ads campaign using existing PPC backend
   */
  private async launchGoogleCampaign(
    strategy: CampaignStrategy, 
    dryRun: boolean
  ): Promise<CampaignLaunchResult> {
    try {
      // Use existing PPC backend API
      const response = await axios.post(
        `${this.ppcBackendUrl}/api/campaigns/create`,
        {
          campaign_name: `Synter Campaign - ${Date.now()}`,
          campaign_type: strategy.campaignType,
          budget: strategy.budget.daily,
          bid_strategy: strategy.bidStrategy,
          keywords: strategy.targeting.keywords,
          ad_copy: {
            headlines: strategy.adCopy.headlines,
            descriptions: strategy.adCopy.descriptions,
          },
          dry_run: dryRun,
        },
        { timeout: 30000 }
      );

      if (response.data.success) {
        return {
          platform: 'google',
          campaignId: response.data.campaign_id,
          status: 'success',
          metrics: response.data.metrics || {
            impressions: 0,
            clicks: 0,
            spend: 0,
          },
        };
      } else {
        throw new Error(response.data.error || 'Campaign creation failed');
      }

    } catch (error) {
      // Fallback to Python script if API is unavailable
      return this.launchGoogleCampaignPython(strategy, dryRun);
    }
  }

  /**
   * Fallback Google Ads campaign creation using Python script
   */
  private async launchGoogleCampaignPython(
    strategy: CampaignStrategy,
    dryRun: boolean
  ): Promise<CampaignLaunchResult> {
    try {
      const campaignData = JSON.stringify({
        campaign_name: `Synter Campaign - ${Date.now()}`,
        budget: strategy.budget.daily,
        bid_strategy: strategy.bidStrategy,
        keywords: strategy.targeting.keywords,
        headlines: strategy.adCopy.headlines,
        descriptions: strategy.adCopy.descriptions,
        dry_run: dryRun,
      });

      const command = `echo '${campaignData}' | python3 ${this.aiAdwordsPath} --mode create_campaign`;
      
      const { stdout } = await execAsync(command, {
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      const result = JSON.parse(stdout);

      return {
        platform: 'google',
        campaignId: result.campaign_id,
        status: result.success ? 'success' : 'failed',
        error: result.error,
        metrics: result.metrics,
      };

    } catch (error) {
      return {
        platform: 'google',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Python script failed',
      };
    }
  }

  /**
   * Launch Meta campaign (placeholder - implement with Meta API)
   */
  private async launchMetaCampaign(
    strategy: CampaignStrategy,
    dryRun: boolean
  ): Promise<CampaignLaunchResult> {
    // For now, return mock success in dry run mode
    if (dryRun) {
      return {
        platform: 'meta',
        campaignId: `meta_${Date.now()}`,
        status: 'success',
        metrics: {
          impressions: 0,
          clicks: 0,
          spend: 0,
        },
      };
    }

    return {
      platform: 'meta',
      status: 'failed',
      error: 'Meta Ads API integration pending',
    };
  }

  /**
   * Launch Reddit campaign using existing Reddit integration
   */
  private async launchRedditCampaign(
    strategy: CampaignStrategy,
    dryRun: boolean
  ): Promise<CampaignLaunchResult> {
    try {
      // Use existing Reddit OAuth and API integration
      const command = `node scripts/reddit-auth.js create-campaign --dry-run=${dryRun}`;
      
      const { stdout } = await execAsync(command, { timeout: 30000 });
      const result = JSON.parse(stdout);

      return {
        platform: 'reddit',
        campaignId: result.campaign_id,
        status: result.success ? 'success' : 'failed',
        error: result.error,
        metrics: result.metrics,
      };

    } catch (error) {
      return {
        platform: 'reddit',
        status: dryRun ? 'success' : 'failed',
        campaignId: dryRun ? `reddit_${Date.now()}` : undefined,
        error: dryRun ? undefined : 'Reddit API integration pending',
        metrics: dryRun ? { impressions: 0, clicks: 0, spend: 0 } : undefined,
      };
    }
  }

  /**
   * Launch X (Twitter) campaign
   */
  private async launchXCampaign(
    strategy: CampaignStrategy,
    dryRun: boolean
  ): Promise<CampaignLaunchResult> {
    // For now, return mock success in dry run mode
    if (dryRun) {
      return {
        platform: 'x',
        campaignId: `x_${Date.now()}`,
        status: 'success',
        metrics: {
          impressions: 0,
          clicks: 0,
          spend: 0,
        },
      };
    }

    return {
      platform: 'x',
      status: 'failed',
      error: 'X Ads API integration pending',
    };
  }

  /**
   * Get campaign status from existing systems
   */
  async getCampaignStatus(campaignId: string, platform: string): Promise<any> {
    switch (platform) {
      case 'google':
        return this.getGoogleCampaignStatus(campaignId);
      case 'meta':
        return this.getMetaCampaignStatus(campaignId);
      case 'reddit':
        return this.getRedditCampaignStatus(campaignId);
      case 'x':
        return this.getXCampaignStatus(campaignId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async getGoogleCampaignStatus(campaignId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.ppcBackendUrl}/api/campaigns/${campaignId}/status`
      );
      return response.data;
    } catch (error) {
      return { status: 'unknown', error: 'Failed to fetch status' };
    }
  }

  private async getMetaCampaignStatus(campaignId: string): Promise<any> {
    return { status: 'mock', platform: 'meta' };
  }

  private async getRedditCampaignStatus(campaignId: string): Promise<any> {
    return { status: 'mock', platform: 'reddit' };
  }

  private async getXCampaignStatus(campaignId: string): Promise<any> {
    return { status: 'mock', platform: 'x' };
  }

  /**
   * Health check for campaign launch services
   */
  async healthCheck(): Promise<{ [platform: string]: boolean }> {
    const checks = await Promise.allSettled([
      this.checkGoogleHealth(),
      this.checkMetaHealth(),
      this.checkRedditHealth(),
      this.checkXHealth(),
    ]);

    return {
      google: checks[0].status === 'fulfilled' ? checks[0].value : false,
      meta: checks[1].status === 'fulfilled' ? checks[1].value : false,
      reddit: checks[2].status === 'fulfilled' ? checks[2].value : false,
      x: checks[3].status === 'fulfilled' ? checks[3].value : false,
    };
  }

  private async checkGoogleHealth(): Promise<boolean> {
    try {
      await axios.get(`${this.ppcBackendUrl}/health`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async checkMetaHealth(): Promise<boolean> {
    return false; // Not implemented yet
  }

  private async checkRedditHealth(): Promise<boolean> {
    try {
      await execAsync('node scripts/reddit-auth.js check', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async checkXHealth(): Promise<boolean> {
    return false; // Not implemented yet
  }
}
