'use client';

import React, { useState } from 'react';
import styles from './order-table.module.css'
import OrderForm from '../order-form/order-form';

export interface SerializedOrderWithRelations {
    id: number;
    internalOrderId: string;
    meenOrderId: string | null;
    name: string;
    status: string;
    vendor: string;
    totalCost: number;
    costVerified: boolean;
    comments: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string;
        email: string;
        subteam: string;
        role: string;
        createdAt: string;
        updatedAt: string;
    };
    items: {
        id: number;
        internalItemId: string;
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
    }[];
}  

interface OrderTableProps {
    orders: SerializedOrderWithRelations[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
    const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<SerializedOrderWithRelations[]>(orders);
    const [showOrderForm, setShowOrderForm] = useState(false);

    const toggleExpand = (orderId: number) => {
        setExpandedOrderIds((prev) =>
        prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
        );
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            const query = e.target.value.toLowerCase();
            setSearchQuery(query);
            if (query === '') {
            setFilteredOrders(orders);
            } else {
            const filtered = orders.filter((order) => {
                return (
                order.name.toLowerCase().includes(query) ||
                order.vendor.toLowerCase().includes(query) ||
                order.user.subteam.toLowerCase().includes(query) ||
                (order.comments && order.comments.toLowerCase().includes(query)) || // Search in comments
                order.items.some(
                    (item) =>
                    item.name.toLowerCase().includes(query) ||
                    item.vendor.toLowerCase().includes(query) // Search in item.vendor
                )
                );
            });
            setFilteredOrders(filtered);
            }
    };

    return (
        <div className={styles.tableMainContainer}>
            <h1>Purchase Orders</h1>
            <div className={styles.tableSearch}>
                <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                style={{ padding: '5px', fontSize: '16px' }}
                />
                <button className={styles.orderButton} onClick={() => setShowOrderForm(true)}>
                    Place Order
                </button>
            </div>
            {showOrderForm && <OrderForm onClose={() => setShowOrderForm(false)}/>}
            <div className={styles.tableContainer}>
                <table className={styles.tableBody}>
                    <thead className={styles.tableHeader}>
                        <tr>
                        <th>ID</th>
                        <th>Date Placed</th>
                        <th>Name</th>
                        <th>Vendor</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Subteam</th>
                        <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                            <tr
                            onClick={() => toggleExpand(order.id)}
                            className={styles.order}
                            >
                                <td>{order.id}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>{order.name}</td>
                                <td>{order.vendor}</td>
                                <td>${order.totalCost.toFixed(2)}</td>
                                <td>{order.status}</td>
                                <td>{order.user.subteam}</td>
                                <td>{order.comments || 'N/A'}</td>
                            </tr>
                            {expandedOrderIds.includes(order.id) && (
                            <tr>
                                <td colSpan={8}>
                                <div
                                    className={styles.expandedOrder}
                                >
                                    {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={styles.expandedOrderContent}
                                    >
                                        <h4>{item.name}</h4>
                                        <p>Vendor: {item.vendor}</p> 
                                        <p>Price: ${item.price.toFixed(2)}</p>
                                        <p>Status: {item.status}</p>
                                    </div>
                                    ))}
                                </div>
                                </td>
                            </tr>
                            )}
                        </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderTable;