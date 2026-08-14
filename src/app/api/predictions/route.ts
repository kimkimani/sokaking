import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';

// Server-side in-memory cache for sub-10ms response times
let serverCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || undefined;
  console.log(`[Next API] GET /api/predictions ${category ? `(category: ${category})` : ''}`);

  // 1. Deliver cached data immediately if valid and no category filter specified
  const now = Date.now();
  if (!category && serverCache && (now - serverCache.timestamp < CACHE_TTL_MS)) {
    return NextResponse.json(serverCache.data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  }

  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/predictions${category ? `?category=${encodeURIComponent(category)}` : ''}`;

    // Add AbortController timeout guard (3.5s limit)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`[Next API] GET /api/predictions success (${Array.isArray(data) ? data.length : 0} items)`);

    if (!category && Array.isArray(data) && data.length > 0) {
      serverCache = { data, timestamp: now };
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('[Next API Error] GET /api/predictions:', error.message || error);

    // Fallback to stale server cache if backend is slow or unreachable
    if (!category && serverCache && serverCache.data) {
      console.log('[Next API] Serving stale predictions cache fallback');
      return NextResponse.json(serverCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=30',
        },
      });
    }

    return NextResponse.json([], { status: 200 });
  }
}

