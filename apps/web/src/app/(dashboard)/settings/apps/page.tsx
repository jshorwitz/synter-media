"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"

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
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">OAuth Apps & API Credentials</h1>
        <p className="text-gray-600">
          Manage OAuth applications and API credentials for each advertising platform.
        </p>
      </div>

      <div className="grid gap-6">
        {PLATFORMS.map((platform) => {
          const platformApps = apps[platform.id] || []
          const hasApps = platformApps.length > 0

          return (
            <Card key={platform.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{platform.name}</CardTitle>
                    <CardDescription>OAuth application credentials for {platform.name}</CardDescription>
                  </div>
                  <Button onClick={() => setShowForm(platform.id)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add OAuth App
                  </Button>
                </div>
              </CardHeader>

              {/* Add App Form */}
              {showForm === platform.id && (
                <CardContent className="border-t pt-6">
                  <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Add {platform.name} OAuth App</h3>
                    
                    <div>
                      <Label htmlFor={`${platform.id}-label`}>App Label</Label>
                      <Input
                        id={`${platform.id}-label`}
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="Production"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`${platform.id}-client-id`}>Client ID</Label>
                      <Input
                        id={`${platform.id}-client-id`}
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        placeholder="your-client-id"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`${platform.id}-client-secret`}>Client Secret</Label>
                      <div className="relative">
                        <Input
                          id={`${platform.id}-client-secret`}
                          type={showSecrets[platform.id] ? "text" : "password"}
                          value={formData.client_secret}
                          onChange={(e) => setFormData({ ...formData, client_secret=REDACTED })}
                          placeholder="your-client-secret"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowSecrets({ ...showSecrets, [platform.id]: !showSecrets[platform.id] })
                          }
                        >
                          {showSecrets[platform.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`${platform.id}-redirect`}>Redirect URI</Label>
                      <Input
                        id={`${platform.id}-redirect`}
                        value={formData.redirect_uri || getDefaultRedirectUri(platform.id)}
                        onChange={(e) => setFormData({ ...formData, redirect_uri: e.target.value })}
                        placeholder={getDefaultRedirectUri(platform.id)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must match exactly in your {platform.name} developer console
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`${platform.id}-scopes`}>Scopes (comma-separated)</Label>
                      <Input
                        id={`${platform.id}-scopes`}
                        value={formData.scopes || getDefaultScopes(platform.id)}
                        onChange={(e) => setFormData({ ...formData, scopes: e.target.value })}
                        placeholder={getDefaultScopes(platform.id)}
                      />
                    </div>

                    {platform.fields.includes("developer_token") && (
                      <div>
                        <Label htmlFor={`${platform.id}-dev-token`}>Developer Token</Label>
                        <Input
                          id={`${platform.id}-dev-token`}
                          type={showSecrets[`${platform.id}-dev`] ? "text" : "password"}
                          value={formData.developer_token}
                          onChange={(e) => setFormData({ ...formData, developer_token: e.target.value })}
                          placeholder="Developer token from platform"
                        />
                      </div>
                    )}

                    {platform.fields.includes("login_customer_id") && (
                      <div>
                        <Label htmlFor={`${platform.id}-login-customer`}>Login Customer ID (MCC)</Label>
                        <Input
                          id={`${platform.id}-login-customer`}
                          value={formData.login_customer_id}
                          onChange={(e) => setFormData({ ...formData, login_customer_id: e.target.value })}
                          placeholder="1234567890"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional: Manager account ID if using MCC</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowForm(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSubmit(platform.id)}
                        disabled={!formData.label || !formData.client_id || !formData.client_secret}
                      >
                        Save OAuth App
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}

              {/* Existing Apps */}
              {hasApps && (
                <CardContent>
                  <div className="space-y-3">
                    {platformApps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{app.label}</div>
                          <div className="text-sm text-gray-500">
                            Client ID: {app.client_id.substring(0, 20)}...
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created: {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.is_active ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
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
          <CardTitle className="text-lg">How to Get OAuth Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Google Ads:</strong>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
              <li>Create OAuth 2.0 Client ID (Web application)</li>
              <li>Get Developer Token from Google Ads API Center</li>
            </ol>
          </div>
          <div>
            <strong>Microsoft Ads:</strong>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Go to Azure Portal → App Registrations</li>
              <li>Create new registration, add redirect URI</li>
              <li>Get Developer Token from Microsoft Advertising</li>
            </ol>
          </div>
          <div>
            <strong>LinkedIn Ads:</strong>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Go to LinkedIn Developers → Create App</li>
              <li>Apply for Marketing Developer Platform access</li>
              <li>Add redirect URIs in App Settings</li>
            </ol>
          </div>
          <div>
            <strong>Reddit Ads:</strong>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Go to reddit.com/prefs/apps</li>
              <li>Create app (type: web app)</li>
              <li>Copy client ID and secret</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
