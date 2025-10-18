"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Minus, TrendingUp, TrendingDown } from "lucide-react"

// Mock data - in real app, this would come from API
const searchTerms = [
  {
    id: "1",
    term: "sourcegraph enterprise",
    matchedKeyword: "sourcegraph",
    icpScore: 95,
    impressions: 1250,
    clicks: 78,
    cost: 245.50,
    conversions: 3,
    ctr: 6.24,
    cpc: 3.15,
    conversionRate: 3.85,
    rationale: "Brand match: 'sourcegraph enterprise' (+40); Include: none; Exclude: none"
  },
  {
    id: "2", 
    term: "semantic code search tool",
    matchedKeyword: "code search",
    icpScore: 85,
    impressions: 890,
    clicks: 45,
    cost: 178.90,
    conversions: 2,
    ctr: 5.06,
    cpc: 3.98,
    conversionRate: 4.44,
    rationale: "Match: 'semantic code search' (+25); Exclude: none; Brand: no"
  },
  {
    id: "3",
    term: "github tutorial for beginners",
    matchedKeyword: "github",
    icpScore: 15,
    impressions: 2100,
    clicks: 125,
    cost: 287.50,
    conversions: 0,
    ctr: 5.95,
    cpc: 2.30,
    conversionRate: 0.00,
    rationale: "Match: none; Exclude match: 'tutorial' (-30); Brand: no"
  },
  {
    id: "4",
    term: "free code indexing",
    matchedKeyword: "code indexing",
    icpScore: 35,
    impressions: 1450,
    clicks: 67,
    cost: 156.80,
    conversions: 1,
    ctr: 4.62,
    cpc: 2.34,
    conversionRate: 1.49,
    rationale: "Include match: 'code indexing' (+25); Free/open source without enterprise (-15)"
  },
  {
    id: "5",
    term: "enterprise repo search",
    matchedKeyword: "repo search",
    icpScore: 75,
    impressions: 780,
    clicks: 52,
    cost: 198.60,
    conversions: 2,
    ctr: 6.67,
    cpc: 3.82,
    conversionRate: 3.85,
    rationale: "Include match: 'repo search' (+25); Exclude: none; Brand: no"
  }
]

export default function SearchTermsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [icpFilter, setIcpFilter] = useState("all")
  const [sortBy, setSortBy] = useState("cost")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const getIcpBadgeColor = (score: number) => {
    if (score >= 70) return "bg-green-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getIcpLabel = (score: number) => {
    if (score >= 70) return "High Fit"
    if (score >= 40) return "Medium Fit"
    return "Low Fit"
  }

  const filteredTerms = searchTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesIcp = icpFilter === "all" || 
      (icpFilter === "high" && term.icpScore >= 70) ||
      (icpFilter === "medium" && term.icpScore >= 40 && term.icpScore < 70) ||
      (icpFilter === "low" && term.icpScore < 40)
    
    return matchesSearch && matchesIcp
  })

  const sortedTerms = [...filteredTerms].sort((a, b) => {
    const aVal = a[sortBy as keyof typeof a] as number
    const bVal = b[sortBy as keyof typeof b] as number
    return sortOrder === "desc" ? bVal - aVal : aVal - bVal
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Terms</h1>
          <p className="text-muted-foreground">
            Monitor and optimize search term performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Filter className="mr-2 h-4 w-4" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={icpFilter} onValueChange={setIcpFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ICP Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ICP Scores</SelectItem>
                <SelectItem value="high">High Fit (70+)</SelectItem>
                <SelectItem value="medium">Medium Fit (40-69)</SelectItem>
                <SelectItem value="low">Low Fit (0-39)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="icpScore">ICP Score</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "desc" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Terms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Search Terms ({sortedTerms.length})</CardTitle>
          <CardDescription>
            Click on a term to see detailed analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Search Term</TableHead>
                <TableHead>Matched Keyword</TableHead>
                <TableHead>ICP Score</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Conv Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTerms.map((term) => (
                <TableRow key={term.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={term.term}>
                      {term.term}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {term.matchedKeyword}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={`${getIcpBadgeColor(term.icpScore)} text-white`}
                      >
                        {term.icpScore}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getIcpLabel(term.icpScore)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{term.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{term.clicks}</TableCell>
                  <TableCell className="text-right">${term.cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{term.conversions}</TableCell>
                  <TableCell className="text-right">{term.ctr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{term.conversionRate.toFixed(2)}%</TableCell>
                  <TableCell>
                    {term.icpScore < 40 && term.cost > 100 ? (
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Minus className="mr-1 h-3 w-3" />
                        Add Negative
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {sortedTerms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No search terms match your current filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* ICP Rationale */}
      {sortedTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample ICP Analysis</CardTitle>
            <CardDescription>
              Understanding how ICP scores are calculated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedTerms.slice(0, 3).map((term) => (
                <div key={term.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{term.term}</span>
                    <Badge className={`${getIcpBadgeColor(term.icpScore)} text-white`}>
                      {term.icpScore}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{term.rationale}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
