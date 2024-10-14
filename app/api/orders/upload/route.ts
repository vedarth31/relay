import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { parse } from 'csv-parse/sync';
import { ItemStatus, OrderStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {

    const userEmail = 'alice.engineer@example.com';

    // Get the user from the database
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse the multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the file content
    const content = await file.text();

    // Parse the CSV content
    let records;
    try {
        records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        });
    } catch (error) {
        console.error('Error parsing CSV:', error);
        return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
    }

    // Validate and process the records
    const itemsData = [];
    for (const record of records) {
        const {
        Item,
        'Part Number': partNumber,
        Notes,
        'QTY to Buy': qtyToBuy,
        Cost,
        Vendor,
        Link,
        } = record;

        if (!Item || !qtyToBuy || !Cost || !Vendor) {
        return NextResponse.json(
            { error: 'Missing required fields in CSV' },
            { status: 400 }
        );
        }

        itemsData.push({
        internalItemId: `ITEM-${Math.floor(Math.random() * 100000)}`,
        name: Item,
        partNumber: partNumber || '',
        notes: Notes || null,
        quantity: parseInt(qtyToBuy, 10),
        price: parseFloat(Cost),
        vendor: Vendor,
        link: Link || null,
        status: ItemStatus.TO_ORDER,
        });
    }

    // Create the order with items
    try {
        await prisma.order.create({
        data: {
            internalOrderId: `ORD-${Math.floor(Math.random() * 100000)}`,
            name: `Order by ${user.name}`,
            userId: user.id,
            subteam: user.subteam,
            status: OrderStatus.TO_ORDER,
            vendor: itemsData[0].vendor,
            totalCost: itemsData.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
            ),
            comments: '',
            items: {
                create: itemsData,
            },
        },
        });

        return NextResponse.json({ message: 'Order created successfully' });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
    }
}