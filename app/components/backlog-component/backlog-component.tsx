'use client';

import React, { useState } from 'react';
import { SerializedOrderWithRelations } from '../order-table/order-table'
import styles from './backlog-component.module.css';

interface BacklogPageProps {
    orders: SerializedOrderWithRelations[];
    items: SerializedItemWithOrder[];
}

interface SerializedItemWithOrder {
    id: number;
    internalItemId: string;
    orderId: number;
    name: string;
    partNumber: string;
    notes: string | null;
    quantity: number;
    price: number;
    priceVerified: boolean;
    vendor: string;
    link: string | null;
    carrier: string | null;
    trackingId: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    order: {
        id: number;
        internalOrderId: string;
        meenOrderId: string | null;
        name: string;
        userId: number;
        subteam: string;
        status: string;
        vendor: string;
        totalCost: number;
        costVerified: boolean;
        comments: string | null;
        createdAt: string;
        updatedAt: string;
    };
}



const BacklogComponent: React.FC<BacklogPageProps> = ({ orders, items }) => {
    const [orderList, setOrderList] = useState(orders);
    const [itemList, setItemList] = useState(items);
    const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);

    // Function to handle marking an order
    const handleMarkOrder = async (orderId: number) => {
        const meenOrderId = prompt('Enter the MEEN Order ID:');
        if (!meenOrderId) return;

        try {
        const response = await fetch(`/api/orders/${orderId}/updateMeenOrderId`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meenOrderId }),
        });

        if (response.ok) {
            // Update local state
            setOrderList((prev) =>
            prev.map((order) =>
                order.id === orderId
                ? { ...order, meenOrderId, status: 'PLACED' }
                : order
            )
            );
        } else {
            alert('Failed to update order.');
        }
        } catch (error) {
        console.error(error);
        alert('An error occurred.');
        }
    };

    // Function to handle marking an item as picked up
    const handleMarkItem = async (itemId: number) => {
        try {
        const response = await fetch(`/api/items/${itemId}/markPickedUp`, {
            method: 'POST',
        });

        if (response.ok) {
            // Remove the item from the list
            setItemList((prev) => prev.filter((item) => item.id !== itemId));
        } else {
            alert('Failed to update item.');
        }
        } catch (error) {
        console.error(error);
        alert('An error occurred.');
        }
    };

    // Function to toggle order expansion
    const toggleExpandOrder = (orderId: number) => {
        setExpandedOrderIds((prev) =>
        prev.includes(orderId)
            ? prev.filter((id) => id !== orderId)
            : [...prev, orderId]
        );
    };

    return (
        <div className={styles.backlogContainer}>
        <h1>Backlog</h1>

        <section className={styles.ordersSection}>
            <h2>Orders to be Placed</h2>
            {orderList.length === 0 ? (
            <p>No orders to display.</p>
            ) : (
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Vendor</th>
                    <th>Total Cost</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {orderList.map((order) => (
                    <React.Fragment key={order.id}>
                    <tr
                        onClick={() => toggleExpandOrder(order.id)}
                        className={styles.orderRow}
                    >
                        <td>{order.id}</td>
                        <td>{order.name}</td>
                        <td>{order.vendor}</td>
                        <td>${order.totalCost.toFixed(2)}</td>
                        <td>
                        <button onClick={() => handleMarkOrder(order.id)}>
                            Mark Order
                        </button>
                        </td>
                    </tr>
                    {expandedOrderIds.includes(order.id) && (
                        <tr>
                        <td colSpan={5}>
                            <table className={styles.itemsTable}>
                            <thead>
                                <tr>
                                <th>Item Name</th>
                                <th>Part Number</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Vendor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.partNumber}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>{item.vendor}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
            )}
        </section>

        <section className={styles.itemsSection}>
            <h2>Items to be Picked Up</h2>
            {itemList.length === 0 ? (
            <p>No items to display.</p>
            ) : (
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Order</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {itemList.map((item) => (
                    <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.order.name}</td>
                    <td>
                        <button onClick={() => handleMarkItem(item.id)}>
                        Mark Item
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </section>
        </div>
    );
};

export default BacklogComponent;