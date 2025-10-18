import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_ADS_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google-ads/callback`;

async function getUserFromRequest(request: NextRequest): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('synter_session')?.value;
  
  if (!sessionToken) {
    return null;
  }

  try {
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
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL(`/onboarding?error=${error}`, request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/onboarding?error=invalid_request', request.url));
    }

    // Verify state parameter
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (state !== storedState) {
      return NextResponse.redirect(new URL('/onboarding?error=state_mismatch', request.url));
    }

    // Clear state cookie
    cookieStore.delete('oauth_state');

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(new URL('/onboarding?error=config_error', request.url));
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret=REDACTED,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/onboarding?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, scope } = tokens;

    // Fetch Google Ads customer IDs
    // Note: This requires the Google Ads API client library in production
    // For now, we'll store the connection and fetch accounts client-side
    
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Store temporary connection without account ID
    // User will select accounts in the next step
    await prisma.platformConnection.create({
      data: {
        user_id: userId,
        platform: 'GOOGLE',
        provider_account_id: 'pending', // Will be updated after account selection
        access_token, // TODO: Encrypt in production
        refresh_token, // TODO: Encrypt in production
        token_expires_at: expiresAt,
        scopes: scope?.split(' ') || [],
        status: 'ACTIVE',
        metadata: {
          pending_account_selection: true,
        },
      },
    });

    // Redirect to account selection page
    return NextResponse.redirect(new URL('/onboarding/connect-accounts?platform=google&success=true', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/onboarding?error=callback_failed', request.url));
  }
}
