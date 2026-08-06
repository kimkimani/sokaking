import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-btts', '/football-predictions-btts-gg');
}

export default function BttsPage() {
  return <SokaPageServer pageId="category-btts" customCanonical="/football-predictions-btts-gg" />;
}
