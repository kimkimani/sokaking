import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function POST(req: NextRequest) {
  console.log('[Next API] POST /api/purchase');
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';

    if (!body.itemType || !body.itemId) {
      return NextResponse.json({ error: 'itemType and itemId are required' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader || `Bearer demo_token:${body.uid || 'guest'}:${body.email || 'guest@sokaking.com'}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] POST /api/purchase:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to record purchase', details: error.message },
      { status: 500 }
    );
  }
}
