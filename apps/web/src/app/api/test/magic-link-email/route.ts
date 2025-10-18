import { NextRequest, NextResponse } from 'next/server';
import { sendMagicLinkEmail } from '@/lib/loops';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    console.log('=== Testing Magic Link Email ===');
    console.log('Environment variables:');
    console.log('LOOPS_API_KEY set:', !!process.env.LOOPS_API_KEY);
    console.log('LOOPS_API_KEY value:', process.env.LOOPS_API_KEY ? `${process.env.LOOPS_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('LOOPS_MAGIC_LINK_TEMPLATE_ID:', process.env.LOOPS_MAGIC_LINK_TEMPLATE_ID || 'using default');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET');

    const testMagicUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/magic?token=test_token_123`;
    
    console.log('Test magic URL:', testMagicUrl);
    console.log('Sending to:', email);

    const result = await sendMagicLinkEmail(email, testMagicUrl, 'Test User');

    return NextResponse.json({
      success: result,
      config: {
        hasApiKey: !!process.env.LOOPS_API_KEY,
        hasTemplateId: !!process.env.LOOPS_MAGIC_LINK_TEMPLATE_ID,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        magicUrl: testMagicUrl,
      },
    });
  } catch (error: any) {
    console.error('Test magic link email error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
