import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-yesterday', '/football-predictions-yesterday');
}

export default function FootballPredictionsYesterdayPage() {
  return <SokaPageServer pageId="category-yesterday" customCanonical="/football-predictions-yesterday" />;
}
