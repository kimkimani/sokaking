import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';


export async function GET(req: NextRequest) {
  const fixtureId = req.nextUrl.searchParams.get('fixtureId') || '';
  const userId = req.nextUrl.searchParams.get('userId') || '';
  console.log(`[Next API] GET /api/predictions/vote (fixtureId: ${fixtureId}, userId: ${userId})`);

  if (!fixtureId) {
    return NextResponse.json({ error: 'fixtureId parameter is required' }, { status: 400 });
  }

  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] GET /api/predictions/vote:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch vote statistics', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fixtureId, userId, vote } = await req.json();
    console.log(`[Next API] POST /api/predictions/vote (fixtureId: ${fixtureId}, vote: ${vote})`);

    if (!fixtureId || !vote) {
      return NextResponse.json({ error: 'fixtureId and vote are required' }, { status: 400 });
    }
    if (!['1', 'X', '2'].includes(vote)) {
      return NextResponse.json({ error: 'Invalid vote value. Must be "1", "X", or "2"' }, { status: 400 });
    }

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/predictions/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ fixtureId, userId, vote }),
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Next API Error] POST /api/predictions/vote:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to record community vote', details: error.message },
      { status: 500 }
    );
  }
}
