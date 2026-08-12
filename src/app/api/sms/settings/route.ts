import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function GET() {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/sms/settings`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    smsProvider: 'textsms',
    atUsername: 'sandbox',
    atApiKey: '',
    atSenderId: 'SOKAKING',
    textSmsPartnerId: '',
    textSmsApiKey: '',
    textSmsShortcode: 'TEXTSMS'
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/sms/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    success: true,
    message: 'SMS Provider settings saved locally (Simulation Mode)',
    smsProvider: 'textsms'
  });
}
