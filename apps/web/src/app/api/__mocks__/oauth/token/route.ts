import { NextRequest, NextResponse } from 'next/server';

// Mock OAuth token endpoint for testing
// Simulates token exchange from authorization code

export async function POST(request: NextRequest) {
  // Only allow in test mode
  if (process.env.NODE_ENV === 'production' && process.env.E2E_MODE !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { code, grant_type } = body;

  // Simulate various error scenarios for testing
  if (code === 'ERROR_CODE') {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  if (code === 'SERVER_ERROR') {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  // Successful token response
  return NextResponse.json({
    access_token: 'mock_access_token_' + Date.now(),
    refresh_token: 'mock_refresh_token_' + Date.now(),
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'ads.read ads.write profile email',
  });
}
