import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('partners', '/partners');
}

export default function PartnersPage() {
  return <SokaPageServer pageId="partners" customCanonical="/partners" />;
}
