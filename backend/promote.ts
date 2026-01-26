import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promote(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'MANAGER' }
    });
    console.log(`User ${user.email} promoted to MANAGER.`);
  } catch (e) {
    console.error(`User with email ${email} not found.`);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with your email
const email = process.argv[2];
if (email) {
    promote(email);
} else {
    console.log('Please provide an email address.');
}
