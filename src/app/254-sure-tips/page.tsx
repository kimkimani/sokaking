import { Metadata } from 'next';
import { getPageMetadata } from '@/src/lib/generatePageMetadata';
import SokaPageServer from '@/src/components/SokaPageServer';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('254-sure-tips', '/254-sure-tips');
}

export default function SureTipsPage() {
  return <SokaPageServer pageId="254-sure-tips" customCanonical="/254-sure-tips" />;
}
