import { Fixture, VipPackage, OddsPack, DesignIteration, ExternalLink } from './types';

export const designIterations: DesignIteration[] = [
  {
    id: 'emerald-pro',
    name: 'Sleek Emerald (Light Mode)',
    version: 'Emerald Light',
    description: 'A beautifully structured, fresh light interface featuring sophisticated soft mint, emerald green, and deep slate tones with generous breathing space.',
    notes: [
      'Crisp high-contrast off-white canvas and clear emerald indicators',
      'Emerald green primary action accents promoting safety and trust',
      'Highly legible typographic spacing using Inter and Space Grotesk',
      'Optimal readability for daily mathematical football prediction slips'
    ],
    themeClass: 'theme-emerald'
  },
  {
    id: 'midnight-athletic',
    name: 'Athletic Midnight (Light Mode)',
    version: 'Midnight Light',
    description: 'An athletic-focused light interface featuring a clean slate-blue canvas, intense indigo primary buttons, and sports-red highlights.',
    notes: [
      'Deep indigo and slate-blue highlights for an active sporting feel',
      'Crisp solid cards with defined modern borders and offsets',
      'Clean Space Grotesk typography for professional analysis',
      'Perfect blend of dynamic modern layout with a sports-journalism vibe'
    ],
    themeClass: 'theme-midnight'
  }
];

export const vipPackages: VipPackage[] = [
  {
    id: 'vip-1day',
    slug: 'vip-1day',
    name: 'One Day VIP',
    price: 1,
    durationDays: 1,
    description: 'Access to high-analyzed VIP tips for 1 day including premium match slips.',
    features: [
      'Accurate daily single tips and secure double selection',
      'Detailed statistical statistical breakdown per fixture',
      'Instant SMS and premium WhatsApp support updates',
      'Priority mobile M-Pesa STK push fast checkout'
    ]
  },
  {
    id: 'vip-4day',
    slug: 'vip-4day',
    name: 'Four Days VIP',
    price: 450,
    durationDays: 4,
    description: 'Curated premium selections spanning 4 days of European action and Midweek Jackpots.',
    features: [
      'Access to daily premium sure-tips slips',
      'Detailed soccer jackpot analytics (Betika, SportPesa, Mozzart)',
      'Double-Chance protection selection (up to 2 games)',
      'High-confidence premium accumulators (3+ odds daily)',
      'Priority customer assistance line'
    ]
  },
  {
    id: 'vip-7day',
    slug: 'vip-7day',
    name: 'One Week VIP',
    price: 800,
    durationDays: 7,
    description: 'Complete weekly coverage of all football leagues, jackpots, and active VIP slips.',
    features: [
      'Full 7-day VIP picks and dynamic accumulator slips',
      'Coverage of all major weekend jackpots (SportPesa Mega, Mozzart Grand)',
      'Confidence indexes and deep-learning tactical insights',
      'Exclusive high-yield longshot premium tickets',
      'WhatsApp hotline priority membership and support'
    ],
    isFeatured: true
  },
  {
    id: 'vip-14day',
    slug: 'vip-14day',
    name: 'Two Weeks VIP',
    price: 1,
    durationDays: 14,
    description: 'Ultimate fortnightly investment tier for seasoned sports prediction players.',
    features: [
      'Fortnightly continuous access to all VIP tips and jackpots',
      'Full analysis of 13-game and 17-game national jackpots',
      'Personalized bankroll management and optimal betting splits',
      'Direct WhatsApp manager line with Joseph Chege',
      '92% verified historical bi-weekly performance metric'
    ]
  }
];

export const oddsPacks: OddsPack[] = [
  {
    id: 1,
    slug: 'odds-3plus',
    name: '3+ Odds Pack',
    tag: 'Smart Bet',
    price: 150,
    durationDays: 1,
    picksPerDay: 3,
    oddsMinDecimal: '3.00',
    description: 'Highly secure balanced shortlist — 3+ combined odds.',
    color: '#10b981', // Emerald
    riskLevel: 'Conservative'
  },
  {
    id: 2,
    slug: 'odds-5plus',
    name: '5+ Odds Pack',
    tag: 'Best Value',
    price: 350,
    durationDays: 1,
    picksPerDay: 2,
    oddsMinDecimal: '5.00',
    description: 'High payout shortlist with carefully weighted 5+ odds.',
    color: '#f59e0b', // Amber
    riskLevel: 'Balanced'
  },
  {
    id: 3,
    slug: 'odds-7plus',
    name: '7+ Odds Pack',
    tag: 'Pro Selection',
    price: 500,
    durationDays: 1,
    picksPerDay: 1,
    oddsMinDecimal: '7.00',
    description: 'Aggressive single-ticket accumulator with 7+ odds.',
    color: '#ef4444', // Red
    riskLevel: 'Aggressive'
  }
];

