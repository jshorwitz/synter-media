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
        expires_at: { gt: new Date() },
      },
      include: { user: true },
    });
    return session?.user_id || null;
  } catch {
    return null;
  }
}

// GET /api/campaigns/:id - Get single campaign
export async function GET(
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

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Failed to fetch campaign:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

// PATCH /api/campaigns/:id - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, daily_budget_cents, objective, target_audience, creative_brief, status } = body;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: parseInt(id),
        user_id: userId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const updated = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(daily_budget_cents && { daily_budget_cents }),
        ...(objective !== undefined && { objective }),
        ...(target_audience !== undefined && { target_audience }),
        ...(creative_brief !== undefined && { creative_brief }),
        ...(status && { status: status.toUpperCase() }),
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

// DELETE /api/campaigns/:id - Delete campaign
export async function DELETE(
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

    await prisma.campaign.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
