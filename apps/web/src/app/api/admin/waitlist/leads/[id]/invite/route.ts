import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const sessionToken = request.cookies.get('synter_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.session.findFirst({
      where: {
        session_token: sessionToken,
        expires_at: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { resend = false } = body;

    const lead = await db.waitlistLead.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (lead.status === 'ACTIVATED') {
      return NextResponse.json(
        { error: 'Lead already activated' },
        { status: 400 }
      );
    }

    // Generate or reuse token
    const inviteToken = resend && lead.invite_token ? lead.invite_token : nanoid(32);

    // Update lead
    const updated = await db.waitlistLead.update({
      where: { id: parseInt(params.id) },
      data: {
        status: 'INVITED',
        invite_token: inviteToken,
        invited_at: new Date(),
        invited_by: session.user.id,
      },
    });

    // TODO: Send email with invite link
    // const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?token=${inviteToken}`;
    // await sendInviteEmail(lead.email, inviteUrl);

    return NextResponse.json({
      ...updated,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding?token=${inviteToken}`,
    });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
