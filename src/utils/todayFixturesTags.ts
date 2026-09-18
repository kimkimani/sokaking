import { Fixture } from '../types';
import { fixturesData } from '../data';
import { isSameDay } from './predictionGenerator';
import { getApiBaseUrl } from '../lib/getApiBaseUrl';

// Module-level live fixtures cache for today category
let liveTodayFixturesCache: Fixture[] | null = null;
let lastLiveTodayFetchTime = 0;
const TODAY_CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL

/**
 * Manually populate or update the today category live fixtures cache.
 */
export function setLiveTodayFixturesCache(fixtures: Fixture[]): void {
  if (Array.isArray(fixtures) && fixtures.length > 0) {
    liveTodayFixturesCache = fixtures;
    lastLiveTodayFetchTime = Date.now();
  }
}

/**
 * Get current cached today category fixtures if available.
 */
export function getCachedLiveTodayFixtures(): Fixture[] | null {
  return liveTodayFixturesCache;
}

/**
 * Check if live today category fixtures are currently cached in memory.
 */
export function hasLiveTodayFixtures(): boolean {
  return Array.isArray(liveTodayFixturesCache) && liveTodayFixturesCache.length > 0;
}

/**
 * Actively fetches today category fixtures directly from the live database API.
 */
export async function fetchLiveTodayFixtures(forceRefresh: boolean = false): Promise<Fixture[]> {
  const now = Date.now();
  if (!forceRefresh && liveTodayFixturesCache && liveTodayFixturesCache.length > 0 && (now - lastLiveTodayFetchTime < TODAY_CACHE_TTL_MS)) {
    return liveTodayFixturesCache;
  }

  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/predictions?category=today`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        liveTodayFixturesCache = data;
        lastLiveTodayFetchTime = now;
        return data;
      }
    }
  } catch (err) {
    // Fail gracefully to cache or local store
  }

  return liveTodayFixturesCache || [];
}

/**
 * Normalizes a raw prediction string for Marquee fixture tip display (e.g. (1X), (1), (OV 2.5)).
 * Extracts clean tip code if wrapped in descriptive labels like "Double Chance (1X)".
 */
export function formatMarqueeTip(prediction: string): string {
  if (!prediction) return '1';
  const clean = prediction.trim();

  // If in format "Double Chance (1X)" or "Home Win (1)", extract the inner tip
  const parenMatch = clean.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }

  return clean;
}

/**
 * Normalizes a raw prediction string into a clean readable tip for tag formatting and display.
 * Preserves database prediction codes or formats clearly.
 */
export function formatTipLabel(prediction: string): string {
  if (!prediction) return 'Tip';
  const clean = prediction.trim();
  const p = clean.toLowerCase();

  // Over 2.5 -> 3+ Goals
  if (
    p.includes('over 2.5') || 
    p.includes('ov 2.5') || 
    p.includes('o2.5') || 
    p.includes('over25') || 
    p.includes('ov 25') || 
    p.includes('> 2.5') || 
    p.includes('>2.5') ||
    p === '2.5 goals' ||
    p === '3+ goals' ||
    p === '3+'
  ) {
    return '3+ Goals';
  }

  // Over 1.5 -> 2+ Goals
  if (
    p.includes('over 1.5') || 
    p.includes('ov 1.5') || 
    p.includes('o1.5') || 
    p.includes('over15') || 
    p.includes('ov 15') || 
    p.includes('> 1.5') || 
    p.includes('>1.5') ||
    p === '1.5 goals' ||
    p === '2+ goals' ||
    p === '2+'
  ) {
    return '2+ Goals';
  }

  return clean;
}

/**
 * Formats a list of strings into natural English list with commas and 'and' before the last item.
 * Example: ["Premier League", "La Liga", "Serie A", "Bundesliga"] -> "Premier League, La Liga, Serie A and Bundesliga"
 */
export function formatListWithAnd(items: string[]): string {
  const filtered = items.map(s => (s || '').trim()).filter(Boolean);
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(', ')} and ${filtered[filtered.length - 1]}`;
}

