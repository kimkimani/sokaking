import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';

let serverCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 120 * 1000;

export async function GET() {
  console.log('[Next API] GET /api/odds-packs');

  const now = Date.now();
  if (serverCache && (now - serverCache.timestamp < CACHE_TTL_MS)) {
    return NextResponse.json(serverCache.data, {
      headers: { 'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200' },
    });
  }

  try {
    const baseUrl = getApiBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${baseUrl}/api/odds-packs`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`[Next API] GET /api/odds-packs success (${Array.isArray(data) ? data.length : 0} packs)`);

    if (Array.isArray(data) && data.length > 0) {
      serverCache = { data, timestamp: now };
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200' },
    });
  } catch (error: any) {
    console.error('[Next API Error] GET /api/odds-packs:', error.message || error);
    if (serverCache && serverCache.data) {
      return NextResponse.json(serverCache.data, { headers: { 'Cache-Control': 'public, max-age=30' } });
    }
    return NextResponse.json([], { status: 200 });
  }
}

