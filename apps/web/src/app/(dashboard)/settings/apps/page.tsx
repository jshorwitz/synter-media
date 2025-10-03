"use client"

import { useEffect, useState } from "react"
import { Plus, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"

const PLATFORMS = [
  { id: "google_ads", name: "Google Ads", fields: ["developer_token", "login_customer_id"] },
  { id: "microsoft_ads", name: "Microsoft Ads", fields: ["developer_token"] },
  { id: "linkedin_ads", name: "LinkedIn Ads", fields: [] },
  { id: "reddit_ads", name: "Reddit Ads", fields: [] },
]

interface OAuthApp {
  id: string
  platform: string
  label: string
  client_id: string
  redirect_uri: string
  scopes: string[]
  is_active: boolean
  created_at: string
}

export default function AppsSettingsPage() {
  const [apps, setApps] = useState<Record<string, OAuthApp[]>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    label: "",
    client_id: "",
    client_secret: "",
    redirect_uri: "",
    scopes: "",
    developer_token: "",
    login_customer_id: "",
  })

  useEffect(() => {
    loadApps()
  }, [])

  const loadApps = async () => {
    setLoading(true)
    try {
      const appData: Record<string, OAuthApp[]> = {}
      
      for (const platform of PLATFORMS) {
        const res = await fetch(`/api/integrations/${platform.id}/apps`, {
          credentials: "include",
        })
        if (res.ok) {
          appData[platform.id] = await res.json()
        } else {
          appData[platform.id] = []
        }
      }
      
      setApps(appData)
    } catch (error) {
      console.error("Failed to load apps:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (platformId: string) => {
    try {
      const scopes = formData.scopes ? formData.scopes.split(",").map((s) => s.trim()) : []
      
      const payload: any = {
        label: formData.label,
        client_id: formData.client_id,
        client_secret=REDACTED,
        redirect_uri: formData.redirect_uri,
        scopes,
      }
      
      if (formData.developer_token) {
        payload.developer_token = formData.developer_token
      }
      
      if (formData.login_customer_id) {
        payload.login_customer_id = formData.login_customer_id
      }
      
      const res = await fetch(`/api/integrations/${platformId}/apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        setShowForm(null)
        setFormData({
          label: "",
          client_id: "",
          client_secret: "",
          redirect_uri: "",
          scopes: "",
          developer_token: "",
          login_customer_id: "",
        })
        loadApps()
      } else {
        const error = await res.json()
        alert(`Error: ${error.detail || "Failed to create app"}`)
      }
    } catch (error) {
      console.error("Failed to create app:", error)
      alert("Failed to create app")
    }
  }

  const getDefaultScopes = (platformId: string): string => {
    switch (platformId) {
      case "google_ads":
        return "https://www.googleapis.com/auth/adwords"
      case "microsoft_ads":
        return "https://ads.microsoft.com/ads.manage, offline_access"
      case "linkedin_ads":
        return "r_ads, r_ads_reporting, rw_ads"
      case "reddit_ads":
        return "ads.read, ads.write"
      default:
        return ""
    }
  }

  const getDefaultRedirectUri = (platformId: string): string => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    return `${baseUrl}/auth/${platformId}/callback`
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
          const platformApps = apps[platform.id] || []
          const hasApps = platformApps.length > 0

          return (
            <div key={platform.id} className="panel">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="panel-title mb-1">{platform.name}</h3>
                  <p className="text-text-low text-xs font-mono">OAuth application credentials for {platform.name}</p>
                </div>
                <button 
                  onClick={() => setShowForm(platform.id)} 
                  className="btn-tactical-secondary text-xs px-3 py-1.5 flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add OAuth App
                </button>
              </div>

              {/* Add App Form */}
              {showForm === platform.id && (
                <div className="border-t border-stroke-1 pt-4 mt-4">
                  <div className="space-y-4 bg-carbon-800/50 p-4 rounded-tactical border border-stroke-2">
                    <h3 className="text-text-hi font-bold font-mono text-sm mb-4 uppercase tracking-wide">Add {platform.name} OAuth App</h3>
                    
                    <div>
                      <label className="block text-xs font-mono text-text-low uppercase tracking-wider mb-2">App Label</label>
                      <input
                        className="input-tactical"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="Production"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-text-low uppercase tracking-wider mb-2">Client ID</label>
                      <input
                        className="input-tactical"
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        placeholder="your-client-id"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-text-low uppercase tracking-wider mb-2">Client Secret</label>
                      <div className="relative">
                        <input
                          className="input-tactical"
                          type={showSecrets[platform.id] ? "text" : "password"}
                          value={formData.client_secret}
                          onChange={(e) => setFormData({ ...formData, client_secret=REDACTED })}
                          placeholder="your-client-secret"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mid hover:text-text-hi"
                          onClick={() =>
                            setShowSecrets({ ...showSecrets, [platform.id]: !showSecrets[platform.id] })
                          }
                        >
                          {showSecrets[platform.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-text-low uppercase tracking-wider mb-2">Redirect URI</label>
                      <input
                        className="input-tactical"
                        value={formData.redirect_uri || getDefaultRedirectUri(platform.id)}
                        onChange={(e) => setFormData({ ...formData, redirect_uri: e.target.value })}
                        placeholder={getDefaultRedirectUri(platform.id)}
                      />
                      <p className="text-[10px] text-text-muted font-mono mt-1">
                        Must match exactly in your {platform.name} developer console
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-text-low uppercase tracking-wider mb-2">Scopes (comma-separated)</label>
                      <input
                        className="input-tactical"
                        value={formData.scopes || getDefaultScopes(platform.id)}
                        onChange={(e) => setFormData({ ...formData, scopes: e.target.value })}
                        placeholder={getDefaultScopes(platform.id)}
                      />
                    </div>

                    {platform.fields.includes("developer_token") && (
                      <div>
                        <label className="block text-xs font-mono text-text-low uppercase tracking-wider mb-2">Developer Token</label>
                        <input
                          className="input-tactical"
                          type={showSecrets[`${platform.id}-dev`] ? "text" : "password"}
                          value={formData.developer_token}
                          onChange={(e) => setFormData({ ...formData, developer_token: e.target.value })}
                          placeholder="Developer token from platform"
                        />
                      </div>
                    )}

                    {platform.fields.includes("login_customer_id") && (
                      <div>
                        <label className="block text-xs font-mono text-text-low uppercase tracking-wider mb-2">Login Customer ID (MCC)</label>
                        <input
                          className="input-tactical"
                          value={formData.login_customer_id}
                          onChange={(e) => setFormData({ ...formData, login_customer_id: e.target.value })}
                          placeholder="1234567890"
                        />
                        <p className="text-[10px] text-text-muted font-mono mt-1">Optional: Manager account ID if using MCC</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button 
                        className="btn-tactical-ghost text-xs px-4 py-2" 
                        onClick={() => setShowForm(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-tactical-primary text-xs px-4 py-2"
                        onClick={() => handleSubmit(platform.id)}
                        disabled={!formData.label || !formData.client_id || !formData.client_secret}
                      >
                        Save OAuth App
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Apps */}
              {hasApps && (
                <div className="border-t border-stroke-1 pt-4 mt-4">
                  <div className="space-y-3">
                    {platformApps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-carbon-800 rounded-tactical border border-stroke-2">
                        <div className="flex-1">
                          <div className="font-mono font-bold text-text-hi text-sm">{app.label}</div>
                          <div className="text-xs font-mono text-text-low mt-1">
                            Client ID: {app.client_id.substring(0, 20)}...
                          </div>
                          <div className="text-[10px] font-mono text-text-muted mt-1">
                            Created: {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.is_active ? (
                            <span className="status-pill success flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="status-pill idle flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
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
        <h3 className="panel-title mb-4 text-accent-cyan">How to Get OAuth Credentials</h3>
        <div className="space-y-4 text-xs font-mono">
          <div>
            <div className="text-text-hi font-bold mb-2">GOOGLE ADS:</div>
            <ol className="list-decimal ml-5 text-text-mid space-y-1">
              <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
              <li>Create OAuth 2.0 Client ID (Web application)</li>
              <li>Get Developer Token from Google Ads API Center</li>
            </ol>
          </div>
          <div>
            <div className="text-text-hi font-bold mb-2">MICROSOFT ADS:</div>
            <ol className="list-decimal ml-5 text-text-mid space-y-1">
              <li>Go to Azure Portal → App Registrations</li>
              <li>Create new registration, add redirect URI</li>
              <li>Get Developer Token from Microsoft Advertising</li>
            </ol>
          </div>
          <div>
            <div className="text-text-hi font-bold mb-2">LINKEDIN ADS:</div>
            <ol className="list-decimal ml-5 text-text-mid space-y-1">
              <li>Go to LinkedIn Developers → Create App</li>
              <li>Apply for Marketing Developer Platform access</li>
              <li>Add redirect URIs in App Settings</li>
            </ol>
          </div>
          <div>
            <div className="text-text-hi font-bold mb-2">REDDIT ADS:</div>
            <ol className="list-decimal ml-5 text-text-mid space-y-1">
              <li>Go to reddit.com/prefs/apps</li>
              <li>Create app (type: web app)</li>
              <li>Copy client ID and secret</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
