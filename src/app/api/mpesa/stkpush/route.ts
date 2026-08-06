import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';


export async function POST(req: NextRequest) {
  console.log('[Next API] POST /api/mpesa/stkpush');
  try {
    const body = await req.json();
    const { phoneNumber, amount, itemType, itemId } = body;
    const authHeader = req.headers.get('authorization') || '';

    if (!phoneNumber || !amount || !itemType || !itemId) {
      return NextResponse.json({ error: 'phoneNumber, amount, itemType and itemId are required' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader || `Bearer demo_token:guest:${body.email || 'guest@sokaking.com'}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] POST /api/mpesa/stkpush:', error.message || error);
    return NextResponse.json(
      { error: 'M-Pesa STK Push initiation failed', details: error.message },
      { status: 500 }
    );
  }
}
