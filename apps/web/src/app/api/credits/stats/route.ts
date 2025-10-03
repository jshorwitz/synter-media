import { NextRequest, NextResponse } from 'next/server';
import { getCreditStats } from '@/lib/subscription/creditManager';

export async function GET(req: NextRequest) {
  try {
    // TODO: Get user ID from session/JWT
    const userId = 1; // Placeholder

    const stats = await getCreditStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get credit stats:', error);
    return NextResponse.json(
      { error: 'Failed to load credit stats' },
      { status: 500 }
    );
  }
}
