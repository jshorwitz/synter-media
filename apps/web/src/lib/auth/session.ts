import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('synter_session')?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { session_token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expires_at < new Date()) {
    return null;
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
