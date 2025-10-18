import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'joel@syntermedia.ai';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';
  
  console.log('🌱 Seeding admin account...');

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`✅ User ${email} already exists (ID: ${existing.id})`);
    return;
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 12);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      name: 'Joel Horwitz',
      role: 'ADMIN',
      is_active: true,
    },
  });

  // Give signup bonus credits
  await prisma.creditBalance.create({
    data: {
      user_id: user.id,
      balance: 500,
      lifetime: 500,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      user_id: user.id,
      amount: 500,
      type: 'SIGNUP_BONUS',
      description: 'Welcome bonus',
    },
  });

  console.log('✅ Admin account created:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Credits: 500`);
  console.log(`   ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
