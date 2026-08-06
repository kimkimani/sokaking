import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('sportpesa-midweek', '/free-sportpesa-midweek-jackpot-predictions-and-analysis');
}

export default function SportpesaMidweekPage() {
  return <SokaPageServer pageId="sportpesa-midweek" customCanonical="/free-sportpesa-midweek-jackpot-predictions-and-analysis" />;
}
