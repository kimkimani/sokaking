import { jackpotsData, JackpotConfig } from '../jackpotsData';
import { Fixture } from '../types';
import { 
  expandTodayFixturesTags, 
  expandTodayFixturesTagsAsync,
  fetchLiveTodayFixtures,
  getTopTwoTodayFixturesText, 
  getTodayLeaguesText, 
  getTodayPredictionsSummaryText, 
  getTodayPredictionsCountText,
  getTodayTags 
} from './todayFixturesTags';

export {
  expandTodayFixturesTags,
  expandTodayFixturesTagsAsync,
  fetchLiveTodayFixtures,
  getTopTwoTodayFixturesText,
  getTodayLeaguesText,
  getTodayPredictionsSummaryText,
  getTodayPredictionsCountText,
  getTodayTags
};

export interface FormattedConfidenceFixture {
  fixture: Fixture;
  tipSymbol: string;
  isHighestConfidence: boolean;
  matchHeader: string;
  description: string;
}

// In-memory cache for live database jackpot fixtures
let liveMegaJackpotFixturesCache: Fixture[] | null = null;
const liveJackpotsCache: Record<string, Fixture[]> = {};
const lastLiveFetchTimes: Record<string, number> = {};
let lastLiveFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

/**
 * Manually update the live jackpot fixtures cache (called by App.tsx or dataStore when DB data arrives).
 */
export function setLiveJackpotFixturesCache(fixtures: Fixture[], jackpotId: string = 'sportpesa-mega'): void {
  const resolved = resolveJackpotId(jackpotId, 'sportpesa-mega');
  if (Array.isArray(fixtures) && fixtures.length > 0) {
    liveJackpotsCache[resolved] = fixtures;
    lastLiveFetchTimes[resolved] = Date.now();
    if (resolved === 'sportpesa-mega') {
      liveMegaJackpotFixturesCache = fixtures;
      lastLiveFetchTime = Date.now();
    }
  }
}

/**
 * Get the timestamp of the last live database fixtures fetch.
 */
export function getLastLiveFetchTime(jackpotId: string = 'sportpesa-mega'): number {
  const resolved = resolveJackpotId(jackpotId, 'sportpesa-mega');
  return lastLiveFetchTimes[resolved] || lastLiveFetchTime;
}

/**
 * Get current cached database fixtures if available for a specific jackpot.
 */
export function getCachedLiveJackpotFixtures(jackpotId: string = 'sportpesa-mega'): Fixture[] | null {
  const resolved = resolveJackpotId(jackpotId, 'sportpesa-mega');
  return liveJackpotsCache[resolved] || (resolved === 'sportpesa-mega' ? liveMegaJackpotFixturesCache : null);
}

/**
 * Helper to parse raw API fixture into standard typed Fixture.
 */
function parseApiFixture(f: any, idx: number): Fixture {
  return {
    id: f.id || idx + 1,
    fixtureNumber: f.fixtureNumber || f.position || idx + 1,
    homeTeam: f.homeTeam || f.home_team_name || 'Home Team',
    awayTeam: f.awayTeam || f.away_team_name || 'Away Team',
    prediction: f.tip || f.prediction || '1',
    confidence: Number(f.confidence) || 75,
    leagueName: f.leagueName || f.league || '',
    countryName: f.countryName || f.country || '',
    kickoffTime: f.kickoffTime || f.date || '',
    status: f.status || 'NS',
    result: f.result || 'pending',
    homeScore: f.homeScore !== undefined ? f.homeScore : '-',
    awayScore: f.awayScore !== undefined ? f.awayScore : '-'
  };
}

/**
 * Actively fetches jackpot fixtures directly from the database API for any jackpot ID.
 */
export async function fetchLiveJackpotFixtures(
  jackpotId: string = 'sportpesa-mega',
  forceRefresh: boolean = false
): Promise<Fixture[]> {
  const resolved = resolveJackpotId(jackpotId, 'sportpesa-mega');
  const now = Date.now();
  const lastFetch = lastLiveFetchTimes[resolved] || 0;

  if (!forceRefresh && liveJackpotsCache[resolved]?.length && (now - lastFetch < CACHE_TTL_MS)) {
    return liveJackpotsCache[resolved];
  }

  try {
    const isBrowser = typeof window !== 'undefined';
    const baseUrl = isBrowser ? '' : 'https://cheerplex.co.ke/soka_king';
    const endpoint = isBrowser ? '/api/jackpots' : `${baseUrl}/api/jackpots`;

    const res = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const itemResolvedId = resolveJackpotId(item.id || item.slug || item.name, '');
          if (itemResolvedId && Array.isArray(item.fixtures) && item.fixtures.length > 0) {
            const parsed = item.fixtures.map(parseApiFixture);
            liveJackpotsCache[itemResolvedId] = parsed;
            lastLiveFetchTimes[itemResolvedId] = now;
            if (itemResolvedId === 'sportpesa-mega') {
              liveMegaJackpotFixturesCache = parsed;
              lastLiveFetchTime = now;
            }
          }
        }

        if (liveJackpotsCache[resolved]?.length) {
          return liveJackpotsCache[resolved];
        }
      }
    }
  } catch (err) {
    console.warn('[topJackpotFixtures] Warning fetching live database fixtures:', err);
  }

  if (liveJackpotsCache[resolved]?.length) {
    return liveJackpotsCache[resolved];
  }
  if (resolved === 'sportpesa-mega' && liveMegaJackpotFixturesCache?.length) {
    return liveMegaJackpotFixturesCache;
  }

  const fallback = jackpotsData.find(j => j.id === resolved || j.slug === resolved) ||
                   jackpotsData.find(j => j.id === 'sportpesa-mega') ||
                   jackpotsData[0];
  return fallback?.fixtures || [];
}

/**
 * Actively fetches the current SportPesa Mega Jackpot fixtures and predictions directly from the database API.
 */
export async function fetchLiveMegaJackpotFixtures(forceRefresh: boolean = false): Promise<Fixture[]> {
  return fetchLiveJackpotFixtures('sportpesa-mega', forceRefresh);
}

// Preload database fixtures in background if fetch is available
if (typeof fetch !== 'undefined') {
  fetchLiveJackpotFixtures('sportpesa-mega').catch(() => {});
}

/**
 * Resolves fixtures for a given source (either direct Fixture array, or jackpot ID).
 */
export function getFixturesForJackpot(
  source?: string | Fixture[],
  explicitJackpotId?: string
): { jackpotId: string; fixtures: Fixture[] } {
  if (Array.isArray(source) && source.length > 0) {
    const jackpotId = resolveJackpotId(explicitJackpotId, 'sportpesa-mega');
    return { jackpotId, fixtures: source };
  }
  const jackpotId = resolveJackpotId(
    typeof source === 'string' ? source : explicitJackpotId,
    'sportpesa-mega'
  );
  const cached = getCachedLiveJackpotFixtures(jackpotId);
  if (cached && cached.length > 0) {
    return { jackpotId, fixtures: cached };
  }
  const found = jackpotsData.find(j => j.id === jackpotId || j.slug === jackpotId);
  return { jackpotId, fixtures: found?.fixtures || [] };
}

/**
 * Cleans and formats team names for natural casing (e.g., "ST Johnstone" -> "St Johnstone").
 */
export function cleanTeamName(name: string): string {
  if (!name) return '';
  let cleaned = name.trim();
  if (/^st\s+/i.test(cleaned)) {
    cleaned = 'St ' + cleaned.slice(3).trim();
  }
  return cleaned;
}

interface CuratedPickDefinition {
  homeKeyword: string;
  awayKeyword: string;
  tip: string;
  isHighest?: boolean;
  customExplanation?: string;
}

const SPORTPESA_MEGA_TARGET_PICKS: CuratedPickDefinition[] = [
  {
    homeKeyword: 'Parma',
    awayKeyword: 'Monza',
    tip: '1',
    customExplanation: 'Parma Home to grab a win'
  },
  {
    homeKeyword: 'Frosinone',
    awayKeyword: 'Venezia',
    tip: 'DC1X',
    customExplanation: 'Frosinone Home team to win or match to end as a Draw'
  },
  {
    homeKeyword: 'Johnstone',
    awayKeyword: 'Hibernian',
    tip: 'DC2',
    customExplanation: 'Hibernian Away team to get a win'
  },
  {
    homeKeyword: 'Malaga',
    awayKeyword: 'Levante',
    tip: 'X',
    customExplanation: 'Match to end as a draw. No Win here, just a plain Draw'
  },
  {
    homeKeyword: 'Espanyol',
    awayKeyword: 'Sevilla',
    tip: 'DC2X',
    customExplanation: 'away (Sevilla) to win or match to end draw'
  },
  {
    homeKeyword: 'Rayo',
    awayKeyword: 'Racing',
    tip: 'DCX2',
    customExplanation: 'Any team to win. The match will is predicted to end as a double chance with Home or away Win'
  },
  {
    homeKeyword: 'Everton',
    awayKeyword: 'Manchester',
    tip: '2',
    isHighest: true,
    customExplanation: 'This is the most current interesting game on this sportpesa meja jackpot prediction. Away team to Win'
  }
];

/**
 * Normalizes any jackpot fixture prediction string into standard betting tip symbols (1, X, 2, DC1X, DC2X, DCX2, DC2).
 */
export function normalizeTipSymbol(prediction: string): string {
  if (!prediction) return '1';
  const clean = prediction.trim();

  // Exact shorthands
  if (/^dcx2$/i.test(clean) || /^dc12$/i.test(clean) || clean === '12') return 'DCX2';
  if (/^dc2x$/i.test(clean) || /^x2$/i.test(clean) || clean === '2X') return 'DC2X';
  if (/^dc1x$/i.test(clean) || /^1x$/i.test(clean) || clean === 'X1') return 'DC1X';
  if (/^dc2$/i.test(clean)) return 'DC2';
  if (/^dc1$/i.test(clean)) return '1';

  // Double chance phrases
  if (/double\s*chance/i.test(clean) || /dc/i.test(clean)) {
    if (/1x|x1/i.test(clean)) return 'DC1X';
    if (/x2|2x/i.test(clean)) return 'DC2X';
    if (/12/i.test(clean)) return 'DCX2';
    return 'DC1X';
  }

  // 1X2 checks
  if (/home\s*win|\(1\)|^1$/i.test(clean)) return '1';
  if (/away\s*win|\(2\)|^2$/i.test(clean)) return '2';
  if (/draw|\(x\)|^x$/i.test(clean)) return 'X';

  return clean;
}

/**
 * Generates natural, human-readable explanatory text for a fixture based on its tip and confidence.
 * Adheres strictly to the user's requested wording rules:
 * - 1: "[Home] Home to grab a win"
 * - DC1X: "[Home] Home team to win or match to end as a Draw"
 * - DC2 / 2: "[Away] Away team to get a win"
 * - X: "Match to end as a draw. No Win here, just a plain Draw"
 * - DC2X: "away ([Away]) to win or match to end draw"
 * - DCX2: "Any team to win. The match will is predicted to end as a double chance with Home or away Win"
 * - Highest confidence: "This is the most current interesting game on this sportpesa meja jackpot prediction. Away team to Win" (or appropriate outcome)
 */
