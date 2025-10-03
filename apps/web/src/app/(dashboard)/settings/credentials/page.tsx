"use client"

import { useEffect, useState } from "react"
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
    color: "cyan",
  },
  {
    id: "microsoft_ads",
    name: "Microsoft Ads",
    description: "Bing Search advertising",
    color: "green",
  },
  {
    id: "linkedin_ads",
    name: "LinkedIn Ads",
    description: "B2B professional targeting",
    color: "amber",
  },
  {
    id: "reddit_ads",
    name: "Reddit Ads",
    description: "Community & interest targeting",
    color: "red",
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

  const getStatusPill = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="status-pill success flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case "error":
        return (
          <span className="status-pill error flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Error
          </span>
        )
      case "expired":
        return (
          <span className="status-pill warning flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        )
      default:
        return <span className="status-pill idle">{status}</span>
    }
  }

  const getPlatformColor = (color: string) => {
    const colors: Record<string, string> = {
      cyan: 'accent-cyan',
      green: 'sentinel-green',
      amber: 'accent-amber',
      red: 'accent-red',
    }
    return colors[color] || 'accent-cyan'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-low font-mono text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="space-y-6">
        {PLATFORMS.map((platform) => {
          const platformConnections = connections[platform.id] || []
          const hasConnection = platformConnections.length > 0
          const colorClass = getPlatformColor(platform.color)

          return (
            <div key={platform.id} className="panel">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-3 py-1 rounded-tactical text-xs font-bold font-mono bg-${colorClass}/20 text-${colorClass} border border-${colorClass}/40 uppercase tracking-wide`}>
                      {platform.name}
                    </span>
                  </div>
                  <p className="text-text-low text-xs font-mono">{platform.description}</p>
                </div>
                <button 
                  onClick={() => startOAuth(platform.id)}
                  className="btn-tactical-secondary text-xs px-3 py-1.5 flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Connect Account
                </button>
              </div>

              {hasConnection && (
                <div className="border-t border-stroke-1 pt-4 mt-4">
                  <div className="space-y-3">
                    {platformConnections.map((conn) => (
                      <div
                        key={conn.id}
                        className="flex items-center justify-between p-3 bg-carbon-800 rounded-tactical border border-stroke-2"
                      >
                        <div className="flex-1">
                          <div className="font-mono font-bold text-text-hi text-sm">
                            {conn.account_name || conn.external_account_id}
                          </div>
                          <div className="text-xs font-mono text-text-low mt-1">
                            Account ID: {conn.external_account_id}
                          </div>
                          {conn.expires_at && (
                            <div className="text-[10px] font-mono text-text-muted mt-1">
                              Expires: {new Date(conn.expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusPill(conn.status)}
                          <button
                            className="btn-tactical-ghost text-xs px-3 py-1.5 flex items-center gap-1"
                            onClick={() => refreshToken(platform.id, conn.id)}
                          >
                            <RefreshCw className="w-3 h-3" />
                            Refresh
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="panel border-accent-cyan/40 bg-carbon-850">
        <h3 className="panel-title mb-2 text-accent-cyan">Need Help?</h3>
        <p className="text-text-mid text-xs font-mono mb-4">
          Learn how to set up OAuth apps for each platform in our documentation.
        </p>
        <button className="btn-tactical-secondary text-xs px-4 py-2 flex items-center gap-2">
          <ExternalLink className="w-3 h-3" />
          View Setup Guide
        </button>
      </div>
    </div>
  )
}
