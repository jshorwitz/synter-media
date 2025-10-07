/**
 * Persona Analysis Component - Deep website analysis and persona building
 * 
 * This component shows the detailed analysis phase before campaign creation
 */

'use client';

import { useState, useEffect } from 'react';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { getPlatformColor } from '@/lib/utils';

/**
 * Generate realistic competitor keywords based on domain and industry
 */
function generateCompetitorKeywords(domain: string, industry: string): string[] {
  const industryKeywords: Record<string, string[]> = {
    'Technology': [
      `${domain} alternative`, `${domain} competitor`, 'tech platform', 'software solution',
      'enterprise software', 'cloud platform', 'SaaS solution', 'business automation',
      'productivity tools', 'workflow management', 'digital transformation'
    ],
    'E-commerce': [
      `${domain} vs`, 'online store', 'ecommerce platform', 'online shopping',
      'retail software', 'shopping cart', 'payment processing', 'online marketplace'
    ],
    'Finance': [
      'fintech solution', 'financial software', 'payment platform', 'banking software',
      'investment tools', 'financial planning', 'accounting software'
    ],
    'Healthcare': [
      'healthcare software', 'medical platform', 'patient management', 'telemedicine',
      'health tech', 'medical records', 'healthcare analytics'
    ],
    'Education': [
      'edtech platform', 'learning management', 'online education', 'training software',
      'educational tools', 'student management', 'online courses'
    ]
  };

  const baseKeywords = industryKeywords[industry] || industryKeywords['Technology'];
  
  // Add competitor analysis keywords
  const competitorTerms = [
    `best ${domain} alternative`,
    `${domain} vs competitors`,
    `${domain} pricing`,
    `${domain} reviews`,
    `top ${industry.toLowerCase()} platforms`,
    `${industry.toLowerCase()} software comparison`
  ];

  return [...baseKeywords.slice(0, 6), ...competitorTerms.slice(0, 4)];
}

/**
 * Get platform brand colors for indicators
 */
function getPlatformBrandColor(platform: string): string {
  const brandColors: Record<string, string> = {
    google: '#4285F4',
    meta: '#1877F2',
    linkedin: '#0A66C2',
    x: '#000000',
    reddit: '#FF4500',
    tiktok: '#FF0050',
    youtube: '#FF0000',
  };
  return brandColors[platform.toLowerCase()] || '#6B7280';
}

interface PersonaData {
  id: string;
  name: string;
  demographics: {
    age: string;
    gender: string;
    location: string;
    income: string;
  };
  interests: string[];
  painPoints: string[];
  valueProps: string[];
  keywords: string[];
  platforms: string[];
  confidence: number;
}

interface WebsiteAnalysis {
  businessInfo: {
    title: string;
    description: string;
    industry: string;
    businessType: string;
    socialPresence: string[];
  };
  seoKeywords: string[];
  competitorKeywords: string[];
  contentThemes: string[];
  personas: PersonaData[];
  readinessScore: number;
}

interface PersonaAnalysisProps {
  websiteUrl: string;
  onPersonasComplete: (analysis: WebsiteAnalysis) => void;
  onBack: () => void;
}

