/**
 * Helper to calculate realistic betting probabilities (Home Win, Draw, Away Win)
 * dynamically based on the fixture's prediction tip and its confidence index.
 */
export function calculateProbabilities(prediction: string, confidence: number): { home: number; draw: number; away: number } {
  const norm = prediction.toLowerCase();
  let home = 0;
  let draw = 0;
  let away = 0;

  // 1. Double Chance Selections
  if (norm.includes('1x') || norm.includes('x1') || norm.includes('(1x)') || norm.includes('(x1)') || norm.includes('1 or x')) {
    home = Math.round(confidence * 0.55);
    draw = Math.round(confidence * 0.45);
    away = 100 - home - draw;
  } else if (norm.includes('x2') || norm.includes('2x') || norm.includes('(x2)') || norm.includes('(2x)') || norm.includes('x or 2')) {
    away = Math.round(confidence * 0.55);
    draw = Math.round(confidence * 0.45);
    home = 100 - away - draw;
  } else if (norm.includes('12') || norm.includes('21') || norm.includes('(12)') || norm.includes('(21)') || norm.includes('1 or 2')) {
    home = Math.round(confidence * 0.5);
    away = Math.round(confidence * 0.5);
    draw = 100 - home - away;
  }
  // 2. Over/Under Goals (e.g. Over 2.5 Goals)
  else if (norm.includes('over') || norm.includes('goals') || norm.includes('gg') || norm.includes('btts')) {
    // Goal-rich game usually implies low draw chance and relatively balanced or home-tilted win probabilities
    home = Math.round(confidence * 0.55);
    away = Math.round(confidence * 0.35);
    draw = 100 - home - away;
  }
  // 3. Single Outcomes
  else if (norm.includes('(1)') || norm.includes('home win') || norm === '1' || norm.includes('home')) {
    home = confidence;
    draw = Math.floor((100 - confidence) * 0.6);
    away = 100 - home - draw;
  } else if (norm.includes('(2)') || norm.includes('away win') || norm === '2' || norm.includes('away')) {
    away = confidence;
    draw = Math.floor((100 - confidence) * 0.6);
    home = 100 - away - draw;
  } else if (norm.includes('(x)') || norm.includes('draw') || norm === 'x') {
    draw = confidence;
    home = Math.floor((100 - confidence) * 0.5);
    away = 100 - draw - home;
  }
  // 4. Default Fallback
  else {
    home = confidence;
    draw = Math.floor((100 - confidence) / 2);
    away = 100 - home - draw;
  }

  // Ensure minimum probability bounds for realistic display
  if (home < 5) home = 5;
  if (draw < 5) draw = 5;
  if (away < 5) away = 5;

  // Re-adjust so they sum to exactly 100
  const sum = home + draw + away;
  if (sum !== 100) {
    const diff = 100 - sum;
    // Add the difference to the largest probability to minimize distortion
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
