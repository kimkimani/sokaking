import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('sportybet-jackpot', '/free-sportybet-jackpot-predictions-and-analysis');
}

export default function SportybetJackpotPage() {
  return <SokaPageServer pageId="sportybet-jackpot" customCanonical="/free-sportybet-jackpot-predictions-and-analysis" />;
}
