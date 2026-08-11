import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

// In-memory prediction_votes store for fallback when external PHP backend is unreachable
const memoryVotesStore: Map<string, { fixtureId: string; userId: string; vote: string }> = new Map();

function calcMemoryVoteStats(fixtureId: string, userId: string) {
  let v1 = 0;
  let vX = 0;
  let v2 = 0;
  let total = 0;
  let userVote: string | null = null;

  for (const item of memoryVotesStore.values()) {
    if (String(item.fixtureId) === String(fixtureId)) {
      total++;
      const v = String(item.vote).trim().toUpperCase();
      if (['1', '1X', 'GG', 'YES'].includes(v) || v.startsWith('OVER') || v.startsWith('OV')) {
        v1++;
      } else if (['X', '12'].includes(v)) {
        vX++;
      } else if (['2', '2X', 'NG', 'NO'].includes(v) || v.startsWith('UNDER') || v.startsWith('UN')) {
        v2++;
      }

      if (userId && String(item.userId) === String(userId)) {
        userVote = item.vote;
      }
    }
  }

  const homePercent = total > 0 ? Math.round((v1 / total) * 100) : 0;
  const drawPercent = total > 0 ? Math.round((vX / total) * 100) : 0;
  const awayPercent = total > 0 ? Math.max(0, 100 - homePercent - drawPercent) : 0;

  return {
    fixtureId: String(fixtureId),
    totalVotes: total,
    votes1: v1,
    votesX: vX,
    votes2: v2,
    homePercent,
    drawPercent,
    awayPercent,
    userVote,
  };
}

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

    const fallbackStats = calcMemoryVoteStats(fixtureId, userId);
    return NextResponse.json(fallbackStats);
  } catch (error: any) {
    const fallbackStats = calcMemoryVoteStats(fixtureId, userId);
    return NextResponse.json(fallbackStats);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fixtureId, vote, userId = 'guest' } = body;

    if (!fixtureId || !vote) {
      return NextResponse.json({ error: 'fixtureId and vote are required' }, { status: 400 });
    }

    // Always update in-memory fallback store
    const storeKey = `${fixtureId}_${userId}`;
    memoryVotesStore.set(storeKey, { fixtureId: String(fixtureId), userId: String(userId), vote: String(vote) });

    const payload = {
      id: body.id || Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000),
      ...body,
    };

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/predictions/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data) {
        return NextResponse.json(data);
      }
    } catch {
      // Remote fetch error handled by returning in-memory stats
    }

    const memoryStats = calcMemoryVoteStats(fixtureId, userId);
    return NextResponse.json({
      success: true,
      stats: memoryStats,
    });
  } catch (error: any) {
    console.error('[Next API Error] POST /api/predictions/vote:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to record vote in database table', details: error.message },
      { status: 500 }
    );
  }
}
