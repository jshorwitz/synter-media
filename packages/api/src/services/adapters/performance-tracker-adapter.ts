/**
 * Performance Tracker Adapter - Connects to existing reporting and dashboard services
 * Located at: ai-adwords/src/ads/reporting.py and ai-adwords/src/dashboard/app.py
 */

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

export class PerformanceTrackerAdapter {
  private ppcBackendUrl: string;
  private dashboardUrl: string;
  private reportingScriptPath: string;

  constructor() {
    this.ppcBackendUrl = process.env.PPC_BACKEND_URL || 'http://localhost:8080';
    this.dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:8501';
    this.reportingScriptPath = 'ai-adwords/src/ads/reporting.py';
  }

  /**
   * Track campaign performance using existing reporting services
   */
  async trackCampaigns(campaignIds: string[]): Promise<PerformanceMetrics[]> {
    console.log(`Tracking performance for ${campaignIds.length} campaigns`);
    
    const metrics: PerformanceMetrics[] = [];

    for (const campaignId of campaignIds) {
      try {
        const campaignMetrics = await this.getCampaignMetrics(campaignId);
        metrics.push(...campaignMetrics);
      } catch (error) {
        console.error(`Failed to get metrics for campaign ${campaignId}:`, error);
        
        // Add placeholder metrics to avoid breaking the flow
        metrics.push(this.getPlaceholderMetrics(campaignId));
      }
    }

    return metrics;
  }

  /**
   * Get metrics for a single campaign
   */
  private async getCampaignMetrics(campaignId: string): Promise<PerformanceMetrics[]> {
    // Determine platform from campaign ID pattern
    const platform = this.detectPlatformFromCampaignId(campaignId);
    
    switch (platform) {
      case 'google':
        return this.getGoogleMetrics(campaignId);
      case 'meta':
        return this.getMetaMetrics(campaignId);
      case 'reddit':
        return this.getRedditMetrics(campaignId);
      case 'x':
        return this.getXMetrics(campaignId);
      default:
        return [this.getPlaceholderMetrics(campaignId, platform)];
    }
  }

  /**
   * Get Google Ads metrics using existing reporting system
   */
  private async getGoogleMetrics(campaignId: string): Promise<PerformanceMetrics[]> {
    try {
      // Try PPC backend API first
      const response = await axios.get(
        `${this.ppcBackendUrl}/api/campaigns/${campaignId}/metrics`,
        { timeout: 30000 }
      );

      if (response.data.success) {
        return response.data.metrics.map((metric: any) => ({
          campaignId,
          platform: 'google',
          impressions: metric.impressions || 0,
          clicks: metric.clicks || 0,
          conversions: metric.conversions || 0,
          spend: metric.spend || 0,
          ctr: metric.ctr || 0,
          cpc: metric.cpc || 0,
          roas: metric.roas || 0,
          timestamp: new Date(metric.date || Date.now()),
        }));
      }
    } catch (error) {
      console.warn('PPC Backend API unavailable, trying Python script');
    }

    // Fallback to Python reporting script
    return this.getGoogleMetricsPython(campaignId);
  }

  /**
   * Get Google Ads metrics using Python reporting script
   */
  private async getGoogleMetricsPython(campaignId: string): Promise<PerformanceMetrics[]> {
    try {
      const command = `python3 ${this.reportingScriptPath} --campaign-id ${campaignId} --format json`;
      
      const { stdout } = await execAsync(command, {
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      const reportData = JSON.parse(stdout);
      
      return reportData.metrics?.map((metric: any) => ({
        campaignId,
        platform: 'google',
        impressions: parseInt(metric.impressions) || 0,
        clicks: parseInt(metric.clicks) || 0,
        conversions: parseInt(metric.conversions) || 0,
        spend: parseFloat(metric.cost_micros) / 1000000 || 0, // Convert micros to currency
        ctr: parseFloat(metric.ctr) || 0,
        cpc: parseFloat(metric.average_cpc) / 1000000 || 0,
        roas: parseFloat(metric.conversions_value) / (parseFloat(metric.cost_micros) / 1000000) || 0,
        timestamp: new Date(metric.date || Date.now()),
      })) || [this.getPlaceholderMetrics(campaignId, 'google')];

    } catch (error) {
      console.error('Python reporting script failed:', error);
      return [this.getPlaceholderMetrics(campaignId, 'google')];
    }
  }

  /**
   * Get Meta/Facebook metrics (placeholder for now)
   */
  private async getMetaMetrics(campaignId: string): Promise<PerformanceMetrics[]> {
    // TODO: Implement Meta Marketing API integration
    return [this.getMockMetrics(campaignId, 'meta')];
  }

  /**
   * Get Reddit metrics (placeholder for now)
   */
  private async getRedditMetrics(campaignId: string): Promise<PerformanceMetrics[]> {
    // TODO: Implement Reddit Ads API integration
    return [this.getMockMetrics(campaignId, 'reddit')];
  }

  /**
   * Get X/Twitter metrics (placeholder for now)
   */
  private async getXMetrics(campaignId: string): Promise<PerformanceMetrics[]> {
    // TODO: Implement X Ads API integration
    return [this.getMockMetrics(campaignId, 'x')];
  }

  /**
   * Get historical metrics for a campaign
   */
  async getHistoricalMetrics(
    campaignId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<PerformanceMetrics[]> {
    const platform = this.detectPlatformFromCampaignId(campaignId);
    
    if (platform === 'google') {
      return this.getGoogleHistoricalMetrics(campaignId, startDate, endDate);
    }
    
    // For other platforms, return daily mock data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const metrics: PerformanceMetrics[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      metrics.push({
        ...this.getMockMetrics(campaignId, platform),
        timestamp: date,
      });
    }
    
    return metrics;
  }

