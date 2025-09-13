import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.sharedReport.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          policy: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }),
      prisma.sharedReport.count({
        where: { userId: user.id }
      })
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shared reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      title, 
      description, 
      reportType, 
      reportConfig, 
      policyId,
      expiresAt 
    } = await request.json();

    if (!title || !reportType || !reportConfig) {
      return NextResponse.json(
        { error: 'Title, report type, and report config are required' },
        { status: 400 }
      );
    }

    // Validate policy exists and belongs to user
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

    // Generate unique share token
    const shareToken = crypto.randomUUID();

    const report = await prisma.sharedReport.create({
      data: {
        userId: user.id,
        title,
        description,
        reportType,
        reportConfig,
        shareToken,
        policyId,
        expiresAt: expiresAt ? new Date(expiresAt) : null
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

    // Log report sharing
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'report_shared',
        details: {
          reportId: report.id,
          reportTitle: report.title,
          reportType: report.reportType,
          shareToken: report.shareToken
        }
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating shared report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
