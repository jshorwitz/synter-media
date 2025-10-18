import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { createMagicLink, getUserByEmail, createUser } from '@/lib/auth';
import { sendMagicLinkEmail } from '@/lib/loops';

const magicLinkSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = magicLinkSchema.parse(body);

    // Get or create user
    let user = await getUserByEmail(email);
    if (!user) {
      // Create user with no password (magic link only)
      user = await createUser({
        email,
        passwordHash: null,
        name: null,
        role: 'viewer',
      });
    }

    // Create magic link token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await createMagicLink({
      userId: user.id,
      token,
      expiresAt,
    });

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const magicUrl = `${baseUrl}/auth/magic?token=${token}`;
    
    console.log('Magic link details:', {
      email,
      magicUrl,
      userName: user.name,
      token: token.substring(0, 10) + '...',
    });
    
    const emailSent = await sendMagicLinkEmail(email, magicUrl, user.name || undefined);

    if (!emailSent) {
      console.error('Failed to send magic link email');
      
      // In development, still return success so devs can use console link
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Email not sent (dev mode). Use this link to sign in:');
        console.warn(`🔗 ${magicUrl}`);
        return NextResponse.json({
          success: true,
          message: 'Magic link generated (check console in dev mode)',
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to send email. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
    });
  } catch (error) {
    console.error('Magic link error:', error);
    
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
