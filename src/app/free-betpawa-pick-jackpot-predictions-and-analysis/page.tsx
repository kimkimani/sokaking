import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('betpawa-pick-jackpot', '/free-betpawa-pick-jackpot-predictions-and-analysis');
}

export default function BetpawaPickJackpotPage() {
  return <SokaPageServer pageId="betpawa-pick-jackpot" customCanonical="/free-betpawa-pick-jackpot-predictions-and-analysis" />;
}
