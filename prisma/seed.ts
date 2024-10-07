const { PrismaClient, Role, OrderStatus, ItemStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const engineer = await prisma.user.upsert({
    where: { email: 'alice.engineer@example.com' },
    update: {},
    create: {
      name: 'Alice Engineer',
      email: 'alice.engineer@example.com',
      role: Role.ENGINEER,
      subteam: 'Powertrain',
    },
  });

  const finance = await prisma.user.upsert({
    where: { email: 'bob.finance@example.com' },
    update: {},
    create: {
      name: 'Bob Finance',
      email: 'bob.finance@example.com',
      role: Role.FINANCE,
      subteam: 'Finance',
    },
  });

  const operations = await prisma.user.upsert({
    where: { email: 'carol.operations@example.com' },
    update: {},
    create: {
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
      comments: 'Urgent order for the new project',
      items: {
        create: [
          {
            internalItemId: 'ITEM-2001',
            name: 'Lithium Cells',
            quantity: 100,
            price: 50.0,
            vendor: 'Battery Supplies Co.',
            status: ItemStatus.TO_ORDER,
          },
          {
            internalItemId: 'ITEM-2002',
            name: 'Battery Management System',
            quantity: 1,
            price: 1000.0,
            vendor: 'Battery Supplies Co.',
            status: ItemStatus.TO_ORDER,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      internalOrderId: 'ORD-1002',
      name: 'Operations Equipment',
      userId: operations.id,
      subteam: operations.subteam,
      status: OrderStatus.PLACED,
      vendor: 'Digikey',
      totalCost: 2340.0,
      comments: 'Standard restock items',
      items: {
        create: [
          {
            internalItemId: 'ITEM-2003',
            name: 'Masking Tape',
            quantity: 10,
            price: 54.0,
            vendor: 'Office Supplies Co.',
            status: ItemStatus.PLACED,
          },
          {
            internalItemId: 'ITEM-2004',
            name: 'Go Cart',
            quantity: 2,
            price: 900.0,
            vendor: 'Sports Equipment Inc.',
            status: ItemStatus.PROCESSED,
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