/**
 * Retrieves today's fixtures dynamically from live cache, provided list, or API.
 * Ensures data always reflects the current today fixtures.
 */
export function getResolvedTodayFixtures(fixtures?: Fixture[]): Fixture[] {
  const today = new Date();

  // 1. If explicitly provided fixtures contains matches scheduled for today, prioritize them
  if (Array.isArray(fixtures) && fixtures.length > 0) {
    const todayMatches = fixtures.filter(f => isSameDay(f.kickoffTime, today));
    if (todayMatches.length > 0) return todayMatches;
  }

  // 2. If live today fixtures cache is populated, return it
  if (liveTodayFixturesCache && liveTodayFixturesCache.length > 0) {
    return liveTodayFixturesCache;
  }

  // 3. If provided fixtures was specifically passed and has fixtures (and not obviously a multi-day jackpot)
  if (Array.isArray(fixtures) && fixtures.length > 0 && fixtures.length <= 15) {
    return fixtures;
  }

  // 4. In browser environment, trigger background fetch if cache empty
  if (typeof window !== 'undefined' && (!liveTodayFixturesCache || liveTodayFixturesCache.length === 0)) {
    fetchLiveTodayFixtures().catch(() => {});
  }

  // 5. Fallback to default fixturesData.today
  return fixturesData.today || [];
}

/**
 * Generates Tag 1: Top two marquee today fixtures.
 * Syntax: fixture (tip) and fixture (tip)
 * Example: "Arsenal vs Chelsea (1X) in English Premier League and Real Madrid vs Barcelona (1) in Spanish La Liga"
 */
export function getTopTwoTodayFixturesText(fixtures?: Fixture[]): string {
  const todayFixtures = getResolvedTodayFixtures(fixtures);
  if (!todayFixtures || todayFixtures.length === 0) {
    return 'No today fixtures available';
  }

  // Sort by highest confidence first, then earliest kickoff time
  const sorted = [...todayFixtures].sort((a, b) => {
    const confA = typeof a.confidence === 'number' ? a.confidence : 75;
    const confB = typeof b.confidence === 'number' ? b.confidence : 75;
    if (confB !== confA) return confB - confA;
    const timeA = a.kickoffTime ? new Date(a.kickoffTime).getTime() || 0 : 0;
    const timeB = b.kickoffTime ? new Date(b.kickoffTime).getTime() || 0 : 0;
    return timeA - timeB;
  });

  const topTwo = sorted.slice(0, 2);

  const formattedItems = topTwo.map(f => {
    const matchName = `${f.homeTeam} vs ${f.awayTeam}`;
    const tip = formatMarqueeTip(f.prediction);
    const league = (f.leagueName || '').trim();
    const leaguePart = league 
      ? (league.toLowerCase().startsWith('in ') ? ` ${league}` : ` in ${league}`) 
      : '';
    return `${matchName} (${tip})${leaguePart}`;
  });

  return formatListWithAnd(formattedItems);
}

/**
 * Generates Tag 2: Today's leagues roundup.
 * Syntax: league, league, league and league
 * Example: "English Premier League, Spanish La Liga, Italian Serie A, German Bundesliga and UEFA Champions League"
 */
export function getTodayLeaguesText(fixtures?: Fixture[]): string {
  const todayFixtures = getResolvedTodayFixtures(fixtures);
  if (!todayFixtures || todayFixtures.length === 0) {
    return 'All Major Leagues';
  }

  // Extract unique league names preserving order of appearance
  const leagueSet = new Set<string>();
  const leagues: string[] = [];

  for (const f of todayFixtures) {
    const league = (f.leagueName || '').trim();
    if (league && !leagueSet.has(league.toLowerCase())) {
      leagueSet.add(league.toLowerCase());
      leagues.push(league);
    }
  }

  if (leagues.length === 0) {
    return 'All Major Leagues';
  }

  return formatListWithAnd(leagues);
}

