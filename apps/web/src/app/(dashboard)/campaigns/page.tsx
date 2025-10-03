"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, DollarSign, Target } from "lucide-react"

export default function CampaignsPage() {
  const router = useRouter()

  // Mock data - in production, fetch from API
  const campaigns = [
    {
      id: "1",
      name: "Q4 Lead Generation",
      platform: "google_ads",
      status: "active",
      budget: 150,
      spent: 87.50,
      conversions: 12,
      created: "2024-10-01",
    },
    {
      id: "2",
      name: "Brand Awareness Campaign",
      platform: "linkedin_ads",
      status: "active",
      budget: 200,
      spent: 156.30,
      conversions: 8,
      created: "2024-09-28",
    },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
          <p className="text-gray-600">Manage and monitor your advertising campaigns</p>
        </div>
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Create your first AI-powered campaign to get started</p>
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
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="outline" className="mr-2">
                        {campaign.platform.replace("_", " ")}
                      </Badge>
                      Created {new Date(campaign.created).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={campaign.status === "active" ? "bg-green-100 text-green-800" : ""}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Budget</div>
                      <div className="font-semibold">${campaign.budget}/day</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Spent</div>
                      <div className="font-semibold">${campaign.spent.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Conversions</div>
                      <div className="font-semibold">{campaign.conversions}</div>
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
