import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function GET(req: NextRequest) {
  const fixtureId = req.nextUrl.searchParams.get('fixtureId') || '';
  const userId = req.nextUrl.searchParams.get('userId') || '';

  if (!fixtureId) {
    return NextResponse.json({ error: 'fixtureId parameter is required' }, { status: 400 });
  }

  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const errData = await res.json().catch(() => ({ error: 'Failed to fetch vote stats from database' }));
    return NextResponse.json(errData, { status: res.status });
  } catch (error: any) {
    console.error('[Next API Error] GET /api/predictions/vote:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch vote stats from database table', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fixtureId, vote } = body;

    if (!fixtureId || !vote) {
      return NextResponse.json({ error: 'fixtureId and vote are required' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/predictions/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      return NextResponse.json(data);
    }

    return NextResponse.json(
      data || { error: 'Failed to save vote to database table' },
      { status: res.status || 500 }
    );
  } catch (error: any) {
    console.error('[Next API Error] POST /api/predictions/vote:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to record vote in database table', details: error.message },
      { status: 500 }
    );
  }
}
