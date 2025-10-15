"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, DollarSign, Target, Loader2 } from "lucide-react"

interface Campaign {
  id: number
  name: string
  platform: string
  status: string
  daily_budget_cents: number
  created_at: string
  launched_at?: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns')
      if (!res.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded">
          Error loading campaigns: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Campaigns</h1>
          <p className="text-gray-400">Manage and monitor your advertising campaigns</p>
        </div>
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No campaigns yet</h3>
            <p className="text-gray-400 mb-6">Create your first AI-powered campaign to get started</p>
            <Button onClick={() => router.push("/campaigns/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="bg-gray-900 border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{campaign.name}</CardTitle>
                    <CardDescription className="mt-1 text-gray-400">
                      <Badge variant="outline" className="mr-2 border-gray-700 text-gray-300">
                        {campaign.platform}
                      </Badge>
                      Created {new Date(campaign.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={campaign.status === "ACTIVE" ? "bg-green-600 text-white border-0" : campaign.status === "PAUSED" ? "bg-yellow-600 text-white border-0" : "bg-gray-700 text-gray-300 border-0"}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Daily Budget</div>
                      <div className="font-semibold text-white">${(campaign.daily_budget_cents / 100).toFixed(2)}/day</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-semibold text-white">{campaign.status === 'ACTIVE' ? 'Running' : campaign.status === 'DRAFT' ? 'Not launched' : campaign.status}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