/**
 * Classifies a fixture prediction into normalized prediction categories.
 * Preserves database values like ov 2.5, ov 1.5, double chance, home win, away win.
 */
export function classifyPredictionCategory(prediction: string): string {
  const p = (prediction || '').toLowerCase().trim();

  // 1. Double Chance (check first so 1X is not classified as 1)
  if (
    p.includes('double chance') || 
    p.includes('1x') || 
    p.includes('x2') || 
    p.includes('12') || 
    p.includes('2x') || 
    p.includes('dc') ||
    p.includes('or draw') || 
    p.includes('draw or')
  ) {
    return 'double chance';
  }

  // 2. Over 2.5 / ov 2.5
  if (
    p.includes('over 2.5') || 
    p.includes('ov 2.5') || 
    p.includes('o2.5') || 
    p.includes('over25') || 
    p.includes('ov 25') || 
    p.includes('> 2.5') || 
    p.includes('>2.5') ||
    p.includes('3+ goals') ||
    p.includes('3+goals') ||
    p.includes('3+') ||
    p === '2.5 goals'
  ) {
    return 'ov 2.5';
  }

  // 3. Over 1.5 / ov 1.5
  if (
    p.includes('over 1.5') || 
    p.includes('ov 1.5') || 
    p.includes('o1.5') || 
    p.includes('over15') || 
    p.includes('ov 15') || 
    p.includes('> 1.5') || 
    p.includes('>1.5') ||
    p.includes('2+ goals') ||
    p.includes('2+goals') ||
    p.includes('2+') ||
    p === '1.5 goals'
  ) {
    return 'ov 1.5';
  }

  // 4. Under 2.5 / un 2.5
  if (
    p.includes('under 2.5') || 
    p.includes('un 2.5') || 
    p.includes('u2.5') || 
    p.includes('< 2.5') || 
    p.includes('<2.5')
  ) {
    return 'un 2.5';
  }

  // 5. Under 1.5 / un 1.5
  if (
    p.includes('under 1.5') || 
    p.includes('un 1.5') || 
    p.includes('u1.5') || 
    p.includes('< 1.5') || 
    p.includes('<1.5')
  ) {
    return 'un 1.5';
  }

  // 6. BTTS / GG
  if (
    p.includes('btts') || 
    p.includes('both teams to score') || 
    p.includes('gg')
  ) {
    return 'BTTS';
  }

  // 7. Home Win
  if (
    p.includes('home win') || 
    p.includes('home') || 
    p === '1' || 
    p.startsWith('1 ') || 
    p.endsWith('(1)')
  ) {
    return 'home win';
  }

  // 8. Away Win
  if (
    p.includes('away win') || 
    p.includes('away') || 
    p === '2' || 
    p.startsWith('2 ') || 
    p.endsWith('(2)')
  ) {
    return 'away win';
  }

  // 9. Draw
  if (
    p.includes('draw') || 
    p === 'x' || 
    p === 'X' || 
    p.endsWith('(x)') || 
    p.endsWith('(X)')
  ) {
    return 'draw';
  }

  return prediction.trim();
}

/**
 * Generates Tag 3: Today's Market Predictions Distribution.
 * Format: "count category, count category and count category"
 * Example: "3 ov 2.5, 1 double chance and 1 home win"
 */
export function getTodayPredictionsSummaryText(fixtures?: Fixture[]): string {
  const todayFixtures = getResolvedTodayFixtures(fixtures);
  if (!todayFixtures || todayFixtures.length === 0) {
    return '0 predictions';
  }

  // Count occurrences of each category
  const categoryCounts = new Map<string, number>();

  for (const f of todayFixtures) {
    const cat = classifyPredictionCategory(f.prediction);
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  }

  // Preferred category order for clean readability
  const preferredOrder = [
    'ov 2.5',
    'double chance',
    'home win',
    'ov 1.5',
    'away win',
    'draw',
    'BTTS',
    'un 2.5',
    'un 1.5'
  ];

  const orderedCategories: string[] = [];

  for (const cat of preferredOrder) {
    if (categoryCounts.has(cat)) {
      orderedCategories.push(cat);
    }
  }

  // Add any remaining unlisted categories
  for (const [cat] of categoryCounts.entries()) {
    if (!orderedCategories.includes(cat)) {
      orderedCategories.push(cat);
    }
  }

  const formattedItems = orderedCategories.map(cat => {
    const count = categoryCounts.get(cat) || 0;
    return `${count} ${cat}`;
  });

  return formatListWithAnd(formattedItems);
}

