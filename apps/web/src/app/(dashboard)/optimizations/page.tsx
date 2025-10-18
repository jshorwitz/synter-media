"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, DollarSign, Target, Zap, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PPCDashboard() {
  const [loading, setLoading] = useState(false)

  const syncAll = async () => {
    setLoading(true)
    try {
      await fetch(`/api/ppc/sync`, { method: "POST" })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const generateRecs = async () => {
    setLoading(true)
    try {
      await fetch(`/api/ppc/recommendations`, { method: "POST" })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PPC Manager</h1>
          <p className="text-muted-foreground">
            Google Ads optimization for Sourcegraph
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={syncAll} disabled={loading}>
            <Activity className="mr-2 h-4 w-4" />
            {loading ? "Syncing..." : "Sync Data"}
          </Button>
          <Button onClick={generateRecs} disabled={loading}>
            <Zap className="mr-2 h-4 w-4" />
            {loading ? "Working..." : "Generate Recommendations"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,458</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$265</div>
            <p className="text-xs text-green-600">
              -5.1% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Waste Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Top Waste Terms</CardTitle>
          <CardDescription>
            Search terms with low ICP scores and high spend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { term: "github tutorial", icp: 15, spend: 450, conversions: 0 },
              { term: "free code search", icp: 25, spend: 380, conversions: 1 },
              { term: "student programming", icp: 12, spend: 290, conversions: 0 },
              { term: "learn coding", icp: 18, spend: 250, conversions: 0 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={item.icp < 20 ? "destructive" : "secondary"}>
                    ICP: {item.icp}
                  </Badge>
                  <span className="font-medium">{item.term}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>${item.spend} spend</span>
                  <span>{item.conversions} conv</span>
                  <Button size="sm" variant="outline">
                    Add Negative
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Search Terms</CardTitle>
            <CardDescription>
              Review and manage search term performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/ppc/search-terms">View All Terms →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
            <CardDescription>
              AI-powered optimization suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/ppc/recommendations">View Recommendations →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Audit Log</CardTitle>
            <CardDescription>
              Track all changes and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/ppc/audit">View Audit Log →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
