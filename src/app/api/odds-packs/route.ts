import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function GET() {
  console.log('[Next API] GET /api/odds-packs');
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/odds-packs`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`[Next API] GET /api/odds-packs success (${Array.isArray(data) ? data.length : 0} packs)`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/odds-packs:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch odds packs', details: error.message },
      { status: 500 }
    );
  }
}
