import BacklogComponent from "../components/backlog-component/backlog-component";
import prisma from "../lib/prisma";

export default async function Backlog() {
    const orders = await prisma.order.findMany({
        where: { status: 'TO_ORDER' },
        include: {
            user: true,
            items: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const serializedOrders = orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        user: {
            ...order.user,
            createdAt: order.user.createdAt.toISOString(),
            updatedAt: order.user.updatedAt.toISOString(),
        },
        items: order.items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        })),
    }));

    const items = await prisma.item.findMany({
        where: { status: 'DELIVERED' },
        include: {
            order: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const serializedItems = items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        order: {
            ...item.order,
            createdAt: item.order.createdAt.toISOString(),
            updatedAt: item.order.updatedAt.toISOString(),
        },
    }));

    return <BacklogComponent orders={serializedOrders} items={serializedItems} />;
}