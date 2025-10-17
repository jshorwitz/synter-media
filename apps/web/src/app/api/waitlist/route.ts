import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, website, company, role, ad_spend, source = 'waitlist', notes } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
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

    // Upsert waitlist lead
    const lead = await db.waitlistLead.upsert({
      where: {
        email,
      },
      update: {
        user_id: userId,
        website,
        company,
        role,
        ad_spend,
        source,
        notes,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        email,
        website,
        company,
        role,
        ad_spend,
        source,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        status: lead.status,
      },
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
