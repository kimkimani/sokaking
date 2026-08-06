import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-homewin', '/football-predictions-1x2-home-win');
}

export default function HomeWinPage() {
  return <SokaPageServer pageId="category-homewin" customCanonical="/football-predictions-1x2-home-win" />;
}
