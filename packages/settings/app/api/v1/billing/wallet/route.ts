// GET /api/v1/billing/wallet - Get wallet balance and auto-recharge settings
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '../../../../../lib/auth';
import { getOrCreateWallet, calculateBurnRate } from '../../../../../lib/db';

export const GET = requireAuth(async (request) => {
  const { workspaceId } = request.context;

  try {
    const wallet = await getOrCreateWallet(workspaceId);
    const burnRateDaily = await calculateBurnRate(wallet.id, 30);
    const daysRemaining = burnRateDaily > 0 ? Math.ceil(wallet.balance / burnRateDaily) : Infinity;

    const response = {
      balance: wallet.balance,
      burnRateDaily: Math.round(burnRateDaily * 100) / 100, // round to 2 decimals
      daysRemaining: daysRemaining === Infinity ? null : daysRemaining,
      autoRecharge: {
        enabled: wallet.autoEnabled,
        threshold: wallet.threshold,
        topupAmount: wallet.topupAmount,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get wallet:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get wallet information' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
