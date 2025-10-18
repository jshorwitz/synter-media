import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get overall stats
    const totalUsers = await prisma.creditBalance.count();
    
    const balanceAgg = await prisma.creditBalance.aggregate({
      _sum: {
        balance: true,
        lifetime: true,
      },
    });

    const totalPurchases = await prisma.purchase.count();
    
    const revenueAgg = await prisma.purchase.aggregate({
      where: { status: 'succeeded' },
      _sum: {
        amount_cents: true,
        credits_awarded: true,
      },
    });

    // Last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recent = await prisma.purchase.aggregate({
      where: {
        status: 'succeeded',
        created_at: { gte: last30Days },
      },
      _sum: {
        amount_cents: true,
        credits_awarded: true,
      },
      _count: true,
    });

    // Get user credit details
    const userCredits = await prisma.creditBalance.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        balance: 'desc',
      },
      take: 100,
    });

    // Get purchase totals per user
    const purchaseTotals = await prisma.purchase.groupBy({
      by: ['user_id'],
      where: { status: 'succeeded' },
      _sum: {
        amount_cents: true,
      },
      _max: {
        created_at: true,
      },
    });

    const purchaseMap = new Map(
      purchaseTotals.map(p => [p.user_id, {
        totalSpent: p._sum.amount_cents || 0,
        lastPurchase: p._max.created_at,
      }])
    );

    const users = userCredits.map(cb => ({
      userId: cb.user.id,
      email: cb.user.email,
      name: cb.user.name,
      balance: cb.balance,
      lifetime: cb.lifetime,
      totalSpent: purchaseMap.get(cb.user.id)?.totalSpent || 0,
      lastPurchase: purchaseMap.get(cb.user.id)?.lastPurchase || null,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBalance: balanceAgg._sum.balance || 0,
        totalLifetime: balanceAgg._sum.lifetime || 0,
        totalPurchases,
        totalRevenue: revenueAgg._sum.amount_cents || 0,
        last30Days: {
          purchases: recent._count || 0,
          revenue: recent._sum.amount_cents || 0,
          creditsAwarded: recent._sum.credits_awarded || 0,
        },
      },
      users,
    });
  } catch (error) {
    console.error('Admin credits error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit data' },
      { status: 500 }
    );
  }
}
