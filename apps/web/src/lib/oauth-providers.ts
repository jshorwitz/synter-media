/**
 * OAuth provider configurations for ad platform connections
 */

export interface OAuthProvider {
  name: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
  additionalParams?: Record<string, string>
  accountsEndpoint?: string
}

export const providers: Record<string, OAuthProvider> = {
  google: {
    name: 'Google Ads',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    additionalParams: {
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
    },
    accountsEndpoint: 'https://googleads.googleapis.com/v16/customers:listAccessibleCustomers',
  },
  
  reddit: {
    name: 'Reddit Ads',
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    scopes: ['identity'], // Add ads scopes when approved
    additionalParams: {
      duration: 'permanent',
    },
  },
  
  linkedin: {
    name: 'LinkedIn Ads',
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['r_ads', 'r_ads_reporting', 'r_basicprofile', 'r_emailaddress'],
    additionalParams: {},
    accountsEndpoint: 'https://api.linkedin.com/v2/adAccountsV2',
  },
  
  x: {
    name: 'X (Twitter) Ads',
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'users.read', 'offline.access'], // Add ads scopes when approved
    additionalParams: {},
    accountsEndpoint: 'https://ads-api.twitter.com/12/accounts',
  },
  
  meta: {
    name: 'Meta Ads',
    clientId: process.env.META_APP_ID || '',
    clientSecret: process.env.META_APP_SECRET || '',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['ads_read', 'ads_management', 'business_management'],
    additionalParams: {},
    accountsEndpoint: 'https://graph.facebook.com/v18.0/me/adaccounts',
  },
}

export function getProvider(provider: string): OAuthProvider {
  const config = providers[provider]
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`)
  }
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`Provider ${provider} not configured (missing client credentials)`)
  }
  return config
}

export function buildAuthUrl(provider: string, redirectUri: string, state: string): string {
  const config = getProvider(provider)
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    ...config.additionalParams,
  })
  
  return `${config.authUrl}?${params.toString()}`
}
