import { PrismaClient } from '@prisma/client';
import { generateReferralCode, generatePersonaName, GHOST_HEAD } from '../src/lib/referral';

const prisma = new PrismaClient();

async function main() {
  console.log('🎭 Seeding ghost users...');

  const ghostCount = GHOST_HEAD; // 1,331 ghosts
  const batchSize = 100;
  let created = 0;

  for (let i = 0; i < ghostCount; i += batchSize) {
    const batch = [];
    
    for (let j = i; j < Math.min(i + batchSize, ghostCount); j++) {
      const seed = j + 1;
      batch.push({
        email: `ghost${seed}@synter.internal`,
        is_ghost: true,
        base_points: seed,
        referral_code: generateReferralCode(),
        persona_name: generatePersonaName(seed),
        avatar_seed: seed,
        status: 'JOINED' as const,
        source: 'seed',
      });
    }

    await prisma.waitlistLead.createMany({
      data: batch,
      skipDuplicates: true,
    });

    created += batch.length;
    console.log(`✅ Created ${created}/${ghostCount} ghost users`);
  }

  console.log(`🎉 Successfully seeded ${created} ghost users!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
