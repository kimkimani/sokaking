import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('liobet-predictions-and-tips', '/liobet-predictions-and-tips');
}

export default function LiobetPage() {
  return <SokaPageServer pageId="liobet-predictions-and-tips" customCanonical="/liobet-predictions-and-tips" />;
}
