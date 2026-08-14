import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || undefined;
  console.log(`[Next API] GET /api/predictions ${category ? `(category: ${category})` : ''}`);

  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/predictions${category ? `?category=${encodeURIComponent(category)}` : ''}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`[Next API] GET /api/predictions success (${Array.isArray(data) ? data.length : 0} items)`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/predictions:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions', details: error.message },
      { status: 500 }
    );
  }
}
