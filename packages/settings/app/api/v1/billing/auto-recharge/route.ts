// POST /api/v1/billing/auto-recharge - Configure auto-recharge settings
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRole } from '../../../../../lib/auth';
import { db, getOrCreateWallet } from '../../../../../lib/db';

const autoRechargeSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().int().positive().optional(),
  topupAmount: z.number().int().positive().optional(),
});

export const POST = requireRole(['OWNER', 'BILLING_ADMIN'])(async (request) => {
  const { workspaceId, userId } = request.context;

  try {
    const body = await request.json();
    const data = autoRechargeSchema.parse(body);

    // Validate that threshold and topupAmount are provided when enabling
    if (data.enabled && (!data.threshold || !data.topupAmount)) {
      return new Response(
        JSON.stringify({ 
          error: 'Threshold and topup amount required when enabling auto-recharge' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get wallet
    const wallet = await getOrCreateWallet(workspaceId);

    // Update auto-recharge settings
    const updatedWallet = await db.creditWallet.update({
      where: { id: wallet.id },
      data: {
        autoEnabled: data.enabled,
        threshold: data.enabled ? data.threshold : null,
        topupAmount: data.enabled ? data.topupAmount : null,
      },
    });

    // TODO: Emit audit event
    // await createAuditEvent(workspaceId, userId, 'billing.auto_recharge_configured', ...)

    return new Response(
      JSON.stringify({
        enabled: updatedWallet.autoEnabled,
        threshold: updatedWallet.threshold,
        topupAmount: updatedWallet.topupAmount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auto-recharge configuration failed:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to configure auto-recharge' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
