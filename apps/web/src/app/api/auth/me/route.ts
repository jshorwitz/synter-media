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

    // Find session and user
    const session = await db.session.findFirst({
      where: {
        session_token: sessionToken,
        expires_at: {
          gt: new Date(), // Only non-expired sessions
        },
      },
      include: {
        user: true,
      },
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = session.user;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
