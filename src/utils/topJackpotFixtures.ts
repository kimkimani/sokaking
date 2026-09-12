import { jackpotsData, JackpotConfig } from '../jackpotsData';
import { Fixture } from '../types';

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
export function getFixturesForJackpot(source?: string | Fixture[]): { jackpotId: string; fixtures: Fixture[] } {
  if (Array.isArray(source) && source.length > 0) {
    return { jackpotId: 'sportpesa-mega', fixtures: source };
  }
  const jackpotId = resolveJackpotId(typeof source === 'string' ? source : undefined, 'sportpesa-mega');
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
 * Joins an array of league names with commas and natural "and" before the final item.
 * Example: ["Serie A", "Ligue 1", ..., "Eliteserien"] -> "Serie A, Ligue 1, ..., Superliga and Eliteserien"
 */
export function joinLeagueNames(leagues: string[]): string {
  if (!leagues || leagues.length === 0) return '';
  if (leagues.length === 1) return leagues[0];
  if (leagues.length === 2) return `${leagues[0]} and ${leagues[1]}`;
  const allButLast = leagues.slice(0, -1).join(', ');
  return `${allButLast} and ${leagues[leagues.length - 1]}`;
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
  } else if (typeof source === 'string' && source) {
    jackpotId = resolveJackpotId(source, 'sportpesa-mega');
    const jackpot = jackpotsData.find(j => j.id === jackpotId || j.slug === jackpotId);
    if (jackpot && Array.isArray(jackpot.fixtures)) {
      fixtures = jackpot.fixtures;
    }
  } else {
    const defaultJackpot = jackpotsData.find(j => j.id === 'sportpesa-mega');
    if (defaultJackpot && Array.isArray(defaultJackpot.fixtures)) {
      fixtures = defaultJackpot.fixtures;
    }
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

  return [...DEFAULT_SPORTPESA_MEGA_LEAGUES];
}

/**
 * Generates formatted league names text for any jackpot (or SportPesa Mega by default).
 */
export function generateJackpotLeaguesText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto'
): string {
  const leagues = getJackpotLeagueNames(source, mode);
  return joinLeagueNames(leagues);
}

/**
 * Backwards compatibility alias for SportPesa Mega Jackpot.
 */
export function generateMegaJackpotLeaguesText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto'
): string {
  return generateJackpotLeaguesText(source || 'sportpesa-mega', mode);
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
export const DEFAULT_SPORTPESA_MEGA_SELECTIONS = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultSelections!;
export const DEFAULT_SPORTPESA_MEGA_UPSET_ALERT = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultUpsetAlert!;
export const DEFAULT_SPORTPESA_MEGA_SUB_COMBOS = ALL_JACKPOT_CONFIGS['sportpesa-mega'].defaultSubCombosParagraph;

/**
 * Generates upset alert text for any jackpot fixtures.
 */
export function generateJackpotUpsetAlertText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto'
): string {
  const { jackpotId, fixtures } = getFixturesForJackpot(source);
  const cfg = ALL_JACKPOT_CONFIGS[jackpotId];

  // Curated upset alert when explicitly requested
  if (mode === 'curated') {
    return cfg?.defaultUpsetAlert || DEFAULT_SPORTPESA_MEGA_UPSET_ALERT;
  }

  // Dynamic analysis from coupon fixtures
  if (fixtures.length >= 2) {
    const sorted = [...fixtures].sort((a, b) => {
      const confA = typeof a.confidence === 'number' ? a.confidence : 75;
      const confB = typeof b.confidence === 'number' ? b.confidence : 75;
      const isDrawA = normalizeTipSymbol(a.prediction || (a as any).tip || '') === 'X' ? 1 : 0;
      const isDrawB = normalizeTipSymbol(b.prediction || (b as any).tip || '') === 'X' ? 1 : 0;
      if (isDrawA !== isDrawB) return isDrawB - isDrawA;
      return confA - confB;
    });

    const f1 = sorted[0];
    const f2 = sorted[1];

    const getRec = (f: Fixture) => {
      const tip = normalizeTipSymbol(f.prediction || (f as any).tip || '');
      if (tip === 'X') return '1X or X2';
      if (tip === '1') return '1X';
      if (tip === '2' || tip === 'DC2') return 'X2';
      return '1X or X2';
    };

    const f1Rec = getRec(f1);
    const f2Rec = getRec(f2);
    const l1 = formatLeagueName(f1.leagueName || (f1 as any).league || 'League');
    const l2 = formatLeagueName(f2.leagueName || (f2 as any).league || 'League');
    const t1Home = cleanTeamName(f1.homeTeam);
    const t1Away = cleanTeamName(f1.awayTeam);
    const t2Home = cleanTeamName(f2.homeTeam);
    const t2Away = cleanTeamName(f2.awayTeam);

    return `${t1Home} vs ${t1Away} (${l1}) and ${t2Home} vs ${t2Away} (${l2})`;
  }

  return cfg?.defaultUpsetAlert || DEFAULT_SPORTPESA_MEGA_UPSET_ALERT;
}

