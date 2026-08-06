import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('odibet-laki-tatu', '/free-odibet-laki-tatu-jackpot-predictions-and-analysis');
}

export default function OdibetLakiTatuPage() {
  return <SokaPageServer pageId="odibet-laki-tatu" customCanonical="/free-odibet-laki-tatu-jackpot-predictions-and-analysis" />;
}
