import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getWaitlistPositionByEmail } from '@/lib/waitlist';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    // Find user by referral code
    const lead = await db.waitlistLead.findFirst({
      where: { referral_code: code },
    });

    if (!lead || !lead.email) {
      return NextResponse.json({ 
        position: 1332,
        total: 1500,
        referralsCount: 0 
      });
    }

    // Get position
    const positionData = await getWaitlistPositionByEmail(lead.email);

    if (!positionData || !positionData.position || !positionData.total) {
      return NextResponse.json({ 
        position: 1332,
        total: 1500,
        referralsCount: 0 
      });
    }

    return NextResponse.json({
      position: positionData.position,
      total: positionData.total,
      referralsCount: positionData.lead?.referrals_count || 0,
    });
  } catch (error) {
    console.error('Position API error:', error);
    return NextResponse.json({ 
      position: 1332,
      total: 1500,
      referralsCount: 0 
    }, { status: 500 });
  }
}
