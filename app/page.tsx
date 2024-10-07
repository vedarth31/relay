import prisma from "./lib/prisma"
import OrderTable from "./components/order-table/order-table";

export default async function Dashboard(){
    const orders = await prisma.order.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: true,
            items: true,
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
    
    return <OrderTable orders={serializedOrders} />;
}