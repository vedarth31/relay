"use client"

import Link from 'next/link';
import { Key, useEffect, useState } from 'react';
import sanitizeHtml from 'sanitize-html';

interface Email {
    sender: string;
    subject: string;
    body: string;
    orderId: string;
    orderStatus: string;
    trackingNumber: string;
    price: string;
}

const GmailComponent = () => {
    const [emails, setEmails] = useState<Email[]>([]);

    useEffect(() => {
        // sse connection
        const eventSource = new EventSource('/api/notifications');

        eventSource.onmessage = async (event) => {
            const newEmail = JSON.parse(event.data);
            const { historyId } = newEmail;
            console.log('New Email Received:', newEmail);

            try {
                const response = await fetch(`/api/gmail/getEmail?historyId=${historyId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch emails');
                }
                const fetchedEmails: Email[] = await response.json();
                // console.log('Fetched Emails:', fetchedEmails);
                setEmails((prev) => [...fetchedEmails, ...prev]);
            
                // console.log("sending request to openai");
                // const statusResponse = await fetch(`/api/gpt?query=${encodeURIComponent(sanitizeHtml(fetchedEmails[0].body))}`);
                // if (!statusResponse.ok) {
                //     throw new Error('Failed to fetch order status');
                // }
                // const statusData = await statusResponse.json();
                // console.log("statusData", statusData);

                // // Update the order status in emails
                // setEmails((prev) =>
                //     prev.map((email) =>
                //         email.orderId === fetchedEmails[0].orderId ? { ...email, orderStatus: statusData.message } : email
                //     )
                // );


                //
            } catch (err) {
                console.error('Error fetching emails:', err);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    console.log("emails: ", emails);

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
                        <p className="font-semibold mb-2"><strong>Order ID:</strong> {email.orderId}</p>
                        <p className="font-semibold mb-2"><strong>Order Status:</strong> {email.orderStatus}</p>
                        <p className="font-semibold mb-2"><strong>Tracking Number:</strong> {email.trackingNumber}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GmailComponent;
