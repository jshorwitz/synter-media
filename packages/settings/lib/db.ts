// Database client and utilities
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;

// Database utilities
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return db.$transaction(fn);
}

export function generateId(): string {
  // Use nanoid for better URL-safe IDs
  const { nanoid } = require('nanoid');
  return nanoid();
}

export function generateToken(): string {
  // Generate secure 128-bit token for invites and share links
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('hex');
}

export function generateSecureToken(): string {
  // Generate secure 256-bit token for share links
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Workspace utilities
export async function getWorkspace(workspaceId: string) {
  return db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      creditWallet: {
        include: {
          ledger: {
            orderBy: { createdAt: 'desc' },
            take: 100,
          },
        },
      },
      users: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      },
      paymentMethods: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    include: {
      workspace: true,
    },
  });
}

export async function getUser(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      workspace: true,
    },
  });
}

// Credit wallet utilities  
export async function getOrCreateWallet(workspaceId: string) {
  let wallet = await db.creditWallet.findUnique({
    where: { workspaceId },
    include: { ledger: true },
  });

  if (!wallet) {
    wallet = await db.creditWallet.create({
      data: {
        workspaceId,
        balance: 0,
      },
      include: { ledger: true },
    });
  }

  return wallet;
}

export async function calculateBurnRate(walletId: string, days: number = 30): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const consumptionEntries = await db.creditLedger.findMany({
    where: {
      walletId,
      reason: 'CONSUMPTION',
      createdAt: { gte: since },
    },
  });

  const totalConsumed = consumptionEntries.reduce(
    (sum, entry) => sum + Math.abs(entry.delta),
    0
  );

  return totalConsumed / days; // credits per day
}

export async function updateWalletBalance(
  walletId: string,
  delta: number,
  reason: string,
  refType?: string,
  refId?: string,
  metadata?: any
) {
  return withTransaction(async (tx) => {
    // Add ledger entry
    await tx.creditLedger.create({
      data: {
        walletId,
        delta,
        reason: reason as any,
        refType,
        refId,
        metadata,
      },
    });

    // Update wallet balance
    await tx.creditWallet.update({
      where: { id: walletId },
      data: {
        balance: { increment: delta },
      },
    });

    // Return updated wallet
    return tx.creditWallet.findUnique({
      where: { id: walletId },
      include: { ledger: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
  });
}
