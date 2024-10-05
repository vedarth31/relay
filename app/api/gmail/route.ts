// import { google } from 'googleapis';
// import { NextResponse } from 'next/server';
// import { OAuth2Client } from 'google-auth-library';
// import { loadOAuthClient } from '@/app/lib/googleAuth';

// async function listMessages(auth: OAuth2Client, senders: string[]) {
//   const gmail = google.gmail({ version: 'v1', auth });
//   const query = senders.map(sender => `from:${sender}`).join(' OR ');

//   const res = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 1 });
//   const messages = res.data.messages || [];

//   if (!messages.length) {
//     return [];
//   }

//   const meenIdPattern = /MEEN - (\d{3})/;
//   const statusPattern = /(placed|Placed|ordered|Ordered|shipped|Shipped|delivered|Delivered|received|Received)/;
//   const trackingPattern = /FedEx\s+([A-Za-z0-9]+)/;

//   const emailData = [];
//   for (const message of messages) {
//     if (message.id) {
//       const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
//       const headers = msg.data.payload?.headers || [];
//       const parts = msg.data.payload?.parts || [];

//       const sender = headers.find(header => header.name === 'From')?.value || 'No sender';
//       const subject = headers.find(header => header.name === 'Subject')?.value || 'No subject';
//       const snippet = msg.data.snippet || '';

//       let body = '';
//       for (const part of parts) {
//         const data = part.body?.data || '';
//         body = Buffer.from(data, 'base64').toString('utf-8');
//       }

//       const idMatch = body.match(meenIdPattern);
//       const orderId = idMatch ? "MEEN - " + idMatch[1] : null;

//       const statusMatch = body.match(statusPattern);
//       const orderStatus = statusMatch ? statusMatch[1] : null;

//       const trackingMatch = body.match(trackingPattern);
//       const trackingNumber = trackingMatch ? trackingMatch[1] : null;

//       emailData.push({
//         sender,
//         subject,
//         snippet,
//         body,
//         orderId,
//         orderStatus,
//         trackingNumber,
//       });
//     }
//   }
//   return emailData;
// }

// export async function GET() {
//   try {
//     const auth: OAuth2Client = await loadOAuthClient();
//     const allowedSenders = [
//       'vedarth31@gmail.com',
//     ];
//     const emails = await listMessages(auth, allowedSenders);
//     return NextResponse.json(emails);
//   } catch (error) {
//     const err = error as Error;
//     return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
//   }
// }