export function getPredictionExplanation(
  fixture: Fixture,
  tipSymbol: string,
  isHighestConfidence: boolean
): string {
  const home = fixture.homeTeam.trim();
  const away = fixture.awayTeam.trim();

  if (isHighestConfidence) {
    const prefix = 'This is the most current interesting game on this sportpesa meja jackpot prediction. ';
    switch (tipSymbol) {
      case '1':
        return `${prefix}Home team to Win`;
      case '2':
      case 'DC2':
        return `${prefix}Away team to Win`;
      case 'X':
        return `${prefix}Match to end as a Draw`;
      case 'DC1X':
        return `${prefix}${home} Home team to win or match to end as a Draw`;
      case 'DC2X':
        return `${prefix}away (${away}) to win or match to end draw`;
      case 'DCX2':
      case 'DC12':
        return `${prefix}Any team to win. The match will is predicted to end as a double chance with Home or away Win`;
      default:
        return `${prefix}Away team to Win`;
    }
  }

  // Standard high-confidence matches (top 5 to 7)
  switch (tipSymbol) {
    case '1':
      return `${home} Home to grab a win`;
    case '2':
    case 'DC2':
      return `${away} Away team to get a win`;
    case 'X':
      return `Match to end as a draw. No Win here, just a plain Draw`;
    case 'DC1X':
      return `${home} Home team to win or match to end as a Draw`;
    case 'DC2X':
      return `away (${away}) to win or match to end draw`;
    case 'DCX2':
    case 'DC12':
      return `Any team to win. The match will is predicted to end as a double chance with Home or away Win`;
    default:
      return `${home} Home to grab a win`;
  }
}

/**
 * Retrieves the top 5 to 7 fixtures with the highest confidence scores from the jackpot database.
 * Formats the match header and description, and places the highest confidence game as the featured climax.
 */
export function getTopConfidenceJackpotFixtures(
  source?: string | Fixture[],
  count: number = 7,
  highestAtEnd: boolean = true
): FormattedConfidenceFixture[] {
  const { jackpotId, fixtures } = getFixturesForJackpot(source);

  if (!fixtures || fixtures.length === 0) {
    return [];
  }

  // 1. For SportPesa Mega, check if fixtures match the curated target picks
  if (jackpotId === 'sportpesa-mega') {
    const matchingCurated: FormattedConfidenceFixture[] = [];
    for (const target of SPORTPESA_MEGA_TARGET_PICKS) {
      const found = fixtures.find(f =>
        f.homeTeam.toLowerCase().includes(target.homeKeyword.toLowerCase()) &&
        f.awayTeam.toLowerCase().includes(target.awayKeyword.toLowerCase())
      );
      if (found) {
        const home = cleanTeamName(found.homeTeam);
        const away = cleanTeamName(found.awayTeam);
        const isHighest = !!target.isHighest;
        const suffix = isHighest ? ' (The game with the highest confidence score)' : '';
        const matchHeader = `${home} vs ${away} — ${target.tip}${suffix}`;
        const description = target.customExplanation || getPredictionExplanation({ ...found, homeTeam: home, awayTeam: away }, target.tip, isHighest);

        matchingCurated.push({
          fixture: { ...found, homeTeam: home, awayTeam: away },
          tipSymbol: target.tip,
          isHighestConfidence: isHighest,
          matchHeader,
          description
        });
      }
    }

    if (matchingCurated.length >= 4) {
      return matchingCurated;
    }
  }

  // 2. Generic dynamic confidence ranking for any jackpot
  const targetCount = Math.min(Math.max(count || 7, 3), Math.min(fixtures.length, 20));

  // Sort by confidence descending
  const sorted = [...fixtures].sort((a, b) => (Number(b.confidence) || 0) - (Number(a.confidence) || 0));
  const topSlice = sorted.slice(0, targetCount);

  if (topSlice.length === 0) return [];

  // Identify the highest confidence fixture among the top set
  const maxConfidence = Math.max(...topSlice.map(f => Number(f.confidence) || 0));
  const highestFixture = topSlice.find(f => (Number(f.confidence) || 0) === maxConfidence) || topSlice[0];

  // Build formatted objects
  const otherFixtures = topSlice.filter(f => f.id !== highestFixture.id);

  const formatFixture = (fixture: Fixture, isHighest: boolean): FormattedConfidenceFixture => {
    const rawTip = (fixture as any).tip || fixture.prediction || '1';
    const tipSymbol = normalizeTipSymbol(rawTip);
    const suffix = isHighest ? ' (The game with the highest confidence score)' : '';
    const home = cleanTeamName(fixture.homeTeam);
    const away = cleanTeamName(fixture.awayTeam);
    const matchHeader = `${home} vs ${away} — ${tipSymbol}${suffix}`;
    const description = getPredictionExplanation({ ...fixture, homeTeam: home, awayTeam: away }, tipSymbol, isHighest);

    return {
      fixture: { ...fixture, homeTeam: home, awayTeam: away },
      tipSymbol,
      isHighestConfidence: isHighest,
      matchHeader,
      description
    };
  };

  const formattedOthers = otherFixtures.map(f => formatFixture(f, false));
  const formattedHighest = formatFixture(highestFixture, true);

  if (highestAtEnd) {
    return [...formattedOthers, formattedHighest];
  } else {
    return [formattedHighest, ...formattedOthers];
  }
}

/**
 * Generates the clean markdown text string for the top confidence jackpot fixtures.
 * Matches the exact formatting pattern requested:
 * 
 * Home vs Away — Tip
 * 
 * Explanation text
 */
export function generateTopConfidenceFixturesMarkdown(
  source?: string | Fixture[],
  count: number = 7
): string {
  const fixtures = getTopConfidenceJackpotFixtures(source, count, true);
  if (fixtures.length === 0) return '';

  return fixtures
    .map(item => `${item.matchHeader}\n\n${item.description}`)
    .join('\n\n\n');
}

export interface FixtureVoteConsensus {
  mostSelectedTip: string;
  mostSelectedPercent: number;
  totalVotes: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
}

/**
 * Derives realistic or live vote statistics and identifies the community's most selected prediction.
 */
export function getFixtureVoteConsensus(fixture: Fixture): FixtureVoteConsensus {
  // 1. Check explicit probabilities on fixture
  const pHome = Number(fixture.probabilities?.home || (fixture as any).homeProb || (fixture as any).percentPredHome || 0);
  const pDraw = Number(fixture.probabilities?.draw || (fixture as any).drawProb || (fixture as any).percentPredDraw || 0);
  const pAway = Number(fixture.probabilities?.away || (fixture as any).awayProb || (fixture as any).percentPredAway || 0);

  let hPct = 0;
  let dPct = 0;
  let aPct = 0;
  const fixtureSeed = Number(fixture.id || 1);
  const totalVotes = 1250 + ((fixtureSeed * 89) % 1500);

  if (pHome + pDraw + pAway > 0) {
    const sum = pHome + pDraw + pAway;
    hPct = Math.round((pHome / sum) * 100);
    dPct = Math.round((pDraw / sum) * 100);
    aPct = Math.max(0, 100 - hPct - dPct);
  } else {
    // Deterministic realistic distribution based on fixture ID, prediction, and confidence
    const conf = Math.min(Math.max(Number(fixture.confidence) || 75, 50), 96);
    const rawTip = String(fixture.prediction || '1').toUpperCase().trim();
    const seed = (fixtureSeed * 13) % 9;

    if (rawTip.startsWith('1') || rawTip === 'DC1X' || rawTip === 'DC12') {
      hPct = Math.min(82, Math.max(48, Math.round(conf * 0.70 + seed)));
      dPct = Math.min(30, Math.max(16, Math.round((100 - hPct) * 0.55)));
      aPct = Math.max(0, 100 - hPct - dPct);
    } else if (rawTip.startsWith('2') || rawTip === 'DCX2' || rawTip === 'DC2') {
      aPct = Math.min(80, Math.max(46, Math.round(conf * 0.68 + seed)));
      dPct = Math.min(30, Math.max(16, Math.round((100 - aPct) * 0.52)));
      hPct = Math.max(0, 100 - aPct - dPct);
    } else {
      // Draw 'X'
      dPct = Math.min(55, Math.max(42, Math.round(conf * 0.58 + seed)));
      hPct = Math.min(34, Math.max(24, Math.round((100 - dPct) * 0.54)));
      aPct = Math.max(0, 100 - dPct - hPct);
    }
  }

  // Determine which outcome has the highest percentage
  let mostSelectedTip = '1';
  let mostSelectedPercent = hPct;

  if (dPct > mostSelectedPercent && dPct >= aPct) {
    mostSelectedTip = 'X';
    mostSelectedPercent = dPct;
  } else if (aPct > mostSelectedPercent) {
    mostSelectedTip = '2';
    mostSelectedPercent = aPct;
  }

  return {
    mostSelectedTip,
    mostSelectedPercent,
    totalVotes,
    homePercent: hPct,
    drawPercent: dPct,
    awayPercent: aPct
  };
}

/**
 * Returns the human-readable outcome label for a tip symbol (e.g. '1' -> 'Home', '2' -> 'Away', 'X' -> 'Draw').
 */
export function getVoteOutcomeLabel(tip: string): string {
  const clean = String(tip || '1').toUpperCase().trim();
  if (clean === '1') return 'Home';
  if (clean === 'X') return 'Draw';
  if (clean === '2') return 'Away';
  if (clean === '1X' || clean === 'DC1X') return 'Home/Draw';
  if (clean === 'X2' || clean === 'DCX2') return 'Draw/Away';
  if (clean === '12' || clean === 'DC12') return 'Home/Away';
  return clean;
}

export interface FormattedAllFixtureItem {
  fixture: Fixture;
  gameNumber: number;
  homeTeam: string;
  awayTeam: string;
  tipSymbol: string;
  confidence: number;
  voteConsensus: FixtureVoteConsensus;
  isDisclosed: boolean;
  isVipLocked: boolean;
  matchHeader: string;
  description: string;
}

/**
 * Returns all jackpot fixtures for a given source, calculating:
 * - Confidence scores
 * - Most selected prediction from community votes
 * - Partial disclosure: only 2/3 prediction values revealed, the remaining 1/3 replaced with Join VIP button
 */
export function getAllJackpotFixtures(
  source?: string | Fixture[],
  explicitJackpotId?: string
): FormattedAllFixtureItem[] {
  const { jackpotId, fixtures } = getFixturesForJackpot(source, explicitJackpotId);
  if (!fixtures || fixtures.length === 0) {
    return [];
  }

  const total = fixtures.length;
  // Partial disclosure: only show 2/3 prediction values, the rest have a join vip button
  const disclosedCount = Math.round((total * 2) / 3);

  return fixtures.map((fixture, idx) => {
    const gameNumber = fixture.fixtureNumber || idx + 1;
    const homeTeam = cleanTeamName(fixture.homeTeam);
    const awayTeam = cleanTeamName(fixture.awayTeam);
    const leagueName = fixture.leagueName || (fixture as any).league || (fixture as any).competition || '';
    const leagueSuffix = leagueName ? ` (${leagueName})` : '';
    const confidence = Math.min(Math.max(Number(fixture.confidence) || 75, 50), 99);
    const voteConsensus = getFixtureVoteConsensus(fixture);
    const isDisclosed = idx < disclosedCount;
    const isVipLocked = !isDisclosed;
    const rawTip = normalizeTipSymbol((fixture as any).tip || fixture.prediction || '1');
    const tipSymbol = isDisclosed ? rawTip : 'VIP';
    const tipDisplay = isDisclosed ? rawTip : '[⭐ Join VIP](/vip-packages)';
    const confidenceDisplay = isDisclosed ? `${confidence}%` : '🔒 VIP';
    const userVoteTip = voteConsensus.mostSelectedTip;
    const userVoteLabel = getVoteOutcomeLabel(userVoteTip);
    const userVotesFormatted = `${userVoteTip} (${userVoteLabel})`;

    // Clearly mark and label SokaKing Tip, Confidence, and Community Votes
    const matchHeader = `Game ${gameNumber}: ${homeTeam} vs ${awayTeam}${leagueSuffix} — SokaKing Tip: ${tipDisplay} (Confidence: ${confidenceDisplay} | Community Votes: ${userVotesFormatted})`;

    // Strictly adhere to top confidence fixtures text format, highlighting fixture tip
    const description = isDisclosed
      ? `**Fixture Tip: ${rawTip}** — ${getPredictionExplanation({ ...fixture, homeTeam, awayTeam }, rawTip, false)}`
      : `**Fixture Tip: [⭐ Join VIP](/vip-packages)** — **Confidence: 🔒 VIP** — Unlock this confidential fixture prediction, VIP analysis, and 3 double-chance combo slips on [SportPesa MJP Prediction](https://sokaking.com/sportpesa-mjp-prediction).`;

    return {
      fixture: { ...fixture, homeTeam, awayTeam },
      gameNumber,
      homeTeam,
      awayTeam,
      tipSymbol,
      confidence,
      voteConsensus,
      isDisclosed,
      isVipLocked,
      matchHeader,
      description
    };
  });
}

