"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, DollarSign, Minus, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import BarChart from "@/components/charts/BarChart"
import Treemap from "@/components/charts/Treemap"
import { ppcMock } from "@/data/ppcMock"

const DEMO_MODE = true // Set to false to use real API

// Types matching backend shape
interface BackendRecommendation {
  id: string;
  type: "negative_keyword" | "pause_keyword" | "budget_shift" | string;
  target_level: string;
  target_id: string;
  details: any;
  projected_impact: number;
  risk: number;
  priority: "low" | "medium" | "high" | string;
  status: "proposed" | "dry_run_ok" | "applied" | "dismissed" | string;
  created_at: string;
  updated_at: string;
}

// UI adapter type
interface UIRecommendation {
  id: string;
  type: BackendRecommendation["type"];
  priority: BackendRecommendation["priority"];
  status: BackendRecommendation["status"];
  title: string;
  description: string;
  projectedImpact: number;
  risk: number;
  details: any;
  createdAt: string;
}

function adapt(rec: BackendRecommendation): UIRecommendation {
  const d = rec.details || {};
  let title = rec.type;
  let description = "";
  if (rec.type === "negative_keyword") {
    title = `Add negative keyword: '${d.search_term || d.searchTerm || d.keyword_text || ""}'`;
    description = `Low ICP (${d.icp_score ?? d.icpScore ?? "?"}) with waste risk`;
  } else if (rec.type === "pause_keyword") {
    title = `Pause keyword: '${d.keyword_text || d.keywordText || ""}'`;
    description = `Underperforming keyword with low ICP and poor conversion rate`;
  } else if (rec.type === "budget_shift") {
    const name = d.campaign_name || d.campaignName || "Campaign";
    const pct = d.suggested_change_pct ?? d.suggestedChangePct;
    title = `${pct && pct > 0 ? "Increase" : "Decrease"} budget: ${name} (${pct ?? 0}%)`;
    description = d.rationale || "Budget change based on ICP performance";
  }
  return {
    id: rec.id,
    type: rec.type,
    priority: rec.priority,
    status: rec.status,
    title,
    description,
    projectedImpact: rec.projected_impact || 0,
    risk: rec.risk || 0,
    details: {
      searchTerm: d.search_term ?? d.searchTerm,
      keywordText: d.keyword_text ?? d.keywordText,
      matchType: d.match_type ?? d.matchType,
      icpScore: d.icp_score ?? d.icpScore,
      spend7d: d.estimated_spend_7d ?? d.spend7d,
      spend14d: d.estimated_spend_14d ?? d.spend14d,
      conversions: d.conversions,
      conversionRate: d.conversion_rate ?? d.conversionRate,
      accountP25ConvRate: d.account_p25_conv_rate ?? d.accountP25ConvRate,
      campaignName: d.campaign_name ?? d.campaignName,
      currentBudgetUsd: d.current_daily_budget_micros ? Math.round((d.current_daily_budget_micros / 1_000_000) * 100) / 100 : d.currentBudgetUsd,
      avgIcpScore: d.avg_icp_score ?? d.avgIcpScore,
      suggestedChangePct: d.suggested_change_pct ?? d.suggestedChangePct,
      weeklySpendUsd: d.weekly_spend_micros ? Math.round((d.weekly_spend_micros / 1_000_000) * 100) / 100 : d.weeklySpendUsd,
      rationale: d.impact_explanation || d.rationale,
    },
    createdAt: rec.created_at,
  };
}

