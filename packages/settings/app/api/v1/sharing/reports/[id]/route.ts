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

    const report = await prisma.sharedReport.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        policy: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Shared report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching shared report:', error);
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

    const report = await prisma.sharedReport.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Shared report not found' },
        { status: 404 }
      );
    }

    const { title, description, reportConfig, policyId, expiresAt, isActive } = await request.json();

    // Validate policy if provided
    if (policyId) {
      const policy = await prisma.sharingPolicy.findFirst({
        where: {
          id: policyId,
          userId: user.id
        }
      });

      if (!policy) {
        return NextResponse.json(
          { error: 'Sharing policy not found' },
          { status: 404 }
        );
      }
    }

    const updatedReport = await prisma.sharedReport.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(reportConfig !== undefined && { reportConfig }),
        ...(policyId !== undefined && { policyId }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        policy: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    // Log report update
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'shared_report_updated',
        details: {
          reportId: report.id,
          reportTitle: report.title,
          changes: { title, description, reportConfig, policyId, expiresAt, isActive }
        }
      }
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error updating shared report:', error);
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

    const report = await prisma.sharedReport.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Shared report not found' },
        { status: 404 }
      );
    }

    await prisma.sharedReport.delete({
      where: { id: params.id }
    });

    // Log report deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'shared_report_deleted',
        details: {
          reportId: report.id,
          reportTitle: report.title
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shared report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
