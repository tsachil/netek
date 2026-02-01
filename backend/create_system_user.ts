import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSystemUser() {
  try {
    const branch = await prisma.branch.findFirst();
    if (!branch) {
      console.log('No branches found. Skipping SYSTEM user creation (run seed first).');
      return;
    }

    const systemUser = await prisma.user.upsert({
      where: { email: 'system@banker.internal' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000000',
        googleId: 'system_user',
        email: 'system@banker.internal',
        name: 'SYSTEM',
        role: 'SYSTEM',
        branchId: branch.id,
      },
    });
    console.log('SYSTEM user created/verified:', systemUser);
  } catch (e) {
    console.error('Error creating SYSTEM user:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSystemUser();