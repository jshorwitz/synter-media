import { NextRequest, NextResponse } from 'next/server';
import { sendWaitlistEmail } from '@/lib/loops';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('=== Testing Loops Email ===');
    console.log('Email:', email);
    console.log('FirstName:', firstName);
    console.log('LOOPS_API_KEY set:', !!process.env.LOOPS_API_KEY);
    console.log('LOOPS_API_KEY value:', process.env.LOOPS_API_KEY ? `${process.env.LOOPS_API_KEY.substring(0, 10)}...` : 'NOT SET');

    const result = await sendWaitlistEmail(
      email,
      1332,
      1500,
      'https://syntermedia.ai/waitlist/check',
      'TEST123',
      firstName || 'Test'
    );

    return NextResponse.json({
      success: result,
      email,
      firstName,
      envCheck: {
        hasApiKey: !!process.env.LOOPS_API_KEY,
        hasTemplateId: !!process.env.LOOPS_WAITLIST_TEMPLATE_ID,
      }
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
