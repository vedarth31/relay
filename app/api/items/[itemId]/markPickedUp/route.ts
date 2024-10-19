import { NextRequest, NextResponse } from 'next/server';
import { ItemStatus } from '@prisma/client';
import prisma from '../../../../lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: { itemId: string } }
) {
    const itemId = parseInt(params.itemId, 10);

    try {
        await prisma.item.update({
        where: { id: itemId },
        data: { status: ItemStatus.PICKED_UP },
        });
        return NextResponse.json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}