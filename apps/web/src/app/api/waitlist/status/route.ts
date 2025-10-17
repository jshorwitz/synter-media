import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('synter_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session' },
        { status: 401 }
      );
    }

    const session = await db.session.findFirst({
      where: {
        session_token: sessionToken,
        expires_at: { gt: new Date() },
      },
      include: { user: true },
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get waitlist status
    const lead = await db.waitlistLead.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { user_id: session.user.id },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    if (!lead) {
      return NextResponse.json({
        status: 'NOT_FOUND',
        message: 'Not on waitlist',
      });
    }

    return NextResponse.json({
      status: lead.status,
      email: lead.email,
      created_at: lead.created_at,
      invited_at: lead.invited_at,
      activated_at: lead.activated_at,
    });
  } catch (error) {
    console.error('Error checking waitlist status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
