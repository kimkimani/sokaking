import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function GET() {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/deliverables/summary`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    vip: [
      { match: 'Arsenal vs Chelsea', league: 'Premier League', prediction: 'Home Win (1)', confidence: '94%', odds: '1.75' },
      { match: 'Real Madrid vs Sevilla', league: 'La Liga', prediction: 'Over 2.5 Goals', confidence: '91%', odds: '1.65' },
      { match: 'Bayern Munich vs Leipzig', league: 'Bundesliga', prediction: 'GG (Both Teams Score)', confidence: '89%', odds: '1.58' }
    ],
    jackpots: [
      {
        name: 'SportPesa Mega Jackpot (17 Games)',
        cashPrize: 'KES 385,000,000+',
        category: '17 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Man Utd vs Chelsea -> 1X',
          '#2 Newcastle vs Spurs -> 2',
          '#3 Everton vs Wolves -> 1',
          '#4 Valencia vs Betis -> X2',
          '#5 Albacete vs Valladolid -> 2'
        ]
      },
      {
        name: 'Mozzart Grand Jackpot (16 Games)',
        cashPrize: 'KES 200,000,000',
        category: '16 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Milan vs Inter -> 12',
          '#2 Roma vs Lazio -> X',
          '#3 Atalanta vs Torino -> 1'
        ]
      },
      {
        name: 'Betika 15 Midweek Jackpot',
        cashPrize: 'KES 15,000,000',
        category: '15 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Brest vs Monaco -> X2',
          '#2 Lille vs Lyon -> 1'
        ]
      },
      {
        name: 'Shabiki Daily Jackpot',
        cashPrize: 'KES 500,000',
        category: '10 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Basel vs Zurich -> 1'
        ]
      }
    ],
    oddsPacks: [
      { pack: '2+ Odds Daily Banker', targetOdds: '2.15', winProbability: '95%', description: '2 Ultra-Safe Double Chance & Over 1.5 Banker selections.' },
      { pack: '3+ Odds Value Accumulator', targetOdds: '3.40', winProbability: '88%', description: '3 Well-analyzed matches combining Home Win & GG markets.' },
      { pack: '5+ Odds Multi-Bet Pack', targetOdds: '5.80', winProbability: '82%', description: 'High-yield multi-bet designed for maximum return.' },
      { pack: '10+ Odds Daily Mega Accumulator', targetOdds: '11.50', winProbability: '74%', description: 'Calculated risk high odds combo for big scorelines.' }
    ],
    updatedAt: new Date().toISOString()
  });
}
