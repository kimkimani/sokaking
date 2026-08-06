import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-tomorrow', '/football-predictions-tomorrow');
}

export default function FootballPredictionsTomorrowPage() {
  return <SokaPageServer pageId="category-tomorrow" customCanonical="/football-predictions-tomorrow" />;
}
