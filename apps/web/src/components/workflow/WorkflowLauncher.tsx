/**
 * Workflow Launcher - Main component to start and monitor the complete advertising workflow
 * 
 * This connects to the new workflow orchestrator API to provide a unified experience
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { PersonaAnalysis } from './PersonaAnalysis';

interface WorkflowConfig {
  websiteUrl: string;
  platforms: string[];
  budget: number;
  dryRun: boolean;
}

interface WorkflowStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
}

interface WorkflowStatus {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep?: string;
  steps: WorkflowStep[];
  progress: number;
  isComplete: boolean;
  hasError: boolean;
}

export function WorkflowLauncher() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');
  
  const [config, setConfig] = useState<WorkflowConfig>({
    websiteUrl: urlParam || (typeof window !== 'undefined' ? localStorage.getItem('workflow_website_url') || '' : ''),
    platforms: ['google'],
    budget: 1000,
    dryRun: true,
  });
  
  const [workflow, setWorkflow] = useState<WorkflowStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'personas' | 'campaign'>('input');
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any>(null);

  // Auto-start persona analysis if URL is provided
  useEffect(() => {
    if (urlParam && currentStep === 'input') {
      setConfig(prev => ({ ...prev, websiteUrl: urlParam }));
      setCurrentStep('personas');
    }
  }, [urlParam, currentStep]);

  // Poll workflow status when running
  useEffect(() => {
    if (!workflow || workflow.isComplete || workflow.hasError) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/workflow/${workflow.workflowId}/status`);
        const data = await response.json();
        
        if (data.success) {
          setWorkflow(data.workflow);
        }
      } catch (error) {
        console.error('Failed to poll workflow status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [workflow]);

  /**
   * Handle persona analysis completion
   */
  const handlePersonasComplete = (analysis: any) => {
    setWebsiteAnalysis(analysis);
    setCurrentStep('campaign');
  };

  /**
   * Go back to URL input
   */
  const handleBackToInput = () => {
    setCurrentStep('input');
    setWebsiteAnalysis(null);
    setWorkflow(null);
    setError(null);
  };

  /**
   * Start the campaign workflow with personas
   */
  const startWorkflow = async () => {
    if (!config.websiteUrl) {
      setError('Please enter a website URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const workflowConfig = {
        ...config,
        personas: websiteAnalysis?.personas || [],
        analysis: websiteAnalysis,
      };

      const response = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowConfig),
      });

      const data = await response.json();

      if (data.success) {
        // Start polling for status
        const statusResponse = await fetch(`/api/workflow/${data.workflowId}/status`);
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          setWorkflow(statusData.workflow);
        }
      } else {
        setError(data.error || 'Failed to start workflow');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset workflow
   */
  const resetWorkflow = () => {
    setWorkflow(null);
    setError(null);
  };

  /**
   * Get step display name
   */
  const getStepDisplayName = (step: string): string => {
    const names: Record<string, string> = {
      analysis: 'Website Analysis',
      campaign_generation: 'Campaign Generation',
      campaign_launch: 'Campaign Launch',
      performance_setup: 'Performance Tracking',
    };
    return names[step] || step;
  };

  /**
   * Get step description
   */
  const getStepDescription = (step: string): string => {
    const descriptions: Record<string, string> = {
      analysis: 'Analyzing your website to identify target audiences and business information',
      campaign_generation: 'Creating AI-powered campaign strategies tailored to your business',
      campaign_launch: 'Launching campaigns on selected advertising platforms',
      performance_setup: 'Setting up performance tracking and metrics collection',
    };
    return descriptions[step] || 'Processing...';
  };

  // Show persona analysis step
  if (currentStep === 'personas') {
    return (
      <PersonaAnalysis
        websiteUrl={config.websiteUrl}
        onPersonasComplete={handlePersonasComplete}
        onBack={handleBackToInput}
      />
    );
  }

  // Show campaign workflow results
  if (workflow) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-synter-ink">Campaign Workflow</h2>
            <p className="text-synter-ink-2 mt-1">Website: {workflow?.websiteUrl || config.websiteUrl}</p>
          </div>
          <button
            onClick={resetWorkflow}
            className="synter-btn synter-btn-ghost"
          >
            Start New Workflow
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-synter-surface-2 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-synter-ink">Progress</h3>
            <span className="text-sm text-synter-ink-2">{workflow.progress}% Complete</span>
          </div>
          
          <div className="w-full bg-synter-surface-3 rounded-full h-2 mb-4">
            <div 
              className="bg-synter-volt h-2 rounded-full transition-all duration-500"
              style={{ width: `${workflow.progress}%` }}
            />
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-3">
            {workflow.hasError && (
              <div className="flex items-center gap-2 text-synter-ember">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Workflow Failed
              </div>
            )}
            {workflow.isComplete && (
              <div className="flex items-center gap-2 text-synter-meadow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Workflow Complete
              </div>
            )}
            {!workflow.isComplete && !workflow.hasError && (
              <div className="flex items-center gap-2 text-synter-volt">
                <div className="animate-spin w-5 h-5 border-2 border-synter-volt border-t-transparent rounded-full" />
                Processing...
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-synter-surface-2 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-synter-ink mb-4">Workflow Steps</h3>
          
          <div className="space-y-4">
            {['analysis', 'campaign_generation', 'campaign_launch', 'performance_setup'].map((stepName, index) => {
              const step = workflow.steps.find(s => s.step === stepName);
              const status = step?.status || 'pending';
              
              return (
                <div key={stepName} className="flex items-start gap-4">
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-synter-meadow text-white' :
                    status === 'running' ? 'bg-synter-volt text-white' :
                    status === 'failed' ? 'bg-synter-ember text-white' :
                    'bg-synter-surface-3 text-synter-ink-2'
                  }`}>
                    {status === 'completed' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {status === 'running' && (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {status === 'failed' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    {status === 'pending' && <span className="text-xs">{index + 1}</span>}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h4 className="font-medium text-synter-ink">{getStepDisplayName(stepName)}</h4>
                    <p className="text-sm text-synter-ink-2 mt-1">{getStepDescription(stepName)}</p>
                    
                    {step?.error && (
                      <div className="mt-2 p-3 bg-synter-ember/10 rounded-lg">
                        <p className="text-sm text-synter-ember">{step.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        {workflow.isComplete && (
          <div className="bg-synter-surface-2 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-synter-ink mb-4">Campaign Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.platforms.map(platform => (
                <div key={platform} className="bg-synter-surface-3 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <PlatformBadge platform={platform} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-synter-ink-2">Campaign:</span>
                      <span className="text-synter-ink">Created</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-synter-ink-2">Budget:</span>
                      <span className="text-synter-ink">${config.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-synter-ink-2">Status:</span>
                      <span className="text-synter-meadow">
                        {config.dryRun ? 'Dry Run' : 'Live'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-synter-surface-2 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-synter-ink mb-6">AI-Powered Marketing Analysis</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-synter-ember/10 border-l-4 border-synter-ember rounded">
            <p className="text-synter-ember">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Website URL */}
          <div>
            <label className="synter-label">Website URL</label>
            <input
              type="url"
              value={config.websiteUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, websiteUrl: e.target.value }))}
              placeholder="https://yourwebsite.com"
              className="synter-input"
            />
            <p className="text-sm text-synter-ink-2 mt-2">
              We'll analyze your website, research keywords, identify social posts, and build 4-6 detailed personas
            </p>
          </div>

          {/* Platforms */}
          <div>
            <label className="synter-label">Advertising Platforms</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {['google', 'meta', 'reddit', 'x'].map(platform => (
                <label key={platform} className="flex items-center gap-3 p-3 border border-synter-border rounded-lg cursor-pointer hover:bg-synter-hover">
                  <input
                    type="checkbox"
                    checked={config.platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig(prev => ({ ...prev, platforms: [...prev.platforms, platform] }));
                      } else {
                        setConfig(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform) }));
                      }
                    }}
                    className="rounded"
                  />
                  <PlatformBadge platform={platform} />
                </label>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="synter-label">Total Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={config.budget}
                onChange={(e) => setConfig(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                min="100"
                max="50000"
                className="synter-input pl-10"
              />
            </div>
            <p className="text-sm text-synter-ink-2 mt-2">
              Budget will be distributed across selected platforms
            </p>
          </div>

          {/* Dry Run */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="dryRun"
              checked={config.dryRun}
              onChange={(e) => setConfig(prev => ({ ...prev, dryRun: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="dryRun" className="text-synter-ink">
              Dry Run (Test mode - no real campaigns will be created)
            </label>
          </div>

          {/* Analyze Website Button */}
          <button
            onClick={() => setCurrentStep('personas')}
            disabled={!config.websiteUrl}
            className="synter-btn synter-btn-primary w-full"
          >
            Analyze Website & Build Personas →
          </button>
        </div>
      </div>
    </div>
  );
}
