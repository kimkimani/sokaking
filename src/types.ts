export interface Fixture {
  id: number;
  fixtureNumber?: number;
  fixtureRef?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  prediction: string;
  result: 'won' | 'lost' | 'pending';
  status: 'LIVE' | 'FT' | 'NS' | 'HT';
  kickoffTime: string; // ISO string or human-readable format
  date?: string;
  time?: string;
  leagueName: string;
  leagueFlag?: string;
  countryFlag?: string;
  leagueLogo?: string;
  countryName?: string;
  leagueCountry?: string;
  homeScore?: number | string;
  awayScore?: number | string;
  confidence: number; // e.g., 85 for 85%
  aiAnalysis?: string; // AI generated context
}

export interface VipPackage {
  id: number | string;
  slug: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  features: string[];
  isFeatured?: boolean;
}

export interface OddsPack {
  id: number;
  slug: string;
  name: string;
  tag: string;
  price: number;
  durationDays: number;
  picksPerDay: number;
  oddsMinDecimal: string;
  description: string;
  color: string;
  riskLevel: 'Conservative' | 'Balanced' | 'Aggressive';
}

export interface DesignIteration {
  id: string;
  name: string;
  version: string;
  description: string;
  notes: string[];
  themeClass: string;
}
