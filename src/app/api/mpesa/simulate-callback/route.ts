import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';


export async function POST(req: NextRequest) {
  console.log('[Next API] POST /api/mpesa/simulate-callback');
  try {
    const body = await req.json();
    const { checkoutRequestId, success } = body;
    const authHeader = req.headers.get('authorization') || '';

    if (!checkoutRequestId) {
      return NextResponse.json({ error: 'checkoutRequestId is required' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/mpesa/simulate-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader || 'Bearer demo_token:guest_user:guest@sokaking.com',
      },
      body: JSON.stringify({ checkoutRequestId, success }),
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] POST /api/mpesa/simulate-callback:', error.message || error);
    return NextResponse.json(
      { error: 'Sandbox simulation failure', details: error.message },
      { status: 500 }
    );
  }
}
