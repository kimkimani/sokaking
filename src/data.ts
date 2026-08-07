import { Fixture, VipPackage, OddsPack, DesignIteration } from './types';

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
      'Accurate daily single tips & secure double selection',
      'Detailed statistical statistical breakdown per fixture',
      'Instant SMS & premium WhatsApp support updates',
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
      'Full 7-day VIP picks & dynamic accumulator slips',
      'Coverage of all major weekend jackpots (SportPesa Mega, Mozzart Grand)',
      'Confidence indexes and deep-learning tactical insights',
      'Exclusive high-yield longshot premium tickets',
      'WhatsApp hotline priority membership & support'
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
      'Fortnightly continuous access to all VIP tips & jackpots',
      'Full analysis of 13-game and 17-game national jackpots',
      'Personalized bankroll management & optimal betting splits',
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
    description: 'Data analytics hub & operational headquarters',
    status: 'Active'
  }
];
