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
    const magicUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/magic?token=${token}`;
    
    console.log('Magic link details:', {
      email,
      magicUrl,
      userName: user.name,
      token: token.substring(0, 10) + '...',
    });
    
    const emailSent = await sendMagicLinkEmail(email, magicUrl, user.name || undefined);

    if (!emailSent) {
      console.error('Failed to send magic link email');
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
