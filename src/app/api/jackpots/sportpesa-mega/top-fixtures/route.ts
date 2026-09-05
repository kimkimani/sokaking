import { NextResponse } from 'next/server';
import { fetchLiveMegaJackpotFixtures, getTopConfidenceJackpotFixtures, generateTopConfidenceFixturesMarkdown } from '../../../../../utils/topJackpotFixtures';

export async function GET() {
  try {
    const fixtures = await fetchLiveMegaJackpotFixtures(true);
    const topFormatted = getTopConfidenceJackpotFixtures(fixtures, 7, true);
    const markdown = generateTopConfidenceFixturesMarkdown(fixtures, 7);

    return NextResponse.json({
      jackpot: 'sportpesa-mega',
      totalFixtures: fixtures.length,
      topCount: topFormatted.length,
      fixtures: topFormatted,
      markdown
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch top fixtures' }, { status: 500 });
  }
}
