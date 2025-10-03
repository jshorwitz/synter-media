"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Plus, CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"

interface Connection {
  id: string
  platform: string
  external_account_id: string
  account_name: string | null
  status: string
  created_at: string
  expires_at: string | null
}

const PLATFORMS = [
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Search & Display advertising",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "microsoft_ads",
    name: "Microsoft Ads",
    description: "Bing Search advertising",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "linkedin_ads",
    name: "LinkedIn Ads",
    description: "B2B professional targeting",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "reddit_ads",
    name: "Reddit Ads",
    description: "Community & interest targeting",
    color: "bg-orange-100 text-orange-800",
  },
]

export default function CredentialsPage() {
  const [connections, setConnections] = useState<Record<string, Connection[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    setLoading(true)
    try {
      const connectionData: Record<string, Connection[]> = {}
      
      for (const platform of PLATFORMS) {
        const res = await fetch(`/api/integrations/${platform.id}/connections`, {
          credentials: "include",
        })
        if (res.ok) {
          connectionData[platform.id] = await res.json()
        } else {
          connectionData[platform.id] = []
        }
      }
      
      setConnections(connectionData)
    } catch (error) {
      console.error("Failed to load connections:", error)
    } finally {
      setLoading(false)
    }
  }

  const startOAuth = async (platformId: string) => {
    try {
      const res = await fetch(`/api/integrations/${platformId}/connections/start`, {
        method: "POST",
        credentials: "include",
      })
      
      if (res.ok) {
        const { authorize_url } = await res.json()
        window.location.href = authorize_url
      }
    } catch (error) {
      console.error("Failed to start OAuth:", error)
    }
  }

  const refreshToken = async (platformId: string, connectionId: string) => {
    try {
      await fetch(`/api/integrations/${platformId}/connections/${connectionId}/refresh`, {
        method: "POST",
        credentials: "include",
      })
      loadConnections()
    } catch (error) {
      console.error("Failed to refresh token:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ad Platform Connections</h1>
        <p className="text-gray-600">
          Connect your advertising platforms to manage campaigns across Google, Microsoft, LinkedIn, and Reddit.
        </p>
      </div>

      <div className="grid gap-6">
        {PLATFORMS.map((platform) => {
          const platformConnections = connections[platform.id] || []
          const hasConnection = platformConnections.length > 0

          return (
            <Card key={platform.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${platform.color}`}>
                        {platform.name}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-2">{platform.description}</CardDescription>
                  </div>
                  <Button onClick={() => startOAuth(platform.id)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Account
                  </Button>
                </div>
              </CardHeader>

              {hasConnection && (
                <CardContent>
                  <div className="space-y-3">
                    {platformConnections.map((conn) => (
                      <div
                        key={conn.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {conn.account_name || conn.external_account_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Account ID: {conn.external_account_id}
                          </div>
                          {conn.expires_at && (
                            <div className="text-xs text-gray-400 mt-1">
                              Expires: {new Date(conn.expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(conn.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshToken(platform.id, conn.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>
            Learn how to set up OAuth apps for each platform in our documentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Setup Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
