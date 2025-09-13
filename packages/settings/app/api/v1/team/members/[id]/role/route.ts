import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../../lib/auth';
import { prisma } from '../../../../../../../lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to change roles (must be owner or admin)
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

    const { role } = await request.json();
    
    if (!role || !['owner', 'admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be owner, admin, or member' },
        { status: 400 }
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

    // Prevent changing own role if you're the only owner
    if (targetMember.userId === user.id && targetMember.role === 'owner') {
      const ownerCount = await prisma.teamMember.count({
        where: { role: 'owner' }
      });

      if (ownerCount === 1 && role !== 'owner') {
        return NextResponse.json(
          { error: 'Cannot change role - you are the only owner' },
          { status: 400 }
        );
      }
    }

    // Only owners can create other owners
    if (role === 'owner' && userRole.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can assign owner role' },
        { status: 403 }
      );
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: params.id },
      data: { role },
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

    // Log the role change
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'role_changed',
        details: {
          targetUserId: targetMember.userId,
          targetUserEmail: targetMember.user.email,
          oldRole: targetMember.role,
          newRole: role
        }
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating team member role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
