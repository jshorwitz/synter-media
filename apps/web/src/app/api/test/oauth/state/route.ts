import { NextRequest, NextResponse } from 'next/server';
import { createState } from '@/lib/oauth-state';

// Test-only endpoint to generate valid OAuth state tokens
// Used by E2E tests to simulate OAuth flows without external providers

export async function GET(request: NextRequest) {
  // Only allow in test/development
  if (process.env.NODE_ENV === 'production' && process.env.E2E_MODE !== 'true') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider');
  const userId = searchParams.get('userId') || '1';
  const returnUrl = searchParams.get('returnUrl') || '/settings/connections';

  if (!provider) {
    return NextResponse.json({ error: 'Provider required' }, { status: 400 });
  }

  const validProviders = ['google', 'linkedin', 'reddit', 'x', 'microsoft'];
  if (!validProviders.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  try {
    const state = await createState({
      provider,
      userId: parseInt(userId),
      returnUrl,
    });

    return NextResponse.json({
      state,
      provider,
      userId,
      returnUrl,
    });
  } catch (error) {
    console.error('Failed to create test OAuth state:', error);
    return NextResponse.json({ error: 'Failed to create state' }, { status: 500 });
  }
}
