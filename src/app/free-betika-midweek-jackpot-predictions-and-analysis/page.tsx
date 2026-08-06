import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('betika-midweek', '/free-betika-midweek-jackpot-predictions-and-analysis');
}

export default function BetikaMidweekPage() {
  return <SokaPageServer pageId="betika-midweek" customCanonical="/free-betika-midweek-jackpot-predictions-and-analysis" />;
}
