import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthCallback, createSessionCookie } from '@/lib/oauth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    // Redirect to Reddit OAuth
    const redditAuthUrl = new URL('https://www.reddit.com/api/v1/authorize');
    redditAuthUrl.searchParams.append('client_id', process.env.REDDIT_CLIENT_ID || '');
    redditAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reddit`);
    redditAuthUrl.searchParams.append('response_type', 'code');
    redditAuthUrl.searchParams.append('scope', 'identity');
    redditAuthUrl.searchParams.append('state', 'reddit_oauth');
    redditAuthUrl.searchParams.append('duration', 'permanent');

    return NextResponse.redirect(redditAuthUrl.toString());
  }

  // Handle OAuth callback
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
        'User-Agent': 'Synter/1.0 by synter-app',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reddit`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    // Get user info from Reddit
    const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'User-Agent': 'Synter/1.0 by synter-app',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const redditUser = await userResponse.json();

    // Create or find user and create session
    const { user, sessionToken } = await handleOAuthCallback({
      provider: 'reddit',
      providerId: redditUser.id,
      email: `${redditUser.name}@reddit.placeholder`, // Reddit doesn't provide email
      name: redditUser.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : undefined,
    });
    
    const response = NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!));
    
    // Set session cookie
    const cookieOptions = await createSessionCookie(sessionToken);
    response.cookies.set(cookieOptions.name, cookieOptions.value, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });
    
    return response;

  } catch (error) {
    console.error('Reddit OAuth error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_error&provider=reddit', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