/**
 * Returns total count of today category predictions.
 */
export function getTodayPredictionsCountText(fixtures?: Fixture[]): string {
  const todayFixtures = getResolvedTodayFixtures(fixtures);
  return String(todayFixtures.length);
}

/**
 * Returns all three tags as a structured object.
 */
export function getTodayTags(fixtures?: Fixture[]) {
  return {
    topTwoFixtures: getTopTwoTodayFixturesText(fixtures),
    leagues: getTodayLeaguesText(fixtures),
    predictionsSummary: getTodayPredictionsSummaryText(fixtures),
    predictionsCount: getTodayPredictionsCountText(fixtures)
  };
}

/**
 * Expands all today fixture tag placeholders in text/markdown synchronously.
 * 
 * Supported tags:
 * - Top Two Marquee Fixtures: {{TODAY_TOP_FIXTURES}}, {{TODAY_TOP_TWO_FIXTURES}}, {{TOP_TWO_TODAY_FIXTURES}}, {{TOP_TODAY_FIXTURES}}
 * - Today's Leagues Roundup: {{TODAY_LEAGUES}}, {{TODAY_LEAGUE_NAMES}}, {{TODAY_FIXTURES_LEAGUES}}
 * - Today's Market Predictions Distribution: {{TODAY_PREDICTIONS}}, {{TODAY_PREDICTIONS_SUMMARY}}
 * - Today's Predictions Count: {{TODAY_PREDICTIONS_COUNT}}
 * 
 * Also supports <!-- ... --> and [...] syntax.
 */
