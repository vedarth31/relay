const { PrismaClient, Role, OrderStatus, ItemStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const engineer = await prisma.user.create({
    data: {
      name: 'Alice Engineer',
      email: 'alice.engineer@example.com',
      role: Role.ENGINEER,
      subteam: 'Powertrain',
    },
  });

  const finance = await prisma.user.create({
    data: {
      name: 'Bob Finance',
      email: 'bob.finance@example.com',
      role: Role.FINANCE,
      subteam: 'Finance',
    },
  });

  const operations = await prisma.user.create({
    data: {
      name: 'Carol Operations',
      email: 'carol.operations@example.com',
      role: Role.OPERATIONS,
      subteam: 'Operations',
    },
  });

  // Create Orders
  await prisma.order.create({
    data: {
      internalOrderId: 'ORD-1001',
      name: 'Battery Components',
      userId: engineer.id,
      subteam: engineer.subteam,
      status: OrderStatus.TO_ORDER,
      vendor: 'Battery Supplies Co.',
      totalCost: 5000.0,
      items: {
        create: [
          {
            internalItemId: 'ITEM-2001',
            name: 'Lithium Cells',
            quantity: 100,
            price: 50.0,
            status: ItemStatus.TO_ORDER,
          },
          {
            internalItemId: 'ITEM-2002',
            name: 'Battery Management System',
            quantity: 1,
            price: 1000.0,
            status: ItemStatus.TO_ORDER,
          },
        ],
      },
    },
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });