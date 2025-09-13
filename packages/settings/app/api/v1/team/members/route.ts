// GET /api/v1/team/members - Get team members
import { NextRequest } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { db } from '../../../../../lib/db';

export const GET = requireAuth(async (request) => {
  const { workspaceId } = request.context;

  try {
    const members = await db.user.findMany({
      where: { 
        workspaceId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' }, // Owner first, then hierarchy
        { createdAt: 'asc' },
      ],
    });

    return new Response(JSON.stringify(members), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Failed to get team members:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get team members' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
