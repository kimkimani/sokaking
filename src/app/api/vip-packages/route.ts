import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';


export async function GET() {
  console.log('[Next API] GET /api/vip-packages');
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/vip-packages`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`[Next API] GET /api/vip-packages success (${Array.isArray(data) ? data.length : 0} packages)`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/vip-packages:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch VIP packages', details: error.message },
      { status: 500 }
    );
  }
}
