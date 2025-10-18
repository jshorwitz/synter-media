import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromRequest(request: NextRequest): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('synter_session')?.value;
  
  if (!sessionToken) {
    return null;
  }

  try {
    const session = await prisma.session.findFirst({
      where: {
        session_token: sessionToken,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
    
    return session?.user_id || null;
  } catch {
    return null;
  }
}

// POST /api/campaigns/:id/launch - Launch a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: parseInt(id),
        user_id: userId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Campaign is already active' }, { status: 400 });
    }

    // For now, just set to ACTIVE (no credit check since platform is free)
    const updated = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: {
        status: 'ACTIVE',
        launched_at: new Date(),
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('Failed to launch campaign:', error);
    return NextResponse.json({ error: 'Failed to launch campaign' }, { status: 500 });
  }
}
