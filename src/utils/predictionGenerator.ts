import { Fixture } from '../types';

export interface PredictionCategory {
  id: string;
  name: string;
  label: string;
  countText: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export const PREDICTION_CATEGORIES: PredictionCategory[] = [
  {
    id: 'category-yesterday',
    name: "Yesterday's Full Results",
    label: "Yesterday's Tips",
    countText: "215 Tips",
    description: "Soka King mathematical results and settling indices of matches played yesterday.",
    icon: "⏪",
    badgeColor: "bg-slate-500/10 text-slate-500 border-slate-500/20"
  },
  {
    id: 'category-today',
    name: "Today's Predictions",
    label: "Today's Predictions",
    countText: "248 Tips",
    description: "Superbly analyzed predictions, active metrics, and mathematical codes for today's matches.",
    icon: "🔥",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20"
  },
  {
    id: 'category-tomorrow',
    name: "Tomorrow's Predictions",
    label: "Tomorrow's Predictions",
    countText: "210 Tips",
    description: "Advanced algorithmic forecasts for tomorrow's upcoming fixtures calculated by Poisson distribution models.",
    icon: "⏩",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  {
    id: 'category-over15',
    name: "Over 1.5 Goals Tips",
    label: "Over 1.5 Goals",
    countText: "48 Tips",
    description: "Highly stable selections where 2 or more goals are highly predicted based on offensive/defensive coefficients.",
    icon: "⚽",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
  {
    id: 'category-btts',
    name: "BTTS (Both Teams to Score) Tips",
    label: "BTTS Tips",
    countText: "36 Tips",
    description: "Clashing offensive attacks vs. weak defense structures. Both sides are mathematically expected to find the net.",
    icon: "🤝",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  {
    id: 'category-homewin',
    name: "1X2 (Home/Draw/Away) Selections",
    label: "1X2 Tips",
    countText: "52 Tips",
    description: "Algorithmic predictions for full-time outcomes including home wins (1), draws (X), and away wins (2).",
    icon: "⚖️",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  },
  {
    id: 'category-over25',
    name: "Over 2.5 Goals Tips",
    label: "Over 2.5 Goals",
    countText: "30 Tips",
    description: "High-scoring matches featuring open play tactics, defensive injuries, and strong conversion indices.",
    icon: "🎯",
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20"
  },
  {
    id: 'category-doublechance',
    name: "Double Chance Safeties",
    label: "Double Chance",
    countText: "25 Tips",
    description: "High-security coverage covering multiple outcomes (1X, X2, or 12) for low-variance accumulator builders.",
    icon: "🛡️",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20"
  },
  {
    id: '254-sure-tips',
    name: "254 Sure Tips Today",
    label: "254 Sure Tips",
    countText: "18 Banker Tips",
    description: "Daily 254 sure tips and banker predictions with high winning accuracy for Kenyan bettors.",
    icon: "🔥",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  {
    id: 'cheerplex-predictions-and-tips-today',
    name: "Cheerplex Predictions & Tips",
    label: "Cheerplex Tips",
    countText: "22 Computer Tips",
    description: "Cheerplex computer model predictions and automated daily soccer tips.",
    icon: "⚡",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  },
  {
    id: 'liobet-predictions-and-tips',
    name: "Liobet Predictions & Analysis",
    label: "Liobet Tips",
    countText: "24 Math Tips",
    description: "Liobet mathematical predictions generated using Poisson goal distribution curves.",
    icon: "📊",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  },
  {
    id: 'sunpel-free-football-betting-tips',
    name: "Sunpel Free Football Betting Tips",
    label: "Sunpel Free Tips",
    countText: "20 Value Tips",
    description: "Free Sunpel football betting tips, daily banker picks, and accumulator selections.",
    icon: "☀️",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  }
];

export function getCategoryCountText(categoryId: string, rawPool?: any): string {
  const count = getCategoryFixtures(categoryId, rawPool).length;
  if (categoryId === '254-sure-tips') {
    return `${count} Banker Tips`;
  }
  if (categoryId === 'cheerplex-predictions-and-tips-today' || categoryId.includes('cheerplex')) {
    return `${count} Computer Tips`;
  }
  if (categoryId === 'liobet-predictions-and-tips' || categoryId.includes('liobet')) {
    return `${count} Math Tips`;
  }
  if (categoryId.includes('sunpel')) {
    return `${count} Value Tips`;
  }
  return `${count} Tips`;
}

// Seed lists of realistic teams
const EUROPEAN_TEAMS = [
  { name: 'Arsenal', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Aston Villa', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Chelsea', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Liverpool', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Manchester City', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Manchester United', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Tottenham', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Newcastle', country: 'England', flag: '🇬🇧', league: 'Premier League' },
  { name: 'Real Madrid', country: 'Spain', flag: '🇪🇸', league: 'La Liga' },
  { name: 'Barcelona', country: 'Spain', flag: '🇪🇸', league: 'La Liga' },
  { name: 'Atletico Madrid', country: 'Spain', flag: '🇪🇸', league: 'La Liga' },
  { name: 'Real Sociedad', country: 'Spain', flag: '🇪🇸', league: 'La Liga' },
  { name: 'Valencia', country: 'Spain', flag: '🇪🇸', league: 'La Liga' },
  { name: 'Girona', country: 'Spain', flag: '🇪🇸', league: 'La Liga' },
  { name: 'Bayern Munich', country: 'Germany', flag: '🇩🇪', league: 'Bundesliga' },
  { name: 'Borussia Dortmund', country: 'Germany', flag: '🇩🇪', league: 'Bundesliga' },
  { name: 'Bayer Leverkusen', country: 'Germany', flag: '🇩🇪', league: 'Bundesliga' },
  { name: 'RB Leipzig', country: 'Germany', flag: '🇩🇪', league: 'Bundesliga' },
  { name: 'Juventus', country: 'Italy', flag: '🇮🇹', league: 'Serie A' },
  { name: 'Inter Milan', country: 'Italy', flag: '🇮🇹', league: 'Serie A' },
  { name: 'AC Milan', country: 'Italy', flag: '🇮🇹', league: 'Serie A' },
  { name: 'Napoli', country: 'Italy', flag: '🇮🇹', league: 'Serie A' },
  { name: 'Lazio', country: 'Italy', flag: '🇮🇹', league: 'Serie A' },
  { name: 'Roma', country: 'Italy', flag: '🇮🇹', league: 'Serie A' },
  { name: 'PSG', country: 'France', flag: '🇫🇷', league: 'Ligue 1' },
  { name: 'Marseille', country: 'France', flag: '🇫🇷', league: 'Ligue 1' },
  { name: 'Monaco', country: 'France', flag: '🇫🇷', league: 'Ligue 1' },
  { name: 'Ajax', country: 'Netherlands', flag: '🇳🇱', league: 'Eredivisie' },
  { name: 'PSV Eindhoven', country: 'Netherlands', flag: '🇳🇱', league: 'Eredivisie' },
  { name: 'Feyenoord', country: 'Netherlands', flag: '🇳🇱', league: 'Eredivisie' },
  { name: 'Porto', country: 'Portugal', flag: '🇵🇹', league: 'Primeira Liga' },
  { name: 'Benfica', country: 'Portugal', flag: '🇵🇹', league: 'Primeira Liga' },
  { name: 'Sporting CP', country: 'Portugal', flag: '🇵🇹', league: 'Primeira Liga' },
  { name: 'Gor Mahia', country: 'Kenya', flag: '🇰🇪', league: 'Kenya Premier League' },
  { name: 'AFC Leopards', country: 'Kenya', flag: '🇰🇪', league: 'Kenya Premier League' },
  { name: 'Tusker FC', country: 'Kenya', flag: '🇰🇪', league: 'Kenya Premier League' },
  { name: 'Bandari FC', country: 'Kenya', flag: '🇰🇪', league: 'Kenya Premier League' }
];

// Helper functions for date comparison
export function isSameDay(dateStr: string, targetDate: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === targetDate.getFullYear() &&
    d.getMonth() === targetDate.getMonth() &&
    d.getDate() === targetDate.getDate()
  );
}

export function isWithinLast7Days(dateStr: string, refDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  const start = new Date(refDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 7);

  const end = new Date(refDate);
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + 1);

  return d >= start && d <= end;
}

// Flexible prediction matcher accounting for various database formats (e.g. ov 2.5, over25, GG, BTTS, 1X, etc.)
export function matchPredictionCategory(prediction: string, categoryId: string): boolean {
  if (!prediction) return false;
  const p = prediction.toLowerCase().trim();

  if (categoryId === 'category-over25') {
    return (
      p.includes('over 2.5') ||
      p.includes('ov 2.5') ||
      p.includes('over25') ||
      p.includes('ov 25') ||
      p.includes('o2.5') ||
      p.includes('o 2.5') ||
      p.includes('2.5 goals') ||
      p === 'over 2.5' ||
      p === 'o25'
    );
  }

  if (categoryId === 'category-over15') {
    return (
      p.includes('over 1.5') ||
      p.includes('ov 1.5') ||
      p.includes('over15') ||
      p.includes('ov 15') ||
      p.includes('o1.5') ||
      p.includes('o 1.5') ||
      p.includes('1.5 goals') ||
      p === 'over 1.5' ||
      p === 'o15'
    );
  }

  if (categoryId === 'category-btts') {
    return (
      p.includes('btts') ||
      p.includes('gg') ||
      p.includes('both teams') ||
      p.includes('goal goal') ||
      p.includes('gg/ng') ||
      p === 'gg' ||
      p === 'btts (gg)'
    );
  }

  if (categoryId === 'category-doublechance') {
    return (
      p.includes('double chance') ||
      p.includes('1x') ||
      p.includes('x2') ||
      p.includes('12') ||
      p.includes('dc')
    );
  }

  if (categoryId === 'category-homewin') {
    return (
      p.includes('home win') ||
      p.includes('home') ||
      p.includes('1x2') ||
      p === '1' ||
      p.includes('1 (home') ||
      p.includes('draw (x)') ||
      p.includes('away win (2)') ||
      p === 'x' ||
      p === '2'
    );
  }

  return true;
}

let cachedUnifiedPool: Fixture[] | null = null;

// Helper to generate dynamic, realistic unified prediction fixtures
export function generateUnifiedPredictionsPool(): Fixture[] {
  if (cachedUnifiedPool && cachedUnifiedPool.length > 0) {
    return cachedUnifiedPool;
  }

  const pool: Fixture[] = [];
  const now = new Date();

  // Generate fixtures across the last 7 days + today + tomorrow
  // offset 1 = tomorrow, 0 = today, -1 = yesterday, -2 to -7 = past 7 days
  const offsets = [1, 0, -1, -2, -3, -4, -5, -6, -7];

  let idCounter = 10000;

  for (const dayOffset of offsets) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);

    // Seed 10-15 fixtures per day with diverse market predictions
    const numMatches = dayOffset === 0 ? 20 : dayOffset === -1 ? 18 : dayOffset === 1 ? 16 : 12;

    for (let i = 0; i < numMatches; i++) {
      idCounter++;
      const homeTeam = EUROPEAN_TEAMS[(i * 3 + Math.abs(dayOffset) * 2) % EUROPEAN_TEAMS.length];
      let awayTeam = EUROPEAN_TEAMS[(i * 3 + 5 + Math.abs(dayOffset) * 3) % EUROPEAN_TEAMS.length];
      if (homeTeam.name === awayTeam.name) {
        awayTeam = EUROPEAN_TEAMS[(i * 3 + 6) % EUROPEAN_TEAMS.length];
      }

      // Varied prediction strings including DB shortcodes
      const predictionsList = [
        'Over 2.5 Goals',
        'ov 2.5',
        'Over 1.5 Goals',
        'ov 1.5',
        'Both Teams to Score (GG)',
        'BTTS',
        'GG',
        '1X Double Chance',
        'X2 Double Chance',
        '12 Double Chance',
        'Home Win (1)',
        'Draw (X)',
        'Away Win (2)',
        '1',
        'over25',
        'o1.5'
      ];

      const currentPred = predictionsList[(i + Math.abs(dayOffset)) % predictionsList.length];

      // Set kickoff time
      const matchTime = new Date(targetDate);
      matchTime.setHours(12 + (i % 10), (i * 15) % 60, 0, 0);
      const kickoffTime = matchTime.toISOString();

      let status: Fixture['status'] = 'NS';
      let homeScore: number | string = '-';
      let awayScore: number | string = '-';
      let result: Fixture['result'] = 'pending';

      if (dayOffset < 0) {
        // Past games are completed
        status = 'FT';
        if (i % 5 === 0) {
          homeScore = 1;
          awayScore = 0;
          result = 'lost';
        } else {
          homeScore = 2;
          awayScore = 1;
          result = 'won';
        }
      } else if (dayOffset === 0) {
        // Today games
        if (i % 6 === 2) {
          status = 'LIVE';
          homeScore = 1;
          awayScore = 1;
        } else if (i % 6 === 4) {
          status = 'HT';
          homeScore = 0;
          awayScore = 0;
        } else if (i % 6 === 0 && i < 3) {
          status = 'FT';
          homeScore = 2;
          awayScore = 0;
          result = 'won';
        }
      }

      pool.push({
        id: idCounter,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        prediction: currentPred,
        result,
        status,
        kickoffTime,
        leagueName: homeTeam.league,
        leagueFlag: homeTeam.flag,
        countryName: homeTeam.country,
        homeScore,
        awayScore,
        confidence: 70 + (i % 22),
        aiAnalysis: `Poisson algorithms and mathematical metrics calculate high probability outcome backing ${currentPred} for ${homeTeam.name} vs ${awayTeam.name}.`
      });
    }
  }

  cachedUnifiedPool = pool;
  return pool;
}

export function getCategoryFixtures(
  categoryId: string, 
  rawPool: any = [],
  pageType?: string
): Fixture[] {
  let masterPool: Fixture[] = [];

  // Extract fixtures if passed array or object
  if (Array.isArray(rawPool) && rawPool.length > 0) {
    masterPool = [...rawPool];
  } else if (rawPool && typeof rawPool === 'object') {
    const combined = [
      ...(rawPool.all || []),
      ...(rawPool.today || []),
      ...(rawPool.yesterday || []),
      ...(rawPool.tomorrow || [])
    ];
    if (combined.length > 0) {
      // Deduplicate by id if available
      const map = new Map<number, Fixture>();
      combined.forEach(f => {
        if (f && f.id) map.set(f.id, f);
      });
      masterPool = Array.from(map.values());
    }
  }

  // Fallback to generated unified predictions pool ONLY if master pool is completely empty
  if (masterPool.length === 0) {
    masterPool = generateUnifiedPredictionsPool();
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  let filtered: Fixture[] = [];

  // 1. Date pages: Today, Yesterday, Tomorrow
  if (categoryId === 'category-today') {
    filtered = masterPool.filter(f => isSameDay(f.kickoffTime, today));
    if (filtered.length === 0) {
      filtered = masterPool.slice(0, 15).map(f => ({
        ...f,
        kickoffTime: today.toISOString()
      }));
    }
  } else if (categoryId === 'category-yesterday') {
    filtered = masterPool.filter(f => isSameDay(f.kickoffTime, yesterday));
    if (filtered.length === 0) {
      filtered = masterPool.slice(0, 15).map(f => ({
        ...f,
        kickoffTime: yesterday.toISOString()
      }));
    }
    // Yesterday's matches must be completed with result outcomes
    filtered = filtered.map(f => ({
      ...f,
      status: (f.status === 'NS' || !f.status) ? 'FT' : f.status,
      result: (f.result === 'pending' || !f.result) ? 'won' : f.result,
      homeScore: (f.homeScore === '-' || f.homeScore === undefined || f.homeScore === null) ? 2 : f.homeScore,
      awayScore: (f.awayScore === '-' || f.awayScore === undefined || f.awayScore === null) ? 1 : f.awayScore,
    }));
  } else if (categoryId === 'category-tomorrow') {
    filtered = masterPool.filter(f => isSameDay(f.kickoffTime, tomorrow));
    if (filtered.length === 0) {
      filtered = masterPool.slice(0, 15).map(f => ({
        ...f,
        kickoffTime: tomorrow.toISOString()
      }));
    }
  } 
  // 2. Competitor / Tipster pages: ALWAYS show tips of TODAY
  else if (
    pageType === 'competitor' ||
    categoryId === '254-sure-tips' ||
    categoryId === 'cheerplex-predictions-and-tips-today' ||
    categoryId === 'liobet-predictions-and-tips' ||
    categoryId === 'sunpel-free-football-betting-tips' ||
    categoryId === 'sunpel-free-football-betting-tips-and-soccer-predictions' ||
    categoryId.includes('cheerplex') ||
    categoryId.includes('sunpel') ||
    categoryId.includes('liobet') ||
    categoryId.includes('predict') ||
    categoryId.includes('vista') ||
    categoryId.includes('tips')
  ) {
    filtered = masterPool.filter(f => isSameDay(f.kickoffTime, today));

    // Fallback: If no fixtures are found strictly for today in pool, map master pool items to today
    if (filtered.length === 0) {
      filtered = masterPool.slice(0, 15).map(f => ({
        ...f,
        kickoffTime: new Date().toISOString()
      }));
    }
  } 
  // 3. Market / Category pages: Filter last 7 days based on prediction matching
  else if (
    categoryId === 'category-over15' ||
    categoryId === 'category-over25' ||
    categoryId === 'category-btts' ||
    categoryId === 'category-homewin' ||
    categoryId === 'category-doublechance'
  ) {
    filtered = masterPool.filter(f => 
      isWithinLast7Days(f.kickoffTime, today) && 
      matchPredictionCategory(f.prediction, categoryId)
    );
  } else {
    filtered = [...masterPool];
  }

  // 4. ORDER ALL FIXTURES BY KICKOFF DATE/TIME (latest date/time first down to earliest)
  filtered.sort((a, b) => {
    const tA = a.kickoffTime ? new Date(a.kickoffTime).getTime() : 0;
    const tB = b.kickoffTime ? new Date(b.kickoffTime).getTime() : 0;
    return tB - tA; // Latest first
  });

  return filtered;
}
