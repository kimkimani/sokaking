import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';


export async function POST(req: NextRequest) {
  console.log('[Next API] POST /api/mpesa/callback');
  try {
    const body = await req.json();
    const baseUrl = getApiBaseUrl();

    const res = await fetch(`${baseUrl}/api/mpesa/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] POST /api/mpesa/callback:', error.message || error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Callback failed' }, { status: 500 });
  }
}
