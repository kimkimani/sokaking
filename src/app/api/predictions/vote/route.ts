import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';
import fs from 'fs';
import path from 'path';

// Local file store for votes to ensure instant persistence & cross-user sharing
const VOTES_FILE_PATH = path.join('/tmp', 'soka_votes_store.json');

interface StoredVote {
  fixtureId: string;
  userId: string;
  vote: string;
  timestamp: number;
}

function loadLocalVotes(): StoredVote[] {
  try {
    if (fs.existsSync(VOTES_FILE_PATH)) {
      const data = fs.readFileSync(VOTES_FILE_PATH, 'utf-8');
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.warn('[Votes Store] Error reading local votes file:', err);
  }
  return [];
}

function saveLocalVotes(votes: StoredVote[]) {
  try {
    fs.writeFileSync(VOTES_FILE_PATH, JSON.stringify(votes, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Votes Store] Error writing local votes file:', err);
  }
}

function computeLocalStats(fixtureId: string, userId?: string) {
  const allVotes = loadLocalVotes();
  const fixtureVotes = allVotes.filter((v) => String(v.fixtureId) === String(fixtureId));

  let v1 = 0;
  let vX = 0;
  let v2 = 0;

  for (const v of fixtureVotes) {
    const voteKey = (v.vote || '').trim().toUpperCase();
    if (
      voteKey === '1' ||
      voteKey === '1X' ||
      voteKey === 'GG' ||
      voteKey.startsWith('OVER')
    ) {
      v1++;
    } else if (voteKey === 'X' || voteKey === '12') {
      vX++;
    } else if (
      voteKey === '2' ||
      voteKey === '2X' ||
      voteKey === 'NG' ||
      voteKey.startsWith('UNDER')
    ) {
      v2++;
    }
  }

  const total = v1 + vX + v2;
  const hPct = total > 0 ? Math.round((v1 / total) * 100) : 0;
  const dPct = total > 0 ? Math.round((vX / total) * 100) : 0;
  const aPct = total > 0 ? Math.max(0, 100 - hPct - dPct) : 0;

  let userVote: string | null = null;
  if (userId) {
    const userObj = fixtureVotes.slice().reverse().find((v) => String(v.userId) === String(userId));
    if (userObj) {
      userVote = userObj.vote;
    }
  }

  return {
    fixtureId: String(fixtureId),
    totalVotes: total,
    votes1: v1,
    votesX: vX,
    votes2: v2,
    homePercent: hPct,
    drawPercent: dPct,
    awayPercent: aPct,
    userVote,
  };
}

export async function GET(req: NextRequest) {
  const fixtureId = req.nextUrl.searchParams.get('fixtureId') || '';
  const userId = req.nextUrl.searchParams.get('userId') || '';

  if (!fixtureId) {
    return NextResponse.json({ error: 'fixtureId parameter is required' }, { status: 400 });
  }

  // Calculate local server stats
  const localStats = computeLocalStats(fixtureId, userId);

  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const remoteTotal = Number(data.totalVotes || 0);
        // Merge stats if remote server has valid votes, ensuring local user votes are preserved
        const totalVotes = Math.max(remoteTotal, localStats.totalVotes);
        const votes1 = Math.max(Number(data.votes1 || 0), localStats.votes1);
        const votesX = Math.max(Number(data.votesX || 0), localStats.votesX);
        const votes2 = Math.max(Number(data.votes2 || 0), localStats.votes2);
        const combinedTotal = votes1 + votesX + votes2;

        const hPct = combinedTotal > 0 ? Math.round((votes1 / combinedTotal) * 100) : 0;
        const dPct = combinedTotal > 0 ? Math.round((votesX / combinedTotal) * 100) : 0;
        const aPct = combinedTotal > 0 ? Math.max(0, 100 - hPct - dPct) : 0;

        return NextResponse.json({
          fixtureId: String(fixtureId),
          totalVotes: combinedTotal > 0 ? combinedTotal : totalVotes,
          votes1,
          votesX,
          votes2,
          homePercent: hPct,
          drawPercent: dPct,
          awayPercent: aPct,
          userVote: data.userVote || localStats.userVote || null,
        });
      }
    }
  } catch (error: any) {
    console.warn('[Next API Warning] Remote vote fetch failed, using local store:', error.message || error);
  }

  // Return local server store fallback
  return NextResponse.json(localStats);
}

export async function POST(req: NextRequest) {
  try {
    const { fixtureId, userId, vote, isEnded, status } = await req.json();

    if (!fixtureId || !vote) {
      return NextResponse.json({ error: 'fixtureId and vote are required' }, { status: 400 });
    }

    const fidStr = String(fixtureId);
    const uidStr = String(userId || 'guest_' + Math.random().toString(36).substring(2, 9));
    const voteStr = String(vote).trim();

    // 1. Record in local persistent store
    const allVotes = loadLocalVotes();
    const existingIndex = allVotes.findIndex(
      (v) => String(v.fixtureId) === fidStr && String(v.userId) === uidStr
    );

    if (existingIndex >= 0) {
      allVotes[existingIndex] = {
        fixtureId: fidStr,
        userId: uidStr,
        vote: voteStr,
        timestamp: Date.now(),
      };
    } else {
      allVotes.push({
        fixtureId: fidStr,
        userId: uidStr,
        vote: voteStr,
        timestamp: Date.now(),
      });
    }

    saveLocalVotes(allVotes);

    const localStats = computeLocalStats(fidStr, uidStr);

    // 2. Sync to remote PHP MySQL backend
    let remoteStats = null;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/predictions/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ fixtureId: fidStr, userId: uidStr, vote: voteStr, isEnded, status }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.stats) {
          remoteStats = data.stats;
        }
      }
    } catch (err: any) {
      console.warn('[Next API Warning] Remote vote sync failed:', err.message || err);
    }

    const finalStats = remoteStats
      ? {
          fixtureId: fidStr,
          totalVotes: Math.max(Number(remoteStats.totalVotes || 0), localStats.totalVotes),
          votes1: Math.max(Number(remoteStats.votes1 || 0), localStats.votes1),
          votesX: Math.max(Number(remoteStats.votesX || 0), localStats.votesX),
          votes2: Math.max(Number(remoteStats.votes2 || 0), localStats.votes2),
          homePercent: remoteStats.homePercent ?? localStats.homePercent,
          drawPercent: remoteStats.drawPercent ?? localStats.drawPercent,
          awayPercent: remoteStats.awayPercent ?? localStats.awayPercent,
          userVote: voteStr,
        }
      : localStats;

    return NextResponse.json({
      success: true,
      stats: finalStats,
    });
  } catch (error: any) {
    console.error('[Next API Error] POST /api/predictions/vote:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to record community vote', details: error.message },
      { status: 500 }
    );
  }
}