  /**
   * Get Google Ads historical metrics
   */
  private async getGoogleHistoricalMetrics(
    campaignId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceMetrics[]> {
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const command = `python3 ${this.reportingScriptPath} --campaign-id ${campaignId} --start-date ${startDateStr} --end-date ${endDateStr} --format json`;
      
      const { stdout } = await execAsync(command, {
        timeout: 120000, // Longer timeout for historical data
        maxBuffer: 2048 * 1024, // 2MB buffer
      });

      const reportData = JSON.parse(stdout);
      
      return reportData.daily_metrics?.map((metric: any) => ({
        campaignId,
        platform: 'google',
        impressions: parseInt(metric.impressions) || 0,
        clicks: parseInt(metric.clicks) || 0,
        conversions: parseInt(metric.conversions) || 0,
        spend: parseFloat(metric.cost_micros) / 1000000 || 0,
        ctr: parseFloat(metric.ctr) || 0,
        cpc: parseFloat(metric.average_cpc) / 1000000 || 0,
        roas: parseFloat(metric.conversions_value) / (parseFloat(metric.cost_micros) / 1000000) || 0,
        timestamp: new Date(metric.date),
      })) || [];

    } catch (error) {
      console.error('Historical data fetch failed:', error);
      return [];
    }
  }

  /**
   * Real-time metrics streaming (using existing dashboard)
   */
  async startMetricsStream(campaignIds: string[], callback: (metrics: PerformanceMetrics[]) => void): Promise<() => void> {
    // Poll metrics every 5 minutes
    const pollInterval = setInterval(async () => {
      try {
        const metrics = await this.trackCampaigns(campaignIds);
        callback(metrics);
      } catch (error) {
        console.error('Metrics streaming error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }

  /**
   * Detect platform from campaign ID pattern
   */
  private detectPlatformFromCampaignId(campaignId: string): string {
    if (campaignId.includes('google') || /^\d+$/.test(campaignId)) {
      return 'google';
    } else if (campaignId.includes('meta') || campaignId.includes('fb')) {
      return 'meta';
    } else if (campaignId.includes('reddit')) {
      return 'reddit';
    } else if (campaignId.includes('x') || campaignId.includes('twitter')) {
      return 'x';
    }
    return 'unknown';
  }

  /**
   * Generate placeholder metrics for failed requests
   */
  private getPlaceholderMetrics(campaignId: string, platform: string = 'unknown'): PerformanceMetrics {
    return {
      campaignId,
      platform,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      ctr: 0,
      cpc: 0,
      roas: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Generate mock metrics for testing
   */
  private getMockMetrics(campaignId: string, platform: string): PerformanceMetrics {
    const baseMetrics = {
      campaignId,
      platform,
      timestamp: new Date(),
    };

    // Platform-specific mock data
    switch (platform) {
      case 'google':
        return {
          ...baseMetrics,
          impressions: Math.floor(Math.random() * 10000) + 1000,
          clicks: Math.floor(Math.random() * 500) + 50,
          conversions: Math.floor(Math.random() * 25) + 5,
          spend: Math.floor(Math.random() * 500) + 100,
          ctr: Math.random() * 5 + 2,
          cpc: Math.random() * 3 + 1,
          roas: Math.random() * 3 + 2,
        };
      case 'meta':
        return {
          ...baseMetrics,
          impressions: Math.floor(Math.random() * 15000) + 2000,
          clicks: Math.floor(Math.random() * 400) + 40,
          conversions: Math.floor(Math.random() * 20) + 3,
          spend: Math.floor(Math.random() * 400) + 80,
          ctr: Math.random() * 3 + 1.5,
          cpc: Math.random() * 2 + 0.8,
          roas: Math.random() * 2.5 + 1.8,
        };
      default:
        return {
          ...baseMetrics,
          impressions: Math.floor(Math.random() * 5000) + 500,
          clicks: Math.floor(Math.random() * 200) + 20,
          conversions: Math.floor(Math.random() * 10) + 2,
          spend: Math.floor(Math.random() * 200) + 50,
          ctr: Math.random() * 4 + 1,
          cpc: Math.random() * 2.5 + 0.5,
          roas: Math.random() * 3 + 1.5,
        };
    }
  }

  /**
   * Health check for performance tracking services
   */
  async healthCheck(): Promise<{ [service: string]: boolean }> {
    const checks = await Promise.allSettled([
      this.checkPpcBackendHealth(),
      this.checkDashboardHealth(),
      this.checkPythonReportingHealth(),
    ]);

    return {
      ppcBackend: checks[0].status === 'fulfilled' ? checks[0].value : false,
      dashboard: checks[1].status === 'fulfilled' ? checks[1].value : false,
      pythonReporting: checks[2].status === 'fulfilled' ? checks[2].value : false,
    };
  }

  private async checkPpcBackendHealth(): Promise<boolean> {
    try {
      await axios.get(`${this.ppcBackendUrl}/health`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async checkDashboardHealth(): Promise<boolean> {
    try {
      await axios.get(`${this.dashboardUrl}/health`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async checkPythonReportingHealth(): Promise<boolean> {
    try {
      await execAsync(`python3 -c "import google.ads.googleads.client; print('OK')"`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
