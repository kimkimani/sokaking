import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-today', '/football-predictions-today');
}

export default function FootballPredictionsTodayPage() {
  return <SokaPageServer pageId="category-today" customCanonical="/football-predictions-today" />;
}
