import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'joel@syntermedia.ai';
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`❌ User ${email} not found`);
    return;
  }

  console.log('✅ User found:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Active: ${user.is_active}`);

  // Update to ADMIN if not already
  if (user.role !== 'ADMIN') {
    console.log(`\n🔄 Updating role from ${user.role} to ADMIN...`);
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log('✅ Role updated to ADMIN');
  } else {
    console.log('\n✅ Role is already ADMIN');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
