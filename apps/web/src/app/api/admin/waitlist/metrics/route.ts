import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    // Get counts by status
    const [total, joined, invited, activated] = await Promise.all([
      db.waitlistLead.count(),
      db.waitlistLead.count({ where: { status: 'JOINED' } }),
      db.waitlistLead.count({ where: { status: 'INVITED' } }),
      db.waitlistLead.count({ where: { status: 'ACTIVATED' } }),
    ]);

    // Calculate conversion rate
    const conversionRate = invited > 0 ? (activated / invited) * 100 : 0;

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignups = await db.waitlistLead.count({
      where: {
        created_at: { gte: sevenDaysAgo },
      },
    });

    const recentInvites = await db.waitlistLead.count({
      where: {
        invited_at: { gte: sevenDaysAgo },
      },
    });

    const recentActivations = await db.waitlistLead.count({
      where: {
        activated_at: { gte: sevenDaysAgo },
      },
    });

    return NextResponse.json({
      totals: {
        total,
        joined,
        invited,
        activated,
      },
      conversion: {
        inviteToActivation: conversionRate,
      },
      recent: {
        signups: recentSignups,
        invites: recentInvites,
        activations: recentActivations,
      },
    });
  } catch (error) {
    console.error('Error fetching waitlist metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
