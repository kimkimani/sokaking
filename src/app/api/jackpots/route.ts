import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function GET() {
  console.log('[Next API] GET /api/jackpots');
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/jackpots`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`[Next API] GET /api/jackpots success (${Array.isArray(data) ? data.length : 0} jackpots)`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/jackpots:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch jackpots', details: error.message },
      { status: 500 }
    );
  }
}
