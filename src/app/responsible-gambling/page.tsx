import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('responsible-gambling', '/responsible-gambling');
}

export default function ResponsibleGamblingPage() {
  return <SokaPageServer pageId="responsible-gambling" customCanonical="/responsible-gambling" />;
}
