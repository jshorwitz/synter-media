import { NextRequest, NextResponse } from 'next/server';

// Mock OAuth userinfo endpoint for testing
// Returns user profile data for different providers

export async function GET(request: NextRequest) {
  // Only allow in test mode
  if (process.env.NODE_ENV === 'production' && process.env.E2E_MODE !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider') || 'google';
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);

  // Simulate error scenarios
  if (token === 'mock_access_token_error') {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // Provider-specific responses
  const responses: Record<string, any> = {
    google: {
      id: 'google_test_123',
      email: 'test@syntertest.com',
      name: 'E2E Test User',
      given_name: 'E2E',
      family_name: 'Test',
      picture: 'https://example.com/avatar.jpg',
      verified_email: true,
    },
    linkedin: {
      id: 'linkedin_test_456',
      firstName: { localized: { en_US: 'E2E' } },
      lastName: { localized: { en_US: 'Test' } },
      email: 'test@syntertest.com',
      profilePicture: {
        'displayImage~': {
          elements: [{ identifiers: [{ identifier: 'https://example.com/avatar.jpg' }] }],
        },
      },
    },
    reddit: {
      id: 'reddit_test_789',
      name: 'e2e_test_user',
      icon_img: 'https://example.com/avatar.jpg',
    },
    x: {
      id: 'x_test_101',
      username: 'e2e_test',
      name: 'E2E Test User',
      profile_image_url: 'https://example.com/avatar.jpg',
    },
    microsoft: {
      id: 'microsoft_test_202',
      userPrincipalName: 'test@syntertest.com',
      displayName: 'E2E Test User',
      givenName: 'E2E',
      surname: 'Test',
    },
  };

  const response = responses[provider] || responses.google;

  return NextResponse.json(response);
}
