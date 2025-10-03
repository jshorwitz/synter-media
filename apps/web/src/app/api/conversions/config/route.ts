import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth/session';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a tracking ID (stored in subscription or separate table)
    // For now, we'll use a simple format: user_id + random hash
    const trackingId = `syn_${user.id}_${generateShortHash(user.email)}`;

    return NextResponse.json({ trackingId });
  } catch (error) {
    console.error('Failed to get tracking config:', error);
    return NextResponse.json(
      { error: 'Failed to load tracking config' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate new tracking ID
    const trackingId = `syn_${user.id}_${generateShortHash(user.email + Date.now())}`;

    // In production, you'd save this to a ConversionTracking table
    // For now, just return it

    return NextResponse.json({ trackingId });
  } catch (error) {
    console.error('Failed to generate tracking ID:', error);
    return NextResponse.json(
      { error: 'Failed to generate tracking ID' },
      { status: 500 }
    );
  }
}

function generateShortHash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex').substring(0, 8);
}
