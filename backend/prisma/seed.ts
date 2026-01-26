import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Branches
  const headquarters = await prisma.branch.upsert({
    where: { code: 'DEFAULT' },
    update: {},
    create: {
      name: 'Headquarters',
      code: 'DEFAULT',
    },
  });

  const westside = await prisma.branch.upsert({
    where: { code: 'WEST' },
    update: {},
    create: {
      name: 'Westside Branch',
      code: 'WEST',
    },
  });

  console.log('✅ Branches created.');

  // 2. Create Dummy Banker for Audit Logs (so transactions have a performedBy user)
  const systemBanker = await prisma.user.upsert({
    where: { googleId: 'system_admin' },
    update: {},
    create: {
      googleId: 'system_admin',
      email: 'admin@bank.com',
      name: 'System Admin',
      branchId: headquarters.id,
      role: 'MANAGER',
    },
  });

  // 3. Create Customers for Headquarters (You will see these)
  const customersData = [
    { name: 'Alice Freeman', email: 'alice@example.com', phone: '555-0101' },
    { name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102' },
    { name: 'Charlie Davis', email: 'charlie@example.com', phone: '555-0103' },
    { name: 'Diana Prince', email: 'diana@example.com', phone: '555-0104' },
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

  // 4. Create Customers for Westside (You should NOT see these)
  const westsideCustomers = [
    { name: 'Eve Rogue', email: 'eve@westside.com', phone: '555-0201' },
    { name: 'Frank Castle', email: 'frank@westside.com', phone: '555-0202' },
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
