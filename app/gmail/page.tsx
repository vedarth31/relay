"use client"

import Link from 'next/link';
import { Key, useEffect, useState } from 'react';
import sanitizeHtml from 'sanitize-html';

interface Attachment {
    filename: string;
    mimeType: string;
    data: string;
}

interface Email {
    sender: string;
    subject: string;
    body: string;
    meenId: string;
    orderStatus: string;
    trackingNumber: string;
    price: string;
    attachments: Attachment[];
    carrier: string;
    vendorOrderId: string;
    itemName: string;
    vendorName: string;
}

const GmailComponent = () => {
    const [emails, setEmails] = useState<Email[]>([]);

    // const test_history_id = process.env.TEST_HISTORY_ID;

    useEffect(() => {
        // sse connection
        const eventSource = new EventSource('/api/notifications');

        eventSource.onmessage = async (event) => {
            const newEmail = JSON.parse(event.data);
            // const { historyId } = newEmail;
            console.log('New Email Received:', newEmail);

            const historyId = '38000';
            try {
                const response = await fetch(`/api/gmail/getEmail?historyId=${historyId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch emails');
                }
                const fetchedEmails: Email[] = await response.json();
                setEmails((prev) => [...fetchedEmails, ...prev]);

                const sanitizedQuery = fetchedEmails[0].subject + sanitizeHtml(fetchedEmails[0].body);
                const encodedQuery = encodeURIComponent(sanitizedQuery);
                
                // Log the query to see exactly what is being sent
                console.log("Query being sent to LLM: ", sanitizedQuery);

                const llmResponse = await fetch(`/api/llm?query=${encodedQuery}`);
                if (!llmResponse.ok) {
                    throw new Error('Failed to fetch order status');
                }
                const llmData = await llmResponse.json();

                console.log("Data received from LLM: ", llmData);

                setEmails((prev) =>
                    prev.map((email) =>
                        email.meenId === fetchedEmails[0].meenId
                            ? {
                                ...email,
                                meenId: llmData.meenId || email.meenId,
                                orderStatus: llmData.orderStatus || email.orderStatus,
                                trackingNumber: llmData.trackingNumber || email.trackingNumber,
                                carrier: llmData.carrier || email.carrier,
                                vendorOrderId: llmData.vendorOrderId || email.vendorOrderId,
                                itemName: llmData.itemName || email.itemName,
                                vendorName: llmData.vendorName
                            }
                            : email
                    )
                );

                const updateData = {
                    meenId: llmData.meenId || '', 
                    orderStatus: llmData.orderStatus || '',
                    itemName: llmData.itemName || '',
                    vendorName: llmData.vendorName || '',
                };


                const updateResponse = await fetch('/api/orders/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update order');
                }

                console.log("Order updated successfully");


                // console.log(process.env.DATABASE_URL);


            } catch (err) {
                console.error('Error fetching emails:', err);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div className="p-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-4">Gmail Messages</h1>
                <Link
                    className="border rounded-lg bg-blue-500 text-white py-2 px-4"
                    href="/api/auth"
                >
                    Log In
                </Link>
            </div>
            <ul className="space-y-4">
                {emails[0] && emails.map((email: Email, index: Key) => (
                    <li key={index} className="p-4 border rounded-lg shadow-md bg-gray-200 text-black">
                        <p className="font-semibold mb-2"><strong>From:</strong> {email.sender}</p>
                        <p className="font-semibold mb-2"><strong>Subject:</strong> {email.subject}</p>
                        <div>
                            <strong>Body:</strong>
                            <div
                                className="mt-2"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(email.body)
                                }}
                            />
                        </div>
                        <hr className="border-t-4 border-black my-10 w-full" />
                        <h1 className="font-semibold text-xl mb-4">ORDER INFORMATION</h1>
                        <p className="font-semibold mb-2"><strong>MEEN ID:</strong> {email.meenId}</p>
                        <p className="font-semibold mb-2"><strong>Order Status:</strong> {email.orderStatus || "None"}</p>
                        <p className="font-semibold mb-2"><strong>Tracking Number:</strong> {email.trackingNumber || "None"}</p>
                        <p className="font-semibold mb-2"><strong>Carrier:</strong> {email.carrier || "None"}</p>
                        <p className="font-semibold mb-2"><strong>Vendor Order ID:</strong> {email.vendorOrderId || "None"}</p>
                        <p className="font-semibold mb-2"><strong>Item name:</strong> {email.itemName || "None"}</p>
                        <p className="font-semibold mb-2"><strong>Vendor name:</strong> {email.vendorName || "None"}</p>

                        <h2 className="font-semibold text-lg mt-6">Attachments ({email.attachments?.length || 0})</h2>
                        {/* <ul>
                            {email.attachments?.map((attachment, i) => (
                                <li key={i} className="mb-4">
                                    {attachment.mimeType.startsWith('image/') ? (
                                        <div className="relative w-full h-64">
                                            <Image
                                                src={`data:${attachment.mimeType};base64,${attachment.data}`}
                                                alt={attachment.filename}
                                                layout="fill"
                                                objectFit="contain"
                                            />
                                        </div>
                                    ) : attachment.mimeType === 'application/pdf' ? (
                                        <div className="relative w-full h-96">
                                            <embed
                                                src={`data:${attachment.mimeType};base64,${attachment.data}`}
                                                width="100%"
                                                height="100%"
                                                type="application/pdf"
                                                className="border-2 border-gray-300"
                                            />
                                        </div>
                                    ) : (
                                        <p>{attachment.filename} (non-image attachment)</p>
                                    )}
                                </li>
                            ))}
                        </ul> */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GmailComponent;