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
let lastLiveFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

/**
 * Manually update the live jackpot fixtures cache (called by App.tsx or dataStore when DB data arrives).
 */
export function setLiveJackpotFixturesCache(fixtures: Fixture[]): void {
  if (Array.isArray(fixtures) && fixtures.length > 0) {
    liveMegaJackpotFixturesCache = fixtures;
    lastLiveFetchTime = Date.now();
  }
}

/**
 * Get current cached database fixtures if available.
 */
export function getCachedLiveJackpotFixtures(): Fixture[] | null {
  return liveMegaJackpotFixturesCache;
}

/**
 * Actively fetches the current SportPesa Mega Jackpot fixtures and predictions directly from the database API.
 */
export async function fetchLiveMegaJackpotFixtures(forceRefresh: boolean = false): Promise<Fixture[]> {
  const now = Date.now();
  if (!forceRefresh && liveMegaJackpotFixturesCache && liveMegaJackpotFixturesCache.length > 0 && (now - lastLiveFetchTime < CACHE_TTL_MS)) {
    return liveMegaJackpotFixturesCache;
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
        const mega = data.find((j: any) => 
          j.id === 'sportpesa-mega' || 
          j.slug === 'sportpesa-mega' || 
          j.name?.toLowerCase().includes('mega')
        );

        if (mega && Array.isArray(mega.fixtures) && mega.fixtures.length > 0) {
          const parsedFixtures: Fixture[] = mega.fixtures.map((f: any, idx: number) => ({
            id: f.id || idx + 1,
            fixtureNumber: f.fixtureNumber || f.position || idx + 1,
            homeTeam: f.homeTeam || f.home_team_name || 'Home Team',
            awayTeam: f.awayTeam || f.away_team_name || 'Away Team',
            prediction: f.tip || f.prediction || '1',
            tip: f.tip || f.prediction || '1',
            confidence: Number(f.confidence) || 75,
            leagueName: f.leagueName || '',
            countryName: f.countryName || '',
            kickoffTime: f.kickoffTime || f.date || '',
            status: f.status || 'NS',
            result: f.result || 'pending',
            homeScore: f.homeScore !== undefined ? f.homeScore : '-',
            awayScore: f.awayScore !== undefined ? f.awayScore : '-'
          }));

          liveMegaJackpotFixturesCache = parsedFixtures;
          lastLiveFetchTime = now;
          return parsedFixtures;
        }
      }
    }
  } catch (err) {
    console.warn('[topJackpotFixtures] Warning fetching live database fixtures:', err);
  }

  if (liveMegaJackpotFixturesCache && liveMegaJackpotFixturesCache.length > 0) {
    return liveMegaJackpotFixturesCache;
  }

  const fallback = jackpotsData.find(j => j.id === 'sportpesa-mega') || jackpotsData[0];
  return fallback?.fixtures || [];
}

