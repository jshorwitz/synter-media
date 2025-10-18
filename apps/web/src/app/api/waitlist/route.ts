import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendWaitlistEmail } from '@/lib/loops';
import { getWaitlistPositionByEmail } from '@/lib/waitlist';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, website, company, role, ad_spend, source = 'waitlist', notes } = body;

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
      },
    });

    // Get position and send email
    const positionData = await getWaitlistPositionByEmail(email);
    if (positionData && positionData.position && positionData.total) {
      await sendWaitlistEmail(email, positionData.position, positionData.total);
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
