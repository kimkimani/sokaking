import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('mozzart-super-daily', '/free-mozzart-super-daily-jackpot-predictions-and-analysis');
}

export default function MozzartSuperDailyPage() {
  return <SokaPageServer pageId="mozzart-super-daily" customCanonical="/free-mozzart-super-daily-jackpot-predictions-and-analysis" />;
}