/**
 * Generates the clean markdown representation for all mega jackpot fixtures.
 * Shows all fixtures with confidence scores and community vote consensus,
 * revealing 2/3 of prediction values and replacing the remaining 1/3 with a Join VIP button.
 */
export function generateAllJackpotFixturesMarkdown(
  source?: string | Fixture[],
  explicitJackpotId?: string
): string {
  const items = getAllJackpotFixtures(source, explicitJackpotId);
  if (items.length === 0) return '';

  return items
    .map(item => `${item.matchHeader}\n\n${item.description}`)
    .join('\n\n\n');
}

/**
 * Checks whether a given tip or prediction string represents a double chance selection.
 */
export function isDoubleChanceTip(tip: string): boolean {
  if (!tip) return false;
  const clean = tip.trim().toUpperCase();
  return (
    clean.startsWith('DC') ||
    clean === '1X' ||
    clean === 'X2' ||
    clean === '2X' ||
    clean === '12' ||
    clean === 'X1' ||
    clean.includes('/') ||
    clean.includes('&') ||
    clean.toLowerCase().includes('double chance')
  );
}

/**
 * Retrieves only fixtures with double chance predictions (e.g. DC1X, DC2X, DCX2, DC2, 1X, X2, 12).
 * Formats match header and description accordingly.
 */
export function getDoubleChanceJackpotFixtures(
  source?: string | Fixture[],
  count?: number
): FormattedConfidenceFixture[] {
  const { jackpotId, fixtures } = getFixturesForJackpot(source);

  if (!fixtures || fixtures.length === 0) {
    return [];
  }

  // 1. Curated picks matching double-chance targets for SportPesa Mega
  if (jackpotId === 'sportpesa-mega') {
    const matchingCurated: FormattedConfidenceFixture[] = [];
    for (const target of SPORTPESA_MEGA_TARGET_PICKS) {
      if (!isDoubleChanceTip(target.tip)) continue;

      const found = fixtures.find(f =>
        f.homeTeam.toLowerCase().includes(target.homeKeyword.toLowerCase()) &&
        f.awayTeam.toLowerCase().includes(target.awayKeyword.toLowerCase())
      );
      if (found) {
        const home = cleanTeamName(found.homeTeam);
        const away = cleanTeamName(found.awayTeam);
        const isHighest = !!target.isHighest;
        const suffix = isHighest ? ' (The game with the highest confidence score)' : '';
        const matchHeader = `${home} vs ${away} — ${target.tip}${suffix}`;
        const description = target.customExplanation || getPredictionExplanation({ ...found, homeTeam: home, awayTeam: away }, target.tip, isHighest);

        matchingCurated.push({
          fixture: { ...found, homeTeam: home, awayTeam: away },
          tipSymbol: target.tip,
          isHighestConfidence: isHighest,
          matchHeader,
          description
        });
      }
    }

    if (matchingCurated.length > 0) {
      return typeof count === 'number' && count > 0 ? matchingCurated.slice(0, count) : matchingCurated;
    }
  }

  // 2. Generic dynamic fallback from live fixtures with double chance tips
  const dcFixtures: FormattedConfidenceFixture[] = [];
  for (const f of fixtures) {
    const rawTip = (f as any).tip || f.prediction || '';
    const tipSymbol = normalizeTipSymbol(rawTip);
    if (isDoubleChanceTip(tipSymbol) || isDoubleChanceTip(rawTip)) {
      const home = cleanTeamName(f.homeTeam);
      const away = cleanTeamName(f.awayTeam);
      const matchHeader = `${home} vs ${away} — ${tipSymbol}`;
      const description = getPredictionExplanation({ ...f, homeTeam: home, awayTeam: away }, tipSymbol, false);
      dcFixtures.push({
        fixture: { ...f, homeTeam: home, awayTeam: away },
        tipSymbol,
        isHighestConfidence: false,
        matchHeader,
        description
      });
    }
  }

  if (dcFixtures.length > 0) {
    return typeof count === 'number' && count > 0 ? dcFixtures.slice(0, count) : dcFixtures;
  }

  // 3. Intelligent fallback: if no explicit double chance predictions exist, pick competitive fixtures
  const sortedCompetitive = [...fixtures].sort((a, b) => {
    const confA = Number(a.confidence) || 50;
    const confB = Number(b.confidence) || 50;
    return Math.abs(confA - 50) - Math.abs(confB - 50);
  });

  const targetCount = Math.min(count || 4, Math.min(sortedCompetitive.length, 6));
  const chosen = sortedCompetitive.slice(0, targetCount);

  return chosen.map((f, idx) => {
    const rawTip = (f as any).tip || f.prediction || '1';
    let tipSymbol = 'DC1X';
    if (rawTip === '2') tipSymbol = 'DC2X';
    else if (rawTip === 'X' || idx % 2 === 1) tipSymbol = 'DC1X';
    else tipSymbol = 'DCX2';

    const home = cleanTeamName(f.homeTeam);
    const away = cleanTeamName(f.awayTeam);
    const matchHeader = `${home} vs ${away} — ${tipSymbol}`;
    const description = getPredictionExplanation({ ...f, homeTeam: home, awayTeam: away }, tipSymbol, false);

    return {
      fixture: { ...f, homeTeam: home, awayTeam: away },
      tipSymbol,
      isHighestConfidence: false,
      matchHeader,
      description
    };
  });
}

/**
 * Generates the clean markdown text string for only double chance jackpot fixtures.
 */
export function generateDoubleChanceFixturesMarkdown(
  source?: string | Fixture[],
  count?: number
): string {
  const fixtures = getDoubleChanceJackpotFixtures(source, count);
  if (fixtures.length === 0) return '';

  return fixtures
    .map(item => `${item.matchHeader}\n\n${item.description}`)
    .join('\n\n\n');
}

/**
 * Standard curated league names arrangement for SportPesa Mega Jackpot matches.
 * Exactly: "Serie A, Ligue 1, Serie B, La Liga, the Premier League, Jupiler Pro League, Primeira Liga, Süper Lig, Superliga and Eliteserien"
 */
export const DEFAULT_SPORTPESA_MEGA_LEAGUES: string[] = [
  'Serie A',
  'Ligue 1',
  'Serie B',
  'La Liga',
  'the Premier League',
  'Jupiler Pro League',
  'Primeira Liga',
  'Süper Lig',
  'Superliga',
  'Eliteserien'
];

/**
 * Formats an individual league name according to standard editorial conventions (e.g., adding "the" where appropriate).
 */
export function formatLeagueName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'premier league' || lower === 'english premier league' || lower === 'epl') {
    return 'the Premier League';
  }
  if (lower === 'championship' || lower === 'english championship') {
    return 'the Championship';
  }
  if (lower === 'premiership' || lower === 'scottish premiership') {
    return 'the Scottish Premiership';
  }
  if (lower === 'super lig' || lower === 'süper lig' || lower === 'turkey super lig') {
    return 'Süper Lig';
  }
  if (lower === 'primeira liga' || lower === 'portugal primeira liga') {
    return 'Primeira Liga';
  }
  if (lower === 'jupiler pro league' || lower === 'belgian pro league') {
    return 'Jupiler Pro League';
  }
  if (lower === 'la liga' || lower === 'laliga' || lower === 'primera division') {
    return 'La Liga';
  }
  if (lower === 'serie a') {
    return 'Serie A';
  }
  if (lower === 'serie b') {
    return 'Serie B';
  }
  if (lower === 'ligue 1') {
    return 'Ligue 1';
  }
  if (lower === 'ligue 2') {
    return 'Ligue 2';
  }
  if (lower === 'bundesliga') {
    return 'the Bundesliga';
  }
  if (lower === 'eredivisie') {
    return 'the Eredivisie';
  }
  if (lower === 'superliga' || lower === 'danish superliga') {
    return 'Superliga';
  }
  if (lower === 'eliteserien' || lower === 'norwegian eliteserien') {
    return 'Eliteserien';
  }
  if (lower === 'allsvenskan') {
    return 'Allsvenskan';
  }
  if (lower === 'ekstraklasa') {
    return 'Ekstraklasa';
  }
  if (lower === 'czech liga' || lower === 'czech first league') {
    return 'the Czech First League';
  }

  // Preserve existing "the " prefix
  if (/^the\s+/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Fisher-Yates array shuffling algorithm returning a randomized copy of the array.
 */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Joins an array of league names with commas and natural connectors,
 * supporting randomized arrangement for uniqueness across multiple pages.
 * Example: ["Serie A", "Ligue 1", ..., "Eliteserien"] -> "Serie A, Ligue 1, ..., Superliga and Eliteserien"
 */
export function joinLeagueNames(leagues: string[], randomize = true): string {
  if (!leagues || leagues.length === 0) return '';
  const working = randomize ? shuffleArray(leagues) : [...leagues];
  if (working.length === 1) return working[0];

  const conjunctions = ['and', 'as well as', 'alongside', 'and', 'together with'];
  const conjunction = randomize 
    ? conjunctions[Math.floor(Math.random() * conjunctions.length)]
    : 'and';

  if (working.length === 2) {
    return `${working[0]} ${conjunction} ${working[1]}`;
  }
  const allButLast = working.slice(0, -1).join(', ');
  return `${allButLast}, ${conjunction} ${working[working.length - 1]}`;
}

/**
 * Retrieves the league names for a jackpot slate, supporting curated arrangement or live fixture extraction.
 */
export function getJackpotLeagueNames(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto'
): string[] {
  let jackpotId = 'sportpesa-mega';
  let fixtures: Fixture[] = [];

  if (Array.isArray(source) && source.length > 0) {
    fixtures = source;
  } else {
    const resolved = getFixturesForJackpot(typeof source === 'string' ? source : undefined);
    jackpotId = resolved.jackpotId;
    fixtures = resolved.fixtures;
  }

  // Curated SportPesa Mega leagues
  if (mode === 'curated' && jackpotId === 'sportpesa-mega') {
    return [...DEFAULT_SPORTPESA_MEGA_LEAGUES];
  }

  // If fixtures are available, extract directly
  if (fixtures.length > 0) {
    const rawLeagues = fixtures
      .map(f => f.leagueName || (f as any).league_name || (f as any).league || '')
      .filter(l => l && l.trim().length > 1);

    const seen = new Set<string>();
    const formatted: string[] = [];
    for (const raw of rawLeagues) {
      const clean = formatLeagueName(raw);
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        formatted.push(clean);
      }
    }

    if (formatted.length > 0) {
      return formatted;
    }
  }

  // If this specific jackpot has a fallback in static data with fixtures, attempt to extract from there
  const fallbackJackpot = jackpotsData.find(j => j.id === jackpotId || j.slug === jackpotId);
  if (fallbackJackpot && Array.isArray(fallbackJackpot.fixtures) && fallbackJackpot.fixtures.length > 0) {
    const rawLeagues = fallbackJackpot.fixtures
      .map(f => f.leagueName || (f as any).league_name || (f as any).league || '')
      .filter(l => l && l.trim().length > 1);
    const seen = new Set<string>();
    const formatted: string[] = [];
    for (const raw of rawLeagues) {
      const clean = formatLeagueName(raw);
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        formatted.push(clean);
      }
    }
    if (formatted.length > 0) {
      return formatted;
    }
  }

  return [...DEFAULT_SPORTPESA_MEGA_LEAGUES];
}

