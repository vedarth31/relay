import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Load credentials from file
async function loadCredentials() {
  try {
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading credentials:', error);
    throw new Error('Failed to load credentials');
  }
}

async function authorize() {
  const credentials = await loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Load existing tokens
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    throw new Error('Token not found. Please authorize the application first.');
  }

  const now = (new Date()).getTime();
  const expiryDate = oAuth2Client.credentials.expiry_date || 0;

  if (expiryDate <= now + 5 * 60 * 1000) {
    const newTokens = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(newTokens.credentials);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(oAuth2Client.credentials, null, 2));
  }

  return oAuth2Client;
}

// List messages function
async function listMessages(auth: OAuth2Client, senders: string[]) {
  const gmail = google.gmail({ version: 'v1', auth });
  const query = senders.map(sender => `from:${sender}`).join(' OR ');

  const res = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 15 });
  const messages = res.data.messages || [];

  if (!messages.length) {
    return [];
  }

  const meenIdPattern = /MEEN - (\d{3})/;
  const statusPattern = /(placed|Placed|ordered|Ordered|shipped|Shipped|delivered|Delivered|received|Received)/;
  const trackingPattern = /FedEx\s+([A-Za-z0-9]+)/;

  const emailData = [];
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

      const idMatch = body.match(meenIdPattern);
      const orderId = idMatch ? "MEEN - " + idMatch[1] : null;

      const statusMatch = body.match(statusPattern);
      const orderStatus = statusMatch ? statusMatch[1] : null;

      const trackingMatch = body.match(trackingPattern);
      const trackingNumber = trackingMatch ? trackingMatch[1] : null;

      emailData.push({
        sender,
        subject,
        snippet,
        body,
        orderId,
        orderStatus,
        trackingNumber,
      });
    }
  }
  return emailData;
}

export async function GET() {
  try {
    const auth: OAuth2Client = await authorize();
    const allowedSenders = [
      'vedarth31@gmail.com',
    ];
    const emails = await listMessages(auth, allowedSenders);
    return NextResponse.json(emails);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
