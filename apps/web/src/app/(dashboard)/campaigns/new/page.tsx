"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Loader2, CheckCircle, Rocket } from "lucide-react"

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    goal: "",
    budget: "",
    targetAudience: "",
    keywords: [] as string[],
    adCopy: "",
  })

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: formData.goal,
          audience: formData.targetAudience,
          budget: formData.budget,
          platform: formData.platform,
        }),
      })
      
      const data = await res.json()
      setAiRecommendations(data)
      setFormData({
        ...formData,
        keywords: data.keywords || [],
        adCopy: data.adCopy || "",
      })
      setStep(3)
    } catch (error) {
      console.error("AI recommendations failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      const { campaignId } = await res.json()
      router.push(`/campaigns/${campaignId}`)
    } catch (error) {
      console.error("Campaign creation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create New Campaign</h1>
        <p className="text-gray-700 dark:text-gray-300">AI-powered campaign builder with intelligent recommendations</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: "Setup" },
          { num: 2, label: "AI Recommendations" },
          { num: 3, label: "Review & Deploy" },
        ].map((s) => (
          <div key={s.num} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s.num <= step ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {s.num < step ? <CheckCircle className="w-5 h-5" /> : s.num}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">{s.label}</span>
            {s.num < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Setup */}
      {step === 1 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Campaign Setup</CardTitle>
            <CardDescription className="text-gray-400">Tell us about your campaign goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Q4 2024 Lead Generation"
              />
            </div>

            <div>
              <Label htmlFor="platform">Ad Platform</Label>
              <Select value={formData.platform} onValueChange={(val) => setFormData({ ...formData, platform: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="microsoft_ads">Microsoft Ads</SelectItem>
                  <SelectItem value="linkedin_ads">LinkedIn Ads</SelectItem>
                  <SelectItem value="reddit_ads">Reddit Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goal">Campaign Goal</Label>
              <Select value={formData.goal} onValueChange={(val) => setFormData({ ...formData, goal: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Generate Leads</SelectItem>
                  <SelectItem value="conversions">Drive Conversions</SelectItem>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Daily Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="100"
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="Describe your ideal customer (e.g., Software engineers at B2B companies)"
                rows={4}
              />
            </div>

            <Button onClick={() => setStep(2)} className="w-full" disabled={!formData.name || !formData.platform}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Recommendations */}
      {step === 2 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription className="text-gray-400">
              Let AI analyze your goals and suggest keywords, targeting, and ad copy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!loading && !aiRecommendations && (
              <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Ready to generate recommendations</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our AI will analyze your campaign goals and suggest the best keywords, audiences, and ad copy
              </p>
                <Button onClick={generateRecommendations} size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate AI Recommendations
                </Button>
              </div>
            )}

            {loading && (
            <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Analyzing your campaign...</h3>
            <p className="text-gray-700 dark:text-gray-300">This may take a few moments</p>
            </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Deploy */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Campaign Summary</CardTitle>
              <CardDescription className="text-gray-400">Review and deploy your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Campaign Name</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Platform</div>
                  <div className="font-medium capitalize text-gray-900 dark:text-white">{formData.platform.replace("_", " ")}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Goal</div>
                  <div className="font-medium capitalize text-gray-900 dark:text-white">{formData.goal}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Budget</div>
                  <div className="font-medium text-gray-900 dark:text-white">${formData.budget}</div>
                </div>
              </div>

              {formData.keywords.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recommended Keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.slice(0, 10).map((kw, i) => (
                      <Badge key={i} variant="secondary">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.adCopy && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ad Copy</div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100">{formData.adCopy}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Edit Campaign
            </Button>
            <Button onClick={createCampaign} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
