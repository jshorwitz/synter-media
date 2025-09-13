import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policy = await prisma.sharingPolicy.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!policy) {
      return NextResponse.json(
        { error: 'Sharing policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error fetching sharing policy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policy = await prisma.sharingPolicy.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!policy) {
      return NextResponse.json(
        { error: 'Sharing policy not found' },
        { status: 404 }
      );
    }

    const { name, description, type, settings, expiresAt, isActive } = await request.json();

    const updatedPolicy = await prisma.sharingPolicy.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(settings !== undefined && { settings }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Log policy update
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'sharing_policy_updated',
        details: {
          policyId: policy.id,
          policyName: policy.name,
          changes: { name, description, type, settings, expiresAt, isActive }
        }
      }
    });

    return NextResponse.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating sharing policy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policy = await prisma.sharingPolicy.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!policy) {
      return NextResponse.json(
        { error: 'Sharing policy not found' },
        { status: 404 }
      );
    }

    await prisma.sharingPolicy.delete({
      where: { id: params.id }
    });

    // Log policy deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'sharing_policy_deleted',
        details: {
          policyId: policy.id,
          policyName: policy.name
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sharing policy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
