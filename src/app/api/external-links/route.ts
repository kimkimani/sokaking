import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';
import { defaultExternalLinks } from '../../../data';

export async function GET() {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/external-links`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Backend response status: ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return NextResponse.json(data);
    }
    return NextResponse.json(defaultExternalLinks);
  } catch (error: any) {
    console.warn('[Next API Error] GET /api/external-links fallback:', error.message);
    return NextResponse.json(defaultExternalLinks);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.anchorText || !body.url) {
      return NextResponse.json({ error: 'anchorText and url are required fields' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/external-links`, {
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
    console.error('[Next API Error] POST /api/external-links:', error);
    return NextResponse.json({ error: 'Failed to save external link' }, { status: 500 });
  }
}