// Preload database fixtures in background if fetch is available
if (typeof fetch !== 'undefined') {
  fetchLiveMegaJackpotFixtures().catch(() => {});
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
  let fixtures: Fixture[] = [];

  if (Array.isArray(source) && source.length > 0) {
    fixtures = source;
  } else if (liveMegaJackpotFixturesCache && liveMegaJackpotFixturesCache.length > 0) {
    fixtures = liveMegaJackpotFixturesCache;
  } else {
    const jackpotId = typeof source === 'string' ? source : 'sportpesa-mega';
    const jackpot = jackpotsData.find(
      j => j.id === jackpotId || j.slug === jackpotId || j.id.toLowerCase().includes(jackpotId.toLowerCase())
    ) || jackpotsData.find(j => j.id === 'sportpesa-mega') || jackpotsData[0];
    fixtures = jackpot?.fixtures || [];
  }

  if (!fixtures || fixtures.length === 0) {
    return [];
  }

  // 1. Check if the active jackpot fixtures contain the curated SportPesa Mega targets from the database
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
      const suffix = isHighest ? ' (The game with the hifhest confidence score)' : '';
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

  // 2. Generic dynamic fallback: Clamp count to reasonable range (between 5 and 7 by default)
  const targetCount = Math.min(Math.max(count || 7, 3), Math.min(fixtures.length, 17));

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
    const suffix = isHighest ? ' (The game with the hifhest confidence score)' : '';
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
  let fixtures: Fixture[] = [];

  if (Array.isArray(source) && source.length > 0) {
    fixtures = source;
  } else if (liveMegaJackpotFixturesCache && liveMegaJackpotFixturesCache.length > 0) {
    fixtures = liveMegaJackpotFixturesCache;
  } else {
    const jackpotId = typeof source === 'string' ? source : 'sportpesa-mega';
    const jackpot = jackpotsData.find(
      j => j.id === jackpotId || j.slug === jackpotId || j.id.toLowerCase().includes(jackpotId.toLowerCase())
    ) || jackpotsData.find(j => j.id === 'sportpesa-mega') || jackpotsData[0];
    fixtures = jackpot?.fixtures || [];
  }

  if (!fixtures || fixtures.length === 0) {
    return [];
  }

  // 1. Curated picks matching double-chance targets
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
      const suffix = isHighest ? ' (The game with the hifhest confidence score)' : '';
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
 * Replaces any top confidence or double chance parameter / shortcode in markdown content with real dynamic jackpot fixtures.
 * 
 * Supported parameters in markdown:
 * - Top Confidence:
 *   - `{{TOP_MEGA_JACKPOT_FIXTURES}}` or `{{TOP_MEGA_JACKPOT_FIXTURES:5}}` or `{{TOP_MEGA_JACKPOT_FIXTURES:7}}`
 *   - `<!-- TOP_MEGA_JACKPOT_FIXTURES -->`
 *   - `{{TOP_CONFIDENCE_FIXTURES}}`
 *   - `[TOP_MEGA_JACKPOT_FIXTURES]`
 * - Double Chances:
 *   - `{{MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES}}` or `{{DOUBLE_CHANCE_FIXTURES}}` or `{{TOP_DOUBLE_CHANCE_FIXTURES}}`
 *   - `{{SPORTPESA_MEGA_DOUBLE_CHANCES}}` or `{{DOUBLE_CHANCES}}` or `{{DOUBLE_CHANCE}}`
 *   - `<!-- MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES -->` or `<!-- DOUBLE_CHANCE_FIXTURES -->`
 *   - `[MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES]` or `[DOUBLE_CHANCE_FIXTURES]`
 */
export function expandTopFixturesParameters(
  content: string,
  defaultJackpotId: string = 'sportpesa-mega',
  customFixtures?: Fixture[]
): string {
  if (!content) return content;

  // Helper to extract count and jackpot from matched attribute strings
  const parseParams = (rawAttrs: string, defaultCnt?: number): { count: number | undefined; jackpotId: string } => {
    let count = defaultCnt;
    let jackpotId = defaultJackpotId;

    if (!rawAttrs) return { count, jackpotId };

    // Format :5 or :7
    const colonMatch = rawAttrs.match(/^:(\d+)/);
    if (colonMatch) {
      count = parseInt(colonMatch[1], 10);
    }

    // Key-value pairs: count=5 or count="5"
    const countMatch = rawAttrs.match(/count\s*=\s*["']?(\d+)["']?/i);
    if (countMatch) {
      count = parseInt(countMatch[1], 10);
    }

    // Key-value pairs: jackpot="sportpesa-mega"
    const jackpotMatch = rawAttrs.match(/(?:jackpot|id)\s*=\s*["']?([a-zA-Z0-9_-]+)["']?/i);
    if (jackpotMatch) {
      jackpotId = jackpotMatch[1];
    }

    return { count, jackpotId };
  };

  // 1. Double Chance patterns: {{MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES ...}}, {{DOUBLE_CHANCE_FIXTURES ...}}, etc.
  const dcMustacheRegex = /\{\{\s*(?:MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCE_FIXTURES|TOP_DOUBLE_CHANCE_FIXTURES|SPORTPESA_MEGA_DOUBLE_CHANCES|DOUBLE_CHANCE|DOUBLE_CHANCES|MEGA_JACKPOT_DOUBLE_CHANCE)([\s:][^}]*)?\}\}/gi;
  const dcHtmlCommentRegex = /<!--\s*(?:MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCE_FIXTURES|TOP_DOUBLE_CHANCE_FIXTURES|SPORTPESA_MEGA_DOUBLE_CHANCES|DOUBLE_CHANCE|DOUBLE_CHANCES|MEGA_JACKPOT_DOUBLE_CHANCE)([\s:][^-]*)?-->/gi;
  const dcBracketRegex = /\[\s*(?:MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES|DOUBLE_CHANCE_FIXTURES|TOP_DOUBLE_CHANCE_FIXTURES|SPORTPESA_MEGA_DOUBLE_CHANCES|DOUBLE_CHANCE|DOUBLE_CHANCES|MEGA_JACKPOT_DOUBLE_CHANCE)([\s:][^\]]*)?\]/gi;

  // 2. Top Confidence patterns: {{TOP_MEGA_JACKPOT_FIXTURES ...}}, {{TOP_CONFIDENCE_FIXTURES ...}}, etc.
  const topMustacheRegex = /\{\{\s*(?:TOP_MEGA_JACKPOT_FIXTURES|TOP_CONFIDENCE_FIXTURES|SPORTPESA_MEGA_TOP_CONFIDENCE|TOP_CONFIDENCE_JACKPOT_FIXTURES)([\s:][^}]*)?\}\}/gi;
  const topHtmlCommentRegex = /<!--\s*(?:TOP_MEGA_JACKPOT_FIXTURES|TOP_CONFIDENCE_FIXTURES|SPORTPESA_MEGA_TOP_CONFIDENCE|TOP_CONFIDENCE_JACKPOT_FIXTURES)([\s:][^-]*)?-->/gi;
  const topBracketRegex = /\[\s*(?:TOP_MEGA_JACKPOT_FIXTURES|TOP_CONFIDENCE_FIXTURES|SPORTPESA_MEGA_TOP_CONFIDENCE)([\s:][^\]]*)?\]/gi;

  let expanded = content;

  // Expand double chances first
  expanded = expanded.replace(dcMustacheRegex, (_match, attrs) => {
    const { count, jackpotId } = parseParams(attrs?.trim() || '');
    return generateDoubleChanceFixturesMarkdown(customFixtures || jackpotId, count);
  });

  expanded = expanded.replace(dcHtmlCommentRegex, (_match, attrs) => {
    const { count, jackpotId } = parseParams(attrs?.trim() || '');
    return generateDoubleChanceFixturesMarkdown(customFixtures || jackpotId, count);
  });

  expanded = expanded.replace(dcBracketRegex, (_match, attrs) => {
    const { count, jackpotId } = parseParams(attrs?.trim() || '');
    return generateDoubleChanceFixturesMarkdown(customFixtures || jackpotId, count);
  });

  // Expand top confidence fixtures
  expanded = expanded.replace(topMustacheRegex, (_match, attrs) => {
    const { count, jackpotId } = parseParams(attrs?.trim() || '', 7);
    return generateTopConfidenceFixturesMarkdown(customFixtures || jackpotId, count || 7);
  });

  expanded = expanded.replace(topHtmlCommentRegex, (_match, attrs) => {
    const { count, jackpotId } = parseParams(attrs?.trim() || '', 7);
    return generateTopConfidenceFixturesMarkdown(customFixtures || jackpotId, count || 7);
  });

  expanded = expanded.replace(topBracketRegex, (_match, attrs) => {
    const { count, jackpotId } = parseParams(attrs?.trim() || '', 7);
    return generateTopConfidenceFixturesMarkdown(customFixtures || jackpotId, count || 7);
  });

  return expanded;
}

/**
 * Asynchronously expands markdown by first fetching current fixtures directly from the live database.
 */
export async function expandTopFixturesParametersAsync(
  content: string,
  defaultJackpotId: string = 'sportpesa-mega'
): Promise<string> {
  const liveFixtures = await fetchLiveMegaJackpotFixtures();
  return expandTopFixturesParameters(content, defaultJackpotId, liveFixtures);
}
