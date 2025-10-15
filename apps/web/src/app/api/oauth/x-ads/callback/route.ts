import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { makeXOAuth, parseOAuthResponse } from '@/lib/oauth-x';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromRequest(request: NextRequest): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');
    const state = searchParams.get('state');
    const denied = searchParams.get('denied');

    if (denied) {
      console.log('[X OAuth] User denied authorization');
      return NextResponse.redirect(new URL('/onboarding?error=x_access_denied', request.url));
    }

    if (!oauthToken || !oauthVerifier || !state) {
      return NextResponse.redirect(new URL('/onboarding?error=x_invalid_request', request.url));
    }

    // Verify state parameter
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const requestTokenSecret = cookieStore.get('x_oauth_token_secret')?.value;
    
    if (state !== storedState) {
      return NextResponse.redirect(new URL('/onboarding?error=state_mismatch', request.url));
    }

    if (!requestTokenSecret) {
      return NextResponse.redirect(new URL('/onboarding?error=x_token_secret_missing', request.url));
    }

    // Clear cookies
    cookieStore.delete('oauth_state');
    cookieStore.delete('x_oauth_token_secret');

    // Initialize OAuth 1.0a
    const oauth = makeXOAuth();

    // Exchange for access token
    const accessTokenUrl = `https://api.x.com/oauth/access_token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`;
    const requestData = {
      url: accessTokenUrl,
      method: 'POST',
    };

    // Sign with request token secret
    const headers = oauth.toHeader(
      oauth.authorize(requestData, { 
        key: oauthToken, 
        secret: requestTokenSecret 
      })
    );

    const response = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: {
        Authorization: headers.Authorization,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[X OAuth] Access token failed:', response.status, errorText);
      return NextResponse.redirect(new URL('/onboarding?error=x_token_exchange_failed', request.url));
    }

    const responseBody = await response.text();
    const tokenData = parseOAuthResponse(responseBody);

    if (!tokenData.oauth_token || !tokenData.oauth_token_secret) {
      console.error('[X OAuth] Invalid access token response:', responseBody);
      return NextResponse.redirect(new URL('/onboarding?error=x_token_invalid', request.url));
    }

    const { oauth_token: accessToken, oauth_token_secret: accessTokenSecret, user_id, screen_name } = tokenData;

    console.log('[X OAuth] Success for user:', screen_name, user_id);

    // Store connection (pending account selection)
    await prisma.platformConnection.create({
      data: {
        user_id: userId,
        platform: 'X',
        provider_account_id: 'pending',
        access_token: accessToken, // TODO: Encrypt in production
        refresh_token: accessTokenSecret, // Store secret in refresh_token field
        token_expires_at: null, // X tokens don't expire
        scopes: [],
        status: 'ACTIVE',
        metadata: {
          screen_name,
          x_user_id: user_id,
          pending_account_selection: true,
        },
      },
    });

    // Redirect to account selection
    return NextResponse.redirect(new URL('/onboarding/connect-accounts?platform=x&success=true', request.url));
  } catch (error) {
    console.error('[X OAuth] Callback error:', error);
    return NextResponse.redirect(new URL('/onboarding?error=x_callback_failed', request.url));
  }
}
