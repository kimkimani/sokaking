import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function POST(req: NextRequest) {
  try {
    console.log('[Next API] POST /api/contact');
    const body = await req.json();
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/contact`, {
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
    console.error('[Next API Error] POST /api/contact:', error);
    return NextResponse.json({ error: 'Failed to submit contact message' }, { status: 500 });
  }
}
