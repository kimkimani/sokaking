/**
 * Helper to calculate realistic betting probabilities (Home Win, Draw, Away Win)
 * dynamically based on the fixture's prediction tip and its confidence index.
 */
export function calculateProbabilities(
  prediction: string,
  confidence: number,
  explicitProbs?: { home?: number; draw?: number; away?: number; percentPredHome?: string | null; percentPredDraw?: string | null; percentPredAway?: string | null } | null
): { home: number; draw: number; away: number } {
  // If explicit probabilities are provided from database/API
  if (explicitProbs) {
    let h = typeof explicitProbs.home === 'number' ? explicitProbs.home : parseInt(String(explicitProbs.percentPredHome || '0').replace('%', ''), 10);
    let d = typeof explicitProbs.draw === 'number' ? explicitProbs.draw : parseInt(String(explicitProbs.percentPredDraw || '0').replace('%', ''), 10);
    let a = typeof explicitProbs.away === 'number' ? explicitProbs.away : parseInt(String(explicitProbs.percentPredAway || '0').replace('%', ''), 10);

    if (h > 0 || d > 0 || a > 0) {
      const sum = h + d + a;
      if (sum > 0) {
        h = Math.round((h / sum) * 100);
        d = Math.round((d / sum) * 100);
        a = 100 - h - d;
        if (a < 0) a = 0;
        return { home: h, draw: d, away: a };
      }
    }
  }

  const norm = (prediction || '').toLowerCase();
  let home = 0;
  let draw = 0;
  let away = 0;
  const conf = Math.max(50, Math.min(95, confidence || 75));

  // 1. Double Chance Selections
  if (norm.includes('1x') || norm.includes('x1') || norm.includes('(1x)') || norm.includes('(x1)') || norm.includes('1 or x')) {
    home = Math.round(conf * 0.55);
    draw = Math.round(conf * 0.38);
    away = 100 - home - draw;
  } else if (norm.includes('x2') || norm.includes('2x') || norm.includes('(x2)') || norm.includes('(2x)') || norm.includes('x or 2')) {
    away = Math.round(conf * 0.55);
    draw = Math.round(conf * 0.38);
    home = 100 - away - draw;
  } else if (norm.includes('12') || norm.includes('21') || norm.includes('(12)') || norm.includes('(21)') || norm.includes('1 or 2')) {
    home = Math.round(conf * 0.46);
    away = Math.round(conf * 0.46);
    draw = 100 - home - away;
  }
  // 2. Over/Under Goals & Both Teams To Score (e.g. Over 2.5 Goals, BTTS / GG)
  else if (norm.includes('over') || norm.includes('goals') || norm.includes('gg') || norm.includes('btts')) {
    home = Math.round(conf * 0.52);
    away = Math.round(conf * 0.33);
    draw = 100 - home - away;
  }
  // 3. Single Outcomes
  else if (norm.includes('(1)') || norm.includes('home win') || norm === '1' || norm.includes('home')) {
    home = conf;
    draw = Math.floor((100 - conf) * 0.65);
    away = 100 - home - draw;
  } else if (norm.includes('(2)') || norm.includes('away win') || norm === '2' || norm.includes('away')) {
    away = conf;
    draw = Math.floor((100 - conf) * 0.65);
    home = 100 - away - draw;
  } else if (norm.includes('(x)') || norm.includes('draw') || norm === 'x') {
    draw = conf;
    home = Math.floor((100 - conf) * 0.5);
    away = 100 - draw - home;
  }
  // 4. Default Fallback
  else {
    home = conf;
    draw = Math.floor((100 - conf) / 2);
    away = 100 - home - draw;
  }

  // Ensure minimum probability bounds for realistic display
  if (home < 4) home = 4;
  if (draw < 4) draw = 4;
  if (away < 4) away = 4;

  // Re-adjust so they sum to exactly 100
  const sum = home + draw + away;
  if (sum !== 100) {
    const diff = 100 - sum;
    if (home >= draw && home >= away) {
      home += diff;
    } else if (draw >= home && draw >= away) {
      draw += diff;
    } else {
      away += diff;
    }
  }

  return { home, draw, away };
}