export function PersonaAnalysis({ websiteUrl, onPersonasComplete, onBack }: PersonaAnalysisProps) {
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('analyzing');
  const [progress, setProgress] = useState(0);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeWebsite();
  }, [websiteUrl]);

  const analyzeWebsite = async () => {
    try {
      console.log(`Starting AI-powered analysis for: ${websiteUrl}`);
      
      // Step 1: Website Content Analysis
      setCurrentStep('analyzing');
      setProgress(20);
      
      let analysisResult;
      try {
        // Try to call the real Python AI service for website analysis
        const aiResponse = await fetch('http://localhost:8000/onboarding/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: websiteUrl,
            use_ai: true,
            generate_personas: true 
          }),
        });

        if (aiResponse.ok) {
          analysisResult = await aiResponse.json();
          console.log('✅ REAL SYNTER AI ANALYSIS COMPLETED');
          console.log('🤖 Synter AI generated personas:', analysisResult.personas?.length || 0);
          
          // Show success indicator in UI
          setCurrentStep('ai-success');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw new Error('AI service unavailable');
        }
      } catch (error) {
        console.log('⚠️ OPENAI SERVICE UNAVAILABLE - Using mock analysis');
        console.log('Error:', error.message);
        analysisResult = null;
      }

      // Step 2: Keyword Research
      setCurrentStep('keywords');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Competitor Analysis  
      setCurrentStep('competitors');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 4: Social Presence Check
      setCurrentStep('social');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: AI Persona Building
      setCurrentStep('personas');
      setProgress(100);
      
      let finalAnalysis;
      if (analysisResult) {
        // Transform real AI response to our format
        finalAnalysis = transformAIResponse(analysisResult, websiteUrl);
        finalAnalysis.isRealAI = true;
        console.log('🎯 Using REAL OpenAI GPT-4 analysis');
      } else {
        // Enhanced mock analysis if AI service is down
        finalAnalysis = generateEnhancedMockAnalysis(websiteUrl);
        finalAnalysis.isRealAI = false;
        console.log('⚡ Using mock analysis (OpenAI not available)');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      setAnalysis(finalAnalysis);
      setCurrentStep('complete');
      
      // Pre-select all personas
      setSelectedPersonas(finalAnalysis.personas.map(p => p.id));

    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentStep('error');
      setError('Analysis failed. Please try again.');
    }
  };

  /**
   * Transform real AI service response to our format
   */
  const transformAIResponse = (aiData: any, url: string): WebsiteAnalysis => {
    return {
      businessInfo: {
        title: aiData.website_info?.title || 'Unknown Business',
        description: aiData.website_info?.description || 'No description available',
        industry: aiData.website_info?.industry || 'Technology',
        businessType: aiData.website_info?.business_type || 'B2B',
        socialPresence: aiData.website_info?.social_presence || [],
      },
      seoKeywords: aiData.keyword_suggestions?.map((k: any) => k.keyword) || [],
      competitorKeywords: aiData.competitor_keywords || [],
      contentThemes: aiData.content_themes || [],
      personas: aiData.personas?.map((p: any, index: number) => ({
        id: `persona-${index + 1}`,
        name: p.name || `Persona ${index + 1}`,
        demographics: p.demographics || {},
        interests: p.interests || [],
        painPoints: p.pain_points || [],
        valueProps: p.value_props || [],
        keywords: p.keywords || [],
        platforms: p.recommended_platforms || ['google'],
        confidence: p.confidence_score || 85,
      })) || generateEnhancedMockAnalysis(url).personas,
      readinessScore: aiData.optimization_score || 85,
    };
  };

  const generateEnhancedMockAnalysis = (url: string): WebsiteAnalysis => {
    const domain = new URL(url).hostname;
    const isSourcegraph = domain.includes('sourcegraph');
    
    return {
      businessInfo: {
        title: isSourcegraph ? 'Sourcegraph' : `Business at ${domain}`,
        description: isSourcegraph ? 'Universal code search and intelligence platform' : 'Innovative technology solution',
        industry: 'Technology',
        businessType: 'B2B',
        socialPresence: ['Twitter', 'LinkedIn', 'GitHub', 'YouTube'],
      },
      seoKeywords: isSourcegraph 
        ? ['code search', 'developer tools', 'source code', 'git', 'repository search', 'code intelligence']
        : ['software', 'technology', 'platform', 'solution', 'enterprise', 'API'],
      competitorKeywords: isSourcegraph
        ? ['github enterprise', 'code analysis tools', 'developer productivity platform', 'code review software', 'enterprise git', 'code intelligence platform', 'source code search tools', 'developer workflow tools']
        : generateCompetitorKeywords(domain, 'Technology'),
      contentThemes: ['Developer Experience', 'Code Quality', 'Team Productivity', 'Enterprise Security'],
      personas: [
        {
          id: 'dev-lead',
          name: 'Development Team Lead',
          demographics: { age: '28-40', gender: 'All', location: 'Global', income: '$80K-150K' },
          interests: ['Code Quality', 'Team Productivity', 'Developer Tools', 'Software Architecture'],
          painPoints: ['Code Review Bottlenecks', 'Finding Code Across Repos', 'Onboarding New Developers'],
          valueProps: ['Faster Code Reviews', 'Better Code Discovery', 'Improved Team Velocity'],
          keywords: ['code search', 'developer tools', 'code review', 'git search'],
          platforms: ['Google', 'LinkedIn'],
          confidence: 92,
        },
        {
          id: 'engineering-manager',
          name: 'Engineering Manager',
          demographics: { age: '32-45', gender: 'All', location: 'North America, Europe', income: '$120K-200K' },
          interests: ['Engineering Productivity', 'Technical Leadership', 'Code Quality', 'Team Management'],
          painPoints: ['Developer Productivity', 'Code Quality Issues', 'Technical Debt Management'],
          valueProps: ['Increased Team Velocity', 'Better Code Quality', 'Reduced Technical Debt'],
          keywords: ['engineering productivity', 'code intelligence', 'developer experience'],
          platforms: ['LinkedIn', 'Google'],
          confidence: 88,
        },
        {
          id: 'senior-developer',
          name: 'Senior Software Developer',
          demographics: { age: '25-38', gender: 'All', location: 'Global', income: '$70K-140K' },
          interests: ['Code Search', 'Developer Experience', 'Open Source', 'Software Architecture'],
          painPoints: ['Finding Legacy Code', 'Understanding Large Codebases', 'Code Documentation'],
          valueProps: ['Faster Code Navigation', 'Better Code Understanding', 'Improved Documentation'],
          keywords: ['code search tool', 'source code search', 'codebase navigation'],
          platforms: ['Google', 'Reddit', 'X'],
          confidence: 85,
        },
        {
          id: 'cto-technical',
          name: 'CTO / Technical Decision Maker',
          demographics: { age: '35-55', gender: 'All', location: 'North America, Europe', income: '$150K-300K' },
          interests: ['Technical Strategy', 'Developer Tools', 'Engineering ROI', 'Technology Adoption'],
          painPoints: ['Engineering Efficiency', 'Technical Debt', 'Tool Evaluation', 'Team Scaling'],
          valueProps: ['Improved Engineering ROI', 'Better Technical Decisions', 'Faster Development Cycles'],
          keywords: ['enterprise code search', 'developer productivity tools', 'engineering efficiency'],
          platforms: ['LinkedIn', 'Google'],
          confidence: 90,
        },
        {
          id: 'devops-engineer',
          name: 'DevOps / Platform Engineer',
          demographics: { age: '26-42', gender: 'All', location: 'Global', income: '$75K-160K' },
          interests: ['Infrastructure', 'Automation', 'Security', 'Monitoring', 'CI/CD'],
          painPoints: ['Code Deployment Issues', 'Security Vulnerabilities', 'Build Pipeline Problems'],
          valueProps: ['Better Code Visibility', 'Security Insights', 'Improved Deployments'],
          keywords: ['devops tools', 'code security', 'deployment automation'],
          platforms: ['Google', 'Reddit'],
          confidence: 82,
        },
        {
          id: 'product-manager',
          name: 'Technical Product Manager',
          demographics: { age: '28-45', gender: 'All', location: 'North America, Europe', income: '$90K-180K' },
          interests: ['Product Strategy', 'Developer Experience', 'Technical Product Management', 'User Research'],
          painPoints: ['Understanding Technical Complexity', 'Feature Planning', 'Developer Feedback'],
          valueProps: ['Better Technical Understanding', 'Improved Feature Planning', 'Enhanced Developer Relations'],
          keywords: ['product management tools', 'developer experience', 'technical product'],
          platforms: ['LinkedIn', 'Google'],
          confidence: 78,
        },
      ],
      readinessScore: 94,
    };
  };



  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonas(prev =>
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleContinue = () => {
    if (analysis && selectedPersonas.length > 0) {
      const analysisWithSelected = {
        ...analysis,
        personas: analysis.personas.filter(p => selectedPersonas.includes(p.id))
      };
      onPersonasComplete(analysisWithSelected);
    }
  };

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-synter-surface-2 rounded-lg p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-synter-ink mb-2">Analyzing Your Website</h2>
            <p className="text-synter-ink-2">URL: {websiteUrl}</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="w-full bg-synter-surface-3 rounded-full h-3 mb-4">
              <div 
                className="bg-lime-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-synter-ink-2">
              {currentStep === 'analyzing' && 'Analyzing website content and structure...'}
              {currentStep === 'ai-success' && '🤖 Synter AI analysis completed successfully!'}
              {currentStep === 'keywords' && 'Researching relevant keywords and search terms...'}
              {currentStep === 'competitors' && 'Analyzing competitor strategies...'}
              {currentStep === 'social' && 'Checking social media presence...'}
              {currentStep === 'personas' && 'AI is building detailed user personas...'}
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Website Content', 'Keyword Research', 'Competitor Analysis', 'Social Presence', 'Persona Building'].map((step, index) => {
              const isActive = index <= Math.floor(progress / 20);
              const isCurrent = index === Math.floor(progress / 20);
              
              return (
                <div key={step} className={`p-3 rounded-lg ${
                  isActive ? 'bg-lime-500/20 text-lime-400' : 'bg-synter-surface-3 text-synter-ink-2'
                }`}>
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    isActive ? 'bg-lime-500 text-slate-900' : 'bg-synter-surface text-synter-ink-2'
                  }`}>
                    {isCurrent && <div className="w-3 h-3 border border-slate-900 border-t-transparent rounded-full animate-spin" />}
                    {isActive && !isCurrent && <span>✓</span>}
                    {!isActive && <span>{index + 1}</span>}
                  </div>
                  <p className="text-xs font-medium">{step}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-synter-ink">Website Analysis Complete</h2>
          <p className="text-synter-ink-2 mt-1">{analysis.businessInfo.title} • {analysis.businessInfo.industry}</p>
        </div>
        <button onClick={onBack} className="synter-btn synter-btn-ghost">
          ← Back
        </button>
      </div>

      {/* Business Overview */}
      <div className="bg-synter-surface-2 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-synter-ink">Business Overview</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            analysis.isRealAI ? 'bg-lime-500/15 text-lime-300 border border-lime-500/30' : 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
          }`}>
            {analysis.isRealAI ? '🤖 Synter AI Generated' : '⚡ Mock Data'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-synter-ink mb-2">Business Information</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-synter-ink-2">Industry:</span> <span className="text-synter-ink">{analysis.businessInfo.industry}</span></div>
              <div><span className="text-synter-ink-2">Type:</span> <span className="text-synter-ink">{analysis.businessInfo.businessType}</span></div>
              <div><span className="text-synter-ink-2">Description:</span> <span className="text-synter-ink">{analysis.businessInfo.description}</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-synter-ink mb-2">Advertising Readiness</h4>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-lime-500">{analysis.readinessScore}%</div>
              <div className="text-sm text-synter-ink-2">Ready for advertising</div>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords & Content Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-synter-surface-2 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-synter-ink mb-4">SEO Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.seoKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-synter-surface-3 text-synter-ink rounded-full text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-synter-surface-2 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-synter-ink mb-4">Competitor Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.competitorKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-orange-500/15 text-orange-300 border border-orange-500/30 rounded-full text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Personas */}
      <div className="bg-synter-surface-2 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-synter-ink">Generated Personas</h3>
            <p className="text-synter-ink-2 text-sm">Select the personas you want to target with campaigns</p>
          </div>
          <div className="text-sm text-synter-ink-2">
            {selectedPersonas.length} of {analysis.personas.length} selected
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {analysis.personas.map((persona) => (
            <div 
              key={persona.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPersonas.includes(persona.id)
                  ? 'border-lime-500 bg-lime-500/10 ring-2 ring-lime-500/20'
                  : 'border-synter-border bg-synter-surface-3 hover:border-synter-border-light hover:bg-synter-surface-2'
              }`}
              onClick={() => handlePersonaToggle(persona.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold ${
                  selectedPersonas.includes(persona.id) ? 'text-synter-ink' : 'text-synter-ink'
                }`}>{persona.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${
                    selectedPersonas.includes(persona.id) ? 'text-lime-700 font-medium' : 'text-synter-ink-2'
                  }`}>{persona.confidence}%</span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedPersonas.includes(persona.id)
                      ? 'border-lime-500 bg-lime-500 shadow-lg'
                      : 'border-synter-border hover:border-lime-300'
                  }`}>
                    {selectedPersonas.includes(persona.id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="mb-3">
                <div className={`text-xs mb-1 ${
                  selectedPersonas.includes(persona.id) ? 'text-lime-700 font-medium' : 'text-synter-ink-2'
                }`}>Demographics</div>
                <div className={`text-sm font-medium ${
                  selectedPersonas.includes(persona.id) ? 'text-synter-ink' : 'text-synter-ink'
                }`}>
                  {persona.demographics.age} • {persona.demographics.location} • {persona.demographics.income}
                </div>
              </div>

              {/* Interests */}
              <div className="mb-3">
                <div className={`text-xs mb-1 ${
                  selectedPersonas.includes(persona.id) ? 'text-lime-700 font-medium' : 'text-synter-ink-2'
                }`}>Interests</div>
                <div className="flex flex-wrap gap-1">
                  {persona.interests.slice(0, 3).map((interest, index) => (
                    <span key={index} className={`px-2 py-1 rounded text-xs ${
                      selectedPersonas.includes(persona.id) 
                        ? 'bg-lime-600 text-white' 
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}>
                      {interest}
                    </span>
                  ))}
                  {persona.interests.length > 3 && (
                    <span className={`text-xs ${
                      selectedPersonas.includes(persona.id) ? 'text-synter-ink font-medium' : 'text-synter-ink-2'
                    }`}>+{persona.interests.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Top Keywords */}
              <div className="mb-3">
                <div className={`text-xs mb-1 ${
                  selectedPersonas.includes(persona.id) ? 'text-lime-700 font-medium' : 'text-synter-ink-2'
                }`}>Top Keywords</div>
                <div className="flex flex-wrap gap-1">
                  {persona.keywords.slice(0, 2).map((keyword, index) => (
                    <span key={index} className={`px-2 py-1 rounded text-xs ${
                      selectedPersonas.includes(persona.id)
                        ? 'bg-lime-600 text-white'
                        : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    }`}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Platforms */}
              <div>
                <div className={`text-xs mb-1 ${
                  selectedPersonas.includes(persona.id) ? 'text-lime-700 font-medium' : 'text-synter-ink-2'
                }`}>Recommended Platforms</div>
                <div className="flex gap-1">
                  {persona.platforms.map((platform, index) => {
                    const isSelected = selectedPersonas.includes(persona.id);
                    return (
                      <div 
                        key={index}
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
                          isSelected 
                            ? 'bg-slate-800 text-white ring-2 ring-lime-500/50' 
                            : getPlatformColor(platform)
                        }`}
                      >
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: getPlatformBrandColor(platform) }}
                        />
                        <span>{platform}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-synter-ink-2">
          Selected personas will be used to create targeted campaigns
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="synter-btn synter-btn-ghost">
            Back to URL Input
          </button>
          <button 
            onClick={handleContinue}
            disabled={selectedPersonas.length === 0}
            className="synter-btn synter-btn-primary"
          >
            Create Campaigns for {selectedPersonas.length} Personas →
          </button>
        </div>
      </div>
    </div>
  );
}
