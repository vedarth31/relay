import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { loadOAuthClient } from '../../../lib/googleAuth';

async function fetchEmails(auth: OAuth2Client, historyId: string) {
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
        userId: 'me',
        q: `after:${historyId}`,
        maxResults: 1
    });

    const messages = res.data.messages || [];
    const emailData = [];

    // const meenIdPattern = /MEEN - (\d{3})/;
    // const statusPattern = /(placed|Placed|ordered|Ordered|shipped|Shipped|delivered|Delivered|received|Received)/;
    // const trackingPattern = /FedEx\s+([A-Za-z0-9]+)/;
  
    for (const message of messages) {
      if (message.id) {
        const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
        const headers = msg.data.payload?.headers || [];
        const parts = msg.data.payload?.parts || [];
  
        const sender = headers.find(header => header.name === 'From')?.value || 'No sender';
        const subject = headers.find(header => header.name === 'Subject')?.value || 'No subject';
        const snippet = msg.data.snippet || '';
  
        let body = '';
        for (const part of parts) {
          const data = part.body?.data || '';
          body = Buffer.from(data, 'base64').toString('utf-8');
        }
  
        // const idMatch = body.match(meenIdPattern);
        // const orderId = idMatch ? "MEEN - " + idMatch[1] : null;
  
        // const statusMatch = body.match(statusPattern);
        // const orderStatus = statusMatch ? statusMatch[1] : null;
  
        // const trackingMatch = body.match(trackingPattern);
        // const trackingNumber = trackingMatch ? trackingMatch[1] : null;
  
        emailData.push({
          sender,
          subject,
          snippet,
          body,
          // orderId,
          // orderStatus,
          // trackingNumber,
        });
      }
    }

    return emailData;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const historyId = searchParams.get('historyId');

        if (!historyId) {
            return NextResponse.json({ error: 'Missing historyId parameter' }, { status: 400 });
        }

        const auth: OAuth2Client = await loadOAuthClient();
        const emails = await fetchEmails(auth, historyId);
        return NextResponse.json(emails);
    } catch (error) {
        const err = error as Error;
        console.error('Error fetching emails:', err);
        return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
    }
}
