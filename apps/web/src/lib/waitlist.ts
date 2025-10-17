import { db } from './db';

export async function getWaitlistPosition(leadId: number) {
  const lead = await db.waitlistLead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    return { position: null, total: null };
  }

  // Count leads ahead of this one (by created_at, then id for tie-breaking)
  const position = await db.waitlistLead.count({
    where: {
      status: 'JOINED',
      OR: [
        { created_at: { lt: lead.created_at } },
        { 
          created_at: lead.created_at,
          id: { lte: lead.id }
        }
      ],
    },
  });

  // Total waiting
  const total = await db.waitlistLead.count({
    where: { status: 'JOINED' },
  });

  return { position, total };
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
