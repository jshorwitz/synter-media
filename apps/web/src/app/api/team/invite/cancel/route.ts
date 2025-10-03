import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { inviteId } = await req.json();

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID required' },
        { status: 400 }
      );
    }

    // TODO: Get current user ID from session
    const userId = 1; // Placeholder

    // Delete invite
    await prisma.teamInvite.delete({
      where: {
        id: inviteId,
        invited_by: userId, // Ensure user can only cancel their own invites
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to cancel invite:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invite' },
      { status: 500 }
    );
  }
}