export const fixturesData: Record<'yesterday' | 'today' | 'tomorrow' | 'jackpot', Fixture[]> = {
  yesterday: [
    {
      id: 101,
      homeTeam: 'Manchester United',
      awayTeam: 'Leeds United',
      prediction: 'Home Win (1)',
      result: 'won',
      status: 'FT',
      kickoffTime: '2026-07-14T15:00:00Z',
      leagueName: 'Premier League',
      leagueFlag: '🇬🇧',
      countryName: 'England',
      homeScore: 2,
      awayScore: 0,
      confidence: 85,
      aiAnalysis: 'Manchester United controlled the game with 62% possession and clinical midfield play as predicted.'
    },
    {
      id: 102,
      homeTeam: 'Norwich City',
      awayTeam: 'Leeds United',
      prediction: 'Over 2.5 Goals',
      result: 'won',
      status: 'FT',
      kickoffTime: '2026-07-14T16:30:00Z',
      leagueName: 'Championship',
      leagueFlag: '🇬🇧',
      countryName: 'England',
      homeScore: 2,
      awayScore: 1,
      confidence: 80,
      aiAnalysis: 'Dynamic offensive strategies from both teams created high goal-scoring chances in transition.'
    },
    {
      id: 103,
      homeTeam: 'Inter Milan',
      awayTeam: 'Juventus',
      prediction: 'Both Teams to Score (GG)',
      result: 'won',
      status: 'FT',
      kickoffTime: '2026-07-14T18:45:00Z',
      leagueName: 'Serie A',
      leagueFlag: '🇮🇹',
      countryName: 'Italy',
      homeScore: 1,
      awayScore: 1,
      confidence: 78,
      aiAnalysis: 'High-octane Italian derby resulting in goals from both wings. Tactical shapes opened up nicely.'
    }
  ],
  today: [
    {
      id: 201,
      homeTeam: 'Arsenal',
      awayTeam: 'Aston Villa',
      prediction: 'Double Chance (1X)',
      result: 'pending',
      status: 'LIVE',
      kickoffTime: '2026-07-15T15:00:00Z',
      leagueName: 'Premier League',
      leagueFlag: '🇬🇧',
      countryName: 'England',
      homeScore: 1,
      awayScore: 0,
      confidence: 88,
      aiAnalysis: 'Arsenal displays robust home possession indices. Defensive transitions look strong, minimizing Villa counters.'
    },
    {
      id: 202,
      homeTeam: 'Barcelona',
      awayTeam: 'Getafe',
      prediction: 'Over 2.5 Goals',
      result: 'pending',
      status: 'LIVE',
      kickoffTime: '2026-07-15T19:00:00Z',
      leagueName: 'La Liga',
      leagueFlag: '🇪🇸',
      countryName: 'Spain',
      homeScore: 2,
      awayScore: 1,
      confidence: 82,
      aiAnalysis: 'Barca high defensive block creates space in deep areas while ensuring high offensive frequency.'
    },
    {
      id: 203,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      prediction: 'Home Win (1)',
      result: 'pending',
      status: 'NS',
      kickoffTime: '2026-07-15T18:30:00Z',
      leagueName: 'Bundesliga',
      leagueFlag: '🇩🇪',
      countryName: 'Germany',
      homeScore: '-',
      awayScore: '-',
      confidence: 84,
      aiAnalysis: 'Bayern shows formidable attacking momentum at home. Dortmund key midfielders are currently suspended.'
    },
    {
      id: 204,
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      prediction: 'Home Win or Draw (1X)',
      result: 'pending',
      status: 'NS',
      kickoffTime: '2026-07-15T20:00:00Z',
      leagueName: 'Premier League',
      leagueFlag: '🇬🇧',
      countryName: 'England',
      homeScore: '-',
      awayScore: '-',
      confidence: 81,
      aiAnalysis: 'City remains unbeaten at Etihad this season. High expectation of low-block possession with dangerous overload in halfspaces.'
    },
    {
      id: 205,
      homeTeam: 'Paris Saint-Germain',
      awayTeam: 'Marseille',
      prediction: 'Home Win (1)',
      result: 'pending',
      status: 'NS',
      kickoffTime: '2026-07-15T21:00:00Z',
      leagueName: 'Ligue 1',
      leagueFlag: '🇫🇷',
      countryName: 'France',
      homeScore: '-',
      awayScore: '-',
      confidence: 85,
      aiAnalysis: 'PSG speed in transition with wingers cuts open Marseille defensive shape. Home support adds crucial momentum.'
    }
  ],
  tomorrow: [
    {
      id: 301,
      homeTeam: 'Real Madrid',
      awayTeam: 'Sevilla',
      prediction: 'Home Win (1)',
      result: 'pending',
      status: 'NS',
      kickoffTime: '2026-07-16T17:30:00Z',
      leagueName: 'La Liga',
      leagueFlag: '🇪🇸',
      countryName: 'Spain',
      homeScore: '-',
      awayScore: '-',
      confidence: 86,
      aiAnalysis: 'San Bernabeu is a tactical stronghold. Madrid displays excellent conversion rates from wide channels.'
    },
    {
      id: 302,
      homeTeam: 'Juventus',
      awayTeam: 'Napoli',
      prediction: 'Away Win (2)',
      result: 'pending',
      status: 'NS',
      kickoffTime: '2026-07-16T18:45:00Z',
      leagueName: 'Serie A',
      leagueFlag: '🇮🇹',
      countryName: 'Italy',
      homeScore: '-',
      awayScore: '-',
      confidence: 71,
      aiAnalysis: 'Juventus currently dealing with squad-rotation issues. Napoli shows stable wing-backs.'
    },
    {
      id: 303,
      homeTeam: 'Chelsea',
      awayTeam: 'Tottenham',
      prediction: 'Over 2.5 Goals',
      result: 'pending',
      status: 'NS',
      kickoffTime: '2026-07-16T20:00:00Z',
      leagueName: 'Premier League',
      leagueFlag: '🇬🇧',
      countryName: 'England',
      homeScore: '-',
      awayScore: '-',
      confidence: 79,
      aiAnalysis: 'Both London clubs suffer from transition gaps. Anticipated high tempo high press match with high error-frequency in defensive third.'
    },
    {
      id: 304,
      homeTeam: 'AC Milan',
      awayTeam: 'Inter Milan',
      prediction: 'Draw or Away Win (X2)',
      result: 'pending',
      status: 'NS',
      kickoffTime: '2026-07-16T21:45:00Z',
      leagueName: 'Serie A',
      leagueFlag: '🇮🇹',
      countryName: 'Italy',
      homeScore: '-',
      awayScore: '-',
      confidence: 83,
      aiAnalysis: 'Derby della Madonnina sees Inter in peak form, carrying high goal conversion and better injury return profile than Milan.'
    }
  ],
  jackpot: []
};

