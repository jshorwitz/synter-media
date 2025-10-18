import { NextRequest, NextResponse } from 'next/server';
import { getWaitlistPositionByEmail } from '@/lib/waitlist';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const positionData = await getWaitlistPositionByEmail(email);

    if (!positionData || !positionData.position) {
      return NextResponse.json(
        { error: 'Email not found on waitlist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      position: positionData.position,
      total: positionData.total,
      referralCode: positionData.lead?.referral_code,
      referralsCount: positionData.lead?.referrals_count || 0,
      status: positionData.lead?.status || 'JOINED',
    });
  } catch (error) {
    console.error('Position check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
