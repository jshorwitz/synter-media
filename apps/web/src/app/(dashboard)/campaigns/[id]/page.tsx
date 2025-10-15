"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Rocket,
} from "lucide-react"

interface Campaign {
  id: number
  name: string
  platform: string
  status: string
  daily_budget_cents: number
  objective?: string
  target_audience?: string
  creative_brief?: string
  created_at: string
  launched_at?: string
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaign()
  }, [])

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${params.id}`)
      if (!res.ok) {
        throw new Error('Campaign not found')
      }
      const data = await res.json()
      setCampaign(data.campaign)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const launchCampaign = async () => {
    if (!campaign) return
    
    setLaunching(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/launch`, {
        method: 'POST',
      })
      
      if (!res.ok) {
        throw new Error('Failed to launch campaign')
      }
      
      const data = await res.json()
      setCampaign(data.campaign)
      alert('Campaign launched successfully!')
    } catch (err: any) {
      alert('Failed to launch campaign: ' + err.message)
    } finally {
      setLaunching(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded">
          {error || 'Campaign not found'}
        </div>
      </div>
    )
  }

  const deploymentSteps = [
    { label: "Campaign created", status: "completed", time: "2024-10-01 10:30" },
    { label: "AI recommendations generated", status: "completed", time: "2024-10-01 10:31" },
    { label: "Deployed to Google Ads", status: "completed", time: "2024-10-01 10:32" },
    { label: "Initial sync completed", status: "completed", time: "2024-10-01 10:35" },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-100">
      <Button variant="ghost" onClick={() => router.push("/campaigns")} className="mb-4 text-gray-100 hover:bg-[#0F131A]">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Campaigns
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">{campaign.name}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-gray-700 text-gray-200 bg-transparent">{campaign.platform}</Badge>
            <Badge className={campaign.status === "ACTIVE" ? "bg-green-500/15 text-green-300 border border-green-500/30" : "bg-gray-500/15 text-gray-300 border border-gray-500/30"}>
              {campaign.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status === "DRAFT" && (
            <Button onClick={launchCampaign} disabled={launching} className="bg-green-600 hover:bg-green-700">
              {launching ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching...</>
              ) : (
                <><Rocket className="mr-2 h-4 w-4" /> Launch Campaign</>
              )}
            </Button>
          )}
          {campaign.status === "ACTIVE" && (
            <Button variant="outline" className="border-gray-700 text-gray-100 hover:bg-[#0F131A]">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {campaign.status === "PAUSED" && (
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-[#0F131A] border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-gray-400">
              <DollarSign className="w-4 h-4" />
              Spent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${campaign.spent.toFixed(2)}</div>
            <div className="text-xs text-gray-500">of ${campaign.budget} daily</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F131A] border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-gray-400">
              <Target className="w-4 h-4" />
              Conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{campaign.conversions}</div>
            <div className="text-xs text-gray-500">CPA: ${(campaign.spent / campaign.conversions).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F131A] border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-gray-400">
              <TrendingUp className="w-4 h-4" />
              Click Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{campaign.ctr}%</div>
            <div className="text-xs text-gray-500">{campaign.clicks} clicks</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F131A] border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              Running Since
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.floor((Date.now() - new Date(campaign.created).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
            <div className="text-xs text-gray-500">{new Date(campaign.created).toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Timeline */}
      <Card className="bg-[#0F131A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Deployment Status</CardTitle>
          <CardDescription className="text-gray-400">Campaign creation and deployment timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deploymentSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                {step.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : step.status === "in-progress" ? (
                  <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-300" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-100">{step.label}</div>
                  {step.time && <div className="text-sm text-gray-500">{step.time}</div>}
                </div>
                <Badge className={step.status === "completed" ? "bg-green-500/15 text-green-300 border border-green-500/30" : "bg-[#0F131A] text-gray-300 border border-gray-700"}>{step.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card className="mt-8 bg-[#0F131A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Performance Overview</CardTitle>
          <CardDescription className="text-gray-400">Daily metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-[#0B0E12] border border-gray-800 rounded-lg">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Performance chart coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