export interface ContactSocialConfig {
  id: string;
  channelName: string;
  contactValue: string;
  type: 'whatsapp' | 'email' | 'phone' | 'location' | 'social';
  actionUrl: string;
  description: string;
  status: 'Active' | '24/7 Dispatch';
}

export const contactSocialTable: ContactSocialConfig[] = [
  {
    id: 'cnt-wa-1',
    channelName: 'WhatsApp Official Hotline',
    contactValue: '+254 740 841 375',
    type: 'whatsapp',
    actionUrl: 'https://wa.me/254740841375?text=Hello%20Soka%20King%20Support%2C%20I%20need%20today%20tips',
    description: 'Instant customer support, M-Pesa STK push assistance, and daily VIP slip queries',
    status: '24/7 Dispatch'
  },
  {
    id: 'cnt-email-1',
    channelName: 'Customer Support Email',
    contactValue: 'support@sokaking.com',
    type: 'email',
    actionUrl: 'mailto:support@sokaking.com',
    description: 'Official billing, partnership, and subscription account inquiries',
    status: 'Active'
  },
  {
    id: 'cnt-phone-1',
    channelName: 'Direct Dispatch Line',
    contactValue: '+254 740 841 375',
    type: 'phone',
    actionUrl: 'tel:+254740841375',
    description: 'Safaricom M-Pesa verification and helpline support',
    status: '24/7 Dispatch'
  },
  {
    id: 'cnt-loc-1',
    channelName: 'Headquarters Office',
    contactValue: 'Galana Plaza, 4th Floor, Kilimani, Nairobi, Kenya',
    type: 'location',
    actionUrl: 'https://maps.google.com/?q=Galana+Plaza+Kilimani+Nairobi',
    description: 'Data analytics hub and operational headquarters',
    status: 'Active'
  }
];

