import { db } from './db';

export async function getWaitlistPosition(leadId: number) {
  const lead = await db.waitlistLead.findFirst({
    where: { id: leadId },
  });

  if (!lead) {
    return { position: null, total: null };
  }

  // Calculate effective points (lower is better/earlier in line)
  const effectivePoints = (lead.base_points || 0) - (lead.bonus_points || 0);

  // Count how many leads have LOWER effective points (i.e., are ahead in line) + 1 for this person
  const position = 1 + await db.waitlistLead.count({
    where: {
      status: 'JOINED',
      OR: [
        {
          // Lower effective points = better position (ahead in line)
          base_points: {
            lt: lead.base_points
          },
          bonus_points: {
            lte: lead.bonus_points
          }
        },
        {
          // Same base_points, more bonus = ahead
          base_points: lead.base_points,
          bonus_points: {
            gt: lead.bonus_points
          }
        },
        {
          // Tie-breaker: same points, earlier created_at or lower ID
          base_points: lead.base_points,
          bonus_points: lead.bonus_points,
          OR: [
            { created_at: { lt: lead.created_at } },
            {
              created_at: lead.created_at,
              id: { lt: lead.id }
            }
          ]
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
