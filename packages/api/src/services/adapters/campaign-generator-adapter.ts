/**
 * Campaign Generator Adapter - Connects to existing AI Agency service
 * Located at: src/ai_agency/llm_clients.py and src/api/ai_agency_routes.py
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execAsync = promisify(exec);

interface WebsiteAnalysis {
  businessInfo: {
    title: string;
    description: string;
    industry: string;
    businessType: string;
  };
  personas: any[];
  competitorInsights: any;
  adReadiness: any;
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

export class CampaignGeneratorAdapter {
  private aiAgencyApiUrl: string;
  private pythonScriptPath: string;

  constructor() {
    // URL for the existing AI Agency API (if running)
    this.aiAgencyApiUrl = process.env.AI_AGENCY_API_URL || 'http://localhost:8000';
    this.pythonScriptPath = 'src/ai_agency/llm_clients.py';
  }

  /**
   * Generate campaigns using existing AI Agency service
   */
  async generateCampaigns(
    analysis: WebsiteAnalysis, 
    platforms: string[]
  ): Promise<CampaignStrategy[]> {
    try {
      console.log(`Generating campaigns for platforms: ${platforms.join(', ')}`);
      
      // Try API first, fall back to Python script
      const strategies = await this.tryApiGeneration(analysis, platforms)
        || await this.tryPythonGeneration(analysis, platforms)
        || this.getFallbackStrategies(analysis, platforms);

      console.log(`Generated ${strategies.length} campaign strategies`);
      return strategies;

    } catch (error) {
      console.error('Campaign generation failed:', error);
      return this.getFallbackStrategies(analysis, platforms);
    }
  }

  /**
   * Try generating via AI Agency API
   */
  private async tryApiGeneration(
    analysis: WebsiteAnalysis, 
    platforms: string[]
  ): Promise<CampaignStrategy[] | null> {
    try {
      const response = await axios.post(
        `${this.aiAgencyApiUrl}/ai-agency/strategy`,
        {
          business_info: analysis.businessInfo,
          personas: analysis.personas,
          platforms: platforms,
          budget_range: [1000, 10000],
        },
        { timeout: 30000 }
      );

      return this.transformApiResponse(response.data, platforms);
    } catch (error) {
      console.warn('AI Agency API not available, trying Python script');
      return null;
    }
  }

  /**
   * Try generating via Python script
   */
  private async tryPythonGeneration(
    analysis: WebsiteAnalysis,
    platforms: string[]
  ): Promise<CampaignStrategy[] | null> {
    try {
      const inputData = JSON.stringify({
        business_info: analysis.businessInfo,
        personas: analysis.personas,
        platforms: platforms,
      });

      const command = `echo '${inputData}' | python3 ${this.pythonScriptPath} --mode campaign_generation`;
      
      const { stdout } = await execAsync(command, {
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      });

      const pythonResult = JSON.parse(stdout);
      return this.transformPythonResponse(pythonResult, platforms);

    } catch (error) {
      console.warn('Python campaign generation failed:', error);
      return null;
    }
  }

  /**
   * Transform API response to campaign strategies
   */
  private transformApiResponse(apiData: any, platforms: string[]): CampaignStrategy[] {
    const strategies: CampaignStrategy[] = [];

    for (const platform of platforms) {
      const platformData = apiData[platform] || apiData.strategies?.[platform];
      
      if (platformData) {
        strategies.push({
          platform,
          campaignType: platformData.campaign_type || this.getDefaultCampaignType(platform),
          targeting: {
            demographics: platformData.targeting?.demographics || {},
            interests: platformData.targeting?.interests || [],
            keywords: platformData.targeting?.keywords || [],
          },
          adCopy: {
            headlines: platformData.ad_copy?.headlines || this.getDefaultHeadlines(),
            descriptions: platformData.ad_copy?.descriptions || this.getDefaultDescriptions(),
            callToActions: platformData.ad_copy?.ctas || this.getDefaultCTAs(),
          },
          budget: {
            daily: platformData.budget?.daily || 100,
            total: platformData.budget?.total || 3000,
          },
          bidStrategy: platformData.bid_strategy || this.getDefaultBidStrategy(platform),
        });
      }
    }

    return strategies.length > 0 ? strategies : this.getFallbackStrategies({} as any, platforms);
  }

  /**
   * Transform Python response to campaign strategies
   */
  private transformPythonResponse(pythonData: any, platforms: string[]): CampaignStrategy[] {
    // Similar transformation as API response
    return this.transformApiResponse(pythonData, platforms);
  }

  /**
   * Fallback campaign strategies when AI services fail
   */
  private getFallbackStrategies(analysis: WebsiteAnalysis, platforms: string[]): CampaignStrategy[] {
    return platforms.map(platform => ({
      platform,
      campaignType: this.getDefaultCampaignType(platform),
      targeting: {
        demographics: {
          age: '25-54',
          gender: 'all',
          location: 'US',
        },
        interests: analysis.personas?.[0]?.interests || ['Technology', 'Business'],
        keywords: this.getDefaultKeywords(analysis.businessInfo?.title || 'business'),
      },
      adCopy: {
        headlines: this.getDefaultHeadlines(analysis.businessInfo?.title),
        descriptions: this.getDefaultDescriptions(analysis.businessInfo?.description),
        callToActions: this.getDefaultCTAs(),
      },
      budget: {
        daily: 100,
        total: 3000,
      },
      bidStrategy: this.getDefaultBidStrategy(platform),
    }));
  }

  /**
   * Platform-specific defaults
   */
  private getDefaultCampaignType(platform: string): string {
    const types = {
      google: 'Search',
      meta: 'Conversion',
      reddit: 'Promoted Posts',
      x: 'Promoted Tweets',
    };
    return types[platform as keyof typeof types] || 'Brand Awareness';
  }

  private getDefaultBidStrategy(platform: string): string {
    const strategies = {
      google: 'MAXIMIZE_CONVERSIONS',
      meta: 'LOWEST_COST_WITH_BID_CAP',
      reddit: 'AUTOMATIC',
      x: 'AUTO_BID',
    };
    return strategies[platform as keyof typeof strategies] || 'AUTOMATIC';
  }

  private getDefaultKeywords(businessName: string): string[] {
    return [
      businessName.toLowerCase(),
      `${businessName} software`,
      `${businessName} platform`,
      `${businessName} solution`,
      'business automation',
      'productivity tools',
    ];
  }

  private getDefaultHeadlines(businessName?: string): string[] {
    const name = businessName || 'Your Business';
    return [
      `Transform Your Business with ${name}`,
      `${name} - The Smart Solution`,
      `Get Started with ${name} Today`,
      `Boost Productivity with ${name}`,
    ];
  }

  private getDefaultDescriptions(businessDesc?: string): string[] {
    return [
      businessDesc || 'Powerful business solution designed to boost your productivity and growth.',
      'Join thousands of satisfied customers who trust our platform.',
      'Easy setup, powerful results. Get started in minutes.',
      'Free trial available. No credit card required.',
    ];
  }

  private getDefaultCTAs(): string[] {
    return [
      'Get Started Free',
      'Start Free Trial',
      'Learn More',
      'Book Demo',
      'Sign Up Now',
    ];
  }

  /**
   * Health check for AI services
   */
  async healthCheck(): Promise<{ api: boolean; python: boolean }> {
    const [apiHealth, pythonHealth] = await Promise.all([
      this.checkApiHealth(),
      this.checkPythonHealth(),
    ]);

    return {
      api: apiHealth,
      python: pythonHealth,
    };
  }

  private async checkApiHealth(): Promise<boolean> {
    try {
      await axios.get(`${this.aiAgencyApiUrl}/health`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async checkPythonHealth(): Promise<boolean> {
    try {
      await execAsync(`python3 -c "import openai; print('OK')"`);
      return true;
    } catch {
      return false;
    }
  }
}
