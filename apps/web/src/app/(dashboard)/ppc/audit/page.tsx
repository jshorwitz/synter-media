"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Download, CheckCircle, XCircle, Clock, AlertCircle, Eye, ExternalLink } from "lucide-react"
import TimeSeriesLine from "@/components/charts/TimeSeriesLine"
import PieChart from "@/components/charts/PieChart"

interface AuditLog {
  id: string
  timestamp: string
  action: string
  user: string
  result: string
  validate_only: boolean
  google_change_id?: string | null
  error_message?: string | null
  payload: Record<string, any>
}

interface AuditSummary {
  total_actions: number
  breakdown: {
    by_result: Record<string, number>
    by_action: Record<string, number>
    by_validation: { dry_run: number; live: number }
  }
  recent_errors: { id: string; action: string; timestamp: string; error_message: string; user: string }[]
}

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [resultFilter, setResultFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<string | null>(null)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [logsRes, sumRes] = await Promise.all([
        fetch(`/api/ppc/audit/logs?limit=200`).then(r => r.json()),
        fetch(`/api/ppc/audit/summary?days=30`).then(r => r.json()),
      ])
      setLogs((logsRes?.logs || []).map((l: any) => ({
        id: l.id,
        timestamp: l.timestamp,
        action: l.action,
        user: l.user,
        result: l.result,
        validate_only: l.validate_only,
        google_change_id: l.google_change_id,
        error_message: l.error_message,
        payload: l.payload || {}
      })))
      setSummary(sumRes || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const getResultIcon = (result: string, validateOnly: boolean) => {
    if (validateOnly) return <Clock className="h-4 w-4 text-blue-500" />
    if (result === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (result === "error") return <XCircle className="h-4 w-4 text-red-500" />
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  const getResultBadge = (result: string, validateOnly: boolean) => {
    if (validateOnly) return <Badge variant="outline" className="text-blue-600">Dry Run</Badge>
    if (result === "success") return <Badge variant="default" className="bg-green-500">Success</Badge>
    if (result === "error") return <Badge variant="destructive">Error</Badge>
    return <Badge variant="secondary">Unknown</Badge>
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "add_negative_keyword": return "Add Negative Keyword"
      case "pause_keyword": return "Pause Keyword"
      case "adjust_budget": return "Adjust Budget"
      default: return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.payload).toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesResult = resultFilter === "all" || log.result === resultFilter
    const matchesUser = userFilter === "all" || log.user === userFilter
    
    return matchesSearch && matchesAction && matchesResult && matchesUser
  })

  const uniqueUsers = [...new Set(logs.map(log => log.user))]
  const uniqueActions = [...new Set(logs.map(log => log.action))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Complete history of all PPC manager operations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Loading..." : "Export"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.total_actions ?? 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.recent_errors?.length ?? 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(() => {
                  const ok = summary?.breakdown?.by_result?.["success"] || 0
                  const total = Object.values(summary?.breakdown?.by_result || {}).reduce((a, b) => a + b, 0)
                  return total ? Math.round((ok / total) * 100) : 0
                })()}%</div>
                <p className="text-xs text-green-600">
                  {(summary?.breakdown?.by_result?.["success"] || 0)}/{Object.values(summary?.breakdown?.by_result || {}).reduce((a, b) => a + b, 0)} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Live vs Dry Run</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const live = summary?.breakdown?.by_validation?.live || 0
                    const dry = summary?.breakdown?.by_validation?.dry_run || 0
                    const total = live + dry
                    return total ? Math.round((live / total) * 100) : 0
                  })()}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.breakdown?.by_validation?.live || 0} live changes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeSeriesLine
                  data={(() => {
                    const byDay = new Map<string, number>();
                    for (const l of logs) {
                      const day = new Date(l.timestamp);
                      const key = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())).toISOString();
                      byDay.set(key, (byDay.get(key) || 0) + 1);
                    }
                    return [...byDay.entries()]
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([k, v]) => ({ date: new Date(k), value: v }));
                  })()}
                  height={260}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={(() => {
                    const br = summary?.breakdown?.by_result || {};
                    return Object.entries(br).map(([label, value]) => ({ label, value: value as number }));
                  })()}
                  height={260}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
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
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>{getActionLabel(action)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
              <CardDescription>
                Click on a log entry to see detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Google Resource</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getResultIcon(log.result, log.validate_only)}
                          <span>{getActionLabel(log.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.user.split('@')[0]}
                      </TableCell>
                      <TableCell>
                        {getResultBadge(log.result, log.validate_only)}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate text-sm text-muted-foreground">
                          {log.payload?.reason || Object.keys(log.payload || {}).slice(0, 2).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.google_change_id ? (
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs match your current filters
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Log Details */}
          {selectedLog && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Log Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const log = logs.find(l => l.id === selectedLog)
                  if (!log) return null
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">ID:</span>
                          <div className="text-muted-foreground font-mono">{log.id}</div>
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span>
                          <div className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="font-medium">User:</span>
                          <div className="text-muted-foreground">{log.user}</div>
                        </div>
                        <div>
                          <span className="font-medium">Result:</span>
                          <div>{getResultBadge(log.result, log.validate_only)}</div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Payload:</span>
                        <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                      
                      {log.error_message && (
                        <div>
                          <span className="font-medium text-red-600">Error Message:</span>
<<<<<<< HEAD
                          <div className="mt-1 p-3 bg-red-50 rounded-lg text-sm text-red-800">
=======
                          <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
>>>>>>> b95e64dd98aa67154364eb1fae3a804228041603
                            {log.error_message}
                          </div>
                        </div>
                      )}
                      
                      {log.google_change_id && (
                        <div>
                          <span className="font-medium">Google Resource:</span>
                          <div className="text-muted-foreground font-mono text-sm">{log.google_change_id}</div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
