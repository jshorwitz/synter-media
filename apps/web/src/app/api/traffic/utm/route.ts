import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('synter_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const period = request.nextUrl.searchParams.get('period') || 'today';

    // Mock traffic data - replace with real PostHog/analytics integration
    const mockData = {
      data: [
        {
          source: 'reddit',
          visitors: 1247,
          pageviews: 2456,
          percentage: 35.2,
          change: 12.5,
        },
        {
          source: 'google',
          visitors: 892,
          pageviews: 1634,
          percentage: 26.8,
          change: -3.2,
        },
        {
          source: 'direct',
          visitors: 634,
          pageviews: 1205,
          percentage: 18.9,
          change: 8.1,
        },
        {
          source: 'twitter',
          visitors: 423,
          pageviews: 756,
          percentage: 12.4,
          change: 15.7,
        },
        {
          source: 'linkedin',
          visitors: 234,
          pageviews: 456,
          percentage: 6.7,
          change: 4.3,
        },
      ],
      totalPageviews: 6507,
      totalVisitors: 3430,
      period: period,
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Traffic data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
