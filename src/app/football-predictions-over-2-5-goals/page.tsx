import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-over25', '/football-predictions-over-2-5-goals');
}

export default function Over25Page() {
  return <SokaPageServer pageId="category-over25" customCanonical="/football-predictions-over-2-5-goals" />;
}
