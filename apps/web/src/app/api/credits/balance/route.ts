import { NextRequest, NextResponse } from 'next/server';
import { getCreditBalance } from '@/lib/subscription/creditManager';

export async function GET(req: NextRequest) {
  try {
    // TODO: Get user ID from session/JWT
    const userId = 1; // Placeholder

    const balance = await getCreditBalance(userId);

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Failed to get credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to load balance' },
      { status: 500 }
    );
  }
}
