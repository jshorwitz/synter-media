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

    // Get or create referral code for user
    let referral = await prisma.referral.findUnique({
      where: { referrer_id: user.id },
      include: { referred_users: true },
    });

    if (!referral) {
      // Generate unique referral code
      const code = generateReferralCode(user.email);
      
      referral = await prisma.referral.create({
        data: {
          referrer_id: user.id,
          referral_code: code,
        },
        include: { referred_users: true },
      });
    }

    return NextResponse.json({
      code: referral.referral_code,
      referred: referral.referred_count,
      earned: referral.credits_earned,
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load referral stats' },
      { status: 500 }
    );
  }
}

function generateReferralCode(email: string): string {
  const hash = crypto.createHash('md5').update(email + Date.now()).digest('hex');
  return hash.substring(0, 8).toUpperCase();
}
