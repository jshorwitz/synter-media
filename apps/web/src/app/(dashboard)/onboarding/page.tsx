"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Building2, Target, Zap, Loader2, Sparkles, Mail, Check, DollarSign } from "lucide-react"

const STEPS = [
  { id: 0, title: "Website Analysis", icon: Sparkles },
  { id: 1, title: "Ad Footprint & Savings", icon: DollarSign },
  { id: 2, title: "Create Account", icon: Mail },
  { id: 3, title: "Your Business", icon: Building2 },
  { id: 4, title: "Connect Platforms", icon: Zap },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url')
  
  const [currentStep, setCurrentStep] = useState(urlParam ? 0 : 2)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    website: urlParam || "",
    businessType: "",
    industry: "",
    productDescription: "",
    audience: "",
    goals: "",
    monthlyBudget: "",
  })

  useEffect(() => {
    if (urlParam && currentStep === 0) {
      analyzeWebsite(urlParam)
    }
  }, [urlParam])

  const analyzeWebsite = async (url: string) => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      
      const data = await res.json()
      setAnalysis(data)
      setFormData({
        ...formData,
        website: url,
        businessType: data.businessType || '',
        industry: data.industry || '',
        productDescription: data.productDescription || '',
        audience: data.targetAudience || '',
      })
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const scanAdFootprint = async (url: string) => {
    setScanning(true)
    try {
      const res = await fetch('/api/onboarding/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      
      const data = await res.json()
      setScanId(data.scan_id)
      
      // If scan completed immediately (synchronous), fetch results right away
      if (data.status === 'done') {
        const resultRes = await fetch(`/api/onboarding/result?scan_id=${data.scan_id}`)
        const result = await resultRes.json()
        setScanResult(result)
        setScanning(false)
        return
      }
      
      // Otherwise poll for results (fallback for async scans)
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/onboarding/status?scan_id=${data.scan_id}`)
        const status = await statusRes.json()
        
        if (status.status === 'done') {
          clearInterval(pollInterval)
          const resultRes = await fetch(`/api/onboarding/result?scan_id=${data.scan_id}`)
          const result = await resultRes.json()
          setScanResult(result)
          setScanning(false)
        } else if (status.status === 'error') {
          clearInterval(pollInterval)
          setScanning(false)
          console.error('Scan failed:', status.error)
        }
      }, 2000)
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval)
        if (scanning) {
          setScanning(false)
        }
      }, 30000)
    } catch (error) {
      console.error('Scan failed:', error)
      setScanning(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      // After analysis, start ad footprint scan
      setCurrentStep(currentStep + 1)
      scanAdFootprint(formData.website)
    } else if (currentStep === 2) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.businessName,
        }),
      })
      
      if (!res.ok) {
        alert('Failed to create account')
        return
      }
      
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 4) {
      // Save onboarding data
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).catch(() => {}) // Don't block if this fails
      
      // Redirect to campaigns
      router.push("/campaigns")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      data-theme="dark"
      style={{background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(220 39% 18%) 100%)'}}
    >
      <div className="w-full max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                      ${step.id < currentStep ? 'bg-emerald-500 scale-110' : ''}
                      ${step.id === currentStep ? 'bg-blue-500 ring-4 ring-blue-500/30 scale-110' : ''}
                      ${step.id > currentStep ? 'bg-slate-700 scale-100' : ''}
                    `}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <step.icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-700 ease-out"
                        style={{width: step.id < currentStep ? '100%' : '0%'}}
                      />
                    </div>
                  )}
                </div>
                <span className={`
                  mt-2 text-sm font-medium transition-colors duration-300
                  ${step.id === currentStep ? 'text-blue-400' : 'text-slate-500'}
                `}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div 
          className="rounded-2xl p-8 backdrop-blur-lg transition-all duration-500"
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Step 0: Analysis */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                  Analyzing your website...
                </h2>
                <p style={{color: 'hsl(215 20% 65%)'}}>
                  Using AI to understand your business and audience
                </p>
              </div>

              {analyzing ? (
                <div className="py-16 text-center">
                  <div className="relative inline-block">
                    <Loader2 className="w-20 h-20 animate-spin" style={{color: 'hsl(217 91% 60%)'}} />
                    <div className="absolute inset-0 animate-ping opacity-20">
                      <Loader2 className="w-20 h-20" style={{color: 'hsl(217 91% 60%)'}} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mt-6 mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                    Analyzing {formData.website}
                  </h3>
                  <p style={{color: 'hsl(215 20% 65%)'}}>
                    Our AI is reviewing your website to understand your business...
                  </p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{color: 'hsl(217 91% 60%)'}}>Business Type</label>
                    <input
                      type="text"
                      value={formData.businessType || analysis.businessType}
                      onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
                      style={{color: 'hsl(210 40% 96%)'}}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{color: 'hsl(142 76% 36%)'}}>Industry</label>
                    <input
                      type="text"
                      value={formData.industry || analysis.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-green-500 focus:outline-none transition-colors"
                      style={{color: 'hsl(210 40% 96%)'}}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{color: 'hsl(45 93% 47%)'}}>Product/Service Description</label>
                    <textarea
                      value={formData.productDescription || ''}
                      onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-yellow-500 focus:outline-none transition-colors"
                      style={{color: 'hsl(210 40% 96%)'}}
                      rows={3}
                      placeholder="Describe what you offer..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{color: 'hsl(271 91% 65%)'}}>Target Audience</label>
                    <textarea
                      value={formData.audience || analysis.targetAudience}
                      onChange={(e) => setFormData({...formData, audience: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                      style={{color: 'hsl(210 40% 96%)'}}
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    style={{background: 'hsl(217 91% 60%)', color: 'white'}}
                  >
                    Continue to Account Creation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 1: Ad Footprint & Savings */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                  Detecting your ad footprint...
                </h2>
                <p style={{color: 'hsl(215 20% 65%)'}}>
                  Analyzing which platforms you're currently advertising on
                </p>
              </div>

              {scanning ? (
                <div className="py-16 text-center">
                  <div className="relative inline-block">
                    <Loader2 className="w-20 h-20 animate-spin" style={{color: 'hsl(142 76% 36%)'}} />
                    <div className="absolute inset-0 animate-ping opacity-20">
                      <Loader2 className="w-20 h-20" style={{color: 'hsl(142 76% 36%)'}} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mt-6 mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                    Scanning {formData.website}
                  </h3>
                  <p style={{color: 'hsl(215 20% 65%)'}}>
                    Checking for Google Ads, Meta, LinkedIn, X, Reddit, and Microsoft tracking pixels...
                  </p>
                </div>
              ) : scanResult ? (
                <div className="space-y-6">
                  {/* ROI Callout */}
                  <div className="p-6 rounded-lg" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '2px solid rgba(16, 185, 129, 0.4)'}}>
                    <div className="flex items-start gap-4">
                      <DollarSign className="w-12 h-12 flex-shrink-0" style={{color: 'hsl(142 76% 36%)'}} />
                      <div>
                        <h3 className="text-2xl font-bold mb-2" style={{color: 'hsl(142 76% 36%)'}}>
                          Synter Advantage
                        </h3>
                        <p className="text-lg mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                          Most agencies charge <strong>10-15% of your ad spend</strong>. Synter uses a flat-rate + credits model that typically saves you money as you scale.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detected Platforms */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4" style={{color: 'hsl(210 40% 96%)'}}>
                      Detected Ad Platforms ({scanResult.totals?.platforms_detected || 0})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {scanResult.platforms?.map((platform: any) => (
                        <div
                          key={platform.platform}
                          className="p-4 rounded-lg border"
                          style={{
                            background: platform.detected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(51, 65, 85, 0.3)',
                            borderColor: platform.detected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(51, 65, 85, 0.5)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold capitalize" style={{color: 'hsl(210 40% 96%)'}}>
                              {platform.platform}
                            </span>
                            {platform.detected && (
                              <Check className="w-5 h-5" style={{color: 'hsl(142 76% 36%)'}} />
                            )}
                          </div>
                          {platform.detected && (
                            <p className="text-xs" style={{color: 'hsl(215 20% 65%)'}}>
                              Confidence: {platform.confidence}%
                            </p>
                          )}
                          {!platform.detected && (
                            <p className="text-xs" style={{color: 'hsl(215 20% 65%)'}}>
                              Not detected
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    style={{background: 'hsl(142 76% 36%)', color: 'white'}}
                  >
                    Continue to Account Creation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 2: Create Account */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                  Create your account
                </h2>
                <p style={{color: 'hsl(215 20% 65%)'}}>
                  Sign up to save your campaign insights
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'hsl(215 20% 65%)'}}>
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderColor: 'rgba(51, 65, 85, 0.6)',
                      color: 'hsl(210 40% 96%)'
                    }}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'hsl(215 20% 65%)'}}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderColor: 'rgba(51, 65, 85, 0.6)',
                      color: 'hsl(210 40% 96%)'
                    }}
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'hsl(215 20% 65%)'}}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderColor: 'rgba(51, 65, 85, 0.6)',
                      color: 'hsl(210 40% 96%)'
                    }}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  onClick={handleNext}
                  disabled={!formData.email || !formData.password || !formData.businessName}
                  className="w-full mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{background: 'hsl(217 91% 60%)', color: 'white'}}
                >
                  Create Account & Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Business Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                  Tell us about your business
                </h2>
                <p style={{color: 'hsl(215 20% 65%)'}}>
                  Review and refine the AI analysis
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'hsl(215 20% 65%)'}}>
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderColor: 'rgba(51, 65, 85, 0.6)',
                      color: 'hsl(210 40% 96%)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'hsl(215 20% 65%)'}}>
                    Target Audience
                  </label>
                  <textarea
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderColor: 'rgba(51, 65, 85, 0.6)',
                      color: 'hsl(210 40% 96%)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'hsl(215 20% 65%)'}}>
                    Monthly Budget
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({...formData, monthlyBudget: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderColor: 'rgba(51, 65, 85, 0.6)',
                      color: 'hsl(210 40% 96%)'
                    }}
                    placeholder="5000"
                  />
                </div>
                <button
                  onClick={handleNext}
                  className="w-full mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  style={{background: 'hsl(217 91% 60%)', color: 'white'}}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Connect Platforms */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{color: 'hsl(210 40% 96%)'}}>
                  Connect your ad platforms
                </h2>
                <p style={{color: 'hsl(215 20% 65%)'}}>
                  Connect Google, LinkedIn, or Reddit Ads. You can also add platforms later in Settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Google Ads', color: 'hsl(217 91% 60%)', route: '/api/oauth/google-ads/start', available: true },
                  { name: 'Reddit Ads', color: 'hsl(16 100% 50%)', route: '/api/oauth/reddit-ads/start', available: true },
                  { name: 'X Ads', color: 'hsl(200 100% 40%)', route: '/api/oauth/x-ads/start', available: true },
                  { name: 'Microsoft Ads', color: 'hsl(142 76% 36%)', route: '/api/oauth/microsoft-ads/start', available: false },
                  { name: 'LinkedIn Ads', color: 'hsl(201 100% 35%)', route: '/api/oauth/linkedin-ads/start', available: false },
                  { name: 'Meta Ads', color: 'hsl(214 89% 52%)', route: '/api/oauth/meta-ads/start', available: false },
                ].map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      if (platform.available) {
                        window.location.href = platform.route
                      }
                    }}
                    disabled={!platform.available}
                    className="p-6 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105 hover:shadow-lg text-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      borderColor: platform.color,
                      background: `${platform.color}15`
                    }}
                  >
                    <Zap className="w-8 h-8 mx-auto mb-2" style={{color: platform.color}} />
                    <p className="font-semibold" style={{color: 'hsl(210 40% 96%)'}}>{platform.name}</p>
                    <p className="text-xs mt-1" style={{color: 'hsl(215 20% 65%)'}}>
                      {platform.available ? 'Click to connect' : 'Coming soon'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/campaigns')}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-slate-700"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: 'hsl(210 40% 96%)'
                  }}
                >
                  Skip for now
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  style={{background: 'hsl(142 76% 36%)', color: 'white'}}
                >
                  Finish Setup
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen flex items-center justify-center"
        data-theme="dark"
        style={{background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(220 39% 18%) 100%)'}}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{color: 'hsl(217 91% 60%)'}} />
          <p style={{color: 'hsl(215 20% 65%)'}}>Loading...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
