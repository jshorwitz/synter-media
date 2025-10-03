import { PrismaClient, CreditTransactionType } from '@prisma/client';
import { CreditAction, getCreditCost, FREE_SIGNUP_CREDITS } from './credits';

const prisma = new PrismaClient();

export async function getCreditBalance(userId: number): Promise<number> {
  const balance = await prisma.creditBalance.findUnique({
    where: { user_id: userId },
  });

  return balance?.balance || 0;
}

export async function hasEnoughCredits(
  userId: number,
  action: CreditAction
): Promise<boolean> {
  const cost = getCreditCost(action);
  const balance = await getCreditBalance(userId);
  return balance >= cost;
}

export async function spendCredits(
  userId: number,
  action: CreditAction,
  metadata?: any
): Promise<{ success: boolean; balance: number; error?: string }> {
  const cost = getCreditCost(action);

  try {
    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get current balance
      const creditBalance = await tx.creditBalance.findUnique({
        where: { user_id: userId },
      });

      if (!creditBalance || creditBalance.balance < cost) {
        throw new Error('Insufficient credits');
      }

      // Deduct credits
      const updated = await tx.creditBalance.update({
        where: { user_id: userId },
        data: {
          balance: {
            decrement: cost,
          },
        },
      });

      // Record transaction
      await tx.creditTransaction.create({
        data: {
          user_id: userId,
          amount: -cost,
          type: 'SPENT',
          description: `Spent ${cost} credits on ${action}`,
          metadata,
        },
      });

      return updated.balance;
    });

    return { success: true, balance: result };
  } catch (error: any) {
    return {
      success: false,
      balance: await getCreditBalance(userId),
      error: error.message,
    };
  }
}

export async function addCredits(
  userId: number,
  amount: number,
  type: CreditTransactionType,
  description?: string,
  metadata?: any
): Promise<number> {
  const result = await prisma.$transaction(async (tx) => {
    // Upsert credit balance
    const updated = await tx.creditBalance.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        balance: amount,
        lifetime: amount,
      },
      update: {
        balance: {
          increment: amount,
        },
        lifetime: {
          increment: amount,
        },
      },
    });

    // Record transaction
    await tx.creditTransaction.create({
      data: {
        user_id: userId,
        amount,
        type,
        description: description || `Added ${amount} credits`,
        metadata,
      },
    });

    return updated.balance;
  });

  return result;
}

export async function grantSignupBonus(userId: number): Promise<number> {
  return addCredits(
    userId,
    FREE_SIGNUP_CREDITS,
    'SIGNUP_BONUS',
    `Welcome bonus: ${FREE_SIGNUP_CREDITS} free credits`
  );
}

export async function getCreditHistory(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  return prisma.creditTransaction.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

export async function getCreditStats(userId: number) {
  const balance = await prisma.creditBalance.findUnique({
    where: { user_id: userId },
  });

  const recentTransactions = await prisma.creditTransaction.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 10,
  });

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const spent30Days = await prisma.creditTransaction.aggregate({
    where: {
      user_id: userId,
      type: 'SPENT',
      created_at: { gte: last30Days },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    balance: balance?.balance || 0,
    lifetime: balance?.lifetime || 0,
    spent30Days: Math.abs(spent30Days._sum.amount || 0),
    recentTransactions,
  };
}
