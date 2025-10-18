import { db } from './db';

export async function getWaitlistPosition(leadId: number) {
  const lead = await db.waitlistLead.findFirst({
    where: { id: leadId },
  });

  if (!lead) {
    return { position: null, total: null };
  }

  // Calculate effective points (lower is better)
  const effectivePoints = (lead.base_points || 0) - (lead.bonus_points || 0);

  // Count leads ahead of this one (by effective_points, then created_at for tie-breaking)
  const position = await db.waitlistLead.count({
    where: {
      status: 'JOINED',
      OR: [
        {
          base_points: {
            lte: effectivePoints + (lead.bonus_points || 0)
          },
          bonus_points: {
            gte: lead.bonus_points || 0
          }
        },
        { 
          base_points: lead.base_points,
          bonus_points: lead.bonus_points,
          created_at: { lte: lead.created_at },
          id: { lte: lead.id }
        }
      ],
    },
  });

  // Total waiting
  const total = await db.waitlistLead.count({
    where: { status: 'JOINED' },
  });

  return { position, total, referralCode: lead.referral_code, referralsCount: lead.referrals_count };
}

export async function getWaitlistPositionByEmail(email: string) {
  const lead = await db.waitlistLead.findFirst({
    where: { email },
    orderBy: { created_at: 'desc' },
  });

  if (!lead) {
    return { position: null, total: null, lead: null };
  }

  const { position, total } = await getWaitlistPosition(lead.id);
  return { position, total, lead };
}
