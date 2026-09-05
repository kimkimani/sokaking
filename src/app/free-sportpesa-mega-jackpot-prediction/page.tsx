import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('sportpesa-mega', '/free-sportpesa-mega-jackpot-prediction');
}

export default function SportpesaMegaPage() {
  return <SokaPageServer pageId="sportpesa-mega" customCanonical="/free-sportpesa-mega-jackpot-prediction" />;
}
