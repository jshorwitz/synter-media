import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
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

    // TODO: Use time range for filtering data
    // const timeRange = request.nextUrl.searchParams.get('timeRange') || '7d';

    // Mock data for now - replace with real database queries
    const mockData = {
      kpis: {
        spend: 12450.50,
        clicks: 8945,
        conversions: 234,
        cac: 53.21,
        roas: 4.2,
        revenue: 52290.00,
      },
      attribution: [
        {
          platform: 'google',
          campaign: 'Brand Search Campaign',
          clicks: 2341,
          conversions: 89,
          spend: 4732.50,
          cac: 53.18,
          roas: 4.8,
          revenue: 22716.00,
        },
        {
          platform: 'reddit',
          campaign: 'Developer Tools Promotion',
          clicks: 1205,
          conversions: 45,
          spend: 2401.25,
          cac: 53.36,
          roas: 3.9,
          revenue: 9365.25,
        },
        {
          platform: 'x',
          campaign: 'Tech Twitter Outreach',
          clicks: 892,
          conversions: 23,
          spend: 1456.00,
          cac: 63.30,
          roas: 2.1,
          revenue: 3056.00,
        },
      ],
      traffic: [],
      agents: [],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
