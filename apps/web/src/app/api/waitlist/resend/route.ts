import { NextRequest, NextResponse } from 'next/server';
import { sendWaitlistEmail } from '@/lib/loops';
import { getWaitlistPosition } from '@/lib/waitlist';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get waitlist position
    const position = await getWaitlistPosition(email);

    if (!position) {
      return NextResponse.json(
        { error: 'Email not found on waitlist' },
        { status: 404 }
      );
    }

    // Resend email via Loops
    await sendWaitlistEmail(email, position.position, position.total);

    return NextResponse.json({ 
      success: true,
      message: 'Email resent successfully' 
    });
  } catch (error) {
    console.error('Error resending waitlist email:', error);
    return NextResponse.json(
      { error: 'Failed to resend email' },
      { status: 500 }
    );
  }
}
