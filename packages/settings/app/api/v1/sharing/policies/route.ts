import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policies = await prisma.sharingPolicy.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Error fetching sharing policies:', error);
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
      name, 
      description, 
      type, 
      settings, 
      expiresAt,
      isActive = true 
    } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['public_link', 'password_protected', 'team_only', 'specific_emails'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: ' + validTypes.join(', ') },
        { status: 400 }
      );
    }

    const policy = await prisma.sharingPolicy.create({
      data: {
        userId: user.id,
        name,
        description,
        type,
        settings: settings || {},
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive
      }
    });

    // Log policy creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'sharing_policy_created',
        details: {
          policyId: policy.id,
          policyName: policy.name,
          policyType: policy.type
        }
      }
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error creating sharing policy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