export const defaultExternalLinks: ExternalLink[] = [
  {
    id: 1,
    anchorText: 'Sokapedia Football Predictions',
    url: 'https://sokapedia.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Football Predictions',
    target: '_blank',
    description: 'Expert match previews, team form metrics, and daily football predictions.',
    orderIndex: 1,
    isActive: true
  },
  {
    id: 2,
    anchorText: 'Betwinner360 Predictions & Jackpot Tips',
    url: 'https://betwinner360.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Jackpot Tips',
    target: '_blank',
    description: 'Accurate SportPesa, Betika Midweek and weekend mega jackpot selections.',
    orderIndex: 2,
    isActive: true
  },
  {
    id: 3,
    anchorText: 'Forebet Mathematical Football Predictions',
    url: 'https://www.forebet.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'AI Predictions',
    target: '_blank',
    description: 'Mathematical football predictions and statistical analysis algorithms.',
    orderIndex: 3,
    isActive: true
  },
  {
    id: 4,
    anchorText: 'Cheerplex Soccer Predictions Today',
    url: 'https://cheerplex.co.ke/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Daily Tips',
    target: '_blank',
    description: 'East Africa premier soccer tips, 254 sure predictions, and 1X2 slips.',
    orderIndex: 4,
    isActive: true
  },
  {
    id: 5,
    anchorText: 'Sunpel Soccer Predictions & Tips',
    url: 'https://sunpel.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Daily Tips',
    target: '_blank',
    description: 'Free daily betting tips, over/under goal guides, and European fixtures.',
    orderIndex: 5,
    isActive: true
  },
  {
    id: 6,
    anchorText: 'Victorspredict Football Betting Tips',
    url: 'https://victorspredict.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Football Predictions',
    target: '_blank',
    description: 'Free banker bets, double chance, and accumulator combination tips.',
    orderIndex: 6,
    isActive: true
  },
  {
    id: 7,
    anchorText: 'Windrawwin Football Predictions & Stats',
    url: 'https://www.windrawwin.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Stats & Analysis',
    target: '_blank',
    description: 'Free football predictions, betting statistics, football results and league tables.',
    orderIndex: 7,
    isActive: true
  },
  {
    id: 8,
    anchorText: 'Statarea Soccer Facts & Predictions',
    url: 'https://www.statarea.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Stats & Analysis',
    target: '_blank',
    description: 'In-depth league trends, head-to-head records, and historical comparisons.',
    orderIndex: 8,
    isActive: true
  },
  {
    id: 9,
    anchorText: 'Vitibet Free Football Tips & Tables',
    url: 'https://www.vitibet.com/',
    rel: 'dofollow',
    isDofollow: true,
    tag: 'Football Predictions',
    target: '_blank',
    description: 'Daily football betting tips, index-based mathematical predictions and tables.',
    orderIndex: 9,
    isActive: true
  },
  {
    id: 10,
    anchorText: 'Flashscore Live Football Scores',
    url: 'https://www.flashscore.com/',
    rel: 'nofollow',
    isDofollow: false,
    tag: 'Live Scores',
    target: '_blank',
    description: 'Real-time live soccer scores, goal notifications, and match stats.',
    orderIndex: 10,
    isActive: true
  },
  {
    id: 11,
    anchorText: 'LiveScore Real-time Sports Results',
    url: 'https://www.livescore.com/',
    rel: 'nofollow',
    isDofollow: false,
    tag: 'Live Scores',
    target: '_blank',
    description: 'Instant scores and sports updates covering football competitions worldwide.',
    orderIndex: 11,
    isActive: true
  },
  {
    id: 12,
    anchorText: 'SportPesa Kenya Official Portal',
    url: 'https://www.sportpesa.co.ke/',
    rel: 'nofollow',
    isDofollow: false,
    tag: 'Bookmakers',
    target: '_blank',
    description: 'SportPesa Kenya licensed betting company and mega jackpot host.',
    orderIndex: 12,
    isActive: true
  },
  {
    id: 13,
    anchorText: 'Betika Kenya Sports Betting',
    url: 'https://www.betika.com/',
    rel: 'nofollow',
    isDofollow: false,
    tag: 'Bookmakers',
    target: '_blank',
    description: 'Betika Kenya licensed sports wagering and midweek jackpot provider.',
    orderIndex: 13,
    isActive: true
  },
  {
    id: 14,
    anchorText: 'MozzartBet Kenya Grand Jackpot',
    url: 'https://www.mozzartbet.co.ke/',
    rel: 'nofollow',
    isDofollow: false,
    tag: 'Bookmakers',
    target: '_blank',
    description: 'Mozzart Bet Kenya daily super jackpot and grand jackpot gaming platform.',
    orderIndex: 14,
    isActive: true
  }
];