/**
 * Generates formatted league names text for any jackpot with randomized ordering for content uniqueness.
 */
export function generateJackpotLeaguesText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  randomize: boolean = true
): string {
  const leagues = getJackpotLeagueNames(source, mode);
  return joinLeagueNames(leagues, randomize);
}

/**
 * Backwards compatibility alias for SportPesa Mega Jackpot.
 */
export function generateMegaJackpotLeaguesText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  randomize: boolean = true
): string {
  return generateJackpotLeaguesText(source || 'sportpesa-mega', mode, randomize);
}

/**
 * Metadata configuration for all 8 available jackpots in Kenya.
 */
export interface JackpotTagConfig {
  id: string;
  name: string;
  shortName: string;
  matchCount: number;
  stakeText: string;
  prefixes: string[];
  defaultSchedule?: string;
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultSelections?: string;
  defaultUpsetAlert?: string;
  defaultSubCombosParagraph: string;
  defaultSubCombosList: string;
  defaultSubCombosShort: string;
}

export const ALL_JACKPOT_CONFIGS: Record<string, JackpotTagConfig> = {
  'sportpesa-mega': {
    id: 'sportpesa-mega',
    name: 'SportPesa Mega Jackpot Pro',
    shortName: 'SportPesa Mega',
    matchCount: 17,
    stakeText: 'KSh 99',
    prefixes: ['MEGA_JACKPOT', 'SPORTPESA_MEGA', 'SPORTPESA_MEGA_JACKPOT', 'MEGA'],
    defaultSchedule: 'Saturday, September 12, from 19:00, with the remaining fixtures continuing throughout Sunday, September 13',
    defaultStartDate: 'Saturday, September 12',
    defaultEndDate: 'Sunday, September 13',
    defaultStartTime: '19:00',
    defaultEndTime: '23:00',
    defaultSelections: '6 home wins, 2 draws, 5 away wins and 4 double chances',
    defaultUpsetAlert: "St Johnstone vs Hibernian (Scottish Premiership) and Espanyol vs Sevilla (La Liga) represent this weekend's primary upset alerts, where narrow head-to-head margins and unpredictable away form make double chance coverage (X2 or 1X) highly advisable.",
    defaultSubCombosParagraph: 'SportPesa Mega Jackpot Pro offers five distinct combination tiers from the same 17-game coupon at KSh 99 per line: the full 17-match jackpot, the 16-game sub-jackpot (matches 2–17), the 15-game sub-jackpot (matches 3–17), the 14-game sub-jackpot (matches 4–17), and the 13-game sub-jackpot (matches 5–17), each featuring standalone guaranteed jackpots and cash bonuses.',
    defaultSubCombosList: [
      '- **17-Game Mega Jackpot**: Matches 1–17 (Full Mega Jackpot + 12–16 bonus tiers)',
      '- **16-Game Sub-Jackpot**: Matches 2–17 (Standalone jackpot & bonuses)',
      '- **15-Game Sub-Jackpot**: Matches 3–17 (Standalone jackpot & bonuses)',
      '- **14-Game Sub-Jackpot**: Matches 4–17 (Standalone jackpot & bonuses)',
      '- **13-Game Sub-Jackpot**: Matches 5–17 (Standalone jackpot & bonuses)'
    ].join('\n'),
    defaultSubCombosShort: 'the 17-match main jackpot, the 16-game combo (matches 2–17), the 15-game combo (matches 3–17), the 14-game combo (matches 4–17), and the 13-game combo (matches 5–17)'
  },
  'betika-midweek': {
    id: 'betika-midweek',
    name: 'Betika Midweek Jackpot',
    shortName: 'Betika Midweek',
    matchCount: 15,
    stakeText: 'KSh 15',
    prefixes: ['BETIKA_MIDWEEK', 'BETIKA', 'BETIKA_JACKPOT'],
    defaultSchedule: 'Saturday, September 27, from 16:30, with the remaining fixtures continuing throughout Sunday, September 28',
    defaultStartDate: 'Saturday, September 27',
    defaultEndDate: 'Sunday, September 28',
    defaultStartTime: '16:30',
    defaultEndTime: '22:00',
    defaultSubCombosParagraph: 'The Betika Midweek Jackpot features a 15-game football slate with an entry stake of KSh 15, offering a grand prize of KSh 15 Million along with guaranteed cash bonus payouts for 12, 13, and 14 correct predictions.',
    defaultSubCombosList: [
      '- **15/15 Grand Prize**: KSh 15,000,000 top jackpot prize',
      '- **14/15 Bonus Tier**: High-tier cash consolation bonus',
      '- **13/15 Bonus Tier**: Mid-tier cash consolation bonus',
      '- **12/15 Bonus Tier**: Entry consolation prize tier'
    ].join('\n'),
    defaultSubCombosShort: 'the 15/15 Grand Prize (KSh 15M) and bonus payout tiers for 14, 13, and 12 correct match picks'
  },
  'mozzart-grand': {
    id: 'mozzart-grand',
    name: 'Mozzart Super Grand Jackpot',
    shortName: 'Mozzart Grand',
    matchCount: 20,
    stakeText: 'KSh 50',
    prefixes: ['MOZZART_GRAND', 'MOZZART', 'MOZZART_JACKPOT', 'MOZZART_GRAND_JACKPOT'],
    defaultSchedule: 'Saturday, September 20, from 18:00, with the remaining fixtures continuing throughout Sunday, September 21',
    defaultStartDate: 'Saturday, September 20',
    defaultEndDate: 'Sunday, September 21',
    defaultStartTime: '18:00',
    defaultEndTime: '23:00',
    defaultSubCombosParagraph: 'The Mozzart Super Grand Jackpot spans 20 pre-selected matches with a standard stake of KSh 50, featuring a fixed top prize of KSh 200 Million alongside cash bonus payouts for 17, 18, and 19 correct predictions, plus a unique consolation prize for correctly calling 0 matches.',
    defaultSubCombosList: [
      '- **20/20 Grand Prize**: KSh 200,000,000 fixed cash jackpot',
      '- **19/20 Bonus Tier**: Significant cash payout bonus',
      '- **18/20 Bonus Tier**: Substantial consolation bonus',
      '- **17/20 Bonus Tier**: Entry-level cash bonus tier',
      '- **0/20 Unique Prize**: Consolation reward for getting zero predictions correct'
    ].join('\n'),
    defaultSubCombosShort: 'the 20/20 Grand Prize (KSh 200M), bonus payouts for 19, 18, and 17 correct picks, and the unique 0/20 consolation prize'
  },
  'sportpesa-midweek': {
    id: 'sportpesa-midweek',
    name: 'SportPesa Midweek Jackpot',
    shortName: 'SportPesa Midweek',
    matchCount: 13,
    stakeText: 'KSh 99',
    prefixes: ['SPORTPESA_MIDWEEK', 'SP_MIDWEEK', 'MIDWEEK', 'SPORTPESA_MIDWEEK_JACKPOT'],
    defaultSchedule: 'Friday, September 19, from 20:00',
    defaultStartDate: 'Friday, September 19',
    defaultEndDate: 'Saturday, September 20',
    defaultStartTime: '20:00',
    defaultEndTime: '23:00',
    defaultSubCombosParagraph: 'The SportPesa Midweek Jackpot challenges bettors to predict 13 competitive games for a stake of KSh 99, featuring a progressive multi-million shilling jackpot starting from KSh 10 Million and guaranteed cash bonuses for 10, 11, and 12 correct predictions.',
    defaultSubCombosList: [
      '- **13/13 Midweek Jackpot**: Progressive multi-million top cash prize',
      '- **12/13 Bonus Tier**: Top consolation cash payout',
      '- **11/13 Bonus Tier**: Medium consolation bonus',
      '- **10/13 Bonus Tier**: Entry consolation prize tier'
    ].join('\n'),
    defaultSubCombosShort: 'the 13/13 main progressive jackpot, with cash bonus payout tiers for 12, 11, and 10 correct match outcomes'
  },
  'mozzart-super-daily': {
    id: 'mozzart-super-daily',
    name: 'Mozzart Super Daily Jackpot',
    shortName: 'Mozzart Super Daily',
    matchCount: 16,
    stakeText: 'KSh 20',
    prefixes: ['MOZZART_SUPER_DAILY', 'SUPER_DAILY', 'MOZZART_DAILY', 'SUPER_DAILY_JACKPOT'],
    defaultSchedule: 'Monday, September 22, from 18:00, with the remaining fixtures continuing throughout Tuesday, September 23',
    defaultStartDate: 'Monday, September 22',
    defaultEndDate: 'Tuesday, September 23',
    defaultStartTime: '18:00',
    defaultEndTime: '23:00',
    defaultSubCombosParagraph: 'The Mozzart Super Daily Jackpot is an intensive 16-game daily coupon with a KSh 20 stake, delivering a daily jackpot prize of KSh 200,000 for 16/16 correct calls and tiered consolation prizes.',
    defaultSubCombosList: [
      '- **16/16 Super Daily Prize**: KSh 200,000 daily top prize',
      '- **Consolation Tiers**: Consolation cash payouts for near-miss tickets'
    ].join('\n'),
    defaultSubCombosShort: 'the 16/16 daily jackpot (KSh 200,000) and consolation bonus tiers'
  }
};

/**
 * Resolves a jackpot prefix or raw ID string to one of the canonical jackpot IDs.
 */
export function resolveJackpotId(raw?: string, defaultJackpotId: string = 'sportpesa-mega'): string {
  if (!raw) return defaultJackpotId;
  const s = raw.toLowerCase().trim().replace(/_/g, '-');

  // Exact ID match
  if (ALL_JACKPOT_CONFIGS[s]) return s;

  if (s.includes('betika')) return 'betika-midweek';
  if (s.includes('mozzart-super') || s.includes('super-daily') || s.includes('mozzart-daily')) return 'mozzart-super-daily';
  if (s.includes('mozzart')) return 'mozzart-grand';
  if (s.includes('sportpesa-midweek') || s.includes('sp-midweek') || (s.includes('midweek') && !s.includes('betika'))) return 'sportpesa-midweek';
  if (s.includes('mega') || s.includes('sportpesa')) return 'sportpesa-mega';

  return defaultJackpotId;
}

/**
 * Standard default constants for SportPesa Mega Jackpot.
 */
export const DEFAULT_SPORTPESA_MEGA_SCHEDULE = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultSchedule!;
export const DEFAULT_SPORTPESA_MEGA_START_DATE = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultStartDate || 'Saturday, September 12';
export const DEFAULT_SPORTPESA_MEGA_END_DATE = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultEndDate || 'Sunday, September 13';
export const DEFAULT_SPORTPESA_MEGA_SELECTIONS = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultSelections!;
export const DEFAULT_SPORTPESA_MEGA_UPSET_ALERT = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultUpsetAlert!;
export const DEFAULT_SPORTPESA_MEGA_SUB_COMBOS = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultSubCombosParagraph;

