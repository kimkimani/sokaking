import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('sportpesa-midweek', '/today-sportpesa-midweek-jackpot-prediction-and-tips');
}

export default function SportpesaMidweekPage() {
  return <SokaPageServer pageId="sportpesa-midweek" customCanonical="/today-sportpesa-midweek-jackpot-prediction-and-tips" />;
}
