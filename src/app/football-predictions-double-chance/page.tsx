import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('category-doublechance', '/football-predictions-double-chance');
}

export default function DoubleChancePage() {
  return <SokaPageServer pageId="category-doublechance" customCanonical="/football-predictions-double-chance" />;
}
