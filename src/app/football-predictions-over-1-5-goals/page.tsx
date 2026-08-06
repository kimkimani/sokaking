import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-over15', '/football-predictions-over-1-5-goals');
}

export default function Over15Page() {
  return <SokaPageServer pageId="category-over15" customCanonical="/football-predictions-over-1-5-goals" />;
}
