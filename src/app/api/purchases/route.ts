import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function GET(req: NextRequest) {
  console.log('[Next API] GET /api/purchases');
  try {
    const authHeader = req.headers.get('authorization') || '';
    const baseUrl = getApiBaseUrl();

    const res = await fetch(`${baseUrl}/api/purchases`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader || 'Bearer demo_token:guest_user:guest@sokaking.com',
      },
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/purchases:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases', details: error.message },
      { status: 500 }
    );
  }
}
