import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('mozzart-grand', '/free-mozzart-grand-jackpot-predictions-and-analysis');
}

export default function MozzartGrandPage() {
  return <SokaPageServer pageId="mozzart-grand" customCanonical="/free-mozzart-grand-jackpot-predictions-and-analysis" />;
}
