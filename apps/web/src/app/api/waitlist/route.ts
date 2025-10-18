import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendWaitlistEmail } from '@/lib/loops';
import { getWaitlistPositionByEmail } from '@/lib/waitlist';
import { generateReferralCode, GHOST_HEAD, MOVE_PER_REFERRAL } from '@/lib/referral';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, website, company, role, ad_spend, source = 'waitlist', notes, ref, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingLead = await db.waitlistLead.findFirst({
      where: { email },
    });

    if (existingLead) {
      // Return existing position without adding duplicate
      const positionData = await getWaitlistPositionByEmail(email);
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        lead: {
          id: existingLead.id,
          email: existingLead.email,
          status: existingLead.status,
        },
        position: positionData?.position,
        total: positionData?.total,
      });
    }

    // Check if user is logged in
    let userId: number | null = null;
    const sessionToken = request.cookies.get('synter_session')?.value;
    
    if (sessionToken) {
      const session = await db.session.findFirst({
        where: {
          session_token: sessionToken,
          expires_at: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });
      
      if (session) {
        userId = session.user.id;
      }
    }

    // Find referrer if ref code provided
    let referrerId: number | null = null;
    if (ref) {
      const referrer = await db.waitlistLead.findFirst({
        where: { referral_code: ref },
      });
      if (referrer && referrer.email !== email) {
        referrerId = referrer.id;
      }
    }

    // Get next base_points (GHOST_HEAD + count of real users + 1)
    const realUserCount = await db.waitlistLead.count({
      where: { is_ghost: false },
    });
    const basePoints = GHOST_HEAD + realUserCount + 1;

    // Create new waitlist lead
    const lead = await db.waitlistLead.create({
      data: {
        user_id: userId,
        email,
        name: name || undefined,
        website,
        company,
        role,
        ad_spend,
        source,
        notes,
        referral_code: generateReferralCode(),
        referrer_id: referrerId,
        base_points: basePoints,
        avatar_seed: Math.floor(Math.random() * 1000000),
      },
    });

    // If they were referred, increment referrer's count and bonus
    if (referrerId) {
      await db.waitlistLead.update({
        where: { id: referrerId },
        data: {
          referrals_count: { increment: 1 },
          bonus_points: { increment: MOVE_PER_REFERRAL },
        },
      });
    }

    // Get position and send email
    const positionData = await getWaitlistPositionByEmail(email);
    if (positionData && positionData.position && positionData.total) {
      console.log('Sending waitlist email to:', email, 'Position:', positionData.position, 'Referral code:', lead.referral_code);
      await sendWaitlistEmail(
        email, 
        positionData.position, 
        positionData.total,
        undefined,
        lead.referral_code || undefined,
        firstName
      );
    } else {
      console.error('Failed to get position data for email:', email, positionData);
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        status: lead.status,
      },
      position: positionData?.position,
      total: positionData?.total,
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