export default function RecommendationsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedRecs, setSelectedRecs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<UIRecommendation[]>([])

  async function fetchRecs() {
    setLoading(true)
    try {
      if (DEMO_MODE) {
        // Use mock data and convert to BackendRecommendation format
        const mockRecs: BackendRecommendation[] = ppcMock.recommendations.map(rec => ({
          id: rec.id,
          type: rec.type === 'keywords' ? 'pause_keyword' : rec.type === 'budgets' ? 'budget_shift' : 'negative_keyword',
          target_level: 'campaign',
          target_id: rec.campaign,
          details: {
            keyword_text: rec.title,
            campaign_name: rec.campaign,
            adgroup_name: rec.adGroup,
            rationale: rec.description,
            suggested_change_pct: rec.impact.expectedCPAChangePct
          },
          projected_impact: rec.potentialSavingsUSD,
          risk: 0.5,
          priority: rec.priority,
          status: rec.status === 'applied' ? 'applied' : rec.status === 'dismissed' ? 'dismissed' : 'proposed',
          created_at: rec.createdAt,
          updated_at: rec.createdAt
        }));
        setItems(mockRecs.map(adapt));
      } else {
        const res = await fetch(`/api/ppc/recommendations?status=${statusFilter === "all" ? "all" : statusFilter}`)
        const json = await res.json()
        const recs: BackendRecommendation[] = json.recommendations || []
        setItems(recs.map(adapt))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const totalProjected = useMemo(() => items.filter(r => r.status === "proposed").reduce((sum, r) => sum + (r.projectedImpact || 0), 0), [items])
  const highPriorityCount = useMemo(() => items.filter(r => r.priority === "high" && r.status === "proposed").length, [items])
  const readyCount = useMemo(() => items.filter(r => r.status === "dry_run_ok").length, [items])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "negative_keyword": return <Minus className="h-4 w-4" />
      case "pause_keyword": return <Pause className="h-4 w-4" />
      case "budget_shift": return <DollarSign className="h-4 w-4" />
      default: return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "negative_keyword": return "Negative Keyword"
      case "pause_keyword": return "Pause Keyword"
      case "budget_shift": return "Budget Shift"
      default: return type
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "proposed": return <Clock className="h-4 w-4" />
      case "dry_run_ok": return <CheckCircle className="h-4 w-4" />
      case "applied": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "dismissed": return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500"
      case "medium": return "bg-yellow-500" 
      case "low": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 0.2) return "text-green-600"
    if (risk <= 0.5) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredRecommendations = items.filter(rec => {
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter
    const matchesType = typeFilter === "all" || rec.type === typeFilter
    return matchesStatus && matchesType
  })

  const toggleSelection = (recId: string) => {
    setSelectedRecs(prev => 
      prev.includes(recId) 
        ? prev.filter(id => id !== recId)
        : [...prev, recId]
    )
  }

  const selectAll = () => {
    const proposedRecs = filteredRecommendations.filter(rec => rec.status === "proposed").map(rec => rec.id)
    setSelectedRecs(proposedRecs)
  }

  const doRefresh = async () => {
    setLoading(true)
    try {
      await fetch(`/api/ppc/recommendations`, { method: "POST" })
      await fetchRecs()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const doDryRun = async () => {
    if (selectedRecs.length === 0) return
    setLoading(true)
    try {
      await fetch(`/api/ppc/apply/dry-run`, { method: "POST", body: JSON.stringify({ ids: selectedRecs }) })
      setSelectedRecs([])
      await fetchRecs()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const dismiss = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/ppc/recommendations/${id}/status?status=dismissed`, { method: "PUT" })
      await fetchRecs()
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
          <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered optimization suggestions for your Google Ads
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={doRefresh} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button disabled={selectedRecs.length === 0 || loading} onClick={doDryRun}>
            <Play className="mr-2 h-4 w-4" />
            Dry Run ({selectedRecs.length})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projected Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalProjected.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {highPriorityCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready to Apply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {readyCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Projected impact by type and recommendation map</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Projected impact by type</div>
              <BarChart
                data={Object.entries(
                  filteredRecommendations.reduce((acc: Record<string, number>, r) => {
                    acc[r.type] = (acc[r.type] || 0) + (r.projectedImpact || 0)
                    return acc
                  }, {})
                ).map(([label, value]) => ({ label, value }))}
                height={260}
              />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Recommendation treemap</div>
              <Treemap
                data={filteredRecommendations.map((r) => ({
                  name: r.title.length > 22 ? r.title.slice(0, 22) + "…" : r.title,
                  value: Math.max(1, r.projectedImpact || 1),
                  group: r.priority,
                }))}
                height={300}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="proposed">Proposed</SelectItem>
                <SelectItem value="dry_run_ok">Dry Run OK</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="negative_keyword">Negative Keywords</SelectItem>
                <SelectItem value="pause_keyword">Pause Keywords</SelectItem>
                <SelectItem value="budget_shift">Budget Shifts</SelectItem>
              </SelectContent>
            </Select>

            {filteredRecommendations.some(rec => rec.status === "proposed") && (
              <Button variant="outline" onClick={selectAll}>
                Select All Proposed ({filteredRecommendations.filter(r => r.status === "proposed").length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <Card key={rec.id} className={`${selectedRecs.includes(rec.id) ? "ring-2 ring-primary" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {rec.status === "proposed" && (
                    <input
                      type="checkbox"
                      checked={selectedRecs.includes(rec.id)}
                      onChange={() => toggleSelection(rec.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  )}
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(rec.type)}
                    <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      {getStatusIcon(rec.status)}
                      <span>{rec.status.replace("_", " ")}</span>
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="text-green-600">
                    +${rec.projectedImpact.toLocaleString()} impact
                  </span>
                  <span className={getRiskColor(rec.risk)}>
                    {(rec.risk * 100).toFixed(0)}% risk
                  </span>
                </div>
              </div>
              
              <div>
                <CardTitle className="text-lg">{rec.title}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {rec.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="rationale">Rationale</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {rec.type === "negative_keyword" && (
                      <>
                        <div>
                          <span className="font-medium">Search Term:</span>
                          <div className="text-muted-foreground">{rec.details.searchTerm}</div>
                        </div>
                        <div>
                          <span className="font-medium">ICP Score:</span>
                          <div className="text-muted-foreground">{rec.details.icpScore}</div>
                        </div>
                        <div>
                          <span className="font-medium">7-Day Spend:</span>
                          <div className="text-muted-foreground">${rec.details.spend7d}</div>
                        </div>
                        <div>
                          <span className="font-medium">Conversions:</span>
                          <div className="text-muted-foreground">{rec.details.conversions}</div>
                        </div>
                        <div>
                          <span className="font-medium">Campaign:</span>
                          <div className="text-muted-foreground">{rec.details.campaignName}</div>
                        </div>
                      </>
                    )}

                    {rec.type === "pause_keyword" && (
                      <>
                        <div>
                          <span className="font-medium">Keyword:</span>
                          <div className="text-muted-foreground">{rec.details.keywordText} ({rec.details.matchType})</div>
                        </div>
                        <div>
                          <span className="font-medium">ICP Score:</span>
                          <div className="text-muted-foreground">{rec.details.icpScore}</div>
                        </div>
                        <div>
                          <span className="font-medium">14-Day Spend:</span>
                          <div className="text-muted-foreground">${rec.details.spend14d}</div>
                        </div>
                        <div>
                          <span className="font-medium">Conversion Rate:</span>
                          <div className="text-muted-foreground">{rec.details.conversionRate}% (vs {rec.details.accountP25ConvRate}% p25)</div>
                        </div>
                        <div>
                          <span className="font-medium">Campaign:</span>
                          <div className="text-muted-foreground">{rec.details.campaignName}</div>
                        </div>
                      </>
                    )}

                    {rec.type === "budget_shift" && (
                      <>
                        <div>
                          <span className="font-medium">Campaign:</span>
                          <div className="text-muted-foreground">{rec.details.campaignName}</div>
                        </div>
                        <div>
                          <span className="font-medium">Current Budget:</span>
                          <div className="text-muted-foreground">{typeof rec.details.currentBudgetUsd === 'number' ? `$${rec.details.currentBudgetUsd}/day` : '-'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Avg ICP Score:</span>
                          <div className="text-muted-foreground">{rec.details.avgIcpScore}</div>
                        </div>
                        <div>
                          <span className="font-medium">Suggested Change:</span>
                          <div className="text-muted-foreground">{rec.details.suggestedChangePct > 0 ? "+" : ""}{rec.details.suggestedChangePct}%</div>
                        </div>
                        {rec.details.weeklySpendUsd && (
                          <div>
                            <span className="font-medium">Weekly Spend:</span>
                            <div className="text-muted-foreground">${rec.details.weeklySpendUsd}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="rationale" className="text-sm text-muted-foreground">
                  {rec.details.rationale || "Automated recommendation based on performance data and ICP analysis."}
                </TabsContent>
              </Tabs>

              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Created {new Date(rec.createdAt).toLocaleDateString()}
                </span>
                
                {rec.status === "proposed" && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => dismiss(rec.id)}>
                      Dismiss
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRecs(prev => prev.includes(rec.id) ? prev : [...prev, rec.id])}>
                      <Play className="mr-1 h-3 w-3" />
                      Queue Dry Run
                    </Button>
                  </div>
                )}
                
                {rec.status === "dry_run_ok" && (
                  <Button size="sm" disabled>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Apply
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <Card>
          <CardContent className="text-center py-6">Loading...</CardContent>
        </Card>
      )}

      {!loading && filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No recommendations match your current filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