export function expandTodayFixturesTags(content: string, customFixtures?: Fixture[]): string {
  if (!content) return content;

  const topTwo = getTopTwoTodayFixturesText(customFixtures);
  const leagues = getTodayLeaguesText(customFixtures);
  const predictionsSummary = getTodayPredictionsSummaryText(customFixtures);
  const predictionsCount = getTodayPredictionsCountText(customFixtures);

  let result = content;

  // 1. Top two marquee today fixtures tag regexes
  const topTwoRegexes = [
    /\{\{\s*(?:TODAY_TOP_FIXTURES|TODAY_TOP_TWO_FIXTURES|TOP_TWO_TODAY_FIXTURES|TOP_TODAY_FIXTURES|TODAY_TOP_2_FIXTURES|TOP_2_TODAY_FIXTURES|TODAY_FIXTURES_TOP_TWO|TODAY_FIXTURES_TOP_2)\s*\}\}/gi,
    /<!--\s*(?:TODAY_TOP_FIXTURES|TODAY_TOP_TWO_FIXTURES|TOP_TWO_TODAY_FIXTURES|TOP_TODAY_FIXTURES|TODAY_TOP_2_FIXTURES|TOP_2_TODAY_FIXTURES|TODAY_FIXTURES_TOP_TWO|TODAY_FIXTURES_TOP_2)\s*-->/gi,
    /(?<!\[)\[(?!\[)\s*(?:TODAY_TOP_FIXTURES|TODAY_TOP_TWO_FIXTURES|TOP_TWO_TODAY_FIXTURES|TOP_TODAY_FIXTURES|TODAY_TOP_2_FIXTURES|TOP_2_TODAY_FIXTURES|TODAY_FIXTURES_TOP_TWO|TODAY_FIXTURES_TOP_2)\s*\](?!\])/gi
  ];

  for (const rgx of topTwoRegexes) {
    result = result.replace(rgx, topTwo);
  }

  // 2. Today fixtures league names tag regexes
  const leaguesRegexes = [
    /\{\{\s*(?:TODAY_LEAGUES|TODAY_LEAGUE_NAMES|TODAY_FIXTURES_LEAGUES|TODAY_FIXTURES_LEAGUE_NAMES|LEAGUES_TODAY)\s*\}\}/gi,
    /<!--\s*(?:TODAY_LEAGUES|TODAY_LEAGUE_NAMES|TODAY_FIXTURES_LEAGUES|TODAY_FIXTURES_LEAGUE_NAMES|LEAGUES_TODAY)\s*-->/gi,
    /(?<!\[)\[(?!\[)\s*(?:TODAY_LEAGUES|TODAY_LEAGUE_NAMES|TODAY_FIXTURES_LEAGUES|TODAY_FIXTURES_LEAGUE_NAMES|LEAGUES_TODAY)\s*\](?!\])/gi
  ];

  for (const rgx of leaguesRegexes) {
    result = result.replace(rgx, leagues);
  }

  // 3. Today predictions count tag regexes
  const countRegexes = [
    /\{\{\s*(?:TODAY_PREDICTIONS_COUNT|TODAY_PREDICTION_COUNT|TODAY_COUNT|TODAY_FIXTURES_COUNT)\s*\}\}/gi,
    /<!--\s*(?:TODAY_PREDICTIONS_COUNT|TODAY_PREDICTION_COUNT|TODAY_COUNT|TODAY_FIXTURES_COUNT)\s*-->/gi,
    /(?<!\[)\[(?!\[)\s*(?:TODAY_PREDICTIONS_COUNT|TODAY_PREDICTION_COUNT|TODAY_COUNT|TODAY_FIXTURES_COUNT)\s*\](?!\])/gi
  ];

  for (const rgx of countRegexes) {
    result = result.replace(rgx, predictionsCount);
  }

  // 4. Today market predictions distribution/summary tag regexes
  const predictionsRegexes = [
    /\{\{\s*(?:TODAY_PREDICTIONS|TODAY_PREDICTIONS_SUMMARY|TODAY_PREDICTION_SUMMARY|TODAY_PREDICTIONS_DISTRIBUTION|TODAY_PREDICTION_DISTRIBUTION|TODAY_PREDICTION|TODAY_TIPS|TODAY_TIPS_SUMMARY)\s*\}\}/gi,
    /<!--\s*(?:TODAY_PREDICTIONS|TODAY_PREDICTIONS_SUMMARY|TODAY_PREDICTION_SUMMARY|TODAY_PREDICTIONS_DISTRIBUTION|TODAY_PREDICTION_DISTRIBUTION|TODAY_PREDICTION|TODAY_TIPS|TODAY_TIPS_SUMMARY)\s*-->/gi,
    /(?<!\[)\[(?!\[)\s*(?:TODAY_PREDICTIONS|TODAY_PREDICTION|TODAY_PREDICTIONS_DISTRIBUTION|TODAY_PREDICTION_DISTRIBUTION|TODAY_PREDICTIONS_SUMMARY|TODAY_PREDICTION_SUMMARY|TODAY_TIPS|TODAY_TIPS_SUMMARY)\s*\](?!\])/gi
  ];

  for (const rgx of predictionsRegexes) {
    result = result.replace(rgx, predictionsSummary);
  }

  return result;
}

/**
 * Asynchronously expands today fixture tags by ensuring live today category data is fetched from the database API.
 */
export async function expandTodayFixturesTagsAsync(content: string, customFixtures?: Fixture[]): Promise<string> {
  if (!content) return content;
  if (!liveTodayFixturesCache || liveTodayFixturesCache.length === 0) {
    await fetchLiveTodayFixtures();
  }
  return expandTodayFixturesTags(content, customFixtures);
}

