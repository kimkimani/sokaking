import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../../lib/getApiBaseUrl';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ checkoutRequestId: string }> }
) {
  try {
    const { checkoutRequestId } = await params;
    console.log(`[Next API] GET /api/mpesa/status/${checkoutRequestId}`);
    const authHeader = req.headers.get('authorization') || '';

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/mpesa/status/${encodeURIComponent(checkoutRequestId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader || 'Bearer demo_token:guest_user:guest@sokaking.com',
      },
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
    console.error('[Next API Error] GET /api/mpesa/status:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction status', details: error.message },
      { status: 500 }
    );
  }
}
