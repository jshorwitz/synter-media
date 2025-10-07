"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

interface ConnectionStatus {
  connected: boolean
  status: 'connected' | 'not_connected' | 'needs_reauth' | 'pending'
  displayName: string | null
  accountCount: number
  lastSync: string | null
}

const providers = [
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Connect your Google Ads accounts',
    icon: '🔍',
    color: 'blue',
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Connect Facebook & Instagram Ads',
    icon: '👍',
    color: 'blue',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    description: 'Connect LinkedIn Campaign Manager',
    icon: '💼',
    color: 'blue',
  },
  {
    id: 'reddit',
    name: 'Reddit Ads',
    description: 'Connect Reddit advertising account',
    icon: '🟠',
    color: 'orange',
  },
  {
    id: 'x',
    name: 'X (Twitter) Ads',
    description: 'Connect X advertising account',
    icon: '𝕏',
    color: 'gray',
  },
]

export default function SettingsPage() {
  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchConnections()

    // Check for OAuth callback success/error
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')
    const provider = params.get('provider')

    if (success && provider) {
      setMessage({
        type: 'success',
        text: `Successfully connected to ${provider}!`,
      })
      // Clear URL params
      window.history.replaceState({}, '', '/settings')
    } else if (error && provider) {
      setMessage({
        type: 'error',
        text: `Failed to connect to ${provider}: ${error}`,
      })
      window.history.replaceState({}, '', '/settings')
    }
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connect/status')
      const data = await response.json()
      setConnections(data.connections || {})
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (providerId: string) => {
    // Redirect to OAuth start endpoint
    window.location.href = `/api/connect/${providerId}/start`
  }

  const getStatusBadge = (status: ConnectionStatus) => {
    if (!status.connected) {
      return (
        <Badge variant="outline" className="border-gray-700 text-gray-400">
          Not Connected
        </Badge>
      )
    }

    switch (status.status) {
      case 'connected':
        return (
          <Badge className="bg-green-500/15 text-green-300 border border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )
      case 'needs_reauth':
        return (
          <Badge className="bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Needs Reconnect
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Settings</h1>
        <p className="text-gray-400">Manage your account, integrations, and preferences</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/15 text-green-300 border border-green-500/30'
              : 'bg-red-500/15 text-red-300 border border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Ad Platform Connections */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Ad Platform Connections</h2>
        <p className="text-gray-400 mb-6">
          Connect your advertising accounts to sync campaigns and performance data
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => {
            const status = connections[provider.id]
            const isConnected = status?.connected

            return (
              <Card key={provider.id} className="bg-[#0F131A] border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{provider.icon}</span>
                      <div>
                        <CardTitle className="text-white">{provider.name}</CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {provider.description}
                        </CardDescription>
                      </div>
                    </div>
                    {status && getStatusBadge(status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {isConnected && status ? (
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-400">Connected as:</span>
                        <span className="text-white ml-2">{status.displayName || 'Unknown'}</span>
                      </div>
                      {status.accountCount > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-400">Ad Accounts:</span>
                          <span className="text-white ml-2">{status.accountCount}</span>
                        </div>
                      )}
                      {status.lastSync && (
                        <div className="text-sm">
                          <span className="text-gray-400">Last synced:</span>
                          <span className="text-white ml-2">
                            {new Date(status.lastSync).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        {status.status === 'needs_reauth' ? (
                          <Button
                            onClick={() => handleConnect(provider.id)}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reconnect
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleConnect(provider.id)}
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Connection
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">
                        Connect your {provider.name} account to start syncing campaigns
                      </p>
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        size="sm"
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect {provider.name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-[#0F131A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Need Help?</CardTitle>
          <CardDescription className="text-gray-400">
            Learn how to connect your ad platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-400">
            <p>
              • Make sure you have admin access to your ad accounts
            </p>
            <p>
              • Some platforms require app approval before connecting
            </p>
            <p>
              • Tokens are encrypted and securely stored
            </p>
            <p>
              • You can disconnect at any time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
