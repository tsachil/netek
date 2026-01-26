import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Branches
  const headquarters = await prisma.branch.upsert({
    where: { code: 'DEFAULT' },
    update: { name: 'סניף ראשי' },
    create: {
      name: 'סניף ראשי',
      code: 'DEFAULT',
    },
  });

  const westside = await prisma.branch.upsert({
    where: { code: 'WEST' },
    update: { name: 'סניף מערב' },
    create: {
      name: 'סניף מערב',
      code: 'WEST',
    },
  });

  console.log('✅ Branches created.');

  // 2. Create Dummy Banker for Audit Logs
  const systemBanker = await prisma.user.upsert({
    where: { googleId: 'system_admin' },
    update: {},
    create: {
      googleId: 'system_admin',
      email: 'admin@bank.com',
      name: 'מנהל מערכת',
      branchId: headquarters.id,
      role: 'MANAGER',
    },
  });

  // 3. Create Customers for Headquarters
  const customersData = [
    { name: 'ישראל ישראלי', email: 'israel@example.com', phone: '050-1234567' },
    { name: 'שרה כהן', email: 'sara@example.com', phone: '052-7654321' },
    { name: 'דוד לוי', email: 'david@example.com', phone: '054-1112222' },
    { name: 'רחל אהרוני', email: 'rachel@example.com', phone: '053-3334444' },
  ];

  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        ...c,
        branchId: headquarters.id,
        accounts: {
          create: [
            {
              type: 'CHECKING',
              balance: Math.floor(Math.random() * 5000) + 1000,
              transactions: {
                create: [
                  {
                    amount: 1000,
                    type: 'DEPOSIT',
                    performedBy: systemBanker.id,
                  },
                ],
              },
            },
            {
              type: 'SAVINGS',
              balance: Math.floor(Math.random() * 20000) + 5000,
            },
          ],
        },
      },
    });
    console.log(`Created customer: ${customer.name} (HQ)`);
  }

  // 4. Create Customers for Westside
  const westsideCustomers = [
    { name: 'יוסי מזרחי', email: 'yossi@westside.com', phone: '055-5555555' },
    { name: 'מיכל ששון', email: 'michal@westside.com', phone: '058-8888888' },
  ];

  for (const c of westsideCustomers) {
    await prisma.customer.create({
      data: {
        ...c,
        branchId: westside.id,
        accounts: {
          create: {
            type: 'CHECKING',
            balance: 500,
          },
        },
      },
    });
    console.log(`Created customer: ${c.name} (Westside - Hidden)`);
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });