import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function GET() {
  try {
    console.log('[Next API] GET /api/partners');
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/partners`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Backend response status: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/partners:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Next API] POST /api/partners');
    const body = await req.json();
    if (!body.name || !body.url || !body.anchorText) {
      return NextResponse.json({ error: 'name, url, and anchorText are required fields' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/partners`, {
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
    console.error('[Next API Error] POST /api/partners:', error);
    return NextResponse.json({ error: 'Failed to add partner' }, { status: 500 });
  }
}
