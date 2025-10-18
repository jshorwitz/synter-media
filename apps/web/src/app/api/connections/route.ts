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

// GET /api/connections - List user's platform connections
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connections = await prisma.platformConnection.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        platform: true,
        provider_account_id: true,
        provider_account_name: true,
        status: true,
        created_at: true,
        last_synced_at: true,
        // Don't expose tokens
      },
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Failed to fetch connections:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}
