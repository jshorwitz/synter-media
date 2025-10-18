import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { makeXOAuth, parseOAuthResponse } from '@/lib/oauth-x';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REDIRECT_URI = process.env.X_ADS_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/x-ads/callback`;

async function getUserFromRequest(request: NextRequest): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('synter_session')?.value;
  
  if (!sessionToken) {
    return null;
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const session = await prisma.session.findFirst({
      where: {
        session_token: sessionToken,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
    
    return session?.user_id || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString('hex');
    
    // Build OAuth callback URL with state
    const oauthCallback = `${REDIRECT_URI}?state=${state}`;

    // Initialize OAuth 1.0a
    const oauth = makeXOAuth();
    
    // Request token endpoint
    const requestTokenUrl = 'https://api.x.com/oauth/request_token';
    const requestData = {
      url: requestTokenUrl,
      method: 'POST',
      data: { oauth_callback: oauthCallback },
    };

    // Sign the request
    const headers = oauth.toHeader(oauth.authorize(requestData));

    // Make request token call
    const response = await fetch(requestTokenUrl, {
      method: 'POST',
      headers: {
        Authorization: headers.Authorization,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[X OAuth] Request token failed:', response.status, errorText);
      return NextResponse.redirect(new URL('/onboarding?error=x_oauth_failed', request.url));
    }

    const responseBody = await response.text();
    const tokenData = parseOAuthResponse(responseBody);

    if (!tokenData.oauth_token || !tokenData.oauth_token_secret) {
      console.error('[X OAuth] Invalid response:', responseBody);
      return NextResponse.redirect(new URL('/onboarding?error=x_oauth_invalid', request.url));
    }

    // Store state and request token secret in cookies
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    cookieStore.set('x_oauth_token_secret', tokenData.oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Redirect to X authorization page
    const authUrl = `https://api.x.com/oauth/authorize?oauth_token=${tokenData.oauth_token}`;
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[X OAuth] Start error:', error);
    return NextResponse.redirect(new URL('/onboarding?error=x_oauth_error', request.url));
  }
}
