import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { getMagicLinkUser, markMagicLinkAsUsed } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400 }
      );
    }

    // Get user from magic link token
    const user = await getMagicLinkUser(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 401 }
      );
    }

    // Mark magic link as used
    await markMagicLinkAsUsed(token);

    // Create session token
    const sessionToken = await createSession(user.id, request);
    
    // Create JWT for API access
    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
      token: jwtToken,
    });

    response.cookies.set('synter_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Magic link processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createSession(userId: number, request: NextRequest) {
  const { createSession: dbCreateSession } = await import('@/lib/auth');
  
  const sessionToken = randomBytes(32).toString('hex');
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

  await dbCreateSession({
    userId,
    sessionToken,
    userAgent,
    ip,
  });

  return sessionToken;
}
