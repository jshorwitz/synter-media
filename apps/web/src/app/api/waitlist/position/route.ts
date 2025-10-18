import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getWaitlistPositionByEmail } from '@/lib/waitlist';

// GET: For OG image generation (by referral code)
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
    console.error('Position API GET error:', error);
    return NextResponse.json({ 
      position: 1332,
      total: 1500,
      referralsCount: 0 
    }, { status: 500 });
  }
}

// POST: For checking position by email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get position data
    const positionData = await getWaitlistPositionByEmail(email);

    if (!positionData || !positionData.lead) {
      return NextResponse.json({ 
        error: 'Email not found on waitlist' 
      }, { status: 404 });
    }

    return NextResponse.json({
      position: positionData.position,
      total: positionData.total,
      status: positionData.lead.status,
      referralCode: positionData.lead.referral_code,
      referralsCount: positionData.lead.referrals_count || 0,
    });
  } catch (error) {
    console.error('Position API POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to check position' 
    }, { status: 500 });
  }
}
