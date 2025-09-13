import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthCallback, createSessionCookie } from '@/lib/oauth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    // Redirect to LinkedIn OAuth
    const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    linkedinAuthUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID || '');
    linkedinAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin`);
    linkedinAuthUrl.searchParams.append('response_type', 'code');
    linkedinAuthUrl.searchParams.append('scope', 'openid profile email');
    linkedinAuthUrl.searchParams.append('state', 'linkedin_oauth');

    return NextResponse.redirect(linkedinAuthUrl.toString());
  }

  // Handle OAuth callback
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret=REDACTED || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    // Get user info from LinkedIn
    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const linkedinUser = await userResponse.json();

    // Create or find user and create session
    const { user, sessionToken } = await handleOAuthCallback({
      provider: 'linkedin',
      providerId: linkedinUser.sub,
      email: linkedinUser.email,
      name: linkedinUser.name,
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
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_error&provider=linkedin', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