/**
 * Backwards compatibility alias for SportPesa Mega Jackpot upset alert.
 */
export function generateMegaJackpotUpsetAlertText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto'
): string {
  return generateJackpotUpsetAlertText(source || 'sportpesa-mega', mode);
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
 * Generates formatted date/time schedule text for any jackpot fixtures.
 * Note: Applies +3 hours (UTC+3 / East Africa Time) to all dates/times.
 */
export function generateJackpotScheduleText(
  source?: string | Fixture[],
  mode: 'curated' | 'fixtures' | 'auto' = 'auto',
  timezoneOffsetHours: number = 3
): string {
  const { jackpotId, fixtures } = getFixturesForJackpot(source);
  const cfg = ALL_JACKPOT_CONFIGS[jackpotId];

  if (mode === 'curated') {
    return cfg?.defaultSchedule || DEFAULT_SPORTPESA_MEGA_SCHEDULE;
  }

  if (fixtures.length > 0) {
    const validDates = fixtures
      .map(f => {
        if (!f.kickoffTime) return null;
        const d = new Date(f.kickoffTime.replace(' ', 'T'));
        if (isNaN(d.getTime())) return null;
        return new Date(d.getTime() + timezoneOffsetHours * 60 * 60 * 1000);
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    if (validDates.length > 0) {
      const first = validDates[0];
      const last = validDates[validDates.length - 1];

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      const startDay = daysOfWeek[first.getUTCDay()];
      const startMonth = months[first.getUTCMonth()];
      const startDateNum = first.getUTCDate();
      const startHour = String(first.getUTCHours()).padStart(2, '0');
      const startMinute = String(first.getUTCMinutes()).padStart(2, '0');
      const startTime = `${startHour}:${startMinute}`;

      const endDay = daysOfWeek[last.getUTCDay()];
      const endMonth = months[last.getUTCMonth()];
      const endDateNum = last.getUTCDate();

      if (startDay !== endDay || first.getUTCMonth() !== last.getUTCMonth() || startDateNum !== endDateNum) {
        return `${startDay}, ${startMonth} ${startDateNum}, from ${startTime}, and the last fixture to be played on ${endDay}, ${endMonth} ${endDateNum}`;
      } else {
        return `${startDay}, ${startMonth} ${startDateNum}, from ${startTime}`;
      }
    }
  }

  return cfg?.defaultSchedule || DEFAULT_SPORTPESA_MEGA_SCHEDULE;
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
  format: 'paragraph' | 'list' | 'short';
}

function parseAllTagParams(rawAttrs: string, tagJackpotHint: string, defaultJackpotId: string): ParsedTagParams {
  let jackpotId = resolveJackpotId(tagJackpotHint || defaultJackpotId, defaultJackpotId);
  let count: number | undefined = undefined;
  let mode: 'auto' | 'fixtures' | 'curated' = 'auto';
  let format: 'paragraph' | 'list' | 'short' = 'paragraph';

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

  // Format: :list, :short, :paragraph
  if (/list/i.test(attrs)) {
    format = 'list';
  } else if (/short/i.test(attrs)) {
    format = 'short';
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

  let expanded = content;

  // Regular expression capturing tag components:
  // Group 1: Prefix (or undefined for generic)
  // Group 2: Suffix
  // Group 3: Attributes
  const universalTagRegex = /\{\{\s*(?:(MEGA_JACKPOT|SPORTPESA_MEGA|SPORTPESA_MEGA_JACKPOT|MEGA|BETIKA_MIDWEEK|BETIKA|BETIKA_JACKPOT|MOZZART_GRAND|MOZZART_GRAND_JACKPOT|MOZZART|MOZZART_JACKPOT|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTPESA_MIDWEEK_JACKPOT|MOZZART_SUPER_DAILY|SUPER_DAILY|MOZZART_DAILY|SUPER_DAILY_JACKPOT|JACKPOT)_)?(DATES|DATE|SCHEDULE|SELECTIONS_INCLUDE|SELECTIONS|SELECTION|OUTCOMES|DISTRIBUTION|UPSET_ALERT|UPSET_ALERTS|UPSETS|SUB_COMBOS|SUB_JACKPOTS|COMBOS|BONUSES|TIERS|LEAGUES|LEAGUE_NAMES|DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCES_COUNT|DOUBLE_CHANCE_COUNT|DC_COUNT|DOUBLE_CHANCES|DOUBLE_CHANCE|TOP_FIXTURES|TOP_CONFIDENCE_FIXTURES|TOP_CONFIDENCE)([\s:][^}]*)?\}\}/gi;

  const universalHtmlCommentRegex = /<!--\s*(?:(MEGA_JACKPOT|SPORTPESA_MEGA|SPORTPESA_MEGA_JACKPOT|MEGA|BETIKA_MIDWEEK|BETIKA|BETIKA_JACKPOT|MOZZART_GRAND|MOZZART_GRAND_JACKPOT|MOZZART|MOZZART_JACKPOT|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTPESA_MIDWEEK_JACKPOT|MOZZART_SUPER_DAILY|SUPER_DAILY|MOZZART_DAILY|SUPER_DAILY_JACKPOT|JACKPOT)_)?(DATES|DATE|SCHEDULE|SELECTIONS_INCLUDE|SELECTIONS|SELECTION|OUTCOMES|DISTRIBUTION|UPSET_ALERT|UPSET_ALERTS|UPSETS|SUB_COMBOS|SUB_JACKPOTS|COMBOS|BONUSES|TIERS|LEAGUES|LEAGUE_NAMES|DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCES_COUNT|DOUBLE_CHANCE_COUNT|DC_COUNT|DOUBLE_CHANCES|DOUBLE_CHANCE|TOP_FIXTURES|TOP_CONFIDENCE_FIXTURES|TOP_CONFIDENCE)([\s:][^-]*)?-->/gi;

  const universalBracketRegex = /\[\s*(?:(MEGA_JACKPOT|SPORTPESA_MEGA|SPORTPESA_MEGA_JACKPOT|MEGA|BETIKA_MIDWEEK|BETIKA|BETIKA_JACKPOT|MOZZART_GRAND|MOZZART_GRAND_JACKPOT|MOZZART|MOZZART_JACKPOT|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTPESA_MIDWEEK_JACKPOT|MOZZART_SUPER_DAILY|SUPER_DAILY|MOZZART_DAILY|SUPER_DAILY_JACKPOT|JACKPOT)_)?(DATES|DATE|SCHEDULE|SELECTIONS_INCLUDE|SELECTIONS|SELECTION|OUTCOMES|DISTRIBUTION|UPSET_ALERT|UPSET_ALERTS|UPSETS|SUB_COMBOS|SUB_JACKPOTS|COMBOS|BONUSES|TIERS|LEAGUES|LEAGUE_NAMES|DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCES_COUNT|DOUBLE_CHANCE_COUNT|DC_COUNT|DOUBLE_CHANCES|DOUBLE_CHANCE|TOP_FIXTURES|TOP_CONFIDENCE_FIXTURES|TOP_CONFIDENCE)([\s:][^\]]*)?\]/gi;

  const executeReplacement = (_full: string, prefixRaw: string | undefined, suffixRaw: string, attrsRaw: string | undefined): string => {
    const prefix = prefixRaw ? prefixRaw.toUpperCase() : '';
    const suffix = suffixRaw.toUpperCase();
    const attrs = attrsRaw || '';

    const { jackpotId, count, mode, format } = parseAllTagParams(attrs, prefix, defaultJackpotId);
    const fixturesToUse = customFixtures && jackpotId === defaultJackpotId ? customFixtures : jackpotId;

    switch (suffix) {
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
      case 'UPSETS':
        return generateJackpotUpsetAlertText(fixturesToUse, mode);

      case 'SUB_COMBOS':
      case 'SUB_JACKPOTS':
      case 'COMBOS':
      case 'BONUSES':
      case 'TIERS':
        return generateJackpotSubCombosText(jackpotId, format);

      case 'LEAGUES':
      case 'LEAGUE_NAMES':
        return generateJackpotLeaguesText(fixturesToUse, mode);

      case 'DOUBLE_CHANCE_FIXTURES':
      case 'DOUBLE_CHANCES':
      case 'DOUBLE_CHANCE':
        return generateDoubleChanceFixturesMarkdown(fixturesToUse, count);

      case 'TOP_FIXTURES':
      case 'TOP_CONFIDENCE_FIXTURES':
      case 'TOP_CONFIDENCE':
        return generateTopConfidenceFixturesMarkdown(fixturesToUse, count || 7);

      default:
        return _full;
    }
  };

  // Top confidence shorthand prefix pattern: e.g. {{TOP_MEGA_JACKPOT_FIXTURES}}, {{TOP_BETIKA_MIDWEEK_FIXTURES}}, etc.
  const topPrefixMustache = /\{\{\s*TOP_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^}]*)?\}\}/gi;
  const topPrefixHtmlComment = /<!--\s*TOP_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^-]*)?-->/gi;
  const topPrefixBracket = /\[\s*TOP_(MEGA_JACKPOT|SPORTPESA_MEGA|BETIKA_MIDWEEK|BETIKA|MOZZART_GRAND|MOZZART|SPORTPESA_MIDWEEK|SP_MIDWEEK|MIDWEEK|SPORTYBET_JACKPOT|SPORTYBET|BETPAWA_PICK_JACKPOT|BETPAWA_PICK|BETPAWA|ODIBET_LAKI_TATU|ODIBET|LAKI_TATU|MOZZART_SUPER_DAILY|SUPER_DAILY|JACKPOT)_FIXTURES([\s:][^\]]*)?\]/gi;

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
 * Asynchronously expands markdown by fetching current fixtures directly from the live database for SportPesa Mega.
 */
export async function expandTopFixturesParametersAsync(
  content: string,
  defaultJackpotId: string = 'sportpesa-mega'
): Promise<string> {
  const liveFixtures = defaultJackpotId === 'sportpesa-mega' ? await fetchLiveMegaJackpotFixtures() : undefined;
  return expandTopFixturesParameters(content, defaultJackpotId, liveFixtures);
}
