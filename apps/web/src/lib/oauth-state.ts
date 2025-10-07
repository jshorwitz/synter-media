/**
 * OAuth state management using signed JWTs for CSRF protection
 */

import { SignJWT, jwtVerify } from 'jose'
import { randomBytes } from 'crypto'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me'
)

export interface OAuthState {
  userId: string
  workspaceId?: string
  provider: string
  nonce: string
  returnUrl?: string
  scopes: string[]
  timestamp: number
}

/**
 * Create a signed JWT state token
 */
export async function createState(params: Omit<OAuthState, 'nonce' | 'timestamp'>): Promise<string> {
  const state: OAuthState = {
    ...params,
    nonce: randomBytes(16).toString('hex'),
    timestamp: Date.now(),
  }

  const token = await new SignJWT(state)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('synter')
    .setAudience('oauth-connect')
    .setExpirationTime('10m') // State expires in 10 minutes
    .sign(SECRET)

  return token
}

/**
 * Verify and decode a state token
 */
export async function verifyState(token: string): Promise<OAuthState> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: 'synter',
      audience: 'oauth-connect',
    })

    return payload as unknown as OAuthState
  } catch (error) {
    throw new Error('Invalid or expired state token')
  }
}
