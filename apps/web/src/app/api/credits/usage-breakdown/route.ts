import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // TODO: Get user ID from session/JWT
    const userId = 1; // Placeholder

    // Get last 30 days of spending grouped by action type
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const transactions = await prisma.creditTransaction.findMany({
      where: {
        user_id: userId,
        type: 'SPENT',
        created_at: { gte: last30Days },
      },
    });

    // Group by action type from metadata
    const groupedByAction = transactions.reduce((acc: any, tx: any) => {
      const action = tx.metadata?.action || 'unknown';
      if (!acc[action]) {
        acc[action] = { action, count: 0, credits: 0 };
      }
      acc[action].count += 1;
      acc[action].credits += Math.abs(tx.amount);
      return acc;
    }, {});

    const breakdown = Object.values(groupedByAction);

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error('Failed to get usage breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to load usage breakdown' },
      { status: 500 }
    );
  }
}