export const CURATED_UPSET_CANDIDATES: Array<{ homeTeam: string; awayTeam: string; leagueName: string }> = [
  { homeTeam: 'St Johnstone', awayTeam: 'Hibernian', leagueName: 'Scottish Premiership' },
  { homeTeam: 'Espanyol', awayTeam: 'Sevilla', leagueName: 'Spanish La Liga' },
  { homeTeam: 'Empoli', awayTeam: 'Monza', leagueName: 'Italian Serie A' },
  { homeTeam: 'Reims', awayTeam: 'Montpellier', leagueName: 'French Ligue 1' },
  { homeTeam: 'Preston North End', awayTeam: 'Blackburn Rovers', leagueName: 'English Championship' },
  { homeTeam: 'FC St. Pauli', awayTeam: 'Mainz 05', leagueName: 'German Bundesliga' },
  { homeTeam: 'Celta Vigo', awayTeam: 'Getafe', leagueName: 'Spanish La Liga' },
  { homeTeam: 'Lecce', awayTeam: 'Cagliari', leagueName: 'Italian Serie A' },
  { homeTeam: 'Heerenveen', awayTeam: 'Groningen', leagueName: 'Dutch Eredivisie' },
  { homeTeam: 'Charleroi', awayTeam: 'Kortrijk', leagueName: 'Belgian Pro League' },
  { homeTeam: 'Alaves', awayTeam: 'Real Valladolid', leagueName: 'Spanish La Liga' },
  { homeTeam: 'Brest', awayTeam: 'Strasbourg', leagueName: 'French Ligue 1' }
];

/**
 * Generates upset alert text for any jackpot fixtures, selecting exactly two consistent fixtures
 * for a given jackpot until new updated fixtures are loaded.
 */
export function generateJackpotUpsetAlertText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  format?: string,
  context: 'inline' | 'standalone' = 'standalone'
): string {
  const { jackpotId, fixtures } = getFixturesForJackpot(source);

  let match1 = '';
  let match2 = '';

  // Dynamic analysis from coupon fixtures: select strictly 2 fixtures consistently
  if (fixtures && fixtures.length >= 2 && mode !== 'curated') {
    const candidateFixtures = [...fixtures].sort((a, b) => {
      const tipA = normalizeTipSymbol(a.prediction || (a as any).tip || '');
      const tipB = normalizeTipSymbol(b.prediction || (b as any).tip || '');
      const isDrawA = tipA === 'X' ? 1 : 0;
      const isDrawB = tipB === 'X' ? 1 : 0;
      if (isDrawA !== isDrawB) return isDrawB - isDrawA;

      const confA = typeof a.confidence === 'number' ? a.confidence : 75;
      const confB = typeof b.confidence === 'number' ? b.confidence : 75;
      if (confA !== confB) return confA - confB;

      const numA = typeof a.fixtureNumber === 'number' ? a.fixtureNumber : 0;
      const numB = typeof b.fixtureNumber === 'number' ? b.fixtureNumber : 0;
      return numA - numB;
    });

    // Consistently select the top 2 upset candidates for this jackpot
    const selectedTwo = candidateFixtures.slice(0, 2);
    // Sort by fixtureNumber ascending so the matches appear in natural order (e.g. Match 3 and Match 16)
    selectedTwo.sort((a, b) => {
      const numA = typeof a.fixtureNumber === 'number' ? a.fixtureNumber : 0;
      const numB = typeof b.fixtureNumber === 'number' ? b.fixtureNumber : 0;
      return numA - numB;
    });

    const f1 = selectedTwo[0];
    const f2 = selectedTwo[1] || selectedTwo[0];

    const l1 = formatLeagueName(f1.leagueName || (f1 as any).league || '');
    const l2 = formatLeagueName(f2.leagueName || (f2 as any).league || '');
    const t1Home = cleanTeamName(f1.homeTeam);
    const t1Away = cleanTeamName(f1.awayTeam);
    const t2Home = cleanTeamName(f2.homeTeam);
    const t2Away = cleanTeamName(f2.awayTeam);

    match1 = l1 ? `${t1Home} vs ${t1Away} (${l1})` : `${t1Home} vs ${t1Away}`;
    match2 = l2 ? `${t2Home} vs ${t2Away} (${l2})` : `${t2Home} vs ${t2Away}`;
  } else {
    // Deterministic curated fallback based on jackpotId (no random shuffling)
    const jackpotHash = jackpotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const idx1 = jackpotHash % CURATED_UPSET_CANDIDATES.length;
    const idx2 = (idx1 + 1) % CURATED_UPSET_CANDIDATES.length;
    const c1 = CURATED_UPSET_CANDIDATES[idx1];
    const c2 = CURATED_UPSET_CANDIDATES[idx2];
    match1 = `${c1.homeTeam} vs ${c1.awayTeam} (${c1.leagueName})`;
    match2 = `${c2.homeTeam} vs ${c2.awayTeam} (${c2.leagueName})`;
  }

  // Consistent ordering of the two fixtures
  const m1 = match1;
  const m2 = match2;

  // If format is explicitly short / inline / matches / fixtures, or context is inline
  if (
    format === 'short' ||
    format === 'inline' ||
    format === 'matches' ||
    format === 'fixtures' ||
    context === 'inline'
  ) {
    return `${m1} and ${m2}`;
  }

  // Standalone full sentence: completely consistent and deterministic
  return `${m1} and ${m2} represent this round's primary upset alerts, where narrow head-to-head margins and unpredictable away form make double chance coverage (1X or X2) highly advisable.`;
}

/**
 * Backwards compatibility alias for SportPesa Mega Jackpot upset alert.
 */
export function generateMegaJackpotUpsetAlertText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  format?: string,
  context: 'inline' | 'standalone' = 'standalone'
): string {
  return generateJackpotUpsetAlertText(source || 'sportpesa-mega', mode, format, context);
}

/**
 * Generates sub-jackpot combos / bonus tiers overview text for any jackpot.
 */
export function generateJackpotSubCombosText(
  jackpotIdOrSource?: string,
  format: 'paragraph' | 'list' | 'short' = 'paragraph'
): string {
  const jackpotId = resolveJackpotId(jackpotIdOrSource, 'sportpesa-mega');
  const cfg = ALL_JACKPOT_CONFIGS[jackpotId] || ALL_JACKPOT_CONFIGS['sportpesa-mega'];

  if (format === 'list') {
    return cfg.defaultSubCombosList;
  }
  if (format === 'short') {
    return cfg.defaultSubCombosShort;
  }
  return cfg.defaultSubCombosParagraph;
}

/**
 * Backwards compatibility alias for SportPesa Mega Jackpot sub combos.
 */
export function generateMegaJackpotSubCombosText(
  format: 'paragraph' | 'list' | 'short' = 'paragraph'
): string {
  return generateJackpotSubCombosText('sportpesa-mega', format);
}

/**
 * Structured date and time details for jackpot slates.
 */
export interface JackpotParsedDates {
  jackpotId: string;
  startDate: string;        // e.g. "Saturday, 18 September"
  endDate: string;          // e.g. "Sunday, 19 September"
  startTime: string;        // e.g. "16:00"
  endTime: string;          // e.g. "22:45"
  startTimeEat: string;     // e.g. "16:00 EAT"
  endTimeEat: string;       // e.g. "22:45 EAT"
  startDay: string;         // e.g. "Saturday"
  endDay: string;           // e.g. "Sunday"
  startDateTime: string;    // e.g. "Saturday, 18 September at 16:00 EAT"
  endDateTime: string;      // e.g. "Sunday, 19 September at 22:45 EAT"
  shortStartDate: string;   // e.g. "18 Sep"
  shortEndDate: string;     // e.g. "19 Sep"
  scheduleText: string;     // e.g. "Saturday, 18 September, from 16:00, and the last fixture to be played on Sunday, 19 September"
}

/**
 * Extracts and formats parsed dates (start date, end date, kickoff time, end time) for any jackpot.
 * Note: Applies +3 hours (UTC+3 / East Africa Time) to all dates/times.
 */
export function getJackpotDates(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3
): JackpotParsedDates {
  const { jackpotId, fixtures } = getFixturesForJackpot(source);
  const cfg = ALL_JACKPOT_CONFIGS[jackpotId];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (mode !== 'curated' && fixtures.length > 0) {
    const validDates = fixtures
      .map(f => {
        const rawTime = f.kickoffTime || f.date || (f as any).kickoff_time || (f as any).kickoffDate || '';
        if (!rawTime) return null;
        const d = new Date(rawTime.includes('T') ? rawTime : rawTime.replace(' ', 'T'));
        if (isNaN(d.getTime())) return null;
        return new Date(d.getTime() + timezoneOffsetHours * 60 * 60 * 1000);
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    if (validDates.length > 0) {
      const first = validDates[0];
      const last = validDates[validDates.length - 1];

      const startDay = daysOfWeek[first.getUTCDay()];
      const startMonth = months[first.getUTCMonth()];
      const startDateNum = first.getUTCDate();
      const startHour = String(first.getUTCHours()).padStart(2, '0');
      const startMinute = String(first.getUTCMinutes()).padStart(2, '0');
      const startTime = `${startHour}:${startMinute}`;
      const startTimeEat = `${startTime} EAT`;

      const endDay = daysOfWeek[last.getUTCDay()];
      const endMonth = months[last.getUTCMonth()];
      const endDateNum = last.getUTCDate();
      const endHour = String(last.getUTCHours()).padStart(2, '0');
      const endMinute = String(last.getUTCMinutes()).padStart(2, '0');
      const endTime = `${endHour}:${endMinute}`;
      const endTimeEat = `${endTime} EAT`;

      // Day, Date Month format (e.g. Saturday, 18 September)
      const startDate = `${startDay}, ${startDateNum} ${startMonth}`;
      const endDate = `${endDay}, ${endDateNum} ${endMonth}`;
      const shortStartDate = `${startDateNum} ${shortMonths[first.getUTCMonth()]}`;
      const shortEndDate = `${endDateNum} ${shortMonths[last.getUTCMonth()]}`;
      const startDateTime = `${startDate} at ${startTimeEat}`;
      const endDateTime = `${endDate} at ${endTimeEat}`;

      let scheduleText = '';
      if (startDay !== endDay || first.getUTCMonth() !== last.getUTCMonth() || startDateNum !== endDateNum) {
        scheduleText = `${startDay}, ${startDateNum} ${startMonth}, from ${startTime}, and the last fixture to be played on ${endDay}, ${endDateNum} ${endMonth}`;
      } else {
        scheduleText = `${startDay}, ${startDateNum} ${startMonth}, from ${startTime}`;
      }

      return {
        jackpotId,
        startDate,
        endDate,
        startTime,
        endTime,
        startTimeEat,
        endTimeEat,
        startDay,
        endDay,
        startDateTime,
        endDateTime,
        shortStartDate,
        shortEndDate,
        scheduleText
      };
    }
  }

  // Fallback to static configuration
  const rawStartDate = cfg?.defaultStartDate || 'Saturday, September 12';
  const rawEndDate = cfg?.defaultEndDate || 'Sunday, September 13';
  const startTime = cfg?.defaultStartTime || '19:00';
  const endTime = cfg?.defaultEndTime || '23:00';
  const startTimeEat = `${startTime} EAT`;
  const endTimeEat = `${endTime} EAT`;

  // Parse "Saturday, September 12" -> "Saturday, 12 September"
  const startMatch = rawStartDate.match(/^([A-Za-z]+),\s+([A-Za-z]+)\s+(\d+)$/);
  const startDay = startMatch ? startMatch[1] : rawStartDate.split(',')[0].trim();
  const startMonth = startMatch ? startMatch[2] : '';
  const startDateNum = startMatch ? startMatch[3] : '';
  const startDate = startMatch ? `${startDay}, ${startDateNum} ${startMonth}` : rawStartDate;

  const endMatch = rawEndDate.match(/^([A-Za-z]+),\s+([A-Za-z]+)\s+(\d+)$/);
  const endDay = endMatch ? endMatch[1] : rawEndDate.split(',')[0].trim();
  const endMonth = endMatch ? endMatch[2] : '';
  const endDateNum = endMatch ? endMatch[3] : '';
  const endDate = endMatch ? `${endDay}, ${endDateNum} ${endMonth}` : rawEndDate;

  const startDateTime = `${startDate} at ${startTimeEat}`;
  const endDateTime = `${endDate} at ${endTimeEat}`;

  const shortStartDate = startDateNum && startMonth ? `${startDateNum} ${startMonth.slice(0, 3)}` : startDate;
  const shortEndDate = endDateNum && endMonth ? `${endDateNum} ${endMonth.slice(0, 3)}` : endDate;

  return {
    jackpotId,
    startDate,
    endDate,
    startTime,
    endTime,
    startTimeEat,
    endTimeEat,
    startDay,
    endDay,
    startDateTime,
    endDateTime,
    shortStartDate,
    shortEndDate,
    scheduleText: cfg?.defaultSchedule || DEFAULT_SPORTPESA_MEGA_SCHEDULE
  };
}

/**
 * Generates formatted date/time schedule text for any jackpot fixtures.
 * Note: Applies +3 hours (UTC+3 / East Africa Time) to all dates/times.
 */
export function generateJackpotScheduleText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3
): string {
  return getJackpotDates(source, mode, timezoneOffsetHours).scheduleText;
}

/**
 * Generates formatted start date text for any jackpot fixtures.
 * e.g., "Saturday, 18 September" or "Saturday, 18 September at 16:00 EAT"
 */
export function generateJackpotStartDateText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string | { withTime?: boolean; short?: boolean; day?: boolean }
): string {
  const dates = getJackpotDates(source, mode, timezoneOffsetHours);
  const fmt = typeof formatOrOptions === 'string' ? formatOrOptions.toLowerCase() : '';
  const opts = typeof formatOrOptions === 'object' && formatOrOptions !== null ? formatOrOptions : {};

  if (opts.day || fmt === 'day') return dates.startDay;
  if (opts.short || fmt === 'short') return dates.shortStartDate;
  if (opts.withTime || fmt === 'time') return dates.startTimeEat;
  if (fmt === 'full' || fmt === 'datetime') return dates.startDateTime;
  return dates.startDate;
}

