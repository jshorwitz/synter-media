import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService, getSessionCookieOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const authService = new AuthService(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        role: 'VIEWER', // Default role (Prisma enum)
      },
    });

    // Add to waitlist
    await db.waitlistLead.upsert({
      where: { email },
      update: {
        user_id: user.id,
        status: 'JOINED',
      },
      create: {
        user_id: user.id,
        email,
        status: 'JOINED',
        source: 'signup',
      },
    });

    // Create session
    const sessionToken = authService.generateSessionToken();
    const expiresAt = authService.getSessionExpiry();
    
    const session = await db.session.create({
      data: {
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt,
        user_agent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      },
    });

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      }
    });

    // Set session cookie
    const cookieOptions = getSessionCookieOptions(process.env.NODE_ENV === 'production');
    response.cookies.set('synter_session', sessionToken, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
