import { Fixture } from '../types';
import { fixturesData } from '../data';
import { isSameDay } from './predictionGenerator';

/**
 * Normalizes a raw prediction string into a clean readable tip for tag formatting and display.
 * Maps Over 2.5/ov 2.5 to '3+ Goals' and Over 1.5/ov 1.5 to '2+ Goals'.
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

  // Standardize common variations if needed, otherwise preserve the clear prediction
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
 * Retrieves today's fixtures from either a provided list or the default data seed.
 */
export function getResolvedTodayFixtures(fixtures?: Fixture[]): Fixture[] {
  const today = new Date();
  if (Array.isArray(fixtures) && fixtures.length > 0) {
    const todayMatches = fixtures.filter(f => isSameDay(f.kickoffTime, today));
    if (todayMatches.length > 0) return todayMatches;
    // If none matched today's date strictly (e.g. mock date mismatch), use the provided fixtures
    return fixtures;
  }
  return fixturesData.today || [];
}

/**
 * Generates Tag 1: Top two today fixtures.
 * Format: "fixture (tip) and fixture (tip)"
 * Example: "Arsenal vs Aston Villa (Double Chance (1X)) and Paris Saint-Germain vs Marseille (Home Win (1))"
 */
export function getTopTwoTodayFixturesText(fixtures?: Fixture[]): string {
  const todayFixtures = getResolvedTodayFixtures(fixtures);
  if (!todayFixtures || todayFixtures.length === 0) {
    return 'No today fixtures available';
  }

  // Sort by highest confidence first, then kickoff time
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
    const tip = formatTipLabel(f.prediction);
    return `${matchName} (${tip})`;
  });

  return formatListWithAnd(formattedItems);
}

/**
 * Generates Tag 2: Today fixtures league names.
 * Format: "league, league, league and league"
 * Example: "Premier League, La Liga, Bundesliga and Ligue 1"
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

  return formatListWithAnd(leagues);
}

/**
 * Classifies a fixture prediction into normalized prediction categories.
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
    p.includes('or draw') || 
    p.includes('draw or')
  ) {
    return 'double chance';
  }

  // 2. Over 2.5 -> 3+ Goals
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
    return '3+ Goals';
  }

  // 3. Over 1.5 -> 2+ Goals
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
    return '2+ Goals';
  }

  // 4. Under 2.5
  if (
    p.includes('under 2.5') || 
    p.includes('un 2.5') || 
    p.includes('u2.5') || 
    p.includes('< 2.5') || 
    p.includes('<2.5')
  ) {
    return 'un 2.5';
  }

  // 5. Under 1.5
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
 * Generates Tag 3: Today predictions summary/breakdown.
 * Format: "2 ov 2.5, 2 double chance, 1 home win, 2 ov 1.5 and 1 away win"
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

  // Preferred category order for clean readability (matching user's example style)
  const preferredOrder = [
    '3+ Goals',
    'double chance',
    'home win',
    '2+ Goals',
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
 * Returns all three tags as a structured object.
 */
export function getTodayTags(fixtures?: Fixture[]) {
  return {
    topTwoFixtures: getTopTwoTodayFixturesText(fixtures),
    leagues: getTodayLeaguesText(fixtures),
    predictionsSummary: getTodayPredictionsSummaryText(fixtures)
  };
}

/**
 * Expands all today fixture tag placeholders in text/markdown.
 * 
 * Supported tags:
 * - {{TODAY_TOP_FIXTURES}}, {{TODAY_TOP_TWO_FIXTURES}}, {{TOP_TWO_TODAY_FIXTURES}}, {{TOP_TODAY_FIXTURES}}
 * - {{TODAY_LEAGUES}}, {{TODAY_LEAGUE_NAMES}}, {{TODAY_FIXTURES_LEAGUES}}
 * - {{TODAY_PREDICTIONS}}, {{TODAY_PREDICTION}}, {{TODAY_PREDICTIONS_COUNT}}, {{TODAY_PREDICTIONS_DISTRIBUTION}}, {{TODAY_PREDICTIONS_SUMMARY}}
 * 
 * Also supports <!-- ... --> and [...] syntax.
 */
export function expandTodayFixturesTags(content: string, customFixtures?: Fixture[]): string {
  if (!content) return content;

  const topTwo = getTopTwoTodayFixturesText(customFixtures);
  const leagues = getTodayLeaguesText(customFixtures);
  const predictions = getTodayPredictionsSummaryText(customFixtures);

  let result = content;

  // 1. Top two today fixtures tag regexes
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

  // 3. Today predictions count/breakdown tag regexes
  const predictionsRegexes = [
    /\{\{\s*(?:TODAY_PREDICTIONS|TODAY_PREDICTION|TODAY_PREDICTIONS_COUNT|TODAY_PREDICTION_COUNT|TODAY_PREDICTIONS_DISTRIBUTION|TODAY_PREDICTION_DISTRIBUTION|TODAY_PREDICTIONS_SUMMARY|TODAY_PREDICTION_SUMMARY|TODAY_TIPS|TODAY_TIPS_SUMMARY)\s*\}\}/gi,
    /<!--\s*(?:TODAY_PREDICTIONS|TODAY_PREDICTION|TODAY_PREDICTIONS_COUNT|TODAY_PREDICTION_COUNT|TODAY_PREDICTIONS_DISTRIBUTION|TODAY_PREDICTION_DISTRIBUTION|TODAY_PREDICTIONS_SUMMARY|TODAY_PREDICTION_SUMMARY|TODAY_TIPS|TODAY_TIPS_SUMMARY)\s*-->/gi,
    /(?<!\[)\[(?!\[)\s*(?:TODAY_PREDICTIONS|TODAY_PREDICTION|TODAY_PREDICTIONS_COUNT|TODAY_PREDICTION_COUNT|TODAY_PREDICTIONS_DISTRIBUTION|TODAY_PREDICTION_DISTRIBUTION|TODAY_PREDICTIONS_SUMMARY|TODAY_PREDICTION_SUMMARY|TODAY_TIPS|TODAY_TIPS_SUMMARY)\s*\](?!\])/gi
  ];

  for (const rgx of predictionsRegexes) {
    result = result.replace(rgx, predictions);
  }

  return result;
}
