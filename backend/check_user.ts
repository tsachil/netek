import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  console.log(user);
}

const email = process.argv[2];
if (email) check(email);
else console.log('Email required');