/**
 * Generates formatted end date text for any jackpot fixtures.
 * e.g., "Sunday, 19 September" or "Sunday, 19 September at 22:45 EAT"
 */
export function generateJackpotEndDateText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string | { withTime?: boolean; short?: boolean; day?: boolean }
): string {
  const dates = getJackpotDates(source, mode, timezoneOffsetHours);
  const fmt = typeof formatOrOptions === 'string' ? formatOrOptions.toLowerCase() : '';
  const opts = typeof formatOrOptions === 'object' && formatOrOptions !== null ? formatOrOptions : {};

  if (opts.day || fmt === 'day') return dates.endDay;
  if (opts.short || fmt === 'short') return dates.shortEndDate;
  if (opts.withTime || fmt === 'time') return dates.endTimeEat;
  if (fmt === 'full' || fmt === 'datetime') return dates.endDateTime;
  return dates.endDate;
}

/**
 * Generates kickoff time of the earliest match in the jackpot slate (e.g., "16:00 EAT").
 */
export function generateJackpotStartTimeText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string | { raw?: boolean }
): string {
  const dates = getJackpotDates(source, mode, timezoneOffsetHours);
  const fmt = typeof formatOrOptions === 'string' ? formatOrOptions.toLowerCase() : '';
  const opts = typeof formatOrOptions === 'object' && formatOrOptions !== null ? formatOrOptions : {};
  if (fmt === 'raw' || fmt === 'notz' || opts.raw) return dates.startTime;
  return dates.startTimeEat;
}

/**
 * Generates kickoff time of the final match in the jackpot slate (e.g., "22:45 EAT").
 */
export function generateJackpotEndTimeText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string | { raw?: boolean }
): string {
  const dates = getJackpotDates(source, mode, timezoneOffsetHours);
  const fmt = typeof formatOrOptions === 'string' ? formatOrOptions.toLowerCase() : '';
  const opts = typeof formatOrOptions === 'object' && formatOrOptions !== null ? formatOrOptions : {};
  if (fmt === 'raw' || fmt === 'notz' || opts.raw) return dates.endTime;
  return dates.endTimeEat;
}

/**
 * Generates full start date and time formatted text (e.g., "Saturday, 18 September at 16:00 EAT").
 */
export function generateJackpotStartDateTimeText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string
): string {
  const dates = getJackpotDates(source, mode, timezoneOffsetHours);
  const fmt = typeof formatOrOptions === 'string' ? formatOrOptions.toLowerCase() : '';
  if (fmt === 'from') return `${dates.startDate}, from ${dates.startTime}`;
  return dates.startDateTime;
}

/**
 * Generates full closing date and time formatted text (e.g., "Sunday, 19 September at 22:45 EAT").
 */
export function generateJackpotEndDateTimeText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string
): string {
  const dates = getJackpotDates(source, mode, timezoneOffsetHours);
  return dates.endDateTime;
}

/**
 * Backwards compatibility alias for SportPesa Mega schedule.
 */
export function generateMegaJackpotScheduleText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3
): string {
  return generateJackpotScheduleText(source || 'sportpesa-mega', mode, timezoneOffsetHours);
}

/**
 * Backwards compatibility alias for SportPesa Mega start date.
 */
export function generateMegaJackpotStartDateText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string | { withTime?: boolean; short?: boolean; day?: boolean }
): string {
  return generateJackpotStartDateText(source || 'sportpesa-mega', mode, timezoneOffsetHours, formatOrOptions);
}

/**
 * Backwards compatibility alias for SportPesa Mega end date.
 */
export function generateMegaJackpotEndDateText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3,
  formatOrOptions?: string | { withTime?: boolean; short?: boolean; day?: boolean }
): string {
  return generateJackpotEndDateText(source || 'sportpesa-mega', mode, timezoneOffsetHours, formatOrOptions);
}

/**
 * Calculates outcome distribution (home wins, draws, away wins) for any jackpot predictions.
 */
export function getJackpotDoubleChancesCount(source?: string | Fixture[]): number {
  const { fixtures } = getFixturesForJackpot(source);
  if (!fixtures || fixtures.length === 0) return 0;
  return fixtures.filter(f => {
    const rawTip = f.prediction || (f as any).tip || '';
    return isDoubleChanceTip(rawTip) || isDoubleChanceTip(normalizeTipSymbol(rawTip));
  }).length;
}

/**
 * Generates the breakdown of prediction outcomes for any jackpot (e.g. "10 home wins, 1 draw, 6 away wins and 4 double chances").
 * When includePrefix is true, prepends "selections include ".
 */
export function generateJackpotSelectionsText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  includePrefix: boolean = false
): string {
  const { jackpotId, fixtures } = getFixturesForJackpot(source);
  const cfg = ALL_JACKPOT_CONFIGS[jackpotId];

  if (mode === 'curated') {
    const body = cfg?.defaultSelections || DEFAULT_SPORTPESA_MEGA_SELECTIONS;
    return includePrefix ? `selections include ${body}` : body;
  }

  if (fixtures.length > 0) {
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let doubleChances = 0;

    for (const f of fixtures) {
      const rawPrediction = f.prediction || (f as any).tip || '';
      const tip = normalizeTipSymbol(rawPrediction);
      const isDc = isDoubleChanceTip(rawPrediction) || isDoubleChanceTip(tip);
      if (isDc) {
        doubleChances++;
      } else if (tip === '1') {
        homeWins++;
      } else if (tip === 'X') {
        draws++;
      } else {
        awayWins++;
      }
    }

    const parts: string[] = [
      `${homeWins} home win${homeWins === 1 ? '' : 's'}`,
      `${draws} draw${draws === 1 ? '' : 's'}`,
      `${awayWins} away win${awayWins === 1 ? '' : 's'}`
    ];
    if (doubleChances > 0) {
      parts.push(`${doubleChances} double chance${doubleChances === 1 ? '' : 's'}`);
    }

    let body = '';
    if (parts.length === 1) {
      body = parts[0];
    } else if (parts.length === 2) {
      body = `${parts[0]} and ${parts[1]}`;
    } else {
      const last = parts.pop();
      body = `${parts.join(', ')} and ${last}`;
    }

    return includePrefix ? `selections include ${body}` : body;
  }

  const body = cfg?.defaultSelections || DEFAULT_SPORTPESA_MEGA_SELECTIONS;
  return includePrefix ? `selections include ${body}` : body;
}

/**
 * Backwards compatibility alias for SportPesa Mega selections.
 */
export function generateMegaJackpotSelectionsText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto'
): string {
  return generateJackpotSelectionsText(source || 'sportpesa-mega', mode, false);
}

/**
 * Helper to parse tag parameters: count, jackpot, mode, format.
 */
interface ParsedTagParams {
  jackpotId: string;
  count?: number;
  mode: 'auto' | 'fixtures' | 'curated';
  format: 'paragraph' | 'list' | 'short' | 'time' | 'full' | 'day' | 'inline' | 'sentence';
}

