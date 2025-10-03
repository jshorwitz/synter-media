"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Building2, Target, Zap } from "lucide-react"

const STEPS = [
  { id: 1, title: "Your Business", icon: Building2 },
  { id: 2, title: "Target Audience", icon: Target },
  { id: 3, title: "Connect Platforms", icon: Zap },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    website: "",
    industry: "",
    audience: "",
    goals: "",
    monthlyBudget: "",
  })

  const handleNext = async () => {
    if (currentStep === 3) {
      // Save to backend and redirect
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
            {currentStep === 1 && "Tell us about your business"}
            {currentStep === 2 && "Who are you trying to reach?"}
            {currentStep === 3 && "Connect your ad platforms"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Help us understand your business so we can create better campaigns"}
            {currentStep === 2 && "Define your ideal customer to get targeted recommendations"}
            {currentStep === 3 && "Connect Google, Microsoft, LinkedIn, or Reddit Ads"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
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

          {currentStep === 2 && (
            <>
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
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
            <Button onClick={handleNext} disabled={currentStep === 1 && !formData.businessName}>
              {currentStep === 3 ? "Get Started" : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
