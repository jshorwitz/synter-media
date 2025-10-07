/**
 * OAuth connection callback endpoint
 * Handles OAuth callback, exchanges code for tokens, and stores connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProvider } from '@/lib/oauth-providers'
import { verifyState } from '@/lib/oauth-state'
import { encryptToBytea } from '@/lib/crypto'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
  scope?: string
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(
  provider: string,
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const config = getProvider(provider)

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret=REDACTED,
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

/**
 * Fetch provider user identity
 */
async function fetchUserIdentity(provider: string, accessToken: string): Promise<{
  id: string
  name: string
  email?: string
}> {
  const endpoints: Record<string, string> = {
    google: 'https://www.googleapis.com/oauth2/v2/userinfo',
    reddit: 'https://oauth.reddit.com/api/v1/me',
    linkedin: 'https://api.linkedin.com/v2/me',
    x: 'https://api.twitter.com/2/users/me',
    meta: 'https://graph.facebook.com/me?fields=id,name,email',
  }

  const endpoint = endpoints[provider]
  if (!endpoint) {
    return { id: 'unknown', name: 'Unknown User' }
  }

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.warn(`Failed to fetch ${provider} user identity`)
    return { id: 'unknown', name: 'Unknown User' }
  }

  const data = await response.json()

  // Normalize response across providers
  switch (provider) {
    case 'google':
      return { id: data.id, name: data.name, email: data.email }
    case 'reddit':
      return { id: data.id, name: data.name }
    case 'linkedin':
      return { id: data.id, name: `${data.localizedFirstName} ${data.localizedLastName}` }
    case 'x':
      return { id: data.data.id, name: data.data.name }
    case 'meta':
      return { id: data.id, name: data.name, email: data.email }
    default:
      return { id: 'unknown', name: 'Unknown User' }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params
    const searchParams = request.nextUrl.searchParams
    
    const code = searchParams.get('code')
    const stateToken = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle user denial or OAuth errors
    if (error) {
      console.log(`[OAuth] User denied ${provider} connection: ${error}`)
      return NextResponse.redirect(
        `${request.nextUrl.origin}/settings?error=oauth_denied&provider=${provider}`
      )
    }

    if (!code || !stateToken) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/settings?error=missing_params&provider=${provider}`
      )
    }

    // Verify state to prevent CSRF
    let state
    try {
      state = await verifyState(stateToken)
    } catch (error) {
      console.error('[OAuth] Invalid state token:', error)
      return NextResponse.redirect(
        `${request.nextUrl.origin}/settings?error=invalid_state&provider=${provider}`
      )
    }

    // Verify provider matches
    if (state.provider !== provider) {
      console.error('[OAuth] Provider mismatch in state')
      return NextResponse.redirect(
        `${request.nextUrl.origin}/settings?error=provider_mismatch`
      )
    }

    const redirectUri = `${request.nextUrl.origin}/api/connect/${provider}/callback`

    // Exchange code for tokens
    console.log(`[OAuth] Exchanging code for ${provider} tokens`)
    const tokens = await exchangeCodeForToken(provider, code, redirectUri)

    // Calculate token expiry
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null

    // Fetch user identity
    const identity = await fetchUserIdentity(provider, tokens.access_token)

    // Encrypt tokens for storage
    const accessTokenEnc = encryptToBytea(tokens.access_token)
    const refreshTokenEnc = tokens.refresh_token
      ? encryptToBytea(tokens.refresh_token)
      : null

    // TODO: Store in database
    // For now, just log success
    console.log(`[OAuth] Successfully connected ${provider} for user ${state.userId}`)
    console.log(`[OAuth] Provider user: ${identity.name} (${identity.id})`)
    console.log(`[OAuth] Token expires: ${expiresAt?.toISOString() || 'never'}`)
    console.log(`[OAuth] Has refresh token: ${!!tokens.refresh_token}`)

    /*
    // Database storage code (uncomment when DB is ready):
    
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    
    // Insert or update connection
    await pool.query(`
      INSERT INTO oauth_connections (
        user_id, workspace_id, provider, provider_user_id, display_name, scopes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'connected')
      ON CONFLICT (user_id, provider, provider_user_id)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        scopes = EXCLUDED.scopes,
        status = 'connected',
        updated_at = NOW()
      RETURNING id
    `, [state.userId, state.workspaceId, provider, identity.id, identity.name, state.scopes])
    
    const connectionId = result.rows[0].id
    
    // Store encrypted tokens
    await pool.query(`
      INSERT INTO oauth_tokens (
        connection_id, access_token_enc, refresh_token_enc, token_type, expires_at
      ) VALUES ($1, $2, $3, $4, $5)
    `, [connectionId, accessTokenEnc, refreshTokenEnc, tokens.token_type, expiresAt])
    
    await pool.end()
    */

    // Redirect back to settings with success
    const returnUrl = state.returnUrl || '/settings'
    return NextResponse.redirect(
      `${request.nextUrl.origin}${returnUrl}?success=connected&provider=${provider}`
    )
  } catch (error: any) {
    console.error(`[OAuth] Callback error:`, error)
    
    return NextResponse.redirect(
      `${request.nextUrl.origin}/settings?error=token_exchange_failed&provider=${params.provider}&message=${encodeURIComponent(error.message)}`
    )
  }
}
