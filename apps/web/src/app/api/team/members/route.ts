import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // TODO: Get current user ID from session
    const userId = 1; // Placeholder

    // Get team members
    const members = await prisma.teamMember.findMany({
      where: { user_id: userId },
      orderBy: { joined_at: 'desc' },
    });

    // Get pending invites
    const invites = await prisma.teamInvite.findMany({
      where: {
        invited_by: userId,
        accepted_at: null,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ members, invites });
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return NextResponse.json(
      { error: 'Failed to load team members' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    // TODO: Get current user ID from session
    const userId = 1; // Placeholder

    // Delete team member
    await prisma.teamMember.delete({
      where: {
        id: memberId,
        user_id: userId, // Ensure user can only delete their own team members
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
