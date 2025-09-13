import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to remove members (must be owner or admin)
    const userRole = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!userRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if the target member exists
    const targetMember = await prisma.teamMember.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Prevent removing the only owner
    if (targetMember.role === 'owner') {
      const ownerCount = await prisma.teamMember.count({
        where: { role: 'owner' }
      });

      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the only owner' },
          { status: 400 }
        );
      }
    }

    // Only owners can remove other owners or admins
    if (targetMember.role === 'owner' && userRole.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can remove other owners' },
        { status: 403 }
      );
    }

    if (targetMember.role === 'admin' && userRole.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can remove admins' },
        { status: 403 }
      );
    }

    // Remove the team member
    await prisma.teamMember.delete({
      where: { id: params.id }
    });

    // Log the removal
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'member_removed',
        details: {
          targetUserId: targetMember.userId,
          targetUserEmail: targetMember.user.email,
          targetUserRole: targetMember.role
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
