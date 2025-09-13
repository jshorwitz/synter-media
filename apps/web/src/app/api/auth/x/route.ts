import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthCallback, createSessionCookie } from '@/lib/oauth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    // Redirect to X (Twitter) OAuth
    const xAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    xAuthUrl.searchParams.append('client_id', process.env.X_CLIENT_ID || '');
    xAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x`);
    xAuthUrl.searchParams.append('response_type', 'code');
    xAuthUrl.searchParams.append('scope', 'tweet.read users.read');
    xAuthUrl.searchParams.append('state', 'x_oauth');
    xAuthUrl.searchParams.append('code_challenge', 'challenge');
    xAuthUrl.searchParams.append('code_challenge_method', 'plain');

    return NextResponse.redirect(xAuthUrl.toString());
  }

  // Handle OAuth callback
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/x`,
        code_verifier: 'challenge',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    // Get user info from X/Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const xUser = await userResponse.json();

    // Create or find user and create session
    const { user, sessionToken } = await handleOAuthCallback({
      provider: 'x',
      providerId: xUser.data.id,
      email: `${xUser.data.username}@x.placeholder`, // X doesn't provide email by default
      name: xUser.data.name,
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
    console.error('X OAuth error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_error&provider=x', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
