import { NextResponse, type NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { OrderStatus } from "@prisma/client";

function getOrderStatus(input: string): OrderStatus | null {
    const normalizedInput = input.trim().toUpperCase().replace(/\s+/g, "_");
    if (Object.values(OrderStatus).includes(normalizedInput as OrderStatus)) {
        return normalizedInput as OrderStatus;
    }
    return null;
}

export async function PUT(req: NextRequest) {

    try {
        const { meenId, orderStatus, itemName, vendorName } = await req.json();

        const normalizedOrderStatus = getOrderStatus(orderStatus);

        if (!normalizedOrderStatus) {
            return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
        }

        let orderToUpdate;

        if (itemName) {
            orderToUpdate = await prisma.order.findFirst({
                where: {
                    name: itemName
                }
            });
        }

        if (!orderToUpdate && meenId) {
            orderToUpdate = await prisma.order.findFirst({
                where: {
                    meenOrderId: meenId
                }
            })
        }

        if (orderToUpdate) {
            const newOrder = await prisma.order.update({
                where: {
                    id: orderToUpdate.id,
                },
                data: {
                    internalOrderId: "ORD-1003",
                    meenOrderId: meenId,
                    name: itemName,
                    userId: 1,
                    subteam: "Electronics",
                    status: normalizedOrderStatus,
                    vendor: vendorName,
                    // totalCost: totalCost || 0.0, // Default to 0.0 if not provided
                    // costVerified: costVerified || false,
                    // comments: comments || '',
                    // items: {
                    //     create: items.map((item: any) => ({
                    //         internalItemId: item.internalItemId,
                    //         name: item.name,
                    //         partNumber: item.partNumber,
                    //         quantity: item.quantity,
                    //         price: item.price || 0.0, // Default to 0.0 if not provided
                    //         priceVerified: item.priceVerified || false,
                    //         vendor: item.vendor,
                    //         link: item.link || null,
                    //         carrier: item.carrier || null,
                    //         trackingId: item.trackingId || null,
                    //         status: item.status, // Should match the `ItemStatus` enum
                    //     })),
                    // },
                },
            });

            return NextResponse.json({ message: "Order updated successfully", newOrder }, { status: 201 });
        } else {
            return NextResponse.json({ message: "No order found to update" }, { status: 404 })
        }
    } catch (error) {
        console.error("Error creating the order", error);
        return NextResponse.json({ error: "Failed to create new order" }, { status: 500 });
    }
}