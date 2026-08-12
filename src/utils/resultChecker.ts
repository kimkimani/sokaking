/**
 * Utility to evaluate whether a prediction tip won or lost based on fulltime score.
 */

export function evaluatePredictionResult(
  prediction: string | undefined | null,
  homeScore: number | string | undefined | null,
  awayScore: number | string | undefined | null,
  status?: string | null
): 'won' | 'lost' | 'pending' {
  if (!prediction) return 'pending';

  // Parse numeric scores safely
  let hScore: number | null = null;
  let aScore: number | null = null;

  if (typeof homeScore === 'number' && !isNaN(homeScore)) {
    hScore = homeScore;
  } else if (typeof homeScore === 'string' && homeScore !== '-' && homeScore.trim() !== '') {
    const parsed = parseInt(homeScore.trim(), 10);
    if (!isNaN(parsed)) hScore = parsed;
  }

  if (typeof awayScore === 'number' && !isNaN(awayScore)) {
    aScore = awayScore;
  } else if (typeof awayScore === 'string' && awayScore !== '-' && awayScore.trim() !== '') {
    const parsed = parseInt(awayScore.trim(), 10);
    if (!isNaN(parsed)) aScore = parsed;
  }

  // If score is missing or incomplete, return pending unless status explicitly indicates unplayed
  if (hScore === null || aScore === null) {
    return 'pending';
  }

  const statusStr = (status || '').toUpperCase().trim();
  // If explicitly NS (Not Started), keep pending
  if (statusStr === 'NS' || statusStr === 'TBA' || statusStr === 'CANCELLED') {
    return 'pending';
  }

  const totalGoals = hScore + aScore;
  const bothScored = hScore > 0 && aScore > 0;
  const actual1X2 = hScore > aScore ? '1' : (hScore === aScore ? 'X' : '2');

  const tipLower = prediction.toLowerCase().trim();

  // 1. Correct Score matching (e.g., "2-1", "2 - 1", "1:0")
  const csMatch = tipLower.match(/^(\d+)\s*[-:]\s*(\d+)$/);
  if (csMatch) {
    const expHome = parseInt(csMatch[1], 10);
    const expAway = parseInt(csMatch[2], 10);
    return (hScore === expHome && aScore === expAway) ? 'won' : 'lost';
  }

  // 2. Over / Under Goals
  if (tipLower.includes('over 2.5') || tipLower.includes('ov 2.5') || tipLower.includes('o2.5') || tipLower.includes('over 25') || tipLower.includes('over2.5')) {
    return totalGoals > 2 ? 'won' : 'lost';
  }
  if (tipLower.includes('under 2.5') || tipLower.includes('un 2.5') || tipLower.includes('u2.5') || tipLower.includes('under 25') || tipLower.includes('under2.5')) {
    return totalGoals < 3 ? 'won' : 'lost';
  }
  if (tipLower.includes('over 1.5') || tipLower.includes('ov 1.5') || tipLower.includes('o1.5') || tipLower.includes('over 15') || tipLower.includes('over1.5')) {
    return totalGoals > 1 ? 'won' : 'lost';
  }
  if (tipLower.includes('under 1.5') || tipLower.includes('un 1.5') || tipLower.includes('u1.5') || tipLower.includes('under 15') || tipLower.includes('under1.5')) {
    return totalGoals < 2 ? 'won' : 'lost';
  }
  if (tipLower.includes('over 3.5') || tipLower.includes('ov 3.5') || tipLower.includes('o3.5') || tipLower.includes('over 35') || tipLower.includes('over3.5')) {
    return totalGoals > 3 ? 'won' : 'lost';
  }
  if (tipLower.includes('under 3.5') || tipLower.includes('un 3.5') || tipLower.includes('u3.5') || tipLower.includes('under 35') || tipLower.includes('under3.5')) {
    return totalGoals < 4 ? 'won' : 'lost';
  }
  if (tipLower.includes('over 0.5') || tipLower.includes('ov 0.5') || tipLower.includes('o0.5') || tipLower.includes('over 05') || tipLower.includes('over0.5')) {
    return totalGoals > 0 ? 'won' : 'lost';
  }

  // 3. Both Teams to Score (GG / NG / BTTS)
  if (tipLower.includes('btts') || tipLower === 'gg' || tipLower.includes('(gg)') || tipLower.includes('both teams to score')) {
    if (tipLower.includes('no') || tipLower === 'ng' || tipLower.includes('(ng)')) {
      return !bothScored ? 'won' : 'lost';
    }
    return bothScored ? 'won' : 'lost';
  }
  if (tipLower === 'ng' || tipLower.includes('(ng)') || tipLower.includes('no goal')) {
    return !bothScored ? 'won' : 'lost';
  }

  // 4. Double Chance (1X, X2, 12)
  if (tipLower.includes('1x') || tipLower.includes('dc 1x') || tipLower.includes('1 or x') || tipLower.includes('home win or draw') || tipLower.includes('home/draw')) {
    return (actual1X2 === '1' || actual1X2 === 'X') ? 'won' : 'lost';
  }
  if (tipLower.includes('x2') || tipLower.includes('dc x2') || tipLower.includes('x or 2') || tipLower.includes('draw or away') || tipLower.includes('draw/away')) {
    return (actual1X2 === 'X' || actual1X2 === '2') ? 'won' : 'lost';
  }
  if (tipLower.includes('12') || tipLower.includes('dc 12') || tipLower.includes('1 or 2') || tipLower.includes('home or away') || tipLower.includes('home/away')) {
    return (actual1X2 === '1' || actual1X2 === '2') ? 'won' : 'lost';
  }

  // 5. 1X2 / Match Result
  if (tipLower.includes('home') || tipLower === '1' || tipLower.startsWith('1 ') || tipLower.includes('home win')) {
    return actual1X2 === '1' ? 'won' : 'lost';
  }
  if (tipLower.includes('draw') || tipLower === 'x' || tipLower.startsWith('x ') || tipLower.includes('draw (x)')) {
    return actual1X2 === 'X' ? 'won' : 'lost';
  }
  if (tipLower.includes('away') || tipLower === '2' || tipLower.startsWith('2 ') || tipLower.includes('away win')) {
    return actual1X2 === '2' ? 'won' : 'lost';
  }

  // Default fallback if score exists and match is finished
  if (statusStr === 'FT' || statusStr === 'FINISHED') {
    return actual1X2 === '1' ? 'won' : 'lost';
  }

  return 'pending';
}
