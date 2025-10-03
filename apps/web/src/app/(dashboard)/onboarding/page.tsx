"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Building2, Target, Zap, Loader2, Sparkles, Mail } from "lucide-react"

const STEPS = [
  { id: 0, title: "Website Analysis", icon: Sparkles },
  { id: 1, title: "Create Account", icon: Mail },
  { id: 2, title: "Your Business", icon: Building2 },
  { id: 3, title: "Connect Platforms", icon: Zap },
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlParam = searchParams.get('url')
  
  const [currentStep, setCurrentStep] = useState(urlParam ? 0 : 1)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    website: urlParam || "",
    industry: "",
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
        industry: data.industry || '',
        audience: data.targetAudience || '',
        monthlyBudget: data.suggestedBudget?.toString() || '',
      })
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      // Create account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      
      if (!res.ok) {
        alert('Failed to create account')
        return
      }
      
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 3) {
      // Save onboarding data and redirect
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      router.push("/campaigns/new")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  step.id === currentStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.id <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
          <CardTitle className="text-2xl">
            {currentStep === 0 && "Analyzing your website..."}
            {currentStep === 1 && "Create your account"}
            {currentStep === 2 && "Tell us about your business"}
            {currentStep === 3 && "Connect your ad platforms"}
          </CardTitle>
          <CardDescription>
            {currentStep === 0 && "Using AI to understand your business and audience"}
            {currentStep === 1 && "Sign up to save your campaign insights"}
            {currentStep === 2 && "Review and refine the AI analysis"}
            {currentStep === 3 && "Connect Google, Microsoft, LinkedIn, or Reddit Ads"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="py-12">
              {analyzing ? (
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analyzing {formData.website}</h3>
                  <p className="text-gray-600">Our AI is reviewing your website to understand your business...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">AI Analysis Complete</h3>
                        <p className="text-blue-700 text-sm">Here's what we learned about your business</p>
                      </div>
                    </div>
                    <div className="grid gap-4 mt-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Industry</div>
                        <div className="text-lg font-semibold text-gray-900">{analysis.industry}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Business Type</div>
                        <div className="text-lg font-semibold text-gray-900">{analysis.businessType}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Target Audience</div>
                        <div className="text-gray-900">{analysis.targetAudience}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Suggested Monthly Budget</div>
                        <div className="text-lg font-semibold text-green-700">${analysis.suggestedBudget?.toLocaleString()}</div>
                      </div>
                      {analysis.keyInsights && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Key Insights</div>
                          <ul className="space-y-1">
                            {analysis.keyInsights.map((insight: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setCurrentStep(1)} className="w-full">
                    Continue to Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a secure password"
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="SaaS, E-commerce, Healthcare, etc."
                />
              </div>
            </>
          )}

          {currentStep === 2 && analysis && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>AI found:</strong> {analysis.industry} • {analysis.businessType}
                </p>
              </div>
              <div>
                <Label htmlFor="audience">Who is your ideal customer?</Label>
                <Textarea
                  id="audience"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="e.g., Software developers at B2B companies with 50-500 employees"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="goals">What are your marketing goals?</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="e.g., Generate qualified leads, increase brand awareness, drive conversions"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="monthlyBudget">Monthly Ad Budget (USD)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                  placeholder="5000"
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Connect your ad platforms now, or skip and do it later from Settings.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push("/settings/credentials?platform=google_ads")}
                >
                  <div className="text-lg font-semibold">Google Ads</div>
                  <div className="text-xs text-gray-500">Search & Display</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push("/settings/credentials?platform=microsoft_ads")}
                >
                  <div className="text-lg font-semibold">Microsoft Ads</div>
                  <div className="text-xs text-gray-500">Bing Search</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push("/settings/credentials?platform=linkedin_ads")}
                >
                  <div className="text-lg font-semibold">LinkedIn Ads</div>
                  <div className="text-xs text-gray-500">B2B Professional</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push("/settings/credentials?platform=reddit_ads")}
                >
                  <div className="text-lg font-semibold">Reddit Ads</div>
                  <div className="text-xs text-gray-500">Community & Interest</div>
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            )}
            {currentStep > 0 && (
              <Button 
                onClick={handleNext} 
                disabled={
                  (currentStep === 1 && (!formData.email || !formData.password)) ||
                  (currentStep === 2 && !formData.businessName)
                }
              >
                {currentStep === 3 ? "Get Started" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
