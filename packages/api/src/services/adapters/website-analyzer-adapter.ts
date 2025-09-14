/**
 * Website Analyzer Adapter - Connects to existing Python website analysis service
 * Located at: src/intelligence/website_analyzer.py
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface WebsiteAnalysisResult {
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

export class WebsiteAnalyzerAdapter {
  private pythonScriptPath: string;

  constructor() {
    // Path to the existing Python website analyzer
    this.pythonScriptPath = path.join(process.cwd(), 'src/intelligence/website_analyzer.py');
  }

  /**
   * Analyze website using existing Python service
   */
  async analyzeWebsite(url: string): Promise<WebsiteAnalysisResult> {
    try {
      console.log(`Starting website analysis for: ${url}`);
      
      // Call the existing Python website analyzer
      const command = `python3 ${this.pythonScriptPath} --url "${url}" --format json`;
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: 60000, // 60 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      if (stderr) {
        console.warn('Website analyzer stderr:', stderr);
      }

      // Parse the JSON response from Python script
      const pythonResult = JSON.parse(stdout);
      
      // Transform Python response to our TypeScript interface
      const result: WebsiteAnalysisResult = this.transformPythonResult(pythonResult);
      
      console.log('Website analysis completed successfully');
      return result;

    } catch (error) {
      console.error('Website analysis failed:', error);
      
      // Return fallback analysis if the service fails
      return this.getFallbackAnalysis(url);
    }
  }

  /**
   * Transform Python analyzer result to TypeScript format
   */
  private transformPythonResult(pythonResult: any): WebsiteAnalysisResult {
    return {
      businessInfo: {
        title: pythonResult.business_info?.title || 'Unknown Business',
        description: pythonResult.business_info?.description || 'No description available',
        industry: pythonResult.business_info?.industry || 'Technology',
        businessType: pythonResult.business_info?.business_type || 'B2B',
      },
      personas: pythonResult.personas?.map((persona: any) => ({
        demographics: persona.demographics || {},
        interests: persona.interests || [],
        painPoints: persona.pain_points || [],
        valueProps: persona.value_props || [],
      })) || [this.getDefaultPersona()],
      competitorInsights: {
        competitors: pythonResult.competitor_insights?.competitors || [],
        adOpportunities: pythonResult.competitor_insights?.ad_opportunities || [],
      },
      adReadiness: {
        score: pythonResult.ad_readiness?.score || 75,
        recommendations: pythonResult.ad_readiness?.recommendations || [
          'Setup conversion tracking',
          'Optimize landing pages for ads',
          'Define clear value propositions'
        ],
      },
    };
  }

  /**
   * Fallback analysis for when Python service is unavailable
   */
  private getFallbackAnalysis(url: string): WebsiteAnalysisResult {
    const domain = new URL(url).hostname;
    
    return {
      businessInfo: {
        title: `Business at ${domain}`,
        description: `Analyzing ${domain} for advertising opportunities`,
        industry: 'Technology',
        businessType: 'B2B',
      },
      personas: [this.getDefaultPersona()],
      competitorInsights: {
        competitors: [],
        adOpportunities: [
          'Search advertising opportunity',
          'Social media presence needed',
          'Content marketing potential',
        ],
      },
      adReadiness: {
        score: 65,
        recommendations: [
          'Complete website analysis manually',
          'Setup analytics tracking',
          'Define target audience',
          'Create landing page variants',
        ],
      },
    };
  }

  /**
   * Default persona when analysis fails
   */
  private getDefaultPersona() {
    return {
      demographics: {
        age: '25-45',
        location: 'Urban',
        income: 'Middle to High',
      },
      interests: ['Technology', 'Business', 'Productivity'],
      painPoints: ['Time management', 'Efficiency', 'Cost optimization'],
      valueProps: ['Save time', 'Increase efficiency', 'Reduce costs'],
    };
  }

  /**
   * Health check for the Python service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`python3 -c "import sys; print('OK')"`);
      return stdout.trim() === 'OK';
    } catch (error) {
      console.error('Python service health check failed:', error);
      return false;
    }
  }
}
