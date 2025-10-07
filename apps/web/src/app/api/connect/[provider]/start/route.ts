/**
 * OAuth connection start endpoint
 * Initiates OAuth flow for ad platform connections
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProvider, buildAuthUrl } from '@/lib/oauth-providers'
import { createState } from '@/lib/oauth-state'

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params

    // TODO: Get authenticated user from session
    // For now, use a placeholder - you'll need to implement session checking
    const userId = request.headers.get('x-user-id') || 'user-123'
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Validate provider exists
    const providerConfig = getProvider(provider)

    // Build redirect URI (must match OAuth app config exactly)
    const redirectUri = `${request.nextUrl.origin}/api/connect/${provider}/callback`

    // Create signed state token with CSRF protection
    const state = await createState({
      userId,
      provider,
      scopes: providerConfig.scopes,
      returnUrl: request.nextUrl.searchParams.get('returnUrl') || '/settings',
    })

    // Build authorization URL
    const authUrl = buildAuthUrl(provider, redirectUri, state)

    console.log(`[OAuth] Initiating ${provider} connection for user ${userId}`)

    // Redirect to provider's OAuth consent screen
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error(`[OAuth] Start error:`, error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}
