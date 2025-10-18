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
    // Get user from session
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

// GET /api/campaigns - List user's campaigns
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, platform, daily_budget_cents, objective, target_audience, creative_brief } = body;

    if (!name || !platform || !daily_budget_cents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        user_id: userId,
        name,
        platform: platform.toUpperCase(),
        daily_budget_cents,
        objective,
        target_audience,
        creative_brief,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
