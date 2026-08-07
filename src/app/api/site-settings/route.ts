import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function GET() {
  try {
    console.log('[Next API] GET /api/site-settings');
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/site-settings`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Backend response status: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/site-settings:', error);
    return NextResponse.json({
      siteName: 'SOKA Predictions',
      email: 'support@sokapredictions.co.ke',
      phone: '+254740841375',
      whatsapp: '+254740841375',
      telegram: 'https://t.me/sokapredictions',
      facebook: 'https://facebook.com/sokapredictions',
      twitter: 'https://x.com/sokapredictions',
      instagram: 'https://instagram.com/sokapredictions',
      address: 'Nairobi, Kenya',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Next API] POST /api/site-settings');
    const body = await req.json();
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/site-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Backend response status: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] POST /api/site-settings:', error);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}
