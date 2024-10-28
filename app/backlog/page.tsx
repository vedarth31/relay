import BacklogComponent from "../components/backlog-component/backlog-component";
import prisma from "../lib/prisma";
import Layout from "../components/layout/layout";

export default async function Backlog() {

    try {
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

        return (
            <Layout>
                <BacklogComponent orders={serializedOrders} items={serializedItems} />
            </Layout>
        );
    } catch (error) {
        console.error("Error fetching backlog data:", error);
        return <Layout><p>Error loading data</p></Layout>;
    }
}