function parseAllTagParams(rawAttrs: string, tagJackpotHint: string, defaultJackpotId: string): ParsedTagParams {
  let jackpotId = resolveJackpotId(tagJackpotHint || defaultJackpotId, defaultJackpotId);
  let count: number | undefined = undefined;
  let mode: 'auto' | 'fixtures' | 'curated' = 'auto';
  let format: 'paragraph' | 'list' | 'short' | 'time' | 'full' | 'day' | 'inline' | 'sentence' = 'paragraph';

  if (!rawAttrs) return { jackpotId, count, mode, format };

  const attrs = rawAttrs.trim();

  // Colon shorthand: e.g. :5 or :7
  const countMatch = attrs.match(/^:(\d+)/);
  if (countMatch) {
    count = parseInt(countMatch[1], 10);
  }

  // Key-value count: count=5
  const kvCountMatch = attrs.match(/count\s*=\s*["']?(\d+)["']?/i);
  if (kvCountMatch) {
    count = parseInt(kvCountMatch[1], 10);
  }

  // Mode: :fixtures, :curated, :live, :dynamic
  if (/fixture|live|dynamic/i.test(attrs)) {
    mode = 'fixtures';
  } else if (/curated|example|default/i.test(attrs)) {
    mode = 'curated';
  }

  // Format: :list, :short, :paragraph, :time, :full, :datetime, :day, :inline, :sentence, :standalone
  if (/list/i.test(attrs)) {
    format = 'list';
  } else if (/short|inline|matches|fixtures/i.test(attrs)) {
    format = 'short';
  } else if (/sentence|standalone/i.test(attrs)) {
    format = 'sentence';
  } else if (/(?:with-)?time|datetime|full/i.test(attrs)) {
    format = 'full';
  } else if (/day/i.test(attrs)) {
    format = 'day';
  } else if (/paragraph/i.test(attrs)) {
    format = 'paragraph';
  }

  // Explicit jackpot specification: jackpot="betika-midweek" or id="mozzart-grand"
  const jackpotMatch = attrs.match(/(?:jackpot|id)\s*=\s*["']?([a-zA-Z0-9_-]+)["']?/i);
  if (jackpotMatch) {
    jackpotId = resolveJackpotId(jackpotMatch[1], jackpotId);
  }

  return { jackpotId, count, mode, format };
}

/**
 * Universal tag replacer supporting all 8 Kenyan jackpots and generic jackpot tags.
 * 
 * Supported Syntax:
 * - Mustache: {{TAG}}
 * - HTML comment: <!-- TAG -->
 * - Brackets: [TAG]
 * 
 * Supported Jackpot Prefixes:
 * - MEGA_JACKPOT_ / SPORTPESA_MEGA_ / MEGA_
 * - BETIKA_MIDWEEK_ / BETIKA_
 * - MOZZART_GRAND_ / MOZZART_
 * - SPORTPESA_MIDWEEK_ / SP_MIDWEEK_ / MIDWEEK_
 * - SPORTYBET_JACKPOT_ / SPORTYBET_
 * - BETPAWA_PICK_JACKPOT_ / BETPAWA_PICK_ / BETPAWA_
 * - ODIBET_LAKI_TATU_ / ODIBET_ / LAKI_TATU_
 * - MOZZART_SUPER_DAILY_ / SUPER_DAILY_ / MOZZART_DAILY_
 * - Generic: JACKPOT_ (resolves dynamically to current page's jackpot)
 * 
 * Supported Suffixes:
 * - DATES / SCHEDULE
 * - START_DATE / START_DATES / STARTING_DATE / START_TIME / START_DATETIME / START_DAY / KICKOFF_DATE
 * - END_DATE / END_DATES / ENDING_DATE / END_TIME / END_DATETIME / END_DAY / CLOSING_DATE
 * - SELECTIONS_INCLUDE
 * - SELECTIONS / OUTCOMES / DISTRIBUTION
 * - UPSET_ALERT / UPSET_ALERTS / UPSETS
 * - SUB_COMBOS / COMBOS / BONUSES / TIERS
 * - LEAGUES / LEAGUE_NAMES
 * - DOUBLE_CHANCE_FIXTURES / DOUBLE_CHANCES / DOUBLE_CHANCE
 * - TOP_FIXTURES / TOP_CONFIDENCE_FIXTURES / TOP_CONFIDENCE
 */
export function expandTopFixturesParameters(
  content: string,
  defaultJackpotId: string = 'sportpesa-mega',
  customFixtures?: Fixture[]
): string {
  if (!content) return content;

  // Expand today's category fixture tags dynamically
  let expanded = expandTodayFixturesTags(content);

  // Regular expression capturing tag components:
  // Group 1: Prefix (or undefined for generic)
  // Group 2: Suffix
  // Group 3: Attributes
  const universalTagRegex = /\{\{\s*(?:(MEGA_JACKPOT|SPORTPESA_MEGA|SPORTPESA_MEGA_JACKPOT|MEGA|BETIKA_MIDWEEK|BETIKA|BETIKA_JACKPOT|MOZZART_GRAND|MOZZART_GRAND_JACKPOT|MOZZART|MOZZART_JACKPOT|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTPESA_MIDWEEK_JACKPOT|MOZZART_SUPER_DAILY|SUPER_DAILY|MOZZART_DAILY|SUPER_DAILY_JACKPOT|JACKPOT)_)?(START_DATE|START_DATES|STARTING_DATE|STARTDATE|STARTDATES|START_TIME|STARTTIME|START_DATETIME|STARTDATETIME|START_DAY|STARTDAY|KICKOFF_DATE|KICKOFF_TIME|KICKOFF_DATETIME|FIRST_DATE|FIRST_MATCH_DATE|END_DATE|END_DATES|ENDING_DATE|ENDDATE|ENDDATES|END_TIME|ENDTIME|END_DATETIME|ENDDATETIME|END_DAY|ENDDAY|CLOSING_DATE|CLOSING_TIME|CLOSING_DATETIME|LAST_DATE|LAST_MATCH_DATE|FINISH_DATE|FINISH_TIME|DATES|DATE|SCHEDULE|SELECTIONS_INCLUDE|SELECTIONS|SELECTION|OUTCOMES|DISTRIBUTION|UPSET_ALERT|UPSET_ALERTS|UPSETS|SUB_COMBOS|SUB_JACKPOTS|COMBOS|BONUSES|TIERS|LEAGUES|LEAGUE_NAMES|DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCES_COUNT|DOUBLE_CHANCE_COUNT|DC_COUNT|DOUBLE_CHANCES|DOUBLE_CHANCE|TOP_FIXTURES|TOP_CONFIDENCE_FIXTURES|TOP_CONFIDENCE|ALL_FIXTURES|ALL_MEGA_JACKPOT_FIXTURES|ALL_JACKPOT_FIXTURES|MEGA_JACKPOT_ALL_FIXTURES|ALL_GAMES|ALL_PREDICTIONS|MEGA_JACKPOT_PREDICTIONS|ALL_MEGA_FIXTURES|MEGA_FIXTURES|UI_TIMER|JACKPOT_TIMER|COUNTDOWN_TIMER|COUNTDOWN|TIMER|TIMER_ONLY)([\s:][^}]*)?\}\}/gi;

  const universalHtmlCommentRegex = /<!--\s*(?:(MEGA_JACKPOT|SPORTPESA_MEGA|SPORTPESA_MEGA_JACKPOT|MEGA|BETIKA_MIDWEEK|BETIKA|BETIKA_JACKPOT|MOZZART_GRAND|MOZZART_GRAND_JACKPOT|MOZZART|MOZZART_JACKPOT|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTPESA_MIDWEEK_JACKPOT|MOZZART_SUPER_DAILY|SUPER_DAILY|MOZZART_DAILY|SUPER_DAILY_JACKPOT|JACKPOT)_)?(START_DATE|START_DATES|STARTING_DATE|STARTDATE|STARTDATES|START_TIME|STARTTIME|START_DATETIME|STARTDATETIME|START_DAY|STARTDAY|KICKOFF_DATE|KICKOFF_TIME|KICKOFF_DATETIME|FIRST_DATE|FIRST_MATCH_DATE|END_DATE|END_DATES|ENDING_DATE|ENDDATE|ENDDATES|END_TIME|ENDTIME|END_DATETIME|ENDDATETIME|END_DAY|ENDDAY|CLOSING_DATE|CLOSING_TIME|CLOSING_DATETIME|LAST_DATE|LAST_MATCH_DATE|FINISH_DATE|FINISH_TIME|DATES|DATE|SCHEDULE|SELECTIONS_INCLUDE|SELECTIONS|SELECTION|OUTCOMES|DISTRIBUTION|UPSET_ALERT|UPSET_ALERTS|UPSETS|SUB_COMBOS|SUB_JACKPOTS|COMBOS|BONUSES|TIERS|LEAGUES|LEAGUE_NAMES|DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCES_COUNT|DOUBLE_CHANCE_COUNT|DC_COUNT|DOUBLE_CHANCES|DOUBLE_CHANCE|TOP_FIXTURES|TOP_CONFIDENCE_FIXTURES|TOP_CONFIDENCE|ALL_FIXTURES|ALL_MEGA_JACKPOT_FIXTURES|ALL_JACKPOT_FIXTURES|MEGA_JACKPOT_ALL_FIXTURES|ALL_GAMES|ALL_PREDICTIONS|MEGA_JACKPOT_PREDICTIONS|ALL_MEGA_FIXTURES|MEGA_FIXTURES|UI_TIMER|JACKPOT_TIMER|COUNTDOWN_TIMER|COUNTDOWN|TIMER|TIMER_ONLY)([\s:][^-]*)?-->/gi;

  const universalBracketRegex = /(?<!\[)\[(?!\[)\s*(?:(MEGA_JACKPOT|SPORTPESA_MEGA|SPORTPESA_MEGA_JACKPOT|MEGA|BETIKA_MIDWEEK|BETIKA|BETIKA_JACKPOT|MOZZART_GRAND|MOZZART_GRAND_JACKPOT|MOZZART|MOZZART_JACKPOT|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTPESA_MIDWEEK_JACKPOT|MOZZART_SUPER_DAILY|SUPER_DAILY|MOZZART_DAILY|SUPER_DAILY_JACKPOT|JACKPOT)_)?(START_DATE|START_DATES|STARTING_DATE|STARTDATE|STARTDATES|START_TIME|STARTTIME|START_DATETIME|STARTDATETIME|START_DAY|STARTDAY|KICKOFF_DATE|KICKOFF_TIME|KICKOFF_DATETIME|FIRST_DATE|FIRST_MATCH_DATE|END_DATE|END_DATES|ENDING_DATE|ENDDATE|ENDDATES|END_TIME|ENDTIME|END_DATETIME|ENDDATETIME|END_DAY|ENDDAY|CLOSING_DATE|CLOSING_TIME|CLOSING_DATETIME|LAST_DATE|LAST_MATCH_DATE|FINISH_DATE|FINISH_TIME|DATES|DATE|SCHEDULE|SELECTIONS_INCLUDE|SELECTIONS|SELECTION|OUTCOMES|DISTRIBUTION|UPSET_ALERT|UPSET_ALERTS|UPSETS|SUB_COMBOS|SUB_JACKPOTS|COMBOS|BONUSES|TIERS|LEAGUES|LEAGUE_NAMES|DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCES_COUNT|DOUBLE_CHANCE_COUNT|DC_COUNT|DOUBLE_CHANCES|DOUBLE_CHANCE|TOP_FIXTURES|TOP_CONFIDENCE_FIXTURES|TOP_CONFIDENCE|ALL_FIXTURES|ALL_MEGA_JACKPOT_FIXTURES|ALL_JACKPOT_FIXTURES|MEGA_JACKPOT_ALL_FIXTURES|ALL_GAMES|ALL_PREDICTIONS|MEGA_JACKPOT_PREDICTIONS|ALL_MEGA_FIXTURES|MEGA_FIXTURES|UI_TIMER|JACKPOT_TIMER|COUNTDOWN_TIMER|COUNTDOWN|TIMER|TIMER_ONLY)([\s:][^\]]*)?\](?!\])/gi;

  const executeReplacement = (_full: string, prefixRaw: string | undefined, suffixRaw: string, attrsRaw: string | undefined, offset?: number, fullStr?: string): string => {
    const prefix = prefixRaw ? prefixRaw.toUpperCase() : '';
    const suffix = suffixRaw.toUpperCase();
    const attrs = attrsRaw || '';

    const { jackpotId, count, mode, format } = parseAllTagParams(attrs, prefix, defaultJackpotId);
    const fixturesToUse = customFixtures && jackpotId === defaultJackpotId ? customFixtures : jackpotId;

    switch (suffix) {
      case 'START_DATE':
      case 'START_DATES':
      case 'STARTING_DATE':
      case 'STARTDATE':
      case 'STARTDATES':
      case 'FIRST_DATE':
      case 'FIRST_MATCH_DATE':
      case 'KICKOFF_DATE':
        return generateJackpotStartDateText(fixturesToUse, mode, 3, format);

      case 'START_TIME':
      case 'STARTTIME':
      case 'KICKOFF_TIME':
      case 'FIRST_TIME':
        return generateJackpotStartTimeText(fixturesToUse, mode, 3, format);

      case 'START_DATETIME':
      case 'STARTDATETIME':
      case 'KICKOFF_DATETIME':
        return generateJackpotStartDateTimeText(fixturesToUse, mode, 3, format);

      case 'START_DAY':
      case 'STARTDAY':
        return generateJackpotStartDateText(fixturesToUse, mode, 3, 'day');

      case 'END_DATE':
      case 'END_DATES':
      case 'ENDING_DATE':
      case 'ENDDATE':
      case 'ENDDATES':
      case 'LAST_DATE':
      case 'LAST_MATCH_DATE':
      case 'CLOSING_DATE':
      case 'FINISH_DATE':
        return generateJackpotEndDateText(fixturesToUse, mode, 3, format);

      case 'END_TIME':
      case 'ENDTIME':
      case 'CLOSING_TIME':
      case 'LAST_TIME':
      case 'FINISH_TIME':
        return generateJackpotEndTimeText(fixturesToUse, mode, 3, format);

      case 'END_DATETIME':
      case 'ENDDATETIME':
      case 'CLOSING_DATETIME':
      case 'FINISH_DATETIME':
        return generateJackpotEndDateTimeText(fixturesToUse, mode, 3, format);

      case 'END_DAY':
      case 'ENDDAY':
        return generateJackpotEndDateText(fixturesToUse, mode, 3, 'day');

      case 'DATES':
      case 'DATE':
      case 'SCHEDULE':
        return generateJackpotScheduleText(fixturesToUse, mode, 3);

      case 'SELECTIONS_INCLUDE':
        return generateJackpotSelectionsText(fixturesToUse, mode, true);

      case 'SELECTIONS':
      case 'SELECTION':
      case 'OUTCOMES':
      case 'DISTRIBUTION':
        return generateJackpotSelectionsText(fixturesToUse, mode, false);

      case 'DOUBLE_CHANCE_COUNT':
      case 'DOUBLE_CHANCES_COUNT':
      case 'DC_COUNT': {
        const dcCount = getJackpotDoubleChancesCount(fixturesToUse);
        if (format === 'short') return String(dcCount);
        return `${dcCount} double chance${dcCount === 1 ? '' : 's'}`;
      }

      case 'UPSET_ALERT':
      case 'UPSET_ALERTS':
      case 'UPSETS': {
        let isInline = false;
        if (format === 'sentence' || format === 'full') {
          isInline = false;
        } else if (format === 'short' || format === 'inline') {
          isInline = true;
        } else if (typeof offset === 'number' && typeof fullStr === 'string') {
          const matchLen = (_full || '').length || 20;
          const preceding = fullStr.slice(Math.max(0, offset - 60), offset);
          const following = fullStr.slice(offset + matchLen, offset + matchLen + 60);

          const hasNewlineBefore = /\n\s*$/.test(preceding);
          const hasNewlineAfter = /^\s*\n/.test(following);
          const endsWithPunctuation = /[.!?]\s*$/.test(preceding);

          if (endsWithPunctuation && (hasNewlineAfter || /^\s*[A-Z]/.test(following))) {
            isInline = false;
          } else if (hasNewlineBefore && (hasNewlineAfter || following.trim().length === 0)) {
            isInline = false;
          } else {
            const hasLeadInBefore = /(?:for|out|in|on|between|of|regarding|about|fixtures?|matches?|games?|including|like|such as|watch(?:\s+out)?|see)\s*$/i.test(preceding.trim());
            const hasContinuationAfter = /^\s*(?:and|for|to|where|in|with|while|expecting|as|,|;)\b/i.test(following) || /^\s*[a-z]/.test(following);

            if (hasLeadInBefore || hasContinuationAfter) {
              isInline = true;
            } else if (!endsWithPunctuation && !hasNewlineBefore && !hasNewlineAfter) {
              isInline = true;
            } else {
              isInline = false;
            }
          }
        }
        return generateJackpotUpsetAlertText(fixturesToUse, mode, format, isInline ? 'inline' : 'standalone');
      }

      case 'SUB_COMBOS':
      case 'SUB_JACKPOTS':
      case 'COMBOS':
      case 'BONUSES':
      case 'TIERS':
        return generateJackpotSubCombosText(
          jackpotId,
          format === 'list' || format === 'short' ? format : 'paragraph'
        );

      case 'LEAGUES':
      case 'LEAGUE_NAMES':
        return generateJackpotLeaguesText(fixturesToUse, mode, true);

      case 'DOUBLE_CHANCE_FIXTURES':
      case 'DOUBLE_CHANCES':
      case 'DOUBLE_CHANCE':
        return generateDoubleChanceFixturesMarkdown(fixturesToUse, count);

      case 'TOP_FIXTURES':
      case 'TOP_CONFIDENCE_FIXTURES':
      case 'TOP_CONFIDENCE':
        return generateTopConfidenceFixturesMarkdown(fixturesToUse, count || 7);

      case 'ALL_FIXTURES':
      case 'ALL_MEGA_JACKPOT_FIXTURES':
      case 'ALL_JACKPOT_FIXTURES':
      case 'MEGA_JACKPOT_ALL_FIXTURES':
      case 'ALL_GAMES':
      case 'ALL_PREDICTIONS':
      case 'MEGA_JACKPOT_PREDICTIONS':
      case 'ALL_MEGA_FIXTURES':
      case 'MEGA_FIXTURES':
        return generateAllJackpotFixturesMarkdown(fixturesToUse, jackpotId);

      case 'UI_TIMER':
      case 'JACKPOT_TIMER':
      case 'COUNTDOWN_TIMER':
      case 'COUNTDOWN':
      case 'TIMER':
      case 'TIMER_ONLY':
        return `\n\n[[UI_TIMER:${jackpotId}]]\n\n`;

      default:
        return _full;
    }
  };

  // Direct UI timer pattern: e.g. {{UI_TIMER}}, {{JACKPOT_TIMER}}, {{COUNTDOWN_TIMER}}, {{TIMER}}, {{COUNTDOWN}}, {{MEGA_JACKPOT_TIMER}}, {{SPORTPESA_MEGA_TIMER}}, {{BETIKA_MIDWEEK_TIMER}}
  const timerDirectMustache = /\{\{\s*(UI_TIMER|JACKPOT_TIMER|COUNTDOWN_TIMER|TIMER|COUNTDOWN|MEGA_JACKPOT_TIMER|SPORTPESA_MEGA_TIMER|BETIKA_MIDWEEK_TIMER|TIMER_ONLY)([\s:][^}]*)?\}\}/gi;
  const timerDirectHtmlComment = /<!--\s*(UI_TIMER|JACKPOT_TIMER|COUNTDOWN_TIMER|TIMER|COUNTDOWN|MEGA_JACKPOT_TIMER|SPORTPESA_MEGA_TIMER|BETIKA_MIDWEEK_TIMER|TIMER_ONLY)([\s:][^-]*)?-->/gi;
  const timerDirectBracket = /(?<!\[)\[(?!\[)\s*(UI_TIMER|JACKPOT_TIMER|COUNTDOWN_TIMER|TIMER|COUNTDOWN|MEGA_JACKPOT_TIMER|SPORTPESA_MEGA_TIMER|BETIKA_MIDWEEK_TIMER|TIMER_ONLY)([\s:][^\]]*)?\](?!\])/gi;

  const executeDirectTimerReplacement = (_full: string, tagName: string, attrsRaw: string | undefined): string => {
    let fallbackPrefix = '';
    const upperTag = tagName.toUpperCase();
    if (upperTag.includes('MEGA') || upperTag.includes('SPORTPESA')) fallbackPrefix = 'sportpesa-mega';
    else if (upperTag.includes('BETIKA')) fallbackPrefix = 'betika-midweek';
    else if (upperTag.includes('MOZZART')) fallbackPrefix = 'mozzart-grand';
    const { jackpotId } = parseAllTagParams(attrsRaw || '', fallbackPrefix, defaultJackpotId);
    return `\n\n[[UI_TIMER:${jackpotId}]]\n\n`;
  };

  expanded = expanded.replace(timerDirectMustache, executeDirectTimerReplacement);
  expanded = expanded.replace(timerDirectHtmlComment, executeDirectTimerReplacement);
  expanded = expanded.replace(timerDirectBracket, executeDirectTimerReplacement);

  // All fixtures shorthand prefix pattern: e.g. {{ALL_MEGA_JACKPOT_FIXTURES}}, {{ALL_BETIKA_MIDWEEK_FIXTURES}}, etc.
  const allPrefixMustache = /\{\{\s*ALL_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^}]*)?\}\}/gi;
  const allPrefixHtmlComment = /<!--\s*ALL_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^-]*)?-->/gi;
  const allPrefixBracket = /(?<!\[)\[(?!\[)\s*ALL_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^\]]*)?\](?!\])/gi;

  // Direct all fixtures pattern: e.g. {{ALL_MEGA_JACKPOT_FIXTURES}}, {{MEGA_JACKPOT_ALL_FIXTURES}}, {{ALL_JACKPOT_FIXTURES}}, {{ALL_FIXTURES}}
  const allDirectMustache = /\{\{\s*(ALL_MEGA_JACKPOT_FIXTURES|MEGA_JACKPOT_ALL_FIXTURES|ALL_JACKPOT_FIXTURES|ALL_FIXTURES|ALL_GAMES|ALL_PREDICTIONS)([\s:][^}]*)?\}\}/gi;
  const allDirectHtmlComment = /<!--\s*(ALL_MEGA_JACKPOT_FIXTURES|MEGA_JACKPOT_ALL_FIXTURES|ALL_JACKPOT_FIXTURES|ALL_FIXTURES|ALL_GAMES|ALL_PREDICTIONS)([\s:][^-]*)?-->/gi;
  const allDirectBracket = /(?<!\[)\[(?!\[)\s*(ALL_MEGA_JACKPOT_FIXTURES|MEGA_JACKPOT_ALL_FIXTURES|ALL_JACKPOT_FIXTURES|ALL_FIXTURES|ALL_GAMES|ALL_PREDICTIONS)([\s:][^\]]*)?\](?!\])/gi;

  const executeAllReplacement = (_full: string, prefixRaw: string, attrsRaw: string | undefined): string => {
    const { jackpotId } = parseAllTagParams(attrsRaw || '', prefixRaw, defaultJackpotId);
    const fixturesToUse = customFixtures && jackpotId === defaultJackpotId ? customFixtures : jackpotId;
    return generateAllJackpotFixturesMarkdown(fixturesToUse, jackpotId);
  };

  const executeDirectAllReplacement = (_full: string, _tagName: string, attrsRaw: string | undefined): string => {
    const { jackpotId } = parseAllTagParams(attrsRaw || '', '', defaultJackpotId);
    const fixturesToUse = customFixtures && jackpotId === defaultJackpotId ? customFixtures : jackpotId;
    return generateAllJackpotFixturesMarkdown(fixturesToUse, jackpotId);
  };

  expanded = expanded.replace(allPrefixMustache, executeAllReplacement);
  expanded = expanded.replace(allPrefixHtmlComment, executeAllReplacement);
  expanded = expanded.replace(allPrefixBracket, executeAllReplacement);

  expanded = expanded.replace(allDirectMustache, executeDirectAllReplacement);
  expanded = expanded.replace(allDirectHtmlComment, executeDirectAllReplacement);
  expanded = expanded.replace(allDirectBracket, executeDirectAllReplacement);

  // Top confidence shorthand prefix pattern: e.g. {{TOP_MEGA_JACKPOT_FIXTURES}}, {{TOP_BETIKA_MIDWEEK_FIXTURES}}, etc.
  const topPrefixMustache = /\{\{\s*TOP_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^}]*)?\}\}/gi;
  const topPrefixHtmlComment = /<!--\s*TOP_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^-]*)?-->/gi;
  const topPrefixBracket = /(?<!\[)\[(?!\[)\s*TOP_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^\]]*)?\](?!\])/gi;

  const executeTopReplacement = (_full: string, prefixRaw: string, attrsRaw: string | undefined): string => {
    const { jackpotId, count } = parseAllTagParams(attrsRaw || '', prefixRaw, defaultJackpotId);
    const fixturesToUse = customFixtures && jackpotId === defaultJackpotId ? customFixtures : jackpotId;
    return generateTopConfidenceFixturesMarkdown(fixturesToUse, count || 7);
  };

  expanded = expanded.replace(topPrefixMustache, executeTopReplacement);
  expanded = expanded.replace(topPrefixHtmlComment, executeTopReplacement);
  expanded = expanded.replace(topPrefixBracket, executeTopReplacement);

  // Apply universal replacements
  expanded = expanded.replace(universalTagRegex, executeReplacement);
  expanded = expanded.replace(universalHtmlCommentRegex, executeReplacement);
  expanded = expanded.replace(universalBracketRegex, executeReplacement);

  return expanded;
}

/**
 * Asynchronously expands markdown by fetching current fixtures directly from the live database for any specified jackpot and today fixtures.
 */
export async function expandTopFixturesParametersAsync(
  content: string,
  defaultJackpotId: string = 'sportpesa-mega'
): Promise<string> {
  const resolved = resolveJackpotId(defaultJackpotId, 'sportpesa-mega');
  
  const tasks: Promise<any>[] = [fetchLiveJackpotFixtures(resolved)];
  if (/TODAY_/i.test(content)) {
    tasks.push(fetchLiveTodayFixtures());
  }

  const [liveFixtures] = await Promise.all(tasks);
  return expandTopFixturesParameters(content, resolved, liveFixtures);
